import { describe, expect, it } from 'vitest'
import { WindowLimiter } from './rateLimit'

describe('WindowLimiter', () => {
  it('lets a key through up to its limit, then refuses until the window ends', () => {
    const lim = new WindowLimiter(3, 60_000)
    expect([0, 1, 2, 3].map((t) => lim.allow('a', t))).toEqual([true, true, true, false])
    expect(lim.allow('a', 59_999)).toBe(false)
    expect(lim.allow('a', 60_000)).toBe(true)
  })

  it('counts each key on its own', () => {
    const lim = new WindowLimiter(1, 1000)
    expect(lim.allow('a', 0)).toBe(true)
    expect(lim.allow('b', 0)).toBe(true)
    expect(lim.allow('a', 1)).toBe(false)
  })

  it('remembers a bounded number of keys, dropping the oldest windows first', () => {
    const lim = new WindowLimiter(1, 1000, 3)
    for (const [i, key] of ['a', 'b', 'c', 'd'].entries()) lim.allow(key, i)
    expect(lim.size).toBe(3)
    // "a" was dropped, so it starts afresh; "d" is still counted.
    expect(lim.allow('a', 10)).toBe(true)
    expect(lim.allow('d', 10)).toBe(false)
  })
})
