import type { Word } from '@/types'

// "Cùng chữ Hán Việt" (docs/design/chinese.md): Sino-Vietnamese is a head start
// only Vietnamese learners have. 学 is HỌC in 学生, 学校 and 学习; 학 is HỌC in
// 학생 and 학교. Grouping the pack's words by (character, Hán Việt syllable) turns
// one known word into a key to others. Built from the words' own `hanViet`, so
// it needs no extra data — only words whose readings line up one to one.

/** A Han character or a Hangul syllable block: one unit per Hán Việt syllable. */
const UNIT = /[一-鿿가-힣]/u

export interface HanVietUnit {
  /** The character (Chinese) or syllable block (Korean). */
  char: string
  /** Its Hán Việt syllable, lower case: "học". */
  hv: string
}

/** The word split into (unit, Hán Việt syllable) pairs, or null if they don't align. */
export function hanVietUnits(word: Pick<Word, 'word' | 'hanViet'>): HanVietUnit[] | null {
  if (!word.hanViet) return null
  const chars = [...word.word.replace(/\s+/g, '')]
  const sylls = word.hanViet.trim().toLowerCase().split(/\s+/)
  if (!chars.length || chars.length !== sylls.length || !chars.every((c) => UNIT.test(c)))
    return null
  return chars.map((char, i) => ({ char, hv: sylls[i] }))
}

export type FamilyIndex = Map<string, Word[]>

const key = (u: HanVietUnit) => `${u.char}|${u.hv}`

const cache = new WeakMap<readonly Word[], FamilyIndex>()

/** (unit, syllable) → the pack's words that contain it, each word once. */
export function familyIndex(words: readonly Word[]): FamilyIndex {
  const hit = cache.get(words)
  if (hit) return hit
  const index: FamilyIndex = new Map()
  for (const w of words) {
    const units = hanVietUnits(w)
    if (!units) continue
    for (const u of new Map(units.map((x) => [key(x), x])).values()) {
      const list = index.get(key(u)) ?? []
      list.push(w)
      index.set(key(u), list)
    }
  }
  cache.set(words, index)
  return index
}

export interface HanVietFamily extends HanVietUnit {
  /** Other words of the pack with the same character read the same way. */
  others: Word[]
}

/** For each unit of `word`, the pack's other words that share it (empty groups left out). */
export function familiesOf(word: Word, words: readonly Word[]): HanVietFamily[] {
  const units = hanVietUnits(word)
  if (!units) return []
  const index = familyIndex(words)
  const seen = new Set<string>()
  return units.flatMap((u) => {
    if (seen.has(key(u))) return []
    seen.add(key(u))
    const others = (index.get(key(u)) ?? []).filter((w) => w.id !== word.id)
    return others.length ? [{ ...u, others }] : []
  })
}

export interface HanVietEntry extends HanVietUnit {
  /** The pack's words that contain this unit read this way, in pack order. */
  words: Word[]
}

/**
 * Every (unit, syllable) shared by at least `min` words — the "bảng chữ" page.
 * Most-used first, then by syllable, so the keys that open the most words lead.
 */
export function hanVietTable(words: readonly Word[], min = 2): HanVietEntry[] {
  return [...familyIndex(words).entries()]
    .filter(([, list]) => list.length >= min)
    .map(([k, list]) => {
      const [char, hv] = k.split('|')
      return { char, hv, words: list }
    })
    .sort((a, b) => b.words.length - a.words.length || a.hv.localeCompare(b.hv, 'vi'))
}

/** Lower case without Vietnamese marks, so "hoc" finds "học". */
export function foldVi(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').trim()
}

/** Entries whose character, syllable or one of whose words matches the query. */
export function searchHanViet(table: HanVietEntry[], query: string): HanVietEntry[] {
  const q = foldVi(query)
  if (!q) return table
  return table.filter(
    (e) =>
      e.char === query.trim() ||
      foldVi(e.hv) === q ||
      foldVi(e.hv).startsWith(q) ||
      e.words.some((w) => w.word.includes(query.trim()))
  )
}

export interface HanVietClue extends HanVietUnit {
  /** Another word of the pack with this unit read the same way. */
  via: Word
}

export interface HanVietQuestion {
  word: Word
  /** One clue per unit that another word shares — the way in. */
  clues: HanVietClue[]
  options: string[]
  answer: number
}

/**
 * "Đoán nghĩa nhờ Hán Việt": words of two or more units where at least one unit
 * is shared with another word, so the learner can reason from what they know.
 * Wrong options are other words' meanings.
 */
export function hanVietQuiz(
  words: readonly Word[],
  count = 10,
  rand: () => number = Math.random
): HanVietQuestion[] {
  const index = familyIndex(words)
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const cluesOf = (w: Word): HanVietClue[] =>
    (hanVietUnits(w) ?? []).flatMap((u) => {
      const via = (index.get(key(u)) ?? []).find((o) => o.id !== w.id)
      return via ? [{ ...u, via }] : []
    })
  const pool = words.filter((w) => (hanVietUnits(w)?.length ?? 0) >= 2 && cluesOf(w).length > 0)
  const meanings = [...new Set(words.map((w) => w.meaning))]
  return shuffle(pool)
    .slice(0, count)
    .map((word) => {
      const wrong = shuffle(meanings.filter((m) => m !== word.meaning)).slice(0, 3)
      const options = shuffle([word.meaning, ...wrong])
      return { word, clues: cluesOf(word), options, answer: options.indexOf(word.meaning) }
    })
}
