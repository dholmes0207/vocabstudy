import { describe, expect, it } from 'vitest'
import type { SRSCard } from '@/types'
import {
  INTERVALS,
  MASTERED_BOX,
  daysUntilDue,
  getDueCards,
  masteryProgress,
  newCard,
  phaseOf,
  review,
} from './srs'

const DAY = 20000 // arbitrary fixed epoch day, so tests never depend on the clock

describe('newCard', () => {
  it('starts in box 0, due immediately, never reviewed', () => {
    const c = newCard(7, DAY)
    expect(c).toEqual({
      id: 7,
      box: 0,
      dueDay: DAY,
      lastReviewedDay: null,
      correctCount: 0,
      wrongCount: 0,
      createdDay: DAY,
    })
  })
})

describe('review', () => {
  it('does not mutate the card it is given', () => {
    const c = newCard(1, DAY)
    const snapshot = { ...c }
    review(c, true, DAY)
    expect(c).toEqual(snapshot)
  })

  it('walks the 1/2/5/14/30 ladder one box per correct answer', () => {
    let c = newCard(1, DAY)
    let day = DAY

    for (const [box, interval] of INTERVALS.entries()) {
      c = review(c, true, day)
      expect(c.box).toBe(box + 1)
      expect(c.dueDay).toBe(day + interval)
      expect(c.lastReviewedDay).toBe(day)
      expect(c.correctCount).toBe(box + 1)
      day = c.dueDay
    }

    // Clearing the final 30-day wait is what actually grants mastery.
    expect(c.box).toBe(INTERVALS.length)
    expect(phaseOf(c)).not.toBe('mastered')
    c = review(c, true, day)
    expect(c.box).toBe(MASTERED_BOX)
    expect(phaseOf(c)).toBe('mastered')
  })

  it('needs 6 correct answers to master — the study plus 5 reviews', () => {
    let c = newCard(1, DAY)
    let day = DAY
    let answers = 0
    while (c.box < MASTERED_BOX) {
      c = review(c, true, day)
      day = c.dueDay
      answers++
      expect(answers).toBeLessThanOrEqual(10) // guard against an infinite loop
    }
    expect(answers).toBe(6)
  })

  it('sends a wrong answer back to box 0, due again the same day', () => {
    let c = newCard(1, DAY)
    c = review(c, true, DAY) // box 1
    c = review(c, true, c.dueDay) // box 2
    const beforeWrong = c.correctCount

    const day = c.dueDay
    c = review(c, false, day)
    expect(c.box).toBe(0)
    expect(c.dueDay).toBe(day)
    expect(c.lastReviewedDay).toBe(day)
    expect(c.wrongCount).toBe(1)
    expect(c.correctCount).toBe(beforeWrong) // a miss never adds to correctCount
  })

  // Spacing is the whole point: an answer given before the card is due proves
  // the learner still has it in short-term memory, nothing more. Letting it
  // climb the ladder meant three quizzes in one evening "mastered" a word.
  describe('answers given before the card is due', () => {
    it('a correct answer does not advance the box or push the due date', () => {
      let c = review(newCard(1, DAY), true, DAY) // box 1, due DAY+1
      const before = c
      c = review(c, true, DAY) // same evening, again
      expect(c.box).toBe(before.box)
      expect(c.dueDay).toBe(before.dueDay)
    })

    it('still counts the correct answer and the activity', () => {
      let c = review(newCard(1, DAY), true, DAY)
      c = review(c, true, DAY)
      expect(c.correctCount).toBe(2)
      expect(c.lastReviewedDay).toBe(DAY)
    })

    it('cannot reach mastery by drilling one day over and over', () => {
      let c = newCard(1, DAY)
      for (let i = 0; i < 20; i++) c = review(c, true, DAY)
      expect(c.box).toBe(1)
      expect(phaseOf(c)).not.toBe('mastered')
    })

    it('a wrong answer always counts — forgetting early is real information', () => {
      let c = review(newCard(1, DAY), true, DAY) // box 1
      c = review(c, true, c.dueDay) // box 2, due in 2 days
      const day = c.dueDay - 1 // not due yet
      c = review(c, false, day)
      expect(c.box).toBe(0)
      expect(c.dueDay).toBe(day)
    })

    it('a card relearnt the same day (wrong, then right) is checked again tomorrow', () => {
      let c = review(newCard(1, DAY), false, DAY) // box 0, due today
      c = review(c, true, DAY)
      expect(c.box).toBe(1)
      expect(c.dueDay).toBe(DAY + INTERVALS[0])
    })

    it('an overdue card advances normally', () => {
      let c = review(newCard(1, DAY), true, DAY) // due DAY+1
      c = review(c, true, DAY + 10)
      expect(c.box).toBe(2)
      expect(c.dueDay).toBe(DAY + 10 + INTERVALS[1])
    })
  })

  it('keeps a mastered card at MASTERED_BOX instead of overflowing', () => {
    const mastered: SRSCard = { ...newCard(1, DAY), box: MASTERED_BOX }
    const after = review(mastered, true, DAY)
    expect(after.box).toBe(MASTERED_BOX)
    expect(after.dueDay).toBe(DAY + INTERVALS[INTERVALS.length - 1])
  })
})

