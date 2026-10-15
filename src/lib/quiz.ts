import type { QuizMode, QuizOption, QuizQuestion, Word } from '@/types'
import { findWordInSentence } from './wordForms'
import { tx } from './i18n'

// ============================================================================
// Quiz generation. Produces multiple-choice and typing questions, drawing
// distractors preferentially from words of the same part-of-speech so the
// wrong options stay plausible.
// ============================================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const norm = (s: string) => s.trim().toLowerCase()

/**
 * Choose up to `n` distractor words: same posCategory first, then any.
 * Distractors are deduplicated by the text that will actually be *displayed*
 * (`displayOf`), including against the correct answer — otherwise words that
 * share a Vietnamese meaning (many do) can produce two identical options.
 */
function chooseDistractors(
  target: Word,
  pool: Word[],
  n: number,
  displayOf: (w: Word) => string
): Word[] {
  const seen = new Set<string>([norm(displayOf(target))])
  const out: Word[] = []
  const take = (candidates: Word[]) => {
    for (const w of candidates) {
      if (out.length >= n) break
      const key = norm(displayOf(w))
      if (seen.has(key)) continue
      seen.add(key)
      out.push(w)
    }
  }
  const others = pool.filter((w) => w.id !== target.id)
  take(shuffle(others.filter((w) => w.posCategory === target.posCategory)))
  take(shuffle(others.filter((w) => w.posCategory !== target.posCategory)))
  return out
}

const CHOICE_MODES: QuizMode[] = ['en-to-vi', 'vi-to-en', 'listen']

export interface GappedSentence {
  /** The example with the word replaced by a blank. */
  gapped: string
  /** The form that was hidden, as written in the sentence ("hands"). */
  surface: string
}

export const GAP = '_____'

/**
 * Hide the target word in its example sentence — in whatever form the sentence
 * uses it (hands, cried, went). Returns null if the word is not in the example.
 */
export function gapSentence(word: Word): GappedSentence | null {
  if (!word.exampleEn) return null
  const hit = findWordInSentence(word.word, word.exampleEn, word.posCategory)
  if (!hit) return null
  const s = word.exampleEn
  return { gapped: s.slice(0, hit.start) + GAP + s.slice(hit.end), surface: hit.surface }
}

/** Build a gapped example sentence, hiding the target word. Returns null if not embeddable. */
export function gapExample(word: Word): string | null {
  return gapSentence(word)?.gapped ?? null
}

export interface SkeletonCell {
  ch: string
  isLetter: boolean
  /** Revealed by default (non-letters, first/last letter, and scaffold letters). */
  revealed: boolean
}

/**
 * Build a partial "abi__ty"-style skeleton for spelling practice: reveals the
 * first & last letter plus alternating middle letters, hides the rest. Uses the
 * first form of a slashed headword. Deterministic (no randomness).
 */
export function buildSkeleton(word: string): SkeletonCell[] {
  const target = word.split('/')[0].trim()
  const chars = [...target]
  // Any script's letters: a Hangul block counts as one, so "사람" shows as "사_"
  // instead of giving the whole word away.
  const isLetter = (c: string) => /\p{L}/u.test(c)
  const letters = chars.map((c, i) => (isLetter(c) ? i : -1)).filter((i) => i >= 0)
  const hide = new Set<number>()
  const middle = letters.slice(1, -1)
  middle.forEach((idx, k) => {
    if (k % 2 === 1) hide.add(idx) // hide 2nd, 4th, … middle letter
  })
  if (hide.size === 0 && letters.length >= 3) hide.add(letters[Math.floor(letters.length / 2)])
  // Two letters have no middle — hide the last, or "is" would be given away.
  if (letters.length === 2) hide.add(letters[1])
  return chars.map((c, i) => ({
    ch: c,
    isLetter: isLetter(c),
    revealed: !isLetter(c) || !hide.has(i),
  }))
}

