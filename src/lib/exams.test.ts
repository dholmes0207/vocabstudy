import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { EXAMS, HSK1, MOCK_SIZE, examFor, examWords, mockQuestions } from './exams'

const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

describe('exam roadmaps', () => {
  it('belong to packs that ship, one exam per pack, with https sources', () => {
    const shipped = new Set(
      (
        JSON.parse(readFileSync('public/data/index.json', 'utf8')).languages as { code: string }[]
      ).map((l) => l.code)
    )
    expect(new Set(EXAMS.map((e) => e.lang)).size).toBe(EXAMS.length)
    for (const e of EXAMS) {
      expect(shipped.has(e.lang)).toBe(true)
      expect(e.sources.length).toBeGreaterThan(0)
      for (const s of e.sources) expect(s.url).toMatch(/^https:\/\//)
    }
    expect(examFor('zh')?.id).toBe('hsk1')
    expect(examFor('ko')?.id).toBe('topik1')
    expect(examFor('en')).toBeUndefined()
  })

  it('finds every HSK 1 headword in the Chinese pack', () => {
    expect(HSK1).toHaveLength(152)
    expect(examWords(examFor('zh')!, pack('zh').words)).toHaveLength(152)
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
