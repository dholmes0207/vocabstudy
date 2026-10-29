// VocaStudy service worker — offline support for the learning content.
//
// Written by hand and kept deliberately small so its behaviour is obvious:
//
//   * the app shell (document, JS, CSS) is NETWORK-FIRST. A new deploy always
//     wins; the cache is only a fallback for when the network is gone. This is
//     what stops the classic service-worker disaster of pinning every learner
//     to an old broken build.
//   * pronunciation clips (/audio/*) are CACHE-FIRST. They are large, a clip's
//     URL changes whenever its sentence does (?v=<hash>), and they are exactly
//     what has to be there on a train with no signal.
//   * the language pack (/data/*) is STALE-WHILE-REVALIDATE: answered from the
//     cache instantly (and offline), then refreshed in the background so the
//     next visit has the latest words. It used to be cache-first as well, which
//     pinned every learner to the pack of the day they installed the worker.
//   * everything else — other origins (Supabase, OpenAI) and /api/* — is left
//     completely alone.
//
// KILL SWITCH: set DISABLED to true and deploy. The worker then unregisters
// itself and deletes its caches on the next page load, returning every visitor
// to plain network behaviour without anyone having to clear site data.

const DISABLED = false

// Bump to invalidate every cache at once (e.g. after regenerating audio).
// v2: the pack moved to stale-while-revalidate; flushing v1 hands every learner
// the current pack on their next visit and drops example clips cached under
// their old, unversioned URLs.
const VERSION = 'v3'
const SHELL_CACHE = `vocabstudy-shell-${VERSION}`
const CONTENT_CACHE = `vocabstudy-content-${VERSION}`
const CACHES = [SHELL_CACHE, CONTENT_CACHE]

/**
 * Which caching strategy applies to a request.
 * Pure and side-effect free so it can be unit tested — see swRoute.test.ts.
 */
function strategyFor(rawUrl, method, origin) {
  if (method !== 'GET') return 'passthrough'
  let url
  try {
    url = new URL(rawUrl)
  } catch (e) {
    return 'passthrough'
  }
  if (url.origin !== origin) return 'passthrough'
  // Path segments rather than a leading match, so a sub-path deployment
  // (https://host/vocab/…) is routed the same way.
  const path = url.pathname
  if (path.includes('/api/')) return 'passthrough'
  if (path.includes('/audio/')) return 'cache-first'
  if (path.includes('/data/')) return 'stale-while-revalidate'
  return 'network-first'
}

/**
 * The JS/CSS files a shell document references, as absolute same-origin URLs.
 *
 * Needed because on a visitor's first load the browser fetches index.html and
 * its assets before this worker controls the page, so they never pass through
 * the fetch handler and never get cached — an offline reload then rendered a
 * blank page. Reading them out of the shell keeps the list correct across
 * deploys without a build step, since Vite fingerprints every filename.
 *
 * Pure and side-effect free — see swRoute.test.ts.
 */
function assetUrlsFrom(html, baseUrl, origin) {
  const urls = []
  const seen = new Set()
  const re = /(?:src|href)="([^"]+)"/g
  let match
  while ((match = re.exec(html)) !== null) {
    const raw = match[1]
    if (raw.startsWith('data:')) continue
    let url
    try {
      url = new URL(raw, baseUrl)
    } catch (e) {
      continue
    }
    if (url.origin !== origin) continue
    if (!/\.(?:js|css)$/.test(url.pathname)) continue
    if (seen.has(url.href)) continue
    seen.add(url.href)
    urls.push(url.href)
  }
  return urls
}

/**
 * Language-pack URLs listed by the data manifest. The app cannot render a
 * single card without its pack, so offline-after-one-visit is only true if the
 * pack is warmed at install. Each pack's details file (collocations, tips,
 * families, split off at build time) is warmed with it, so an opened card is
 * complete offline too. Audio is deliberately left out — 57 MB is not
 * something to download behind someone's back.
 *
 * Pure and side-effect free — see swRoute.test.ts.
 */
function packUrlsFrom(manifest, baseUrl) {
  const langs = manifest && typeof manifest === 'object' ? manifest.languages : null
  if (!Array.isArray(langs)) return []
  const urls = []
  for (const lang of langs) {
    if (!lang || typeof lang !== 'object') continue
    const file = typeof lang.file === 'string' && lang.file ? lang.file : null
    const code = typeof lang.code === 'string' && lang.code ? lang.code : null
    if (!file && !code) continue
    try {
      urls.push(new URL(`data/${file ?? `${code}.json`}`, baseUrl).href)
      if (code) urls.push(new URL(`data/${code}.details.json`, baseUrl).href)
    } catch (e) {
      /* skip a malformed entry rather than fail the install */
    }
  }
  return urls
}

/**
 * Every JS/CSS file Vite emitted, from its build manifest.
 *
 * The routes are code-split, so caching the entry bundle is not enough: opening
 * the app offline threw on the lazy import for the current route. The manifest
 * is generated at build time, so this list never drifts as routes are added.
 *
 * Pure and side-effect free — see swRoute.test.ts.
 */
function chunkUrlsFrom(manifest, baseUrl) {
  if (!manifest || typeof manifest !== 'object') return []
  const urls = []
  const seen = new Set()
  const take = (file) => {
    if (typeof file !== 'string' || !/\.(?:js|css)$/.test(file)) return
    let href
    try {
      href = new URL(file, baseUrl).href
    } catch (e) {
      return
    }
    if (seen.has(href)) return
    seen.add(href)
    urls.push(href)
  }
  for (const chunk of Object.values(manifest)) {
    if (!chunk || typeof chunk !== 'object') continue
    take(chunk.file)
    if (Array.isArray(chunk.css)) chunk.css.forEach(take)
  }
  return urls
}

