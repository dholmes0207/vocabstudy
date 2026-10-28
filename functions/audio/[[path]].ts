import { audioContentType, audioKey, byteSpan } from '../../src/lib/audioServe'
import type { Env } from '../_shared'

// /audio/* — pronunciation clips from the R2 bucket bound as AUDIO_BUCKET
// (docs/design/audio-r2.md). The paths are the same as the files in
// public/audio, so the service worker, the caching rules and every player stay
// as they are. Without the binding, or for a key the bucket does not have, the
// request falls through to the deploy's own static files.
//
// A clip that exists nowhere is a 404. Left to itself Pages answers an unknown
// path with index.html and a 200, which the service worker would then cache as
// that clip for good: the learner would never hear it, even after it is added.
//
// Cloudflare does not cache what a Function returns, so every first play used
// to go Function → R2 (0.5–2 s). Whole clips read from R2 are now kept in the
// data centre's cache (Cache API) and later requests there are answered from it.

interface AudioCtx {
  request: Request
  env: Env
  next: () => Promise<Response>
  waitUntil: (promise: Promise<unknown>) => void
}

// Same rule as /audio/* in public/_headers, which only covers static files.
const CACHE_CONTROL = 'public, max-age=2592000, stale-while-revalidate=86400'

async function staticOr404(ctx: AudioCtx): Promise<Response> {
  const response = await ctx.next()
  const type = response.headers.get('Content-Type') ?? ''
  if (response.ok && type.includes('text/html')) return new Response('Not found', { status: 404 })
  return response
}

/** Copy of a response with one header added (cached responses are immutable). */
function withHeader(response: Response, name: string, value: string): Response {
  const copy = new Response(response.body, response)
  copy.headers.set(name, value)
  return copy
}

/**
 * The cached clip for this request, if the data centre has it. The key is the
 * full URL, query included: example clips carry ?v=<fingerprint of the
 * sentence>, so a rewritten sentence never gets the old recording back.
 * Cache API answers Range with a 206 and a matching If-None-Match with a 304
 * by itself; "bytes=0-" is dropped first so a whole clip stays a 200, which is
 * what the service worker can store.
 */
async function fromCache(request: Request, cacheKey: Request): Promise<Response | undefined> {
  const headers = new Headers()
  const range = request.headers.get('Range')
  if (range && range.trim() !== 'bytes=0-') headers.set('Range', range)
  const etag = request.headers.get('If-None-Match')
  if (etag) headers.set('If-None-Match', etag)
  const hit = await caches.default.match(new Request(cacheKey, { headers }))
  return hit && withHeader(hit, 'X-Audio-Cache', 'hit')
}

async function serve(ctx: AudioCtx, withBody: boolean): Promise<Response> {
  const bucket = ctx.env.AUDIO_BUCKET
  const key = audioKey(new URL(ctx.request.url).pathname)
  if (!key) return new Response('Not found', { status: 404 })
  if (!bucket) return staticOr404(ctx)

  const cacheKey = new Request(ctx.request.url, { method: 'GET' })
  if (withBody) {
    const hit = await fromCache(ctx.request, cacheKey).catch(() => undefined)
    if (hit) return hit
  }

  let object: R2Object | R2ObjectBody | null
  try {
    // Players ask for byte ranges (Safari always does), and revalidations
    // carry If-None-Match: R2 answers both straight from the request headers.
    object = await bucket.get(key, { range: ctx.request.headers, onlyIf: ctx.request.headers })
  } catch {
    return staticOr404(ctx) // e.g. a range past the end: let the static file answer
  }
  if (!object) return staticOr404(ctx)

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', CACHE_CONTROL)
  headers.set('Accept-Ranges', 'bytes')
  // How to tell from outside that R2 answered: the edge cache serves ranges and
  // 304s for static files too, so status codes alone prove nothing.
  headers.set('X-Audio-Source', 'r2')
  if (!headers.has('Content-Type')) headers.set('Content-Type', audioContentType(key))

  // A precondition from the request matched the stored copy: nothing to send.
  if (!('body' in object)) return new Response(null, { status: 304, headers })

  // A range that covers the whole clip ("bytes=0-", what most players send
  // first) is answered as a plain 200: the service worker can cache that, but
  // never a 206.
  const asked = ctx.request.headers.has('Range') ? byteSpan(object.range, object.size) : null
  const span = asked && !(asked.start === 0 && asked.end === object.size - 1) ? asked : null
  if (span) headers.set('Content-Range', `bytes ${span.start}-${span.end}/${object.size}`)
  headers.set('Content-Length', String(span ? span.end - span.start + 1 : object.size))
  headers.set('X-Audio-Cache', 'miss')
  const response = new Response(withBody ? object.body : null, {
    status: span ? 206 : 200,
    headers,
  })
  // Only a whole clip goes into the cache (Cache API refuses a 206); ranges
  // are cut from it on later requests.
  if (withBody && !span) ctx.waitUntil(caches.default.put(cacheKey, response.clone()))
  return response
}

export const onRequestGet = (ctx: AudioCtx) => serve(ctx, true)
export const onRequestHead = (ctx: AudioCtx) => serve(ctx, false)
