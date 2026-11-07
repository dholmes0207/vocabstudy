import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Word } from '@/types'
import type { GrammarUnit } from './grammar'
import { EN_PATH, ZH_PATH } from './learningPath'
import { LIVES, TEST_SIZE, buildLevelTest, testScope, testWon } from './levelTest'
import { TOEIC_WORDS } from './toeic'
import { mulberry32 } from './sky'

const words = JSON.parse(readFileSync('public/data/en.json', 'utf8')).words as Word[]
const grammar = JSON.parse(readFileSync('public/data/grammar/en.json', 'utf8'))
  .units as GrammarUnit[]
const zhWords = JSON.parse(readFileSync('public/data/zh.json', 'utf8')).words as Word[]
const zhGrammar = JSON.parse(readFileSync('public/data/grammar/zh.json', 'utf8'))
  .units as GrammarUnit[]

describe('level tests', () => {
  it('ask twelve questions with one right answer each, on every level', () => {
    for (const level of EN_PATH)
      for (let seed = 1; seed <= 5; seed++) {
        const qs = buildLevelTest(level, words, grammar, mulberry32(seed))
        expect(qs, `level ${level.n}`).toHaveLength(TEST_SIZE)
        for (const q of qs) {
          expect(q.options.length, q.prompt).toBeGreaterThanOrEqual(3)
          expect(new Set(q.options).size, q.prompt).toBe(q.options.length)
          expect(q.answer, q.prompt).toBeGreaterThanOrEqual(0)
          expect(q.answer, q.prompt).toBeLessThan(q.options.length)
        }
      }
  })

  it('work for every Chinese level too, from the HSK lists and the Chinese grammar', () => {
    for (const level of ZH_PATH)
      for (let seed = 1; seed <= 3; seed++) {
        const qs = buildLevelTest(level, zhWords, zhGrammar, mulberry32(seed))
        expect(qs, `zh level ${level.n}`).toHaveLength(TEST_SIZE)
        expect(qs.filter((q) => q.kind === 'grammar').length).toBeGreaterThan(0)
        const allowed = new Set(level.testWords)
        const byId = new Map(zhWords.map((w) => [w.id, w.word]))
        for (const q of qs)
          if (q.kind === 'word') expect(allowed.has(byId.get(q.wordId!)!)).toBe(true)
      }
  })

  it('keep to the words and grammar of the level', () => {
    const one = EN_PATH[0]
    const scope = testScope(one, words)
    expect(scope.words).toEqual(words.slice(0, 150))
    expect(scope.units).toEqual(['to-be', 'present-simple', 'pronouns', 'articles'])
    const inLevel = new Set(scope.words.map((w) => w.id))
    const prompts = new Set(
      grammar
        .filter((u) => scope.units.includes(u.id))
        .flatMap((u) => u.exercises.flatMap((e) => (e.type === 'choice' ? [e.prompt] : [])))
    )
    const qs = buildLevelTest(one, words, grammar, mulberry32(7))
    expect(qs.filter((q) => q.kind === 'grammar')).toHaveLength(5)
    for (const q of qs)
      if (q.kind === 'word') expect(inLevel.has(q.wordId!)).toBe(true)
      else expect(prompts.has(q.prompt)).toBe(true)
  })

  it('ask the TOEIC level about TOEIC words, and a level without grammar about words only', () => {
    const toeic = EN_PATH.find((l) => l.testWords)!
    const allowed = new Set(TOEIC_WORDS)
    const qs = buildLevelTest(toeic, words, grammar, mulberry32(3))
    expect(qs.every((q) => q.kind === 'word')).toBe(true)
    const byId = new Map(words.map((w) => [w.id, w.word]))
    for (const q of qs) expect(allowed.has(byId.get(q.wordId!)!)).toBe(true)
  })

  it('are won with a heart left after the last question', () => {
    expect(testWon(0, TEST_SIZE, TEST_SIZE)).toBe(true)
    expect(testWon(LIVES - 1, TEST_SIZE, TEST_SIZE)).toBe(true)
    expect(testWon(LIVES, TEST_SIZE, TEST_SIZE)).toBe(false)
    expect(testWon(0, TEST_SIZE - 1, TEST_SIZE)).toBe(false)
  })
})
