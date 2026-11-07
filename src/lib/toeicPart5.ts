import type { Word } from '@/types'
import { findWordInSentence } from './wordForms'
import { TOEIC_THEMES } from './toeic'

// TOEIC Part 5, "Incomplete sentences" (docs/design/toeic.md): a sentence with a
// gap and four options. The grammar questions are hand-written, each with an
// explanation in Vietnamese; the vocabulary questions are cut from the example
// sentences of the TOEIC words, with other TOEIC words of the same part of
// speech as distractors. The hand-written questions are in
// public/data/toeic/en.json (lib/toeicBank.ts); there `answer` is the index of
// the right option before shuffling.

type Pair = [vi: string, en: string]

/** What a question tests, as Part 5 questions usually split. */
export type Part5Kind = 'form' | 'prep' | 'verb' | 'link' | 'pronoun' | 'meaning'

export const PART5_KINDS: Record<Part5Kind, Pair> = {
  form: ['Từ loại', 'Word form'],
  prep: ['Giới từ', 'Prepositions'],
  verb: ['Thì & dạng động từ', 'Verb tense & form'],
  link: ['Liên từ', 'Conjunctions'],
  pronoun: ['Đại từ', 'Pronouns'],
  meaning: ['Nghĩa của từ', 'Word meaning'],
}

export interface Part5Question {
  /** The sentence, the gap written as "___". */
  sentence: string
  options: string[]
  answer: number
  kind: Part5Kind
  /** Why the answer is right, in Vietnamese. */
  why: string
  /** The pack word a vocabulary question was cut from. */
  wordId?: number
  /**
   * The sentence in Vietnamese, shown with a vocabulary question: a distractor
   * of the same part of speech can fit the English alone, never the meaning.
   */
  hint?: string
}

/** Vocabulary questions cut from the examples of the TOEIC words. */
export function vocabQuestions(words: readonly Word[]): Part5Question[] {
  const themeOf = new Map(TOEIC_THEMES.flatMap((t) => t.words.split(' ').map((w) => [w, t.id])))
  const toeic = words.filter((w) => themeOf.has(w.word))
  return toeic.flatMap((w) => {
    const match = findWordInSentence(w.word, w.exampleEn, w.posCategory)
    // Only examples that use the headword as it is, so all four options read
    // alike, and not as the first word (a capitalised gap against lower-case options).
    if (!match || match.start === 0 || match.surface !== w.word) return []
    // Distractors of the same part of speech from other themes: a word of the
    // same theme (hotel / accommodation) too often fits the sentence as well.
    const others = toeic.filter(
      (o) =>
        o.posCategory === w.posCategory &&
        themeOf.get(o.word) !== themeOf.get(w.word) &&
        !w.exampleEn.toLowerCase().includes(o.word.toLowerCase())
    )
    if (others.length < 3) return []
    return [
      {
        kind: 'meaning' as const,
        sentence: w.exampleEn.slice(0, match.start) + '___' + w.exampleEn.slice(match.end),
        options: [w.word, ...others.map((o) => o.word)],
        answer: 0,
        why: `${w.word} = ${w.meaning}.`,
        hint: w.exampleVi,
        wordId: w.id,
      },
    ]
  })
}

/** Questions in one round: hand-written grammar first in the mix, a few vocabulary ones. */
export const PART5_ROUND = 10
const VOCAB_PER_ROUND = 3

/**
 * One round of Part 5: grammar questions from the bank and vocabulary ones from
 * the pack, shuffled, each with its options shuffled and three distractors.
 */
export function part5Round(
  bank: readonly Part5Question[],
  words: readonly Word[],
  rand: () => number = Math.random
): Part5Question[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const vocab = shuffle(vocabQuestions(words)).slice(0, VOCAB_PER_ROUND)
  const grammar = shuffle(bank).slice(0, PART5_ROUND - vocab.length)
  return shuffle([...grammar, ...vocab]).map((qn) => {
    const right = qn.options[qn.answer]
    const wrong = shuffle(qn.options.filter((_, i) => i !== qn.answer)).slice(0, 3)
    const options = shuffle([right, ...wrong])
    return { ...qn, options, answer: options.indexOf(right) }
  })
}

/**
 * A round of the bank's questions the learner missed before (keyed by their
 * sentence), up to a full round, options shuffled as in part5Round.
 */
export function retryRound(
  bank: readonly Part5Question[],
  missed: readonly string[],
  rand: () => number = Math.random
): Part5Question[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const keep = new Set(missed)
  return shuffle(bank.filter((qn) => keep.has(qn.sentence)))
    .slice(0, PART5_ROUND)
    .map((qn) => {
      const right = qn.options[qn.answer]
      const options = shuffle(qn.options)
      return { ...qn, options, answer: options.indexOf(right) }
    })
}

/**
 * The kind of question answered worst, among those asked at least `min` times,
 * once enough answers are in: null before `total` answers, or when every kind
 * is perfect.
 */
export function weakestKind<K extends string = Part5Kind>(
  kinds: Partial<Record<K, [number, number]>>,
  min = 5,
  total = 10
): [K, number, number] | null {
  const rows = Object.entries(kinds) as [K, [number, number]][]
  if (rows.reduce((n, [, [, asked]]) => n + asked, 0) < total) return null
  const worst = rows
    .filter(([, [right, asked]]) => asked >= min && right < asked)
    .sort(([, [ra, aa]], [, [rb, ab]]) => ra / aa - rb / ab)[0]
  return worst ? [worst[0], worst[1][0], worst[1][1]] : null
}

/** Right answers per kind in a finished round: [kind, right, asked], weakest first. */
export function part5Summary(
  results: { kind: Part5Kind; ok: boolean }[]
): [Part5Kind, number, number][] {
  const tally = new Map<Part5Kind, [number, number]>()
  for (const r of results) {
    const [right, asked] = tally.get(r.kind) ?? [0, 0]
    tally.set(r.kind, [right + (r.ok ? 1 : 0), asked + 1])
  }
  return [...tally]
    .map(([kind, [right, asked]]): [Part5Kind, number, number] => [kind, right, asked])
    .sort((a, b) => a[1] / a[2] - b[1] / b[2])
}
