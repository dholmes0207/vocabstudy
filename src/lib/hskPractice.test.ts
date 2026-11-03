import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import {
  HSK_LEVELS,
  fillQuestions,
  levelWords,
  listenQuestions,
  orderQuestions,
} from './hskPractice'

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack
const plain = (s: string) => s.replace(/\u200b/g, '')

describe.each(HSK_LEVELS)('%s practice', (level) => {
  const own = new Set(levelWords(level, zh.words).map((w) => w.word))

  it('hears an example of the level and offers its meaning among three', () => {
    const qs = listenQuestions(level, zh.words, 10)
    expect(qs).toHaveLength(10)
    for (const q of qs) {
      expect(own.has(q.word.word)).toBe(true)
      expect(new Set(q.options).size).toBe(3)
      expect(q.options[q.answer]).toBe(q.word.exampleVi)
    }
  })

  it('takes a word out of its example, the other options from the same level', () => {
    const qs = fillQuestions(level, zh.words, 10)
    expect(qs).toHaveLength(10)
    for (const q of qs) {
      expect(plain(q.sentence!.replace('___', q.word.word))).toBe(plain(q.word.exampleEn))
      expect(new Set(q.options).size).toBe(4)
      expect(q.options[q.answer]).toBe(q.word.word)
      for (const o of q.options) expect(own.has(o), o).toBe(true)
      expect(q.readings).toHaveLength(4)
    }
  })

  it('puts back in order only plain sentences with one right order', () => {
    const qs = orderQuestions(level, zh.words, 10)
    expect(qs.length).toBeGreaterThanOrEqual(5)
    for (const q of qs) {
      expect(q.tokens.join('') + q.end).toBe(plain(q.word.exampleEn.trim()))
      expect(new Set(q.tokens).size).toBe(q.tokens.length)
      expect(q.tokens.length).toBeGreaterThanOrEqual(3)
    }
  })
})