describe('phaseOf', () => {
  it('treats a missing card as new', () => {
    expect(phaseOf(undefined)).toBe('new')
  })

  it('separates never-studied from lapsed cards in box 0', () => {
    const fresh = newCard(1, DAY)
    expect(phaseOf(fresh)).toBe('new')
    expect(phaseOf({ ...fresh, lastReviewedDay: DAY })).toBe('learning')
  })

  it('maps boxes 1-2 to learning and 3-5 to review', () => {
    const base = { ...newCard(1, DAY), lastReviewedDay: DAY }
    expect(phaseOf({ ...base, box: 1 })).toBe('learning')
    expect(phaseOf({ ...base, box: 2 })).toBe('learning')
    expect(phaseOf({ ...base, box: 3 })).toBe('review')
    expect(phaseOf({ ...base, box: 5 })).toBe('review')
    expect(phaseOf({ ...base, box: MASTERED_BOX })).toBe('mastered')
  })
})

describe('getDueCards', () => {
  const card = (over: Partial<SRSCard>): SRSCard => ({ ...newCard(1, DAY), ...over })

  it('excludes never-studied cards even though they are due today', () => {
    expect(getDueCards([card({ id: 1, dueDay: DAY })], DAY)).toEqual([])
  })

  it('excludes mastered cards and cards not yet due', () => {
    const cards = [
      card({ id: 1, box: MASTERED_BOX, dueDay: DAY, lastReviewedDay: DAY - 30 }),
      card({ id: 2, box: 2, dueDay: DAY + 1, lastReviewedDay: DAY }),
    ]
    expect(getDueCards(cards, DAY)).toEqual([])
  })

  it('includes overdue cards and sorts by dueDay, then box', () => {
    const cards = [
      card({ id: 1, box: 3, dueDay: DAY, lastReviewedDay: DAY - 5 }),
      card({ id: 2, box: 1, dueDay: DAY - 4, lastReviewedDay: DAY - 6 }),
      card({ id: 3, box: 1, dueDay: DAY, lastReviewedDay: DAY - 2 }),
    ]
    expect(getDueCards(cards, DAY).map((c) => c.id)).toEqual([2, 3, 1])
  })
})

describe('masteryProgress / daysUntilDue', () => {
  it('reports 0 for an unknown word and 1 once mastered', () => {
    expect(masteryProgress(undefined)).toBe(0)
    expect(masteryProgress(newCard(1, DAY))).toBe(0)
    expect(masteryProgress({ ...newCard(1, DAY), box: MASTERED_BOX })).toBe(1)
  })

  it('never exceeds 1 even if the box somehow overshoots', () => {
    expect(masteryProgress({ ...newCard(1, DAY), box: MASTERED_BOX + 4 })).toBe(1)
  })

  it('goes negative once a card is overdue', () => {
    expect(daysUntilDue({ ...newCard(1, DAY), dueDay: DAY + 3 }, DAY)).toBe(3)
    expect(daysUntilDue({ ...newCard(1, DAY), dueDay: DAY - 2 }, DAY)).toBe(-2)
  })
})
