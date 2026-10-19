// "Ngữ pháp căn bản" — short grammar units for beginners (docs/design/grammar.md).
// Content lives in public/data/grammar/<code>.json; explanations are written
// in Vietnamese for Vietnamese learners, titles in both interface languages.

import { tokenize } from './games'

export type Pair = [vi: string, en: string]

export interface GrammarExample {
  en: string
  vi: string
  /** How the example reads, for scripts a beginner cannot read yet (Chinese pinyin). */
  read?: string
}

export interface GrammarMistake {
  wrong: string
  right: string
  why: string
}

export type GrammarExercise =
  | { type: 'choice'; prompt: string; options: string[]; answer: number; explain?: string }
  | { type: 'order'; en: string; vi: string }

export interface GrammarUnit {
  id: string
  emoji: string
  level: string
  title: Pair
  summary: Pair
  explain: string[]
  patterns: string[]
  examples: GrammarExample[]
  mistakes: GrammarMistake[]
  exercises: GrammarExercise[]
}

export interface GrammarPack {
  version: string
  units: GrammarUnit[]
}

const isPair = (v: unknown): v is Pair =>
  Array.isArray(v) && v.length === 2 && v.every((s) => typeof s === 'string' && s.trim() !== '')

/** Refuse a malformed pack rather than render half a lesson. */
export function validateGrammarPack(data: unknown): GrammarPack {
  const pack = data as Partial<GrammarPack>
  if (!pack || !Array.isArray(pack.units) || pack.units.length === 0)
    throw new Error('Grammar pack has no units')
  const ids = new Set<string>()
  for (const u of pack.units) {
    if (!u.id || ids.has(u.id)) throw new Error(`Grammar unit id "${u.id}" is missing or repeated`)
    ids.add(u.id)
    if (!isPair(u.title) || !isPair(u.summary)) throw new Error(`Unit "${u.id}" needs titles`)
    if (!Array.isArray(u.explain) || !u.explain.length)
      throw new Error(`Unit "${u.id}" explains nothing`)
    if (!Array.isArray(u.exercises) || u.exercises.length < 5)
      throw new Error(`Unit "${u.id}" needs at least 5 exercises`)
    for (const e of u.exercises) {
      if (e.type === 'choice') {
        if (
          !e.prompt.includes('___') ||
          e.options.length < 2 ||
          new Set(e.options).size !== e.options.length ||
          !Number.isInteger(e.answer) ||
          e.answer < 0 ||
          e.answer >= e.options.length
        )
          throw new Error(`Unit "${u.id}": bad choice "${e.prompt}"`)
      } else if (e.type === 'order') {
        const n = tokenize(e.en).length
        if (n < 3 || n > 10 || !e.vi.trim())
          throw new Error(`Unit "${u.id}": "${e.en}" must be 3–10 words with a translation`)
      } else {
        throw new Error(`Unit "${u.id}": unknown exercise type`)
      }
    }
  }
  return { version: pack.version ?? '0', units: pack.units }
}

export async function loadGrammarPack(code: string): Promise<GrammarPack> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/grammar/${code}.json`)
  if (!res.ok) throw new Error(`Grammar pack "${code}" (${res.status})`)
  return validateGrammarPack(await res.json())
}

// ---------------------------------------------------------------------------
// Progress: the best score per unit. A unit counts as learned at 80%.
// ---------------------------------------------------------------------------

export interface GrammarRecord {
  /** Best score so far, 0–100. */
  best: number
  attempts: number
  /** Day number of the last attempt (lib/date `today()`). */
  lastDay: number
  /** Rung on REVIEW_DAYS once passed; -1 after a failed review (relearning). */
  step?: number
  /** Day the next review is due. Missing on records saved before reviews existed. */
  due?: number
}

export type GrammarProgress = Record<string, GrammarRecord>

export const PASS_SCORE = 80

export const isPassed = (rec: GrammarRecord | undefined) => (rec?.best ?? 0) >= PASS_SCORE

/**
 * Days to the next review after each successful one (docs/design/grammar.md,
 * "Ôn ngữ pháp"): a passed lesson comes back like a word card does.
 */
export const REVIEW_DAYS = [3, 7, 21, 60]

/** The day a passed lesson is due for review; null while it is not passed. */
export function dueDay(rec: GrammarRecord | undefined): number | null {
  if (!rec || !isPassed(rec)) return null
  return rec.due ?? rec.lastDay + REVIEW_DAYS[0]
}

/** Passed lessons due on `day`, most overdue first. */
export function dueUnits(progress: GrammarProgress, unitIds: string[], day: number): string[] {
  return unitIds
    .map((id) => ({ id, due: dueDay(progress[id]) }))
    .filter((u): u is { id: string; due: number } => u.due !== null && u.due <= day)
    .sort((a, b) => a.due - b.due)
    .map((u) => u.id)
}

export function recordAttempt(
  progress: GrammarProgress,
  unitId: string,
  correct: number,
  total: number,
  day: number
): GrammarProgress {
  const score = total > 0 ? Math.round((correct / total) * 100) : 0
  const prev = progress[unitId]
  const best = Math.max(prev?.best ?? 0, score)
  let { step, due } = prev ?? {}
  const wasDue = (dueDay(prev) ?? Infinity) <= day
  if (score >= PASS_SCORE) {
    // A first pass starts the ladder; a passed review climbs it. Practising
    // again before the lesson is due leaves the schedule alone.
    if (!isPassed(prev)) step = 0
    else if (wasDue) step = Math.min((step ?? 0) + 1, REVIEW_DAYS.length - 1)
    if (!isPassed(prev) || wasDue) due = day + REVIEW_DAYS[step!]
  } else if (wasDue) {
    // A failed review: back tomorrow, and the next pass restarts the ladder.
    step = -1
    due = day + 1
  }
  const rec: GrammarRecord = { best, attempts: (prev?.attempts ?? 0) + 1, lastDay: day }
  if (step !== undefined) rec.step = step
  if (due !== undefined) rec.due = due
  return { ...progress, [unitId]: rec }
}

// ---------------------------------------------------------------------------
// A practice round: every exercise of the unit, shuffled, with choice options
// shuffled too (the answer index follows its option).
// ---------------------------------------------------------------------------

function shuffle<T>(items: T[], random: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildGrammarRound(
  unit: GrammarUnit,
  random: () => number = Math.random
): GrammarExercise[] {
  return shuffle(unit.exercises, random).map((e) => {
    if (e.type !== 'choice') return e
    const order = shuffle(
      e.options.map((_, i) => i),
      random
    )
    return {
      ...e,
      options: order.map((i) => e.options[i]),
      answer: order.indexOf(e.answer),
    }
  })
}

/** XP for a finished round, on the same scale as the phrases practice. */
export function grammarXp(correct: number, total: number): number {
  return Math.max(3, correct * 3 + (correct === total && total > 0 ? 5 : 0))
}
