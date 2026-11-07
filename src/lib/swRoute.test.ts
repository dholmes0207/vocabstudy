import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// These tests exercise the ACTUAL shipped service worker (public/sw.js) rather
// than a copy of its rules, because a service worker that disagrees with its
// tests is worse than no tests at all. The file is a classic worker script — no
// `export` allowed — so it hands its internals to `self` and we evaluate it
// here with a stubbed global. Nothing at the top level touches the network.

const source = readFileSync(fileURLToPath(new URL('../../public/sw.js', import.meta.url)), 'utf-8')

interface SwInternals {
  VERSION: string
  EXTRA_DATA: string[]
  CACHES: string[]
  strategyFor: (url: string, method: string, origin: string) => string
  assetUrlsFrom: (html: string, baseUrl: string, origin: string) => string[]
  packUrlsFrom: (manifest: unknown, baseUrl: string) => string[]
  chunkUrlsFrom: (manifest: unknown, baseUrl: string) => string[]
  staleWhileRevalidate: (
    request: unknown,
    waitUntil: (p: Promise<unknown>) => void
  ) => Promise<unknown>
}

function loadServiceWorker(): SwInternals {
  const self = { addEventListener: () => {}, skipWaiting: () => {}, clients: {} }
  const run = new Function('self', `${source}\nreturn self.__swInternals`)
  return run(self) as SwInternals
}

const sw = loadServiceWorker()
const ORIGIN = 'https://vocastudy.app'
const route = (path: string, method = 'GET', origin = ORIGIN) =>
  sw.strategyFor(path.startsWith('http') ? path : ORIGIN + path, method, origin)

describe('service worker — what it refuses to touch', () => {
  it('ignores anything that is not a GET', () => {
    expect(route('/', 'POST')).toBe('passthrough')
    expect(route('/data/en.json', 'HEAD')).toBe('passthrough')
  })

  it('never intercepts another origin (Supabase auth, OpenAI, anything)', () => {
    expect(route('https://abc.supabase.co/auth/v1/user')).toBe('passthrough')
    expect(route('https://api.openai.com/v1/chat/completions')).toBe('passthrough')
  })

  it('never caches the API — replies are per-user and per-moment', () => {
    expect(route('/api/ai/chat')).toBe('passthrough')
    expect(route('/api/admin/users')).toBe('passthrough')
    expect(route('/api/ai/status')).toBe('passthrough')
  })

  it('passes through a URL it cannot parse instead of throwing', () => {
    expect(sw.strategyFor('http://[', 'GET', ORIGIN)).toBe('passthrough')
  })
})

describe('service worker — cache-first for pronunciation clips', () => {
  it('serves pronunciation clips from cache (the whole point of offline study)', () => {
    expect(route('/audio/en/aria/w1.mp3')).toBe('cache-first')
    expect(route('/audio/en/guy/e1000.mp3')).toBe('cache-first')
    expect(route('/audio/en/index.json')).toBe('cache-first')
  })

  it('still works when the app is hosted under a sub-path', () => {
    expect(route('/vocab/audio/en/aria/w1.mp3')).toBe('cache-first')
    expect(route('/vocab/data/en.json')).toBe('stale-while-revalidate')
    expect(route('/vocab/api/ai/chat')).toBe('passthrough')
  })
})

