import type { QuizQuestion, SRSCard, Word } from '@/types'
import { makeQuestion } from '@/lib/quiz'
import { phaseOf } from '@/lib/srs'

// "Học vượt bộ này" (docs/design/learning-depth.md): a short check on the deck
// the learner is about to study. Passing skips the deck's new words the same way
// "Mình biết từ này rồi" does — each is checked again a few days later.

export const TEST_OUT_SIZE = 8
/** Decks with fewer new words than this are not worth a check. */
export const TEST_OUT_MIN_NEW = 5

/** Right answers needed: 7 of 8 (or the same share of a shorter check). */
export function testOutPassMark(total: number): number {
  return Math.ceil(total * 0.875)
}

/** The deck's words that are not in the review schedule yet. */
export function newWordsOf(
  words: readonly Word[],
  cards: Readonly<Record<number, SRSCard>>
): Word[] {
  return words.filter((w) => phaseOf(cards[w.id]) === 'new')
}

/** Meaning questions on up to TEST_OUT_SIZE of the deck's new words. */
export function testOutQuestions(
  deckWords: readonly Word[],
  fresh: readonly Word[],
  rng: () => number = Math.random
): QuizQuestion[] {
  const picked = [...fresh]
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[picked[i], picked[j]] = [picked[j], picked[i]]
  }
  return picked.slice(0, TEST_OUT_SIZE).map((w) => makeQuestion(w, [...deckWords], 'en-to-vi'))
}
