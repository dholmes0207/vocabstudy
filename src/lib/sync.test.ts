import { describe, expect, it } from 'vitest'
import type { LanguageProgress, SRSCard } from '@/types'
import { mergeProgress } from './sync'

// The sync bug this guards: `useProgressSync` used to overwrite local progress
// with whatever the server returned. Study a few words with a flaky connection
// (the pull fails, so pushes stay blocked and the work lives only in
// localStorage), reload once the network is back, and the older server row
// silently erased the session. Same story with two devices.

function card(over: Partial<SRSCard> & { id: number }): SRSCard {
  return {
    box: 1,
    dueDay: 100,
    lastReviewedDay: 99,
    correctCount: 1,
    wrongCount: 0,
    createdDay: 90,
    ...over,
  }
}

function progress(cards: SRSCard[], stats: Partial<LanguageProgress['stats']> = {}) {
  return {
    cards: Object.fromEntries(cards.map((c) => [c.id, c])),
    stats: {
      streak: 0,
      lastStudyDay: null,
      totalReviews: 0,
      totalCorrect: 0,
      xp: 0,
      newByDay: {},
      reviewsByDay: {},
      shields: 0,
      bestStreak: 0,
      shieldUsedDay: null,
      ...stats,
    },
  } satisfies LanguageProgress
}

describe('mergeProgress — streak shields', () => {
  it('keeps the best streak of both devices and the shields of the latest one', () => {
    const phone = progress([], { streak: 3, lastStudyDay: 20, shields: 0, bestStreak: 12 })
    const laptop = progress([], { streak: 9, lastStudyDay: 18, shields: 2, bestStreak: 9 })
    const merged = mergeProgress(phone, laptop)
    expect(merged.stats.bestStreak).toBe(12)
    expect(merged.stats.shields).toBe(0)
  })
})

describe('mergeProgress — cards', () => {
  it('keeps a card only the local side knows about (studied offline)', () => {
    const merged = mergeProgress(progress([card({ id: 1 })]), progress([]))
    expect(merged.cards[1]).toBeDefined()
  })

  it('keeps a card only the server knows about (studied on another device)', () => {
    const merged = mergeProgress(progress([]), progress([card({ id: 2 })]))
    expect(merged.cards[2]).toBeDefined()
  })

  it('prefers whichever side reviewed the card more recently', () => {
    const older = card({ id: 3, box: 1, lastReviewedDay: 100 })
    const newer = card({ id: 3, box: 4, lastReviewedDay: 130 })
    expect(mergeProgress(progress([older]), progress([newer])).cards[3].box).toBe(4)
    expect(mergeProgress(progress([newer]), progress([older])).cards[3].box).toBe(4)
  })

  it('treats a never-reviewed card as older than a reviewed one', () => {
    const fresh = card({ id: 4, box: 0, lastReviewedDay: null, correctCount: 0 })
    const reviewed = card({ id: 4, box: 2, lastReviewedDay: 120 })
    expect(mergeProgress(progress([fresh]), progress([reviewed])).cards[4].box).toBe(2)
    expect(mergeProgress(progress([reviewed]), progress([fresh])).cards[4].box).toBe(2)
  })

  it('breaks a same-day tie in favour of the side with more answers recorded', () => {
    const light = card({ id: 5, lastReviewedDay: 110, correctCount: 1, wrongCount: 0, box: 1 })
    const heavy = card({ id: 5, lastReviewedDay: 110, correctCount: 3, wrongCount: 2, box: 3 })
    expect(mergeProgress(progress([light]), progress([heavy])).cards[5].box).toBe(3)
    expect(mergeProgress(progress([heavy]), progress([light])).cards[5].box).toBe(3)
  })

  it('never loses cards, whichever way round the merge runs', () => {
    const a = progress([card({ id: 1 }), card({ id: 2 })])
    const b = progress([card({ id: 2 }), card({ id: 3 })])
    expect(Object.keys(mergeProgress(a, b).cards).sort()).toEqual(['1', '2', '3'])
    expect(Object.keys(mergeProgress(b, a).cards).sort()).toEqual(['1', '2', '3'])
  })
})

describe('mergeProgress — stats', () => {
  it('never lowers a counter (a merge must not look like lost work)', () => {
    const local = progress([], { totalReviews: 120, totalCorrect: 90, xp: 1500, streak: 7 })
    const remote = progress([], { totalReviews: 80, totalCorrect: 70, xp: 900, streak: 12 })
    const merged = mergeProgress(local, remote).stats
    expect(merged.totalReviews).toBe(120)
    expect(merged.totalCorrect).toBe(90)
    expect(merged.xp).toBe(1500)
    expect(merged.streak).toBe(12)
  })

  it('keeps the latest study day', () => {
    const local = progress([], { lastStudyDay: 130 })
    const remote = progress([], { lastStudyDay: 90 })
    expect(mergeProgress(local, remote).stats.lastStudyDay).toBe(130)
    expect(mergeProgress(remote, local).stats.lastStudyDay).toBe(130)
  })

  it('takes the per-day maximum rather than summing (a synced day is not two days)', () => {
    const local = progress([], { reviewsByDay: { 100: 12, 101: 5 }, newByDay: { 100: 10 } })
    const remote = progress([], { reviewsByDay: { 100: 12, 102: 8 }, newByDay: { 100: 15 } })
    const merged = mergeProgress(local, remote).stats
    expect(merged.reviewsByDay).toEqual({ 100: 12, 101: 5, 102: 8 })
    expect(merged.newByDay).toEqual({ 100: 15 })
  })
})

describe('mergeProgress — degenerate input', () => {
  it('returns the other side when one is missing entirely', () => {
    const only = progress([card({ id: 9 })], { xp: 50 })
    expect(mergeProgress(undefined, only)).toEqual(only)
    expect(mergeProgress(only, undefined)).toEqual(only)
  })

  it('survives malformed server payloads without throwing', () => {
    const local = progress([card({ id: 1 })], { xp: 10 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const junk = { cards: null, stats: 'nope' } as any
    expect(() => mergeProgress(local, junk)).not.toThrow()
    expect(mergeProgress(local, junk).cards[1]).toBeDefined()
  })
})
