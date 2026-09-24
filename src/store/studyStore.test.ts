import { beforeEach, describe, expect, it } from 'vitest'
import { useStudy } from './studyStore'
import { today } from '@/lib/date'

// Games award XP and count as a study day, but must never move an SRS card:
// a mis-tap while racing the clock is not evidence of forgetting.

beforeEach(() => useStudy.setState({ progress: {} }))

describe('addPlayXp', () => {
  it('adds XP and counts today towards the streak', () => {
    useStudy.getState().addPlayXp('en', 15)
    const stats = useStudy.getState().progress.en.stats
    expect(stats.xp).toBe(15)
    expect(stats.streak).toBe(1)
    expect(stats.lastStudyDay).toBe(today())
  })

  it('leaves cards and review counts untouched', () => {
    useStudy.getState().recordAnswer('en', 1, true)
    const before = useStudy.getState().progress.en
    useStudy.getState().addPlayXp('en', 5)
    const after = useStudy.getState().progress.en
    expect(after.cards).toEqual(before.cards)
    expect(after.stats.totalReviews).toBe(before.stats.totalReviews)
    expect(after.stats.reviewsByDay).toEqual(before.stats.reviewsByDay)
    expect(after.stats.xp).toBe(before.stats.xp + 5)
  })

  it('ignores zero or negative amounts', () => {
    useStudy.getState().addPlayXp('en', 0)
    useStudy.getState().addPlayXp('en', -4)
    expect(useStudy.getState().progress.en?.stats.xp ?? 0).toBe(0)
  })
})
