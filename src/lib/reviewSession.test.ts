import { describe, expect, it } from 'vitest'
import { BIG_BACKLOG, SESSION_CAP, reviewSessionSize } from './reviewSession'

describe('reviewSessionSize', () => {
  it('takes a normal day whole', () => {
    expect(reviewSessionSize(12, 0, 0)).toBe(12)
    expect(reviewSessionSize(BIG_BACKLOG, 0, 0)).toBe(BIG_BACKLOG)
  })

  it('splits a big pile into short sessions', () => {
    expect(reviewSessionSize(BIG_BACKLOG + 1, 0, 0)).toBe(SESSION_CAP)
    expect(reviewSessionSize(400, 0, 0)).toBe(SESSION_CAP)
  })

  it('lets the learner’s own limit, or the address, decide instead', () => {
    expect(reviewSessionSize(400, 80, 0)).toBe(80)
    expect(reviewSessionSize(400, 0, 20)).toBe(20)
    expect(reviewSessionSize(400, 80, 20)).toBe(20)
    expect(reviewSessionSize(10, 80, 20)).toBe(10)
    expect(reviewSessionSize(400, 0, NaN)).toBe(SESSION_CAP)
  })
})
