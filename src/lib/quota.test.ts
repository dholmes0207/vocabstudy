import { describe, expect, it } from 'vitest'
import { parseDailyLimit, quotaHint, quotaVerdict, summarizeUsage } from './quota'

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

// The cap fails open on purpose, so from the outside a broken counter looks
// exactly like a working one. These two helpers are how it becomes visible:
// an admin panel that shows today's real numbers, and a nudge for the learner
// before they hit the wall mid-conversation.

describe('summarizeUsage — what the admin panel reports', () => {
  it('reports nothing used when there are no rows yet today', () => {
    expect(summarizeUsage([])).toEqual({ users: 0, requests: 0 })
  })

  it('adds up requests and counts the learners behind them', () => {
    expect(
      summarizeUsage([
        { user_id: 'a', used: 3 },
        { user_id: 'b', used: 12 },
      ])
    ).toEqual({ users: 2, requests: 15 })
  })

  it('counts a learner once even if the row set repeats them', () => {
    // One row per user per day is the primary key, but a report that
    // double-counts on bad input is worse than useless.
    expect(
      summarizeUsage([
        { user_id: 'a', used: 3 },
        { user_id: 'a', used: 4 },
      ])
    ).toEqual({ users: 1, requests: 7 })
  })

  it('skips malformed rows rather than reporting NaN at an admin', () => {
    expect(
      summarizeUsage([
        { user_id: 'a', used: 2 },
        { user_id: 'b' },
        { used: 5 },
        null,
        { user_id: 'c', used: 'nhiều' },
      ] as unknown[])
    ).toEqual({ users: 1, requests: 2 })
  })

  it('survives a non-array payload', () => {
    expect(summarizeUsage(null)).toEqual({ users: 0, requests: 0 })
    expect(summarizeUsage({ error: 'nope' })).toEqual({ users: 0, requests: 0 })
  })
})

describe('quotaHint — the nudge shown to the learner', () => {
  it('says nothing while there is plenty left', () => {
    expect(quotaHint(20)).toBeNull()
    expect(quotaHint(6)).toBeNull()
  })

  it('says nothing when the server did not report a number', () => {
    // No cap configured, or the counter was unreachable — either way, inventing
    // a number for the learner would be a lie.
    expect(quotaHint(undefined)).toBeNull()
    expect(quotaHint(null)).toBeNull()
    expect(quotaHint(Number.POSITIVE_INFINITY)).toBeNull()
    expect(quotaHint(Number.NaN)).toBeNull()
  })

  it('warns once the end is in sight, naming the number left', () => {
    expect(quotaHint(5)).toContain('5')
    expect(quotaHint(5)).toMatch(/hôm nay/i)
    expect(quotaHint(1)).toContain('1')
  })

  it('is explicit that the last one was the last one', () => {
    const hint = quotaHint(0)
    expect(hint).toMatch(/cuối cùng|hết/i)
    expect(hint).toMatch(/hôm nay/i)
  })

  it('treats a negative count as none left rather than showing "-2"', () => {
    expect(quotaHint(-2)).toBe(quotaHint(0))
  })
})
