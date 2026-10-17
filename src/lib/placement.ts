import type { QuizQuestion, Word } from '@/types'
import { makeQuestion } from '@/lib/quiz'

// Placement test (docs/design/placement.md): find how far into the pack's
// learning order the learner already knows words, so Learn can start there.
// It only moves the starting point — no card is created or marked known.

/** Words asked per band, and how many must be right to move on. */
export const PER_BAND = 5
export const PASS = 4
/** The first band's size; each later band doubles until the pack ends. */
const FIRST_BAND = 25

export interface Band {
  /** Index range in the pack's order, [start, end). */
  start: number
  end: number
}

/** Bands over a pack of `n` words: 25, 50, 100, 200… (a short tail is merged). */
export function placementBands(n: number): Band[] {
  const bands: Band[] = []
  let start = 0
  let end = Math.min(n, FIRST_BAND)
  while (start < n) {
    // Fold a tail smaller than half a band into the last band: five questions
    // on a handful of words say little.
    if (n - end > 0 && n - end < (end - start) / 2) end = n
    bands.push({ start, end })
    start = end
    end = Math.min(n, end * 2)
  }
  return bands
}

/**
 * PER_BAND meaning questions on words drawn from one band; wrong options come
 * from the same band so they are about as hard as the answer.
 */
export function bandQuestions(
  words: readonly Word[],
  band: Band,
  rng: () => number = Math.random
): QuizQuestion[] {
  const pool = words.slice(band.start, band.end)
  const picked = [...pool]
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[picked[i], picked[j]] = [picked[j], picked[i]]
  }
  // A band can be smaller than four options' worth of distinct meanings in a
  // tiny pack; widen the distractor pool to the whole pack then.
  const distractors = pool.length >= 8 ? pool : [...words]
  return picked.slice(0, PER_BAND).map((w) => makeQuestion(w, distractors, 'en-to-vi'))
}

export const passed = (correct: number): boolean => correct >= PASS
