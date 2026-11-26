import type { CardPhase, SRSCard } from '@/types'
import { today } from './date'

// ============================================================================
// Spaced Repetition System — a Leitner-box scheduler tuned to the source
// document's schedule: review at Day 1 -> 2 -> 5 -> 14 -> 30.
//
// A card sits in "box" b (0-indexed). Box b means it has passed b successful
// reviews. After a correct answer in box b it waits INTERVALS[b] days before
// the next review and advances to box b+1. A card that has advanced past the
// last interval (box === INTERVALS.length) is "mastered".
// A wrong answer sends the card back to box 0 (relearn the ladder).
//
// Only an answer given ON or AFTER the due day moves a card up. Answering a
// card early (a quiz, a second pass in the same lesson) says the word is still
// in short-term memory — which is not what the ladder measures — so a correct
// early answer is counted but leaves the schedule alone. A wrong answer always
// counts: forgetting is real information whenever it happens.
// ============================================================================

/** Review intervals in days, matching Day 1 -> 2 -> 5 -> 14 -> 30. */
export const INTERVALS: readonly number[] = [1, 2, 5, 14, 30]

/**
 * Box index at which a card is considered fully mastered.
 *
 * A card must clear ALL intervals — including the final 30-day wait — before
 * graduating: box 4 answered correctly schedules the +30-day review and moves
 * to box 5 (still a "review" card); clearing box 5 moves to box 6 = mastered.
 * So mastery = the initial study + 5 successful reviews at 1/2/5/14/30 days.
 */
export const MASTERED_BOX = INTERVALS.length + 1 // 6

/**
 * Maintenance (task 4.1 in docs/PLAN.md): a mastered word still comes back,
 * sparsely, so it is not quietly forgotten — first MAINTENANCE_FIRST days after
 * mastery, then each gap doubles up to MAINTENANCE_MAX. The gap is read from the
 * card itself (dueDay − lastReviewedDay), so no new field is stored or synced.
 */
export const MAINTENANCE_FIRST = 60
export const MAINTENANCE_MAX = 240
/** Mastered words asked per day, on top of the ordinary reviews. */
export const MAINTENANCE_PER_DAY = 5

/** The next maintenance gap after one passed at `gap` days: 60 → 120 → 240 → 240. */
export function nextMaintenanceGap(gap: number): number {
  if (!(gap >= MAINTENANCE_FIRST)) return MAINTENANCE_FIRST
  return Math.min(MAINTENANCE_MAX, gap * 2)
}

/** Create a fresh card for a word just introduced today. */
export function newCard(id: number, day: number = today()): SRSCard {
  return {
    id,
    box: 0,
    // A brand-new card is due immediately for its first study.
    dueDay: day,
    lastReviewedDay: null,
    correctCount: 0,
    wrongCount: 0,
    createdDay: day,
  }
}

/**
 * "Mình biết từ này rồi" (docs/design/learning-depth.md): a word the learner
 * says they already know skips the early steps but is not mastered — it waits
 * KNOWN_CHECK_DAYS, then a review asks for it at that box's (harder) question
 * type. A wrong answer there sends it back to box 0 like any other card.
 */
export const KNOWN_BOX = 3
export const KNOWN_CHECK_DAYS = INTERVALS[2]

export function knownCard(id: number, day: number = today()): SRSCard {
  return {
    id,
    box: KNOWN_BOX,
    dueDay: day + KNOWN_CHECK_DAYS,
    lastReviewedDay: day,
    correctCount: 0,
    wrongCount: 0,
    createdDay: day,
  }
}

/**
 * Apply a review outcome to a card and return the *new* card (pure function).
 * @param card    the card being reviewed
 * @param correct whether the learner answered correctly
 * @param day     the epoch day of the review (defaults to today)
 */
export function review(card: SRSCard, correct: boolean, day: number = today()): SRSCard {
  if (correct && !isDue(card, day)) {
    // Early and right: the learner gets the credit, the schedule stays put.
    return { ...card, lastReviewedDay: day, correctCount: card.correctCount + 1 }
  }
  if (correct && card.box >= MASTERED_BOX) {
    // A maintenance review passed: the next one comes back later still.
    const gap = card.lastReviewedDay === null ? 0 : card.dueDay - card.lastReviewedDay
    return {
      ...card,
      box: MASTERED_BOX,
      dueDay: day + nextMaintenanceGap(gap),
      lastReviewedDay: day,
      correctCount: card.correctCount + 1,
    }
  }
  if (correct) {
    const nextBox = Math.min(card.box + 1, MASTERED_BOX)
    // Interval to wait is keyed by the box we just cleared.
    const intervalDays = INTERVALS[Math.min(card.box, INTERVALS.length - 1)]
    return {
      ...card,
      box: nextBox,
      dueDay: nextBox >= MASTERED_BOX ? day + MAINTENANCE_FIRST : day + intervalDays,
      lastReviewedDay: day,
      correctCount: card.correctCount + 1,
    }
  }
  // Wrong: relearn from the start, due again today. A mastered word that slipped
  // goes back to the review steps, not to the very beginning (task 4.1).
  return {
    ...card,
    box: card.box >= MASTERED_BOX ? KNOWN_BOX : 0,
    dueDay: day,
    lastReviewedDay: day,
    wrongCount: card.wrongCount + 1,
  }
}

/**
 * Whether an answer on `day` counts toward the schedule. A never-answered card
 * is always due (its first study); otherwise the due day must have arrived.
 */
export function isDue(card: SRSCard, day: number = today()): boolean {
  return card.lastReviewedDay === null || card.dueDay <= day
}

/** Derive the human-facing lifecycle phase of a card. */
export function phaseOf(card: SRSCard | undefined): CardPhase {
  if (!card) return 'new'
  if (card.box >= MASTERED_BOX) return 'mastered'
  if (card.box === 0) return card.lastReviewedDay === null ? 'new' : 'learning'
  if (card.box <= 2) return 'learning'
  return 'review'
}

/**
 * Cards due for review on/before `day`, i.e. already-started cards whose next
 * review date has arrived and which are not yet mastered.
 */
export function getDueCards(cards: SRSCard[], day: number = today()): SRSCard[] {
  return cards
    .filter((c) => c.box < MASTERED_BOX && c.lastReviewedDay !== null && c.dueDay <= day)
    .sort((a, b) => a.dueDay - b.dueDay || a.box - b.box)
}

/**
 * Mastered cards due for their maintenance review on `day`: the most overdue
 * first, at most MAINTENANCE_PER_DAY a day counting those already answered today.
 */
export function getMaintenanceCards(
  cards: SRSCard[],
  day: number = today(),
  perDay: number = MAINTENANCE_PER_DAY
): SRSCard[] {
  const mastered = cards.filter((c) => c.box >= MASTERED_BOX && c.lastReviewedDay !== null)
  const doneToday = mastered.filter((c) => c.lastReviewedDay === day).length
  return mastered
    .filter((c) => c.dueDay <= day && c.lastReviewedDay !== day)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, Math.max(0, perDay - doneToday))
}

/** Words to review on `day`: the due ones plus the day's few maintenance words. */
export function dueCount(cards: SRSCard[], day: number = today()): number {
  return getDueCards(cards, day).length + getMaintenanceCards(cards, day).length
}
