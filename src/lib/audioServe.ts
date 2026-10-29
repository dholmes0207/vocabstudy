// Serving pronunciation clips from the R2 bucket (functions/audio/[[path]].ts,
// docs/design/audio-r2.md). Pure helpers, kept here so they can be tested.

/**
 * The bucket key for a request path, or null for anything that is not a clip
 * or a voice manifest. Keys mirror public/audio: "/audio/ko/sunhi/w12.mp3" is
 * "ko/sunhi/w12.mp3", "/audio/ko/index.json" is "ko/index.json". Sentence clips
 * that exist only in R2 sit under "t/": "en/aria/t/1x2y3z-4a5b6c.mp3".
 */
export function audioKey(pathname: string): string | null {
  const prefix = '/audio/'
  if (!pathname.startsWith(prefix)) return null
  const key = pathname.slice(prefix.length)
  return /^[a-z]{2,3}\/(index\.json|[a-z0-9]+\/([wep]\d+|t\/[0-9a-z]{1,8}-[0-9a-z]{1,8})\.mp3)$/.test(
    key
  )
    ? key
    : null
}

export function audioContentType(key: string): string {
  return key.endsWith('.json') ? 'application/json' : 'audio/mpeg'
}

/**
 * The part of an object R2 returned for a Range request (its R2Range). For an
 * open-ended range ("bytes=0-", what players send first) R2 hands back an
 * object that has a `suffix` key holding undefined, so the shape is read from
 * the values, never from which keys exist.
 */
export type ByteRange = { offset?: number; length?: number; suffix?: number }

const count = (n: number | undefined) => (typeof n === 'number' && Number.isFinite(n) ? n : null)

/** First and last byte of a range, for Content-Range; null when there is none. */
export function byteSpan(
  range: ByteRange | undefined,
  size: number
): { start: number; end: number } | null {
  if (!range || size <= 0) return null
  const suffix = count(range.suffix)
  if (suffix !== null) return { start: Math.max(0, size - suffix), end: size - 1 }
  const start = count(range.offset) ?? 0
  const length = count(range.length)
  const end = length === null ? size - 1 : start + length - 1
  return { start, end: Math.min(end, size - 1) }
}
