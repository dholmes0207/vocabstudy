// "Nghe – chép" (dictation, docs/design/dictation.md): hear an example sentence,
// type what you heard, see word by word what you caught and what you missed.
// Pure and tested; the screen only renders it.

import type { SRSCard, Word } from '@/types'
import { tokenize } from './games'

/**
 * Lower-case words without punctuation. Apostrophes are dropped too, so
 * "dont" typed on a phone keyboard matches "don't".
 */
export function normalizeWords(sentence: string): string[] {
  return units(sentence)
    .map((w) =>
      w
        .toLowerCase()
        .replace(/['\u2019\u2018]/g, '')
        .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    )
    .filter(Boolean)
}

const HAN = /\p{Script=Han}/u

/**
 * What gets compared: words — or, for Chinese, single characters. A learner
 * types Chinese with a pinyin keyboard and no spaces, so there are no word
 * breaks to line up; character by character is also how a teacher marks it.
 */
function units(sentence: string): string[] {
  if (!HAN.test(sentence)) return tokenize(sentence)
  return [...sentence].filter((c) => /[\p{L}\p{N}]/u.test(c))
}

export interface DiffPart {
  /** The word as written in the original sentence (or as typed, for extras). */
  text: string
  status: 'ok' | 'missing' | 'extra'
}

/**
 * Line the typed words up against the sentence (longest common subsequence):
 * matched words are "ok", sentence words not typed are "missing", typed words
 * that are not in the sentence are "extra". Order follows the sentence.
 */
export function diffWords(sentence: string, typed: string): DiffPart[] {
  const shown = units(sentence)
  const a = normalizeWords(sentence)
  const b = normalizeWords(typed)
  // `shown` and `a` line up one-to-one unless a token was pure punctuation.
  const display = shown.filter((t) => normalizeWords(t).length > 0)
  const n = a.length
  const m = b.length
  const lcs = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
  const out: DiffPart[] = []
  let i = 0
  let j = 0
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      out.push({ text: display[i] ?? a[i], status: 'ok' })
      i++
      j++
    } else if (j < m && (i === n || lcs[i][j + 1] >= lcs[i + 1][j])) {
      out.push({ text: b[j], status: 'extra' })
      j++
    } else {
      out.push({ text: display[i] ?? a[i], status: 'missing' })
      i++
    }
  }
  return out
}

/** Share of the sentence's words that were heard right (0–1). */
export function dictationScore(parts: DiffPart[]): number {
  const total = parts.filter((p) => p.status !== 'extra').length
  if (total === 0) return 0
  const extras = parts.filter((p) => p.status === 'extra').length
  const ok = parts.filter((p) => p.status === 'ok').length
  // Extra words cost a little, so typing everything you can think of never wins.
  return Math.max(0, (ok - extras * 0.5) / total)
}

/**
 * Tiles for writing a sentence down without a keyboard: its words, as the
 * other tile games split them. A Chinese sentence with no marked word breaks
 * (the grammar examples) is split into characters instead, punctuation kept
 * on the character next to it.
 */
export function dictationTiles(sentence: string): string[] {
  const words = tokenize(sentence)
  if (!HAN.test(sentence) || words.length > 1) return words
  const tiles: string[] = []
  let lead = '' // an opening quote waits for the character it belongs to
  for (const c of sentence.trim()) {
    if (/[\p{L}\p{N}]/u.test(c)) {
      tiles.push(lead + c)
      lead = ''
    } else if (tiles.length === 0) lead += c
    else tiles[tiles.length - 1] += c
  }
  return tiles
}

/**
 * Score for a sentence built from tiles. A wrong tap costs half a tile, like an
 * extra typed word, so one slip in a short sentence still counts as caught.
 */
export function tileScore(tiles: number, mistakes: number): number {
  return tiles === 0 ? 0 : Math.max(0, (tiles - mistakes * 0.5) / tiles)
}

/** At or above this a sentence counts as caught. */
export const DICTATION_PASS = 0.8

/**
 * Sentences to write down: from words already met (they are fair to ask),
 * 4–12 words long, never the same word twice. Falls back to the first words
 * of the pack for someone who has not studied yet.
 */
export function pickDictationRound(
  words: Word[],
  cards: Record<number, SRSCard>,
  size = 6,
  random: () => number = Math.random
): Word[] {
  const fits = (w: Word) => {
    const n = normalizeWords(w.exampleEn).length
    return n >= 4 && n <= 12
  }
  const met = words.filter((w) => cards[w.id] && fits(w))
  const pool = met.length >= size ? met : words.filter(fits).slice(0, Math.max(size * 4, 40))
  const a = [...pool]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, size)
}

/** XP for a finished round, on the same scale as the other practice games. */
export function dictationXp(caught: number, total: number): number {
  return Math.max(3, caught * 4 + (caught === total && total > 0 ? 5 : 0))
}
