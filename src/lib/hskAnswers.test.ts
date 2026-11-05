import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { levelWords } from './hskPractice'
import { answerRound, PAIRS } from './hskAnswers'
import { mulberry32 } from './sky'

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack
/** Every character of the words of the level and below, and of their examples. */
const known = (upTo: 'hsk1' | 'hsk2' | 'hsk3') =>
  new Set(
    (['hsk1', 'hsk2', 'hsk3'] as const)
      .slice(0, ['hsk1', 'hsk2', 'hsk3'].indexOf(upTo) + 1)
      .flatMap((l) => levelWords(l, zh.words))
      .flatMap((w) => [...w.word, ...w.exampleEn])
  )
const han = (s: string) => [...s].filter((c) => /\p{Script=Han}/u.test(c))

describe('HSK question and answer pairs', () => {
  it.each(['hsk1', 'hsk2', 'hsk3'] as const)(
    '%s: use only characters of the level and below, each with its Vietnamese',
    (level) => {
      const pairs = PAIRS[level]
      expect(pairs.length).toBeGreaterThanOrEqual(25)
      expect(new Set(pairs.map((p) => p.id)).size).toBe(pairs.length)
      const ok = known(level)
      for (const p of pairs) {
        expect(
          han(p.q + p.a).filter((c) => !ok.has(c)),
          p.id
        ).toEqual([])
        expect(p.qVi.trim() && p.aVi.trim(), p.id).toBeTruthy()
      }
    }
  )

  it.each(['hsk1', 'hsk2', 'hsk3'] as const)(
    '%s: offers each answer among three others',
    (level) => {
      const round = answerRound(level, 10, mulberry32(3))
      expect(round).toHaveLength(10)
      for (const q of round) {
        expect(new Set(q.options).size).toBe(4)
        expect(q.options[q.answer]).toBe(q.pair.a)
        expect(PAIRS[level]).toContain(q.pair)
      }
    }
  )
})
