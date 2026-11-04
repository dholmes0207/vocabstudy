import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { levelWords } from './hskPractice'
import { answerRound, HSK1_PAIRS } from './hskAnswers'
import { mulberry32 } from './sky'

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack
const known = new Set(levelWords('hsk1', zh.words).flatMap((w) => [...w.word, ...w.exampleEn]))
const han = (s: string) => [...s].filter((c) => /\p{Script=Han}/u.test(c))

describe('HSK 1 question and answer pairs', () => {
  it('use only HSK 1 characters, each with its Vietnamese', () => {
    expect(HSK1_PAIRS.length).toBeGreaterThanOrEqual(12)
    expect(new Set(HSK1_PAIRS.map((p) => p.id)).size).toBe(HSK1_PAIRS.length)
    for (const p of HSK1_PAIRS) {
      expect(
        han(p.q + p.a).filter((c) => !known.has(c)),
        p.id
      ).toEqual([])
      expect(p.qVi.trim() && p.aVi.trim(), p.id).toBeTruthy()
    }
  })

  it('offers each answer among three others, all different', () => {
    const round = answerRound(10, mulberry32(3))
    expect(round).toHaveLength(10)
    for (const q of round) {
      expect(new Set(q.options).size).toBe(4)
      expect(q.options[q.answer]).toBe(q.pair.a)
    }
  })
})
