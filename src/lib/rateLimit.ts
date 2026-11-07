// A small fixed-window rate limiter for Pages Functions (functions/api/errors.ts).
// It lives in one Worker isolate's memory, so it is a first line against a
// single client flooding an endpoint, not an exact global count: Cloudflare can
// run several isolates, each with its own windows. Pure, with the clock passed
// in, so it can be tested.

export class WindowLimiter {
  private readonly hits = new Map<string, { start: number; count: number }>()

  /**
   * @param limit   requests allowed per key in one window
   * @param windowMs length of a window
   * @param maxKeys keys remembered at most; the oldest windows are dropped first
   */
  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 10_000
  ) {}

  /** Counts one request for `key`; false once the key is over its limit for this window. */
  allow(key: string, now: number): boolean {
    const hit = this.hits.get(key)
    if (!hit || now - hit.start >= this.windowMs) {
      this.hits.delete(key)
      this.hits.set(key, { start: now, count: 1 })
      this.trim(now)
      return true
    }
    hit.count++
    return hit.count <= this.limit
  }

  /** Keys being tracked (for tests). */
  get size(): number {
    return this.hits.size
  }

  private trim(now: number): void {
    if (this.hits.size <= this.maxKeys) return
    // Map keeps insertion order and a new window re-inserts its key, so the
    // first entries are the oldest windows: expired ones go, then the oldest.
    for (const [key, hit] of this.hits) {
      if (this.hits.size <= this.maxKeys && now - hit.start < this.windowMs) break
      this.hits.delete(key)
    }
  }
}
