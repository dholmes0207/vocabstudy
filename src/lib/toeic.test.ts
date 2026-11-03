import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { TOEIC_THEMES, TOEIC_WORDS, themeWords } from './toeic'
import { examFor, examLabelFor, examWords } from './exams'

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

describe('TOEIC themes', () => {
  it('only list words of the English pack, each in one theme', () => {
    const inPack = new Set(en.words.map((w) => w.word))
    expect(TOEIC_WORDS.filter((w) => !inPack.has(w))).toEqual([])
    expect(new Set(TOEIC_WORDS).size).toBe(TOEIC_WORDS.length)
  })

  it('give every theme enough words for a few lessons', () => {
    for (const t of TOEIC_THEMES) {
      expect(themeWords(t, en.words).length, t.id).toBeGreaterThanOrEqual(15)
      expect(
        t.title.every((s) => s.trim()),
        t.id
      ).toBe(true)
    }
    expect(new Set(TOEIC_THEMES.map((t) => t.id)).size).toBe(TOEIC_THEMES.length)
  })

  it('are the word list of the TOEIC roadmap, and label those words', () => {
    const toeic = examFor('en', 'toeic')!
    expect(examWords(toeic, en.words)).toHaveLength(TOEIC_WORDS.length)
    expect(examLabelFor('en', { word: 'invoice' })).toBe('TOEIC')
    expect(examLabelFor('en', { word: 'banana' })).toBeNull()
  })
})
