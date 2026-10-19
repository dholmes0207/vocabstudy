import type { LanguageProgress, StudyStats, Word } from '@/types'
import { getDueCards, phaseOf } from './srs'
import { today as todayFn } from './date'

export interface StudySummary {
  total: number
  /** Words the learner has started (have a card). */
  learned: number
  mastered: number
  learning: number
  /** Words never studied. */
  fresh: number
  /** Cards due for review today. */
  due: number
  /** New words still allowed to be introduced today (capped by limit & availability). */
  newRemainingToday: number
  /** New words introduced so far today. */
  newDoneToday: number
  /** Reviews completed today. */
  reviewsDoneToday: number
}

export function summarize(
  words: Word[],
  progress: LanguageProgress | undefined,
  dailyNewLimit: number,
  day: number = todayFn()
): StudySummary {
  const cards = progress?.cards ?? {}
  const stats: StudyStats | undefined = progress?.stats

  let mastered = 0
  let learning = 0
  let learned = 0
  for (const w of words) {
    const card = cards[w.id]
    if (!card) continue
    learned++
    const phase = phaseOf(card)
    if (phase === 'mastered') mastered++
    else if (phase === 'learning' || phase === 'review') learning++
  }

  const due = getDueCards(Object.values(cards), day).length
  const fresh = words.length - learned
  const newDoneToday = stats?.newByDay?.[day] ?? 0
  const reviewsDoneToday = stats?.reviewsByDay?.[day] ?? 0
  const newRemainingToday = Math.max(0, Math.min(dailyNewLimit - newDoneToday, fresh))

  return {
    total: words.length,
    learned,
    mastered,
    learning,
    fresh,
    due,
    newRemainingToday,
    newDoneToday,
    reviewsDoneToday,
  }
}

// Grammar words: frequent, so the pack lists them first, but abstract — a
// lesson made only of "the, of, to, in, is" teaches a beginner very little.
const GRAMMAR_POS: ReadonlySet<string> = new Set([
  'article',
  'preposition',
  'determiner',
  'pronoun',
  'conjunction',
  'adverb',
])
// Forms of be/have/do and the modals: verbs by part of speech, grammar in use.
const AUXILIARIES: ReadonlySet<string> = new Set([
  ...['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being'],
  ...['have', 'has', 'had', 'having', 'do', 'does', 'did'],
  ...['can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must'],
])

/** A word that carries grammar more than meaning (the, of, you, is, can…). */
export function isGrammarWord(w: Word): boolean {
  return GRAMMAR_POS.has(w.posCategory) || AUXILIARIES.has(w.word.toLowerCase())
}

/**
 * The next batch of never-studied words in the pack's order. With a placement
 * start (docs/design/placement.md), words from `startAt` on come first; the
 * skipped ones that are still new follow once those run out.
 *
 * At most a third of a batch (at least one) are grammar words; the others wait
 * at the front of the queue for the next batch, so every lesson mixes words a
 * learner can picture with the little words that hold sentences together.
 */
export function nextNewWords(
  words: Word[],
  progress: LanguageProgress | undefined,
  limit: number,
  startAt = 0
): Word[] {
  const cards = progress?.cards ?? {}
  const ahead: Word[] = []
  const behind: Word[] = []
  words.forEach((w, i) => {
    if (!cards[w.id]) (i >= startAt ? ahead : behind).push(w)
  })
  const queue = [...ahead, ...behind]
  const size = Math.max(0, limit)
  let grammarLeft = Math.max(1, Math.floor(size / 3))
  const batch: Word[] = []
  for (const w of queue) {
    if (batch.length >= size) break
    if (isGrammarWord(w)) {
      if (grammarLeft === 0) continue
      grammarLeft--
    }
    batch.push(w)
  }
  // Near the end of a pack only grammar words may be left: fill up with them.
  for (const w of queue) {
    if (batch.length >= size) break
    if (!batch.includes(w)) batch.push(w)
  }
  return batch
}