// The language pack used to be cache-first too, with nothing ever refreshing
// it: a learner who installed the worker kept the pack from that day forever —
// fixed examples, new words and all the depth fields never reached them.
describe('service worker — the language pack is served instantly AND refreshed', () => {
  it('routes the pack and its manifest to stale-while-revalidate', () => {
    expect(route('/data/en.json')).toBe('stale-while-revalidate')
    expect(route('/data/index.json')).toBe('stale-while-revalidate')
  })

  const OLD = 'old pack'
  const NEW = 'new pack'

  function stubCaches(initial: string | null) {
    let stored = initial
    const cache = { put: async (_req: unknown, res: { body: string }) => void (stored = res.body) }
    const g = globalThis as Record<string, unknown>
    g.caches = {
      match: async () => (stored === null ? undefined : { body: stored, clone: () => ({}) }),
      open: async () => cache,
    }
    return { read: () => stored }
  }

  const response = (body: string, ok = true) => ({ body, ok, clone: () => ({ body }) })

  it('answers from cache at once and stores the fresh copy for next time', async () => {
    const store = stubCaches(OLD)
    ;(globalThis as Record<string, unknown>).fetch = async () => response(NEW)
    const pending: Promise<unknown>[] = []
    const res = (await sw.staleWhileRevalidate('/data/en.json', (p) => pending.push(p))) as {
      body: string
    }
    expect(res.body).toBe(OLD)
    await Promise.all(pending)
    expect(store.read()).toBe(NEW)
  })

  it('goes to the network (and caches) when nothing is cached yet', async () => {
    const store = stubCaches(null)
    ;(globalThis as Record<string, unknown>).fetch = async () => response(NEW)
    const res = (await sw.staleWhileRevalidate('/data/en.json', () => {})) as { body: string }
    expect(res.body).toBe(NEW)
    expect(store.read()).toBe(NEW)
  })

  it('keeps working offline: a failed refresh never breaks the cached answer', async () => {
    const store = stubCaches(OLD)
    ;(globalThis as Record<string, unknown>).fetch = async () => {
      throw new TypeError('offline')
    }
    const pending: Promise<unknown>[] = []
    const res = (await sw.staleWhileRevalidate('/data/en.json', (p) => pending.push(p))) as {
      body: string
    }
    expect(res.body).toBe(OLD)
    await expect(Promise.all(pending)).resolves.toBeDefined()
    expect(store.read()).toBe(OLD)
  })

  it('does not overwrite a good cached pack with an error page', async () => {
    const store = stubCaches(OLD)
    ;(globalThis as Record<string, unknown>).fetch = async () => response('500', false)
    const pending: Promise<unknown>[] = []
    await sw.staleWhileRevalidate('/data/en.json', (p) => pending.push(p))
    await Promise.all(pending)
    expect(store.read()).toBe(OLD)
  })
})

describe('service worker — network-first for the app itself', () => {
  it('always tries the network for the document and the code', () => {
    // This is the rule that stops a bad cache from pinning learners to an old
    // broken build — the classic service-worker trap.
    expect(route('/')).toBe('network-first')
    expect(route('/index.html')).toBe('network-first')
    expect(route('/assets/index-abc123.js')).toBe('network-first')
    expect(route('/assets/index-abc123.css')).toBe('network-first')
  })

  it('is not confused by query strings or hash routes', () => {
    expect(route('/?utm=x')).toBe('network-first')
    expect(route('/#/learn')).toBe('network-first')
    expect(route('/data/en.json?v=2')).toBe('stale-while-revalidate')
    expect(route('/audio/en/aria/e1.mp3?v=abc12')).toBe('cache-first')
  })
})

describe('service worker — upgrade safety', () => {
  it('names every cache after a version so a bad deploy can be flushed', () => {
    expect(sw.VERSION).toMatch(/\S/)
    expect(sw.CACHES.length).toBeGreaterThan(0)
    for (const name of sw.CACHES) expect(name).toContain(sw.VERSION)
  })
})

