/**
 * A short, stable fingerprint of a string (FNV-1a, 32-bit, base 36).
 *
 * Used to version example-sentence audio URLs: when a sentence is rewritten and
 * its clip regenerated, the URL changes with it, so neither the 30-day HTTP
 * cache (public/_headers) nor the service worker's cache-first store can keep
 * playing the old recording under the new text.
 */
export function textHash(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}
