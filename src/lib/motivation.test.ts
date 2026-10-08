import { describe, expect, it } from 'vitest'
import {
  MAX_SHIELDS,
  coverageEstimate,
  daysAway,
  goalProgress,
  nextMilestone,
  nextStreak,
  quickStartPath,
  shareText,
  welcomeBack,
} from './motivation'

describe('nextStreak', () => {
  it('studying again the same day changes nothing', () => {
    const r = nextStreak({ streak: 3, lastStudyDay: 10, shields: 1 }, 10)
    expect(r).toMatchObject({ streak: 3, lastStudyDay: 10, shields: 1 })
  })

  it('the next day grows the streak', () => {
    expect(nextStreak({ streak: 3, lastStudyDay: 10 }, 11).streak).toBe(4)
  })

  it('a missed day with a shield keeps the streak and spends the shield', () => {
    const r = nextStreak({ streak: 9, lastStudyDay: 10, shields: 2 }, 12)
    expect(r).toMatchObject({ streak: 10, shields: 1, shieldUsedDay: 11 })
  })

  it('a missed day without a shield starts over', () => {
    expect(nextStreak({ streak: 9, lastStudyDay: 10, shields: 0 }, 12).streak).toBe(1)
  })

  it('two missed days are too many even with shields', () => {
    const r = nextStreak({ streak: 9, lastStudyDay: 10, shields: 2 }, 13)
    expect(r).toMatchObject({ streak: 1, shields: 2 })
  })

  it('earns a shield each full week, up to the maximum', () => {
    expect(nextStreak({ streak: 6, lastStudyDay: 10, shields: 0 }, 11).shields).toBe(1)
    expect(nextStreak({ streak: 13, lastStudyDay: 10, shields: MAX_SHIELDS }, 11).shields).toBe(
      MAX_SHIELDS
    )
    // Re-studying on day 7 must not earn a second shield.
    expect(nextStreak({ streak: 7, lastStudyDay: 11, shields: 1 }, 11).shields).toBe(1)
  })

  it('remembers the best streak', () => {
    expect(nextStreak({ streak: 4, lastStudyDay: 1, bestStreak: 20 }, 9).bestStreak).toBe(20)
    expect(nextStreak({ streak: 20, lastStudyDay: 8, bestStreak: 20 }, 9).bestStreak).toBe(21)
  })

  it('a brand-new learner starts at one', () => {
    expect(nextStreak({ streak: 0, lastStudyDay: null }, 5)).toMatchObject({
      streak: 1,
      shields: 0,
      bestStreak: 1,
    })
  })
})

describe('welcome back', () => {
  it('counts the days away', () => {
    expect(daysAway(null, 10)).toBeNull()
    expect(daysAway(7, 10)).toBe(3)
  })

  it('greets only after a real break, and never scolds', () => {
    expect(welcomeBack(null)).toBeNull()
    expect(welcomeBack(1)).toBeNull()
    const short = welcomeBack(3)!
    expect(short.body).toContain('3 ngày')
    expect(welcomeBack(30)!.body).toContain('5 từ')
  })
})

describe('daily goal', () => {
  it('tracks progress and caps the ratio', () => {
    expect(goalProgress(3, 10)).toMatchObject({ ratio: 0.3, reached: false, left: 7 })
    expect(goalProgress(12, 10)).toMatchObject({ ratio: 1, reached: true, left: 0 })
    expect(goalProgress(0, 0).goal).toBe(1)
  })
})

describe('coverage', () => {
  it('grows with known words but never past the top of the table', () => {
    expect(coverageEstimate(0)).toBe(0)
    expect(coverageEstimate(100)).toBe(50)
    expect(coverageEstimate(1000)).toBe(75)
    const mid = coverageEstimate(500)
    expect(mid).toBeGreaterThan(63)
    expect(mid).toBeLessThan(75)
    expect(coverageEstimate(100000)).toBe(88)
    expect(coverageEstimate(5)).toBeGreaterThan(0)
  })
})

describe('milestones', () => {
  it('points at the next round number', () => {
    expect(nextMilestone(0)).toEqual({ target: 10, left: 10, from: 0 })
    expect(nextMilestone(87)).toEqual({ target: 100, left: 13, from: 50 })
    expect(nextMilestone(100).target).toBe(200)
    expect(nextMilestone(6000).target).toBe(7000)
  })
})

describe('quick start', () => {
  it('reviews what is due first, otherwise five new words', () => {
    expect(quickStartPath(3)).toBe('/review')
    expect(quickStartPath(0)).toBe('/learn?quick=1')
  })
})

describe('shareText', () => {
  it('mentions the stars, and the streak only when there is one', () => {
    expect(shareText(120, 5)).toContain('120 ngôi sao')
    expect(shareText(120, 5)).toContain('5 ngày')
    expect(shareText(3, 1)).not.toContain('chuỗi')
  })
})
