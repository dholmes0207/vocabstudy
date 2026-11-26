import type { QuizMode, QuizQuestion, Word } from '@/types'
import { makeQuestion } from './quiz'
import { mulberry32 } from './sky'

// "Thử thách hôm nay" (docs/design/toeic.md, phần học từ vựng hấp dẫn hơn):
// five questions a day, the same for everyone learning the same language that
// day, picked by a generator seeded with the day and the pack. Its answers count
// toward the one study streak (lib/motivation.ts liveStreak); it has none of its own.

export const CHALLENGE_SIZE = 5

/** Read, hear, recall: the kinds of question in order. */
const MODES: QuizMode[] = ['en-to-vi', 'listen', 'vi-to-en', 'en-to-vi', 'listen']

function seedOf(code: string, day: number): number {
  let h = day >>> 0
  for (const ch of code) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0
  return h
}

/** The day's words: CHALLENGE_SIZE distinct words, the same on every device. */
export function challengeWords(words: readonly Word[], code: string, day: number): Word[] {
  const rand = mulberry32(seedOf(code, day))
  const pool = [...words]
  const picked: Word[] = []
  while (picked.length < CHALLENGE_SIZE && pool.length) {
    picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  return picked
}

export function challengeQuestions(words: Word[], code: string, day: number): QuizQuestion[] {
  return challengeWords(words, code, day).map((w, i) => makeQuestion(w, words, MODES[i]))
}

export interface ChallengeRecord {
  /** Epoch day of the last challenge done. */
  day: number
  correct: number
  total: number
  best: number
}

/** The record after finishing the challenge of `day`; a second try the same day keeps the better score. */
export function recordChallenge(
  prev: ChallengeRecord | undefined,
  day: number,
  correct: number,
  total: number
): ChallengeRecord {
  if (prev?.day === day)
    return { ...prev, correct: Math.max(prev.correct, correct), best: Math.max(prev.best, correct) }
  return { day, correct, total, best: Math.max(prev?.best ?? 0, correct) }
}
