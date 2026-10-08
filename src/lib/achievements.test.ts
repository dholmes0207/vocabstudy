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

describe('sticker badges', () => {
  it('unlock as the gift album fills up', () => {
    const base = { learned: 1, mastered: 0, streak: 0, xp: 0, totalReviews: 0, accuracy: 0 }
    const byId = (stickers: number) =>
      Object.fromEntries(evaluateAchievements({ ...base, stickers }).map((a) => [a.id, a]))
    expect(byId(6).stickers12).toMatchObject({ unlocked: false, progress: 0.5 })
    expect(byId(12).stickers12.unlocked).toBe(true)
    expect(byId(48).stickers48.unlocked).toBe(true)
  })
})
