import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import {
  EXAMS,
  HSK1,
  HSK2,
  HSK3,
  MOCK_SIZE,
  examFor,
  examLabelFor,
  examWords,
  examsFor,
  mockQuestions,
} from './exams'

const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

describe('exam roadmaps', () => {
  it('belong to packs that ship, each with its own id and https sources', () => {
    const shipped = new Set(
      (
        JSON.parse(readFileSync('public/data/index.json', 'utf8')).languages as { code: string }[]
      ).map((l) => l.code)
    )
    expect(new Set(EXAMS.map((e) => e.id)).size).toBe(EXAMS.length)
    for (const e of EXAMS) {
      expect(shipped.has(e.lang)).toBe(true)
      expect(e.sources.length).toBeGreaterThan(0)
      for (const s of e.sources) expect(s.url).toMatch(/^https:\/\//)
    }
    expect(examFor('zh')?.id).toBe('hsk1')
    expect(examFor('zh', 'hsk2')?.id).toBe('hsk2')
    expect(examFor('zh', 'nope')?.id).toBe('hsk1')
    expect(examsFor('zh').map((e) => e.id)).toEqual(['hsk1', 'hsk2', 'hsk3'])
    expect(examFor('ko')?.id).toBe('topik1')
    expect(examsFor('en').map((e) => e.id)).toEqual(['a2key', 'b1prelim'])
    expect(examFor('ja')).toBeUndefined()
  })

  it("takes the English exams' words from the pack stages: core for A2 Key, B1 extension for B1 Preliminary", () => {
    const en = pack('en').words
    const a2 = examWords(examFor('en', 'a2key')!, en)
    const b1 = examWords(examFor('en', 'b1prelim')!, en)
    expect(a2).toHaveLength(en.filter((w) => (w.stage ?? 1) === 1).length)
    expect(b1).toHaveLength(en.filter((w) => w.stage === 2).length)
    expect(a2.length + b1.length).toBe(en.length)
    // No official list in the app, so no exam badge on English word cards.
    expect(examLabelFor('en', en[0])).toBeNull()
  })

  it('finds every HSK 1 headword in the Chinese pack', () => {
    expect(HSK1).toHaveLength(152)
    expect(examWords(examFor('zh')!, pack('zh').words)).toHaveLength(152)
  })

  it('finds every HSK 2 headword in the Chinese pack', () => {
    expect(HSK2).toHaveLength(147)
    expect(new Set(HSK2).size).toBe(147)
    expect(examWords(examFor('zh', 'hsk2')!, pack('zh').words)).toHaveLength(147)
  })

  it('finds every HSK 3 headword in the Chinese pack, none repeating an easier level', () => {
    expect(HSK3).toHaveLength(298)
    expect(new Set(HSK3).size).toBe(298)
    expect(HSK3.filter((w) => HSK1.includes(w) || HSK2.includes(w))).toEqual([])
    expect(examWords(examFor('zh', 'hsk3')!, pack('zh').words)).toHaveLength(298)
  })

  it('labels a word with the easiest level whose list has it', () => {
    expect(examLabelFor('zh', { word: '学生' })).toBe('HSK 1')
    expect(examLabelFor('zh', { word: '哥哥' })).toBe('HSK 2')
    expect(examLabelFor('zh', { word: '虽然' })).toBe('HSK 3')
    expect(examLabelFor('zh', { word: '号' })).toBe('HSK 1')
    expect(examLabelFor('zh', { word: '越南' })).toBeNull()
    expect(examLabelFor('ko', { word: '학생' })).toBeNull()
  })

  it('uses the whole Korean pack for TOPIK I', () => {
    const { words } = pack('ko')
    expect(examWords(examFor('ko')!, words)).toHaveLength(words.length)
  })
})

describe('mockQuestions', () => {
  it.each(['zh', 'ko'])('asks %s: half heard, half read, all distinct', (code) => {
    const words = examWords(examFor(code)!, pack(code).words)
    const qs = mockQuestions(words)
    expect(qs).toHaveLength(MOCK_SIZE)
    expect(new Set(qs.map((q) => q.wordId)).size).toBe(MOCK_SIZE)
    expect(qs.slice(0, MOCK_SIZE / 2).every((q) => q.mode === 'listen')).toBe(true)
    expect(qs.slice(MOCK_SIZE / 2).some((q) => q.mode === 'listen')).toBe(false)
    for (const q of qs) expect(q.options.filter((o) => o.correct)).toHaveLength(1)
  })
})
