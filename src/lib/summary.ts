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
  day: number = todayFn(),
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

/** The next batch of never-studied words, in id order. */
export function nextNewWords(words: Word[], progress: LanguageProgress | undefined, limit: number): Word[] {
  const cards = progress?.cards ?? {}
  const fresh = words.filter((w) => !cards[w.id])
  return fresh.slice(0, Math.max(0, limit))
}
