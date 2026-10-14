import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// The Korean beta pack (docs/design/languages.md): a small, clean starter set.

interface W {
  id: number
  word: string
  ipa: string
  viRead: string
  meaning: string
  exampleEn: string
  exampleVi: string
}
const pack = JSON.parse(readFileSync('public/data/ko.json', 'utf8')) as {
  meta: { code: string; count: number; ttsLang: string }
  words: W[]
}
const manifest = JSON.parse(readFileSync('public/data/index.json', 'utf8')) as {
  languages: { code: string; count: number; file: string }[]
}
const HANGUL = /[가-힣]/

describe('Korean pack', () => {
  it('is listed in the manifest with the right count and voice language', () => {
    const entry = manifest.languages.find((l) => l.code === 'ko')
    expect(entry).toMatchObject({ file: 'ko.json', count: pack.words.length })
    expect(pack.meta).toMatchObject({ code: 'ko', count: pack.words.length, ttsLang: 'ko-KR' })
  })

  it('numbers its words 1..n with no repeated headword', () => {
    expect(pack.words.map((w) => w.id)).toEqual(pack.words.map((_, i) => i + 1))
    expect(new Set(pack.words.map((w) => w.word)).size).toBe(pack.words.length)
  })

  it('gives every word Hangul, a Vietnamese reading, a meaning and a Korean example', () => {
    for (const w of pack.words) {
      expect(w.word, String(w.id)).toMatch(HANGUL)
      expect(w.exampleEn, w.word).toMatch(HANGUL)
      expect(w.viRead.trim() && w.meaning.trim() && w.exampleVi.trim(), w.word).toBeTruthy()
      // No IPA for Korean: the reading is the Vietnamese-style one.
      expect(w.ipa, w.word).toBe('')
      // Readings use Vietnamese letters only (no doubled "pp"/"tt" from romanisation).
      expect(w.viRead, w.word).not.toMatch(/pp|tt|kk|ss|jj/)
    }
  })
})
