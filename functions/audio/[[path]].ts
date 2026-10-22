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

interface AudioCtx {
  request: Request
  env: Env
  next: () => Promise<Response>
}

// Same rule as /audio/* in public/_headers, which only covers static files.
const CACHE_CONTROL = 'public, max-age=2592000, stale-while-revalidate=86400'

async function staticOr404(ctx: AudioCtx): Promise<Response> {
  const response = await ctx.next()
  const type = response.headers.get('Content-Type') ?? ''
  if (response.ok && type.includes('text/html')) return new Response('Not found', { status: 404 })
  return response
}

async function serve(ctx: AudioCtx, withBody: boolean): Promise<Response> {
  const bucket = ctx.env.AUDIO_BUCKET
  const key = audioKey(new URL(ctx.request.url).pathname)
  if (!key) return new Response('Not found', { status: 404 })
  if (!bucket) return staticOr404(ctx)

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
  return new Response(withBody ? object.body : null, { status: span ? 206 : 200, headers })
}

export const onRequestGet = (ctx: AudioCtx) => serve(ctx, true)
export const onRequestHead = (ctx: AudioCtx) => serve(ctx, false)
