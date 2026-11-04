import type { PosCategory, Word } from '@/types'

// "Đoán từ loại qua đuôi từ" (docs/design/toeic.md): TOEIC Part 5 asks the
// right form of a word (decide, decision, decisive, decisively) in about a
// third of its questions, and the ending usually tells the part of speech.
// The drill shows a word of the English pack and asks which part of speech it
// is; only words whose one part of speech matches their ending's rule are used,
// so the rule is never wrong on the word it is taught with.

type Pair = [vi: string, en: string]

export type FormCategory = Extract<PosCategory, 'noun' | 'verb' | 'adjective' | 'adverb'>

export const FORM_NAMES: Record<FormCategory, Pair> = {
  noun: ['Danh từ', 'Noun'],
  verb: ['Động từ', 'Verb'],
  adjective: ['Tính từ', 'Adjective'],
  adverb: ['Trạng từ', 'Adverb'],
}

/** Endings with a reliable part of speech, longest first so -ation wins over -ion. */
export const ENDINGS: readonly { ending: string; cat: FormCategory }[] = [
  { ending: 'ation', cat: 'noun' },
  { ending: 'tion', cat: 'noun' },
  { ending: 'sion', cat: 'noun' },
  { ending: 'ment', cat: 'noun' },
  { ending: 'ness', cat: 'noun' },
  { ending: 'ity', cat: 'noun' },
  { ending: 'ance', cat: 'noun' },
  { ending: 'ence', cat: 'noun' },
  { ending: 'ship', cat: 'noun' },
  { ending: 'ive', cat: 'adjective' },
  { ending: 'ful', cat: 'adjective' },
  { ending: 'able', cat: 'adjective' },
  { ending: 'ible', cat: 'adjective' },
  { ending: 'ous', cat: 'adjective' },
  { ending: 'less', cat: 'adjective' },
  { ending: 'ic', cat: 'adjective' },
  { ending: 'ly', cat: 'adverb' },
  { ending: 'ize', cat: 'verb' },
  { ending: 'ise', cat: 'verb' },
  { ending: 'ify', cat: 'verb' },
]

/** Parts of speech as the pack writes them, for words with exactly one. */
const SINGLE: Record<string, FormCategory> = {
  'n.': 'noun',
  'v.': 'verb',
  'adj.': 'adjective',
  'adv.': 'adverb',
}

export interface FormQuestion {
  word: Word
  ending: string
  answer: FormCategory
}

/** The ending rule a word follows, when it follows one. */
export function endingOf(w: Word): { ending: string; cat: FormCategory } | null {
  const cat = SINGLE[w.pos.trim()]
  if (!cat || !/^[a-z]+$/.test(w.word)) return null
  const rule = ENDINGS.find((e) => w.word.endsWith(e.ending) && w.word.length > e.ending.length + 2)
  return rule && rule.cat === cat ? rule : null
}

/** A round of words, a spread of parts of speech: no more than half of one kind. */
export function formRound(
  words: readonly Word[],
  count = 10,
  rand: () => number = Math.random
): FormQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const byCat = new Map<FormCategory, FormQuestion[]>()
  for (const w of shuffle(words)) {
    const rule = endingOf(w)
    if (!rule) continue
    byCat.set(rule.cat, [
      ...(byCat.get(rule.cat) ?? []),
      { word: w, ending: rule.ending, answer: rule.cat },
    ])
  }
  // Take from each kind in turn, so the round is not ten nouns.
  const queues = shuffle([...byCat.values()])
  const picked: FormQuestion[] = []
  while (picked.length < count && queues.some((q) => q.length))
    for (const q of queues) if (q.length && picked.length < count) picked.push(q.shift()!)
  return shuffle(picked)
}