// Reloading offline still produced a blank page at first: on a visitor's very
// first load the browser fetches index.html and its JS/CSS BEFORE the worker
// has taken control, so those files never passed through it and were not
// cached. The worker therefore reads the shell it just cached and precaches the
// files that shell actually references.
describe('service worker — finding the app shell assets', () => {
  const BASE = 'https://vocastudy.app/'
  const html = `<!doctype html><html><head>
    <link rel="icon" href="data:image/svg+xml,%3Csvg%3E%3C/svg%3E" />
    <link rel="stylesheet" href="/assets/index-abc123.css" />
    <link rel="preload" href="data/en.json" as="fetch" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=X" />
    </head><body><div id="root"></div>
    <script type="module" src="/assets/index-def456.js"></script>
    <img src="/logo.png" />
    </body></html>`

  it('picks up the JS and CSS the document actually references', () => {
    const urls = sw.assetUrlsFrom(html, BASE, 'https://vocastudy.app')
    expect(urls).toContain('https://vocastudy.app/assets/index-abc123.css')
    expect(urls).toContain('https://vocastudy.app/assets/index-def456.js')
  })

  it('leaves everything that is not code alone', () => {
    const urls = sw.assetUrlsFrom(html, BASE, 'https://vocastudy.app')
    // The 280 KB language pack is cached on demand, not forced on first load,
    // and images/icons are not worth blocking the install for.
    expect(urls.some((u) => u.includes('en.json'))).toBe(false)
    expect(urls.some((u) => u.includes('logo.png'))).toBe(false)
    expect(urls.some((u) => u.startsWith('data:'))).toBe(false)
  })

  it('never reaches for another origin', () => {
    const urls = sw.assetUrlsFrom(html, BASE, 'https://vocastudy.app')
    expect(urls.some((u) => u.includes('fonts.googleapis.com'))).toBe(false)
  })

  it('resolves relative paths against the document, for sub-path hosting', () => {
    const rel = '<script type="module" src="./assets/app-1.js"></script>'
    expect(sw.assetUrlsFrom(rel, 'https://host/vocab/', 'https://host')).toEqual([
      'https://host/vocab/assets/app-1.js',
    ])
  })

  it('returns each file once', () => {
    const dup = '<script src="/assets/a.js"></script><script src="/assets/a.js"></script>'
    expect(sw.assetUrlsFrom(dup, BASE, 'https://vocastudy.app')).toEqual([
      'https://vocastudy.app/assets/a.js',
    ])
  })

  it('returns nothing rather than throwing on junk', () => {
    expect(sw.assetUrlsFrom('', BASE, 'https://vocastudy.app')).toEqual([])
    expect(sw.assetUrlsFrom('<script src="http://[">', BASE, 'https://vocastudy.app')).toEqual([])
  })
})

// The app cannot render a single card without its language pack, so "works
// offline after the first visit" is only true if the pack is precached too.
// Audio is deliberately NOT precached — it is 57 MB.
describe('service worker — which language packs to warm', () => {
  const BASE = 'https://vocastudy.app/'

  it('takes one pack per language in the manifest', () => {
    const manifest = { defaultLang: 'en', languages: [{ code: 'en' }, { code: 'fr' }] }
    expect(sw.packUrlsFrom(manifest, BASE)).toEqual([
      'https://vocastudy.app/data/en.json',
      'https://vocastudy.app/data/en.details.json',
      'https://vocastudy.app/data/fr.json',
      'https://vocastudy.app/data/fr.details.json',
    ])
  })

  it('honours an explicit file name when the manifest gives one', () => {
    const manifest = { languages: [{ code: 'en', file: 'en-v2.json' }] }
    expect(sw.packUrlsFrom(manifest, BASE)).toEqual([
      'https://vocastudy.app/data/en-v2.json',
      'https://vocastudy.app/data/en.details.json',
    ])
  })

  it('resolves against the document for sub-path hosting', () => {
    const manifest = { languages: [{ code: 'en' }] }
    expect(sw.packUrlsFrom(manifest, 'https://host/vocab/')).toEqual([
      'https://host/vocab/data/en.json',
      'https://host/vocab/data/en.details.json',
    ])
  })

  it('ignores junk instead of throwing during install', () => {
    expect(sw.packUrlsFrom(null, BASE)).toEqual([])
    expect(sw.packUrlsFrom({}, BASE)).toEqual([])
    expect(sw.packUrlsFrom({ languages: 'nope' }, BASE)).toEqual([])
    expect(sw.packUrlsFrom({ languages: [{}, { code: '' }, { code: 'en' }] }, BASE)).toEqual([
      'https://vocastudy.app/data/en.json',
      'https://vocastudy.app/data/en.details.json',
    ])
  })

  it('never pulls audio into the install step', () => {
    const manifest = { languages: [{ code: 'en' }] }
    expect(sw.packUrlsFrom(manifest, BASE).some((u) => u.includes('/audio/'))).toBe(false)
  })
})

