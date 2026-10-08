import { describe, expect, it } from 'vitest'
import { evaluateAchievements, type AchievementInput } from './achievements'

const base: AchievementInput = {
  learned: 0,
  mastered: 0,
  streak: 0,
  xp: 0,
  totalReviews: 0,
  accuracy: 0,
}
const get = (m: Partial<AchievementInput>, id: string) =>
  evaluateAchievements({ ...base, ...m }).find((a) => a.id === id)!

describe('achievements', () => {
  it('rewards coming back on separate days, streak or not', () => {
    expect(get({ daysStudied: 9 }, 'days10').unlocked).toBe(false)
    expect(get({ daysStudied: 10 }, 'days10').unlocked).toBe(true)
    expect(get({ daysStudied: 15 }, 'days30').progress).toBeCloseTo(0.5)
    expect(get({}, 'days10').progress).toBe(0)
  })

  it('a best streak counts even after the streak itself ended', () => {
    expect(get({ streak: 2, bestStreak: 14 }, 'best14').unlocked).toBe(true)
    expect(get({ streak: 14 }, 'best14').unlocked).toBe(true)
    expect(get({ streak: 5, bestStreak: 7 }, 'best14').unlocked).toBe(false)
  })

  it('has milestones for the bigger pack', () => {
    expect(get({ learned: 2000 }, 'learn2000').unlocked).toBe(true)
    expect(get({ learned: 2999 }, 'learn3000').unlocked).toBe(false)
  })

  it('every badge has a unique id', () => {
    const ids = evaluateAchievements(base).map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
