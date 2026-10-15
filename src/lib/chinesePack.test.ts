import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { tokenize } from './games'
import { findWordInSentence } from './wordForms'

// The Chinese beta pack (docs/design/chinese.md), built by scripts/build_zh_pack.py.

interface W {
  id: number
  word: string
  ipa: string
  viRead: string
  posCategory: string
  meaning: string
  exampleEn: string
  exampleVi: string
}
const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as {
  meta: { code: string; count: number; ttsLang: string; readingLabel?: string[] }
  words: W[]
}
const manifest = JSON.parse(readFileSync('public/data/index.json', 'utf8')) as {
  languages: { code: string; count: number; file: string; beta?: boolean }[]
}
const HAN = /\p{Script=Han}/u
const PINYIN = /^[a-zA-ZüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈŌÓǑÒ' ]+$/

describe('Chinese pack', () => {
  it('is listed in the manifest as a beta, with pinyin as its reading', () => {
    const entry = manifest.languages.find((l) => l.code === 'zh')
    expect(entry).toMatchObject({ file: 'zh.json', count: pack.words.length, beta: true })
    expect(pack.meta).toMatchObject({ code: 'zh', count: pack.words.length, ttsLang: 'zh-CN' })
    expect(pack.meta.readingLabel).toEqual(['pinyin', 'pinyin'])
  })

  it('numbers its words 1..n, each headword and each meaning once', () => {
    expect(pack.words.map((w) => w.id)).toEqual(pack.words.map((_, i) => i + 1))
    expect(new Set(pack.words.map((w) => w.word)).size).toBe(pack.words.length)
    expect(new Set(pack.words.map((w) => w.meaning)).size).toBe(pack.words.length)
  })

  it('gives every word Chinese characters, pinyin, a meaning and a translated example', () => {
    for (const w of pack.words) {
      expect(w.word, String(w.id)).toMatch(HAN)
      expect(w.viRead, w.word).toMatch(PINYIN)
      expect(w.ipa, w.word).toBe('')
      expect(w.meaning.trim() && w.exampleVi.trim(), w.word).toBeTruthy()
    }
  })

  it('marks word breaks in each example with invisible spaces, never visible ones', () => {
    for (const w of pack.words) {
      expect(w.exampleEn, w.word).toContain('\u200b')
      expect(w.exampleEn, w.word).not.toMatch(/ /)
      const n = tokenize(w.exampleEn).length
      expect(n, w.exampleEn).toBeGreaterThanOrEqual(2)
      expect(n, w.exampleEn).toBeLessThanOrEqual(10)
    }
  })

  it('finds each word in its own example, so the card can underline it', () => {
    // A break inside a word (between 喜 and 欢 of 喜欢, say) would hide it from the search.
    for (const w of pack.words)
      expect(findWordInSentence(w.word, w.exampleEn, w.posCategory as never), w.word).not.toBeNull()
  })
})