/** Generate a single question for a word in a given mode. */
export function makeQuestion(word: Word, pool: Word[], mode: QuizMode): QuizQuestion {
  if (mode === 'fill') {
    const gap = gapSentence(word)
    return {
      wordId: word.id,
      mode,
      prompt: gap?.gapped ?? word.meaning,
      hint: gap ? word.meaning : tx('Gõ từ có nghĩa này', 'Type the word with this meaning'),
      options: [],
      answer: word.word,
      surface: gap?.surface,
    }
  }

  if (mode === 'context') {
    const gap = gapSentence(word)
    // No sentence to reason from → the closest recall question is picking the
    // English word for the meaning.
    if (!gap) return makeQuestion(word, pool, 'vi-to-en')
    const distractors = chooseDistractors(word, pool, 3, (w) => w.word)
    return {
      wordId: word.id,
      mode,
      prompt: gap.gapped,
      hint: word.exampleVi || word.meaning,
      options: shuffle([
        { text: word.word, correct: true, wordId: word.id },
        ...distractors.map((d) => ({ text: d.word, correct: false, wordId: d.id })),
      ]),
      answer: word.word,
      surface: gap.surface,
    }
  }

  if (mode === 'spell') {
    return {
      wordId: word.id,
      mode,
      prompt: word.meaning,
      hint: `${word.pos} · ${tx('Nghe & gõ lại từ', 'Listen & type the word')}`,
      options: [],
      answer: word.word,
    }
  }

  // The displayed option text differs by mode; dedupe distractors on it.
  const displayOf = mode === 'vi-to-en' ? (w: Word) => w.word : (w: Word) => w.meaning
  const distractors = chooseDistractors(word, pool, 3, displayOf)
  let options: QuizOption[]
  let prompt: string
  let hint: string | undefined
  let answer: string

  if (mode === 'vi-to-en') {
    prompt = word.meaning
    hint = word.pos
    answer = word.word
    options = shuffle([
      { text: word.word, correct: true, wordId: word.id },
      ...distractors.map((d) => ({ text: d.word, correct: false, wordId: d.id })),
    ])
  } else {
    // en-to-vi and listen both ask for the Vietnamese meaning.
    prompt = word.word
    hint =
      mode === 'listen'
        ? tx('🔊 Nghe và chọn nghĩa đúng', '🔊 Listen and pick the meaning')
        : word.pos
    answer = word.meaning
    options = shuffle([
      { text: word.meaning, correct: true, wordId: word.id },
      ...distractors.map((d) => ({ text: d.meaning, correct: false, wordId: d.id })),
    ])
  }

  return { wordId: word.id, mode, prompt, hint, options, answer }
}

export interface QuizConfig {
  /** Words to be quizzed. */
  words: Word[]
  /** Larger pool to draw distractors from (usually the whole pack). */
  pool: Word[]
  /** Restrict to these modes; defaults to the three multiple-choice modes. */
  modes?: QuizMode[]
  /** Cap the number of questions. */
  limit?: number
}

/** Build a full quiz: one randomly-typed question per word, shuffled. */
export function generateQuiz(config: QuizConfig): QuizQuestion[] {
  const modes = config.modes && config.modes.length ? config.modes : CHOICE_MODES
  const chosen = shuffle(config.words)
  const limited = config.limit ? chosen.slice(0, config.limit) : chosen
  return limited.map((w) => {
    // For very short words 'fill' can be trivial; still allowed if requested.
    const mode = pick(modes)
    return makeQuestion(w, config.pool, mode)
  })
}

/**
 * Flexible answer check for typing questions. Any form of a slashed headword
 * counts, and so does the exact form the sentence used (`surface`) — typing
 * "hands" into "Wash your _____." is as right as typing "hand".
 */
export function checkFillAnswer(word: Word, input: string, surface?: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  const target = norm(input)
  if (!target) return false
  const forms = word.word.split('/').map((s) => norm(s))
  if (surface) forms.push(norm(surface))
  return forms.some((f) => f === target)
}
