import { describe, expect, it } from 'vitest'
import { NUDGES, PRAISE, nudge, praise } from './encourage'

describe('encourage', () => {
  it('the same question always gets the same line', () => {
    expect(praise(42)).toBe(praise(42))
    expect(nudge(7)).toBe(nudge(7))
  })

  it('every line can appear, and odd seeds are safe', () => {
    expect(new Set(PRAISE.map((_, i) => praise(i))).size).toBe(PRAISE.length)
    expect(new Set(NUDGES.map((_, i) => nudge(i))).size).toBe(NUDGES.length)
    expect(nudge(-3)).toBeDefined()
    expect(praise(2.7)).toBeDefined()
  })

  it('a nudge never says the learner failed', () => {
    for (const n of NUDGES) expect(n).not.toMatch(/sai rồi|thất bại|kém/i)
  })
})