// Practice kept out of the code (TOEIC, HSK questions) is warmed with the packs,
// so it still works offline right after install, as it did inside a chunk.
describe('service worker — practice data warmed at install', () => {
  it('lists only files that ship, under data/, never audio', () => {
    expect(sw.EXTRA_DATA).toContain('data/toeic/en.json')
    expect(sw.EXTRA_DATA).toContain('data/hsk/zh.json')
    expect(sw.EXTRA_DATA).toContain('data/ielts/en.json')
    for (const path of sw.EXTRA_DATA) {
      expect(path).toMatch(/^data\/[^/].*\.json$/)
      expect(existsSync(`public/${path}`), path).toBe(true)
    }
  })
})

// Routes are code-split, so the entry bundle alone is not enough: opening the
// app offline threw on the lazy import for the current route and fell through
// to the error screen. Vite's build manifest lists every chunk it emits, which
// is the only list that stays correct as routes are added.
describe('service worker — every code-split chunk', () => {
  const BASE = 'https://vocastudy.app/'
  const manifest = {
    'index.html': {
      file: 'assets/index-abc.js',
      css: ['assets/index-def.css'],
      isEntry: true,
    },
    'src/features/learn/Learn.tsx': {
      file: 'assets/Learn-ghi.js',
      isDynamicEntry: true,
    },
    '_shared-jkl.js': { file: 'assets/shared-jkl.js' },
  }

  it('collects the entry, the lazy routes and the shared chunks', () => {
    const urls = sw.chunkUrlsFrom(manifest, BASE)
    expect(urls).toContain('https://vocastudy.app/assets/index-abc.js')
    expect(urls).toContain('https://vocastudy.app/assets/Learn-ghi.js')
    expect(urls).toContain('https://vocastudy.app/assets/shared-jkl.js')
  })

  it('collects the stylesheets a chunk declares', () => {
    expect(sw.chunkUrlsFrom(manifest, BASE)).toContain('https://vocastudy.app/assets/index-def.css')
  })

  it('takes only code — never images, fonts or audio', () => {
    const withAssets = {
      'x.html': { file: 'assets/x.js', assets: ['assets/hero-1.png'] },
      y: { file: 'assets/voice.mp3' },
    }
    const urls = sw.chunkUrlsFrom(withAssets, BASE)
    expect(urls).toEqual(['https://vocastudy.app/assets/x.js'])
  })

  it('resolves against the document for sub-path hosting', () => {
    expect(sw.chunkUrlsFrom({ a: { file: 'assets/index-abc.js' } }, 'https://host/vocab/')).toEqual(
      ['https://host/vocab/assets/index-abc.js']
    )
  })

  it('returns nothing rather than throwing when there is no manifest', () => {
    expect(sw.chunkUrlsFrom(null, BASE)).toEqual([])
    expect(sw.chunkUrlsFrom('nope', BASE)).toEqual([])
    expect(sw.chunkUrlsFrom({ a: null, b: { file: 42 } }, BASE)).toEqual([])
  })

  it('lists each file once even when several chunks share a stylesheet', () => {
    const shared = {
      a: { file: 'assets/a.js', css: ['assets/s.css'] },
      b: { file: 'assets/b.js', css: ['assets/s.css'] },
    }
    const urls = sw.chunkUrlsFrom(shared, BASE)
    expect(urls.filter((u) => u.endsWith('s.css'))).toHaveLength(1)
  })
})
