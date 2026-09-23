import type { QuizMode, SRSCard, Word } from '@/types'
import { gapSentence } from './quiz'

// ============================================================================
// How a study session is shaped — pure, so every rule here is unit tested.
//
// Learning new words: small groups (a beginner can hold ~5 new things in mind),
// each word met on a full card first, then asked about twice — recognise it
// (pick the meaning), then recall it (pick the English word for the sentence).
//
// Reviewing: the question gets harder as the card matures — recognition while
// the memory is young, recall in the middle, writing it out once it is old.
// That is the "desirable difficulty" that turns a word you recognise into one
// you can use.
//
// Both: a missed question comes back a few questions later (not immediately —
// that only tests the last five seconds), at most MAX_ATTEMPTS times.
// ============================================================================

/** New words per group in a learning session. */
export const GROUP_SIZE = 5
/** How many other questions come between a miss and its retry. */
export const REQUEUE_GAP = 3
/** Total tries one question may take before the session moves on. */
export const MAX_ATTEMPTS = 3

export interface Drill {
  wordId: number
  mode: QuizMode
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * The practice questions for one freshly-met group: a recognition round then a
 * recall round, each in random order, never the same word twice in a row.
 */
export function learnDrills(group: Word[]): Drill[] {
  const recognise = shuffle(group).map((w) => ({ wordId: w.id, mode: 'en-to-vi' as QuizMode }))
  const recall = shuffle(group).map((w) => ({
    wordId: w.id,
    mode: (gapSentence(w) ? 'context' : 'vi-to-en') as QuizMode,
  }))
  // The last recognised word must not open the recall round.
  if (recall.length > 1 && recall[0].wordId === recognise[recognise.length - 1].wordId) {
    ;[recall[0], recall[1]] = [recall[1], recall[0]]
  }
  return [...recognise, ...recall]
}

/**
 * The question type for reviewing a card, by how mature it is. Alternates
 * between two modes by day, so a word is not always asked the same way.
 */
export function reviewModeFor(card: SRSCard, word: Word, day: number): QuizMode {
  const flip = (word.id + day) % 2 === 0
  const canGap = gapSentence(word) !== null
  if (card.box <= 1) return flip ? 'en-to-vi' : 'listen'
  if (card.box <= 3) return flip && canGap ? 'context' : 'vi-to-en'
  if (!flip && canGap) return 'fill'
  // A one-letter word ("a") has nothing left to spell once its skeleton shows.
  const letters = word.word.split('/')[0].replace(/[^a-z]/gi, '').length
  return letters > 1 ? 'spell' : 'vi-to-en'
}

/** Insert `item` REQUEUE_GAP places after `index` (or at the end). Pure. */
export function requeue<T>(queue: T[], index: number, item: T, gap = REQUEUE_GAP): T[] {
  const at = Math.min(queue.length, index + 1 + gap)
  return [...queue.slice(0, at), item, ...queue.slice(at)]
}
