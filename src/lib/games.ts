import type { SRSCard, Word } from '@/types'
import { phaseOf } from './srs'

// ============================================================================
// Games — the pure part, unit tested (see games.test.ts).
//
// Games exist to make practice feel like play, so they are deliberately kept
// out of the SRS: a mis-tap while racing the clock says nothing about memory.
// They still award XP and keep the daily streak alive (studyStore.addPlayXp).
// Both games draw on words the learner has already met, topping up from the
// start of the curriculum for brand-new learners.
// ============================================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Learned words (shuffled) followed by unseen words in curriculum order. */
function candidates(words: Word[], cards: Record<number, SRSCard>): Word[] {
  const learned = words.filter((w) => cards[w.id])
  const fresh = words.filter((w) => !cards[w.id])
  return [...shuffle(learned), ...fresh]
}

/** A meaning short enough for a tile: no brackets, first sense group, ≤2 senses. */
export function shortMeaning(meaning: string): string {
  const clean = meaning
    .replace(/\([^)]*\)/g, ' ')
    .split(';')[0]
    .replace(/\s+/g, ' ')
    .trim()
  return clean
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(', ')
}

export interface MatchPair {
  id: number
  en: string
  vi: string
}

/**
 * Pairs for "Ghép cặp". Words and displayed meanings are all distinct, or two
 * tiles would both be "right".
 */
export function pickMatchRound(
  words: Word[],
  cards: Record<number, SRSCard>,
  size = 6
): MatchPair[] {
  const out: MatchPair[] = []
  const seenVi = new Set<string>()
  const seenEn = new Set<string>()
  for (const w of candidates(words, cards)) {
    if (out.length >= size) break
    const vi = shortMeaning(w.meaning)
    const en = w.word.trim()
    if (!vi || seenVi.has(vi.toLowerCase()) || seenEn.has(en.toLowerCase())) continue
    seenVi.add(vi.toLowerCase())
    seenEn.add(en.toLowerCase())
    out.push({ id: w.id, en, vi })
  }
  return out
}

/** XP for a finished "Ghép cặp" round: pairs, a speed bonus, minus mistakes. */
export function matchXp(pairs: number, mistakes: number, seconds: number): number {
  const speed = Math.floor(Math.max(0, 30 - seconds) / 3)
  return Math.max(3, pairs * 2 + speed - mistakes)
}

// ---------------------------------------------------------------------------
// "Xếp câu" — rebuild an example sentence from shuffled word tiles.
// ---------------------------------------------------------------------------

/** Word tiles for a sentence; punctuation stays on its word ("today."). */
/**
 * The words of a sentence. Spaces separate them; Chinese has none, so its
 * example sentences mark word breaks with an invisible zero-width space
 * (U+200B, docs/design/chinese.md) — "我\u200b喜欢\u200b喝\u200b咖啡。".
 */
export function tokenize(sentence: string): string[] {
  return sentence
    .trim()
    .split(/[\s\u200b]+/)
    .filter(Boolean)
}

export interface OrderState {
  /** The sentence, in order. */
  tokens: string[]
  /** Pool position p shows tokens[order[p]]. */
  order: number[]
  /** Pool positions already placed, in the order they were placed. */
  placed: number[]
  mistakes: number
  done: boolean
}

export function startOrder(tokens: string[], order: number[]): OrderState {
  return { tokens, order, placed: [], mistakes: 0, done: tokens.length === 0 }
}

/** A shuffled pool order that is never the sentence itself (when avoidable). */
export function shuffledOrder(n: number): number[] {
  const ids = Array.from({ length: n }, (_, i) => i)
  for (let tries = 0; tries < 10; tries++) {
    const o = shuffle(ids)
    if (n < 2 || o.some((v, i) => v !== i)) return o
  }
  return ids.reverse()
}

/**
 * Tap the tile at pool position `pos`. It is right when it shows the next word
 * of the sentence — by text, so either copy of a repeated word ("the … the")
 * works. A tap on a tile already placed is ignored, not counted as a mistake.
 */
export function placeToken(
  state: OrderState,
  pos: number
): { state: OrderState; correct: boolean } {
  if (state.done || state.placed.includes(pos) || pos < 0 || pos >= state.order.length) {
    return { state, correct: false }
  }
  const expected = state.tokens[state.placed.length]
  const shown = state.tokens[state.order[pos]]
  if (shown !== expected) {
    return { state: { ...state, mistakes: state.mistakes + 1 }, correct: false }
  }
  const placed = [...state.placed, pos]
  return {
    state: { ...state, placed, done: placed.length === state.tokens.length },
    correct: true,
  }
}

/** Sentences short enough to enjoy on a phone (4–10 tiles), learned words first. */
export function pickOrderRound(words: Word[], cards: Record<number, SRSCard>, size = 5): Word[] {
  return candidates(words, cards)
    .filter((w) => {
      const n = tokenize(w.exampleEn).length
      return n >= 4 && n <= 10
    })
    .slice(0, size)
}

/** XP for a finished "Xếp câu" round. */
export function orderXp(sentences: number, mistakes: number): number {
  return Math.max(3, sentences * 4 - mistakes)
}

// ---------------------------------------------------------------------------
// Word of the day
// ---------------------------------------------------------------------------

/**
 * One word to look at today — the same all day. Prefers a word already met but
 * not yet mastered (the ones worth another look); a brand-new learner gets one
 * of the first 100 words.
 */
export function wordOfDay(words: Word[], cards: Record<number, SRSCard>, day: number): Word {
  const inProgress = words.filter((w) => cards[w.id] && phaseOf(cards[w.id]) !== 'mastered')
  const pool = inProgress.length ? inProgress : words.slice(0, 100)
  const index = Math.imul(day, 2654435761) >>> 0
  return pool[index % pool.length]
}
