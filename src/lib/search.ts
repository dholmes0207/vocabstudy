// Dictionary search (Tra cứu): forgiving about accents and tone marks, the way
// people actually type on a phone — "xin chao" finds "xin chào", "ni hao" and
// "nihao" find 你好 through its pinyin.

import type { Word } from '@/types'

/** Lower-case without accents or tone marks: "Xin chào" → "xin chao", "nǐ hǎo" → "ni hao". */
export function foldText(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase()
}

const LATIN = /[a-z]/i
const squash = (s: string) => s.replace(/[\s'’-]/g, '')

/**
 * Does a word match the query? The headword and the meaning always count. The
 * reading (pinyin, Hangul respelling) and the Hán Việt reading count only for
 * words not written in Latin letters — in English the reading is a respelling
 * nobody searches by.
 */
export function matchesQuery(w: Word, query: string): boolean {
  const q = foldText(query.trim())
  if (!q) return true
  if (foldText(w.word).includes(q) || foldText(w.meaning).includes(q)) return true
  if (LATIN.test(w.word)) return false
  return [w.viRead, w.hanViet].some((r) => !!r && squash(foldText(r)).includes(squash(q)))
}
