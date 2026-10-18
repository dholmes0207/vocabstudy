// Answers typed in pinyin (docs/design/pinyin-input.md): a learner without a
// Chinese keyboard can still write what they heard, with the Latin letters every
// keyboard has. Tones are not checked — a Vietnamese keyboard has no way to
// type ǎ — so this grades the sounds, and the screens always show the
// characters afterwards.

import type { DiffPart } from './dictation'

const HAN = /\p{Script=Han}/u

/** Packs whose answers may be typed in pinyin. */
export function acceptsPinyin(code: string): boolean {
  return code === 'zh'
}

/** Typed with Latin letters and no characters — what a pinyin answer looks like. */
export function isPinyinAnswer(typed: string): boolean {
  return !HAN.test(typed) && /[a-zü]/i.test(typed.normalize('NFD'))
}

/**
 * Lower case, no tone marks or tone numbers, nothing but letters. "ü" and the
 * keyboard spelling "v" both become "u": nǚ / nv / nu all read the same here.
 */
export function plainPinyin(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/v/g, 'u')
    .replace(/[^a-z]/g, '')
}

/** The words of a pinyin line ("Lǐ xiǎojiě, nǐ hǎo!"), as shown and as compared. */
function pinyinWords(read: string): { shown: string; plain: string }[] {
  return read
    .split(/[\s\u200b]+/)
    .map((w) => ({ shown: w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''), plain: plainPinyin(w) }))
    .filter((w) => w.plain)
}

/**
 * Line a typed pinyin answer up against the sentence's pinyin, word by word.
 * Spaces in the answer do not matter ("nihao" = "ni hao"), so the typed letters
 * are matched as one string: each word is found where it fits best in order
 * (a longest-common-subsequence over words, consuming letters). Letters that fit
 * no word come back as one "extra" part per run.
 */
export function diffPinyin(read: string, typed: string): DiffPart[] {
  const words = pinyinWords(read)
  const text = plainPinyin(typed)
  const n = words.length
  const m = text.length
  // best[i][j]: most words matched using words i.. and letters j..
  const best = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  const fits = (i: number, j: number) => text.startsWith(words[i].plain, j)
  for (let i = n - 1; i >= 0; i--)
    for (let j = m; j >= 0; j--) {
      let b = Math.max(best[i + 1][j], j < m ? best[i][j + 1] : 0)
      if (fits(i, j)) b = Math.max(b, 1 + best[i + 1][j + words[i].plain.length])
      best[i][j] = b
    }

  const out: DiffPart[] = []
  let extra = ''
  const flush = () => {
    if (extra) out.push({ text: extra, status: 'extra' })
    extra = ''
  }
  let i = 0
  let j = 0
  while (i < n || j < m) {
    if (i < n && fits(i, j) && best[i][j] === 1 + best[i + 1][j + words[i].plain.length]) {
      flush()
      out.push({ text: words[i].shown, status: 'ok' })
      j += words[i].plain.length
      i++
    } else if (j < m && (i === n || best[i][j] === best[i][j + 1])) {
      extra += text[j]
      j++
    } else {
      flush()
      out.push({ text: words[i].shown, status: 'missing' })
      i++
    }
  }
  flush()
  return out
}

/** Whether a typed answer is the word's pinyin, tones aside ("xiexie" for 谢谢). */
export function matchesPinyin(input: string, pinyin: string): boolean {
  const typed = plainPinyin(input)
  return typed.length > 0 && pinyin.split('/').some((p) => plainPinyin(p) === typed)
}
