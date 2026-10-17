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