// Expose the internals for the unit tests (a classic worker cannot `export`).
self.__swInternals = {
  VERSION,
  CACHES,
  strategyFor,
  assetUrlsFrom,
  packUrlsFrom,
  chunkUrlsFrom,
  staleWhileRevalidate,
}

// Cached responses carry `Vary: Origin` (and hosts often add
// `Vary: Accept-Encoding`). The browser asks for a module script with a CORS
// request whose headers differ from the one the install step used, so a plain
// `caches.match(request)` MISSES and the offline reload renders a blank page —
// this bit us in testing. The site serves one variant of every file, so
// ignoring Vary is both safe and required. Do not remove.
const MATCH = { ignoreVary: true }

async function cacheFirst(request) {
  const cached = await caches.match(request, MATCH)
  if (cached) return cached
  const response = await fetch(request)
  // Only a whole 200 response can be stored: the Cache API rejects a 206 (a
  // player asking for part of a clip), and that must not cost the playback.
  if (response && response.status === 200) {
    const cache = await caches.open(CONTENT_CACHE)
    await cache.put(request, response.clone())
  }
  return response
}

/**
 * Answer from the cache when possible and refresh it in the background; go to
 * the network only when nothing is cached yet. `waitUntil` keeps the worker
 * alive until the refresh is stored. A failed refresh (offline, 5xx) is
 * swallowed — the learner already has an answer — and never replaces a good
 * cached copy.
 */
async function staleWhileRevalidate(request, waitUntil) {
  const cached = await caches.match(request, MATCH)
  const refresh = fetch(request).then(async (response) => {
    if (response && response.ok) {
      const cache = await caches.open(CONTENT_CACHE)
      await cache.put(request, response.clone())
    }
    return response
  })
  if (cached) {
    waitUntil(refresh.catch(() => undefined))
    return cached
  }
  return refresh
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      const cache = await caches.open(SHELL_CACHE)
      await cache.put(request, response.clone())
    }
    return response
  } catch (e) {
    const cached = await caches.match(request, MATCH)
    if (cached) return cached
    // Every route is the same document (the SPA shell), so the cached root is a
    // valid answer for any navigation the learner attempts offline.
    if (request.mode === 'navigate') {
      const shell = await caches.match(new URL('./', self.location.href).href, MATCH)
      if (shell) return shell
    }
    throw e
  }
}

/** Cache the document and the code it needs, so an offline reload can boot. */
async function precacheShell() {
  const shellUrl = new URL('./', self.location.href).href
  const cache = await caches.open(SHELL_CACHE)
  const response = await fetch(shellUrl, { cache: 'reload' })
  if (!response || !response.ok) return
  await cache.put(shellUrl, response.clone())
  // Prefer the build manifest (it knows about the code-split routes the
  // document never mentions); fall back to reading the shell's own tags.
  let assets = []
  try {
    const manifestRes = await fetch(new URL('asset-manifest.json', shellUrl).href)
    if (manifestRes.ok) assets = chunkUrlsFrom(await manifestRes.json(), shellUrl)
  } catch (e) {
    /* fall back below */
  }
  const fromHtml = assetUrlsFrom(await response.text(), shellUrl, self.location.origin)
  assets = [...new Set([...assets, ...fromHtml])]
  // `cache.add` issues a no-cors request whose stored variant will not match
  // the CORS request the browser makes for a module script; fetch and put by
  // hand so the cached entry is the same variant the page will ask for.
  await Promise.all(assets.map((url) => warm(cache, url)))

  // The language pack, so the very first offline visit can actually study.
  try {
    const manifestUrl = new URL('data/index.json', shellUrl).href
    const manifestRes = await fetch(manifestUrl)
    if (manifestRes.ok) {
      const content = await caches.open(CONTENT_CACHE)
      await content.put(manifestUrl, manifestRes.clone())
      const packs = packUrlsFrom(await manifestRes.json(), shellUrl)
      await Promise.all(packs.map((url) => warm(content, url)))
    }
  } catch (e) {
    /* no manifest, no problem — packs are still cached on first use */
  }
}

/** Fetch one URL and store it, ignoring individual failures. */
async function warm(cache, url) {
  try {
    const res = await fetch(url)
    if (res && res.ok) await cache.put(url, res.clone())
  } catch (e) {
    /* one missing file must not fail the whole install */
  }
}

self.addEventListener('install', (event) => {
  if (DISABLED) return
  // Take over as soon as possible; the network-first shell makes this safe.
  self.skipWaiting()
  event.waitUntil(precacheShell().catch(() => {}))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (DISABLED) {
        const names = await caches.keys()
        await Promise.all(names.map((n) => caches.delete(n)))
        await self.registration.unregister()
        return
      }
      const names = await caches.keys()
      await Promise.all(
        names
          .filter((n) => n.startsWith('vocabstudy-') && !CACHES.includes(n))
          .map((n) => caches.delete(n))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  if (DISABLED) return
  const strategy = strategyFor(event.request.url, event.request.method, self.location.origin)
  if (strategy === 'passthrough') return
  event.respondWith(
    strategy === 'cache-first'
      ? cacheFirst(event.request)
      : strategy === 'stale-while-revalidate'
        ? staleWhileRevalidate(event.request, (p) => event.waitUntil(p))
        : networkFirst(event.request)
  )
})
