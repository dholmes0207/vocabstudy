import type { Word } from '@/types'
import { examFor, examWords } from './exams'
import { tokenize } from './games'
import { RADICALS } from './radicals'

// "Luyện thi HSK" (docs/design/toeic.md, giai đoạn B): the question types of
// HSK 1–3, cut from the example sentences of each level's words. The examples
// are split into words by invisible breaks (see lib/games tokenize), carry
// pinyin and a Vietnamese translation, and have recorded audio.
//
//   listen: hear the sentence (听力), pick its meaning among three;
//   fill:   a word taken out (选词填空), pick it among four of the same level;
//   order:  put the words back in order (HSK 3 writing, 完成句子);
//   char:   a character missing, its pinyin given (HSK 3 writing, 写汉字).

export type HskLevel = 'hsk1' | 'hsk2' | 'hsk3'
export const HSK_LEVELS: readonly HskLevel[] = ['hsk1', 'hsk2', 'hsk3']

/** Final punctuation of a Chinese sentence. */
const END = /[。！？]$/
/** Punctuation that splits a sentence inside, which makes its order ambiguous. */
const INSIDE = /[，、“”：；,"]/

/** The words of a level, in the pack's order. */
export function levelWords(level: HskLevel, words: readonly Word[]): Word[] {
  return examWords(examFor('zh', level)!, words)
}

export interface HskChoice {
  kind: 'listen' | 'fill' | 'char'
  word: Word
  /** fill: the sentence with "___" for the word. */
  sentence?: string
  options: string[]
  /** Pinyin of each option, for a fill question (HSK 1–2 print pinyin too); none for char. */
  readings?: string[]
  answer: number
}

export interface HskOrder {
  kind: 'order'
  word: Word
  /** The words of the sentence, in order, without the final punctuation. */
  tokens: string[]
  /** The final punctuation, shown after the built sentence. */
  end: string
}

function shuffler(rand: () => number) {
  return <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
}

/** Hear the example, pick its meaning among three translations of the same level. */
export function listenQuestions(
  level: HskLevel,
  words: readonly Word[],
  count: number,
  rand: () => number = Math.random
): HskChoice[] {
  const shuffle = shuffler(rand)
  const pool = levelWords(level, words).filter((w) => w.exampleEn && w.exampleVi)
  return shuffle(pool)
    .slice(0, count)
    .map((w) => {
      const others = shuffle(pool.filter((o) => o.exampleVi !== w.exampleVi)).slice(0, 2)
      const options = shuffle([w.exampleVi, ...others.map((o) => o.exampleVi)])
      return { kind: 'listen' as const, word: w, options, answer: options.indexOf(w.exampleVi) }
    })
}

/** Where the word stands as a whole token of its example, ignoring trailing punctuation. */
function tokenAt(w: Word): { tokens: string[]; at: number } | null {
  const tokens = tokenize(w.exampleEn)
  const at = tokens.findIndex((tk) => tk.replace(/[。！？，、]+$/, '') === w.word)
  return at < 0 ? null : { tokens, at }
}

/** A word taken out of its example; the other options are words of the same level. */
export function fillQuestions(
  level: HskLevel,
  words: readonly Word[],
  count: number,
  rand: () => number = Math.random
): HskChoice[] {
  const shuffle = shuffler(rand)
  const pool = levelWords(level, words)
  const usable = pool.flatMap((w) => {
    const hit = tokenAt(w)
    return hit ? [{ w, ...hit }] : []
  })
  return shuffle(usable)
    .slice(0, count)
    .map(({ w, tokens, at }) => {
      const tail = tokens[at].slice(w.word.length)
      const sentence = [...tokens.slice(0, at), '___' + tail, ...tokens.slice(at + 1)].join('')
      // Same part of speech first, so the gap cannot be told from the grammar alone.
      const same = pool.filter(
        (o) => o.posCategory === w.posCategory && o.word !== w.word && !w.exampleEn.includes(o.word)
      )
      const rest = pool.filter((o) => o.word !== w.word && !w.exampleEn.includes(o.word))
      const wrong = [...shuffle(same), ...shuffle(rest)]
        .filter((o, i, a) => a.findIndex((x) => x.word === o.word) === i)
        .slice(0, 3)
      const picked = shuffle([w, ...wrong])
      return {
        kind: 'fill' as const,
        word: w,
        sentence,
        options: picked.map((o) => o.word),
        readings: picked.map((o) => o.viRead),
        answer: picked.indexOf(w),
      }
    })
}

/** Pinyin without tone marks, for "same sound, other tone". */
const toneless = (p: string) =>
  p
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/**
 * HSK 3 writing, part two (写汉字): a one-character word taken out of its
 * example, its pinyin shown, four characters to choose from. The others sound
 * alike in another tone or share a radical, so the shape has to be known; one
 * read exactly the same (他 / 她 / 它, all tā) never appears, since the pinyin
 * could not tell them apart.
 */
export function charQuestions(
  level: HskLevel,
  words: readonly Word[],
  count: number,
  rand: () => number = Math.random
): HskChoice[] {
  const shuffle = shuffler(rand)
  const singles = levelWords(level, words).filter((w) => [...w.word].length === 1)
  const radicalsOf = (ch: string) => RADICALS.filter((r) => r.chars.includes(ch))
  return shuffle(singles)
    .flatMap((w) => {
      const hit = tokenAt(w)
      if (!hit) return []
      const read = w.viRead.toLowerCase()
      const others = singles.filter(
        (o) => o.word !== w.word && o.viRead.toLowerCase() !== read && !w.exampleEn.includes(o.word)
      )
      const sound = others.filter((o) => toneless(o.viRead) === toneless(read))
      const mine = radicalsOf(w.word)
      const shape = others.filter((o) => radicalsOf(o.word).some((r) => mine.includes(r)))
      const wrong = [...shuffle(sound), ...shuffle(shape), ...shuffle(others)]
        // One option per reading: two distractors read alike (角 / 脚) waste a place.
        .filter(
          (o, i, a) => a.findIndex((x) => x.viRead.toLowerCase() === o.viRead.toLowerCase()) === i
        )
        .slice(0, 3)
      if (wrong.length < 3) return []
      const { tokens, at } = hit
      const tail = tokens[at].slice(w.word.length)
      const picked = shuffle([w, ...wrong])
      return [
        {
          kind: 'char' as const,
          word: w,
          sentence: [...tokens.slice(0, at), '___' + tail, ...tokens.slice(at + 1)].join(''),
          options: picked.map((o) => o.word),
          answer: picked.indexOf(w),
        },
      ]
    })
    .slice(0, count)
}

/** Examples short and plain enough to have one right order: 3–7 words, no inner punctuation. */
export function orderQuestions(
  level: HskLevel,
  words: readonly Word[],
  count: number,
  rand: () => number = Math.random
): HskOrder[] {
  const shuffle = shuffler(rand)
  const usable = levelWords(level, words).flatMap((w) => {
    const text = w.exampleEn.trim()
    const end = END.exec(text)?.[0] ?? ''
    const body = end ? text.slice(0, -1) : text
    const tokens = tokenize(body)
    if (INSIDE.test(body) || tokens.length < 3 || tokens.length > 7) return []
    // Two equal tiles would make two right orders.
    if (new Set(tokens).size !== tokens.length) return []
    return [{ kind: 'order' as const, word: w, tokens, end }]
  })
  return shuffle(usable).slice(0, count)
}

/** HSK 1–2 have two sections of 100 points; HSK 3 adds writing. Pass marks per level. */
export const HSK_SCALE: Record<HskLevel, { sections: number; pass: number }> = {
  hsk1: { sections: 2, pass: 120 },
  hsk2: { sections: 2, pass: 120 },
  hsk3: { sections: 3, pass: 180 },
}
