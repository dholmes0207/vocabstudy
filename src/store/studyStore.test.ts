import { beforeEach, describe, expect, it } from 'vitest'
import { useStudy } from './studyStore'
import { today } from '@/lib/date'
import { KNOWN_BOX, KNOWN_CHECK_DAYS, phaseOf, review } from '@/lib/srs'

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

describe('markKnown ("Mình biết từ này rồi")', () => {
  it('schedules a check in a few days, without XP or a new word of the day', () => {
    useStudy.getState().markKnown('en', 7)
    const { cards, stats } = useStudy.getState().progress.en
    expect(cards[7]).toMatchObject({
      box: KNOWN_BOX,
      dueDay: today() + KNOWN_CHECK_DAYS,
      lastReviewedDay: today(),
    })
    expect(phaseOf(cards[7])).toBe('review')
    expect(stats.xp).toBe(0)
    expect(useStudy.getState().newIntroducedToday('en')).toBe(0)
  })

  it('leaves a word that is already in the schedule alone', () => {
    useStudy.getState().recordAnswer('en', 7, false)
    const before = useStudy.getState().progress.en.cards[7]
    useStudy.getState().markKnown('en', 7)
    expect(useStudy.getState().progress.en.cards[7]).toBe(before)
  })

  it('sends a "known" word back to the start when the check is missed', () => {
    useStudy.getState().markKnown('en', 7)
    const card = useStudy.getState().progress.en.cards[7]
    expect(review(card, false, card.dueDay)).toMatchObject({ box: 0 })
    expect(review(card, true, card.dueDay)).toMatchObject({ box: KNOWN_BOX + 1 })
  })
})
