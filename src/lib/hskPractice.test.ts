import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import {
  HSK_LEVELS,
  charQuestions,
  fillQuestions,
  judgeQuestions,
  levelWords,
  listenQuestions,
  orderQuestions,
  PICTURE_WORDS,
} from './hskPractice'
import { mulberry32 } from './sky'

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

describe('HSK writing, characters (写汉字)', () => {
  it('takes a one-character word out of its example, never with a same-reading distractor', () => {
    for (const level of HSK_LEVELS) {
      const qs = charQuestions(level, zh.words, 10)
      expect(qs.length, level).toBeGreaterThanOrEqual(5)
      for (const q of qs) {
        expect([...q.word.word]).toHaveLength(1)
        expect(plain(q.sentence!.replace('___', q.word.word))).toBe(plain(q.word.exampleEn))
        expect(new Set(q.options).size).toBe(4)
        expect(q.options[q.answer]).toBe(q.word.word)
        const reads = q.options.map((o) => zh.words.find((w) => w.word === o)!.viRead.toLowerCase())
        expect(new Set(reads).size, q.options.join('')).toBe(4)
      }
    }
  })
})

describe('HSK listening, right or wrong (判断对错)', () => {
  it('pictures only words of the pack, each with its own emoji', () => {
    const byWord = new Map(zh.words.map((w) => [w.word, w]))
    const emojis = PICTURE_WORDS.map((p) => byWord.get(p)?.emoji)
    expect(emojis.every(Boolean), 'every picture word is in the pack with an emoji').toBe(true)
    expect(new Set(emojis).size).toBe(PICTURE_WORDS.length)
  })

  it.each(HSK_LEVELS)(
    '%s: a word heard, its picture or another, both kinds in a round',
    (level) => {
      const own = new Set(levelWords(level, zh.words).map((w) => w.word))
      for (let seed = 1; seed <= 5; seed++) {
        const qs = judgeQuestions(level, zh.words, 10, mulberry32(seed))
        expect(qs).toHaveLength(10)
        expect(new Set(qs.map((q) => q.word.word)).size).toBe(10)
        for (const q of qs) {
          expect(own.has(q.word.word)).toBe(true)
          if (q.answer === 0) {
            expect(q.picture).toBe(q.word.emoji)
            expect(q.pictureOf).toBeUndefined()
          } else {
            expect(own.has(q.pictureOf!.word)).toBe(true)
            expect(q.picture).toBe(q.pictureOf!.emoji)
            expect(q.picture).not.toBe(q.word.emoji)
          }
        }
        expect(qs.filter((q) => q.answer === 0)).toHaveLength(5)
      }
    }
  )
})
