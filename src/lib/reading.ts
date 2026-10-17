// "Đọc truyện ngắn" — graded reading (docs/design/reading.md). Short stories at
// A1–B1 in the language being learned, every sentence with its Vietnamese
// translation, words from the pack tappable for their meaning, then a few
// comprehension questions.

import type { Word } from '@/types'
import { surfaceForms } from './wordForms'
import { tokenize } from './games'

export type Pair = [vi: string, en: string]

export interface StorySentence {
  /** The sentence in the language being learned (named like a pack's `exampleEn`). */
  en: string
  vi: string
  /**
   * Hand-written lookups, token → pack word id, for languages where a word's
   * form gives no clue to its headword: Korean particles (시장에서 → 시장) and
   * contracted verbs (마셔요 → 마시다). Takes priority over the glossary.
   */
  gloss?: Record<string, number>
  /** How the sentence reads, for scripts a beginner cannot read yet (Chinese pinyin). */
  read?: string
}

export interface StoryQuestion {
  /** Asked in Vietnamese: it checks understanding of the English text. */
  q: string
  options: string[]
  answer: number
}

export interface Story {
  id: string
  emoji: string
  level: string
  title: Pair
  sentences: StorySentence[]
  questions: StoryQuestion[]
}

export interface ReadingPack {
  version: string
  stories: Story[]
}

export function validateReadingPack(data: unknown): ReadingPack {
  const pack = data as Partial<ReadingPack>
  if (!pack || !Array.isArray(pack.stories) || pack.stories.length === 0)
    throw new Error('Reading pack has no stories')
  const ids = new Set<string>()
  for (const s of pack.stories) {
    if (!s.id || ids.has(s.id)) throw new Error(`Story id "${s.id}" is missing or repeated`)
    ids.add(s.id)
    if (!Array.isArray(s.sentences) || s.sentences.length < 3)
      throw new Error(`Story "${s.id}" is too short`)
    for (const line of s.sentences) {
      if (!line.en?.trim() || !line.vi?.trim())
        throw new Error(`Story "${s.id}" has a sentence without its translation`)
      const tokens = new Set(tokenize(line.en).map(bareWord))
      for (const key of Object.keys(line.gloss ?? {}))
        if (!tokens.has(key)) throw new Error(`Story "${s.id}": "${key}" is not in "${line.en}"`)
    }
    if (!Array.isArray(s.questions) || s.questions.length < 2)
      throw new Error(`Story "${s.id}" needs questions`)
    for (const q of s.questions)
      if (
        !q.q?.trim() ||
        q.options.length < 2 ||
        new Set(q.options).size !== q.options.length ||
        !Number.isInteger(q.answer) ||
        q.answer < 0 ||
        q.answer >= q.options.length
      )
        throw new Error(`Story "${s.id}": bad question "${q.q}"`)
  }
  return { version: pack.version ?? '0', stories: pack.stories }
}

export async function loadReadingPack(code: string): Promise<ReadingPack> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/reading/${code}.json`)
  if (!res.ok) throw new Error(`Reading pack "${code}" (${res.status})`)
  return validateReadingPack(await res.json())
}

// ---------------------------------------------------------------------------
// Tap a word to see what it means: every surface form of every pack word
// ("drinks", "went", "cooked") points back to its headword.
// ---------------------------------------------------------------------------

export type Glossary = Map<string, Word>

export function buildGlossary(words: Word[]): Glossary {
  const map: Glossary = new Map()
  const add = (form: string, w: Word) => {
    if (form && !form.includes(' ') && !map.has(form)) map.set(form, w)
  }
  // Headwords first: "evening" is the noun, not "even" + -ing, and "rose" the
  // flower wins over the past of "rise" whenever the pack has both.
  for (const w of words) for (const head of w.word.toLowerCase().split('/')) add(head.trim(), w)
  for (const w of words) for (const form of surfaceForms(w.word, w.posCategory)) add(form, w)
  return map
}

/** The bare word inside a token: "mangoes?”" → "mangoes", "Lan's" → "lan". */
export function bareWord(token: string): string {
  return token
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    .replace(/'s$/, '')
}

export function glossFor(token: string, glossary: Glossary): Word | null {
  const w = bareWord(token)
  return w ? (glossary.get(w) ?? null) : null
}

/** The pack word behind a token of `line`: its own lookups first, then the glossary. */
export function glossInLine(
  token: string,
  line: StorySentence,
  glossary: Glossary,
  byId: Map<number, Word>
): Word | null {
  const id = line.gloss?.[bareWord(token)]
  if (id !== undefined) return byId.get(id) ?? null
  return glossFor(token, glossary)
}

// ---------------------------------------------------------------------------
// Progress: best quiz score per story.
// ---------------------------------------------------------------------------

export interface ReadingRecord {
  best: number
  reads: number
}

export type ReadingProgress = Record<string, ReadingRecord>

export function recordReading(
  progress: ReadingProgress,
  storyId: string,
  correct: number,
  total: number
): ReadingProgress {
  const score = total > 0 ? Math.round((correct / total) * 100) : 0
  const prev = progress[storyId]
  return {
    ...progress,
    [storyId]: { best: Math.max(prev?.best ?? 0, score), reads: (prev?.reads ?? 0) + 1 },
  }
}

/** XP for reading a story and answering its questions. */
export function readingXp(correct: number, total: number): number {
  return 5 + correct * 3 + (correct === total && total > 0 ? 5 : 0)
}

/**
 * The same question with its options in a fresh random order, so the right
 * answer is not always in the slot the author happened to write it in.
 */
export function shuffleOptions(q: StoryQuestion, rand: () => number = Math.random): StoryQuestion {
  const order = q.options.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return { q: q.q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) }
}
