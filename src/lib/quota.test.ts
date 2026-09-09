import { describe, expect, it } from 'vitest'
import { parseDailyLimit, quotaVerdict } from './quota'

// /api/ai/chat proxies straight to OpenAI on the project's key with no cap, so
// one signed-in account could spend the whole budget. `used` here is the
// request count for today INCLUDING the request being judged, because the
// counter is bumped atomically in Postgres before the verdict is taken.

describe('parseDailyLimit', () => {
  it('uses the configured number when it is a sane one', () => {
    expect(parseDailyLimit('50', 30)).toBe(50)
    expect(parseDailyLimit(' 8 ', 30)).toBe(8)
  })

  it('falls back when the value is missing or nonsense', () => {
    expect(parseDailyLimit(undefined, 30)).toBe(30)
    expect(parseDailyLimit('', 30)).toBe(30)
    expect(parseDailyLimit('nhiều', 30)).toBe(30)
    expect(parseDailyLimit('12.5', 30)).toBe(30)
  })

  it('reads 0 as "no cap" rather than "block everything"', () => {
    // An admin turning the cap off must not accidentally disable the tutor.
    expect(parseDailyLimit('0', 30)).toBe(0)
  })

  it('refuses a negative cap and falls back', () => {
    expect(parseDailyLimit('-5', 30)).toBe(30)
  })
})

describe('quotaVerdict', () => {
  it('allows a request inside the cap and reports what is left', () => {
    expect(quotaVerdict(1, 30)).toMatchObject({ allowed: true, remaining: 29 })
    expect(quotaVerdict(29, 30)).toMatchObject({ allowed: true, remaining: 1 })
  })

  it('allows the request that lands exactly on the cap', () => {
    expect(quotaVerdict(30, 30)).toMatchObject({ allowed: true, remaining: 0 })
  })

  it('refuses the one after the cap', () => {
    expect(quotaVerdict(31, 30)).toMatchObject({ allowed: false, remaining: 0 })
  })

  it('treats limit 0 as unlimited', () => {
    expect(quotaVerdict(9999, 0).allowed).toBe(true)
  })

  it('never reports negative remaining', () => {
    expect(quotaVerdict(100, 30).remaining).toBe(0)
  })

  it('survives a junk counter instead of locking the learner out', () => {
    expect(quotaVerdict(Number.NaN, 30).allowed).toBe(true)
    expect(quotaVerdict(-3, 30).allowed).toBe(true)
  })

  it('explains the refusal in Vietnamese the learner can act on', () => {
    const v = quotaVerdict(31, 30)
    expect(v.allowed).toBe(false)
    expect(v.message).toMatch(/hôm nay/i)
    expect(v.message).toContain('30')
  })
})
