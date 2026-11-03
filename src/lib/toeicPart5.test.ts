import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import {
  PART5_BANK,
  PART5_KINDS,
  PART5_ROUND,
  part5Round,
  part5Summary,
  vocabQuestions,
  type Part5Kind,
} from './toeicPart5'

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

function seeded(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31
    return seed / 2 ** 31
  }
}

describe('the Part 5 bank', () => {
  it('has one gap, four different options and an explanation in every question', () => {
    for (const qn of PART5_BANK) {
      expect(qn.sentence.split('___'), qn.sentence).toHaveLength(2)
      expect(new Set(qn.options).size, qn.sentence).toBe(4)
      expect(qn.answer, qn.sentence).toBeLessThan(4)
      expect(qn.why.trim(), qn.sentence).not.toBe('')
    }
    expect(new Set(PART5_BANK.map((qn) => qn.sentence)).size).toBe(PART5_BANK.length)
  })

  it('covers every kind of question with a few each', () => {
    for (const kind of Object.keys(PART5_KINDS) as Part5Kind[])
      expect(PART5_BANK.filter((qn) => qn.kind === kind).length, kind).toBeGreaterThanOrEqual(4)
  })
})

describe('vocabulary questions', () => {
  const qs = vocabQuestions(en.words)

  it('come from most TOEIC words, the gap where the word was', () => {
    expect(qs.length).toBeGreaterThan(150)
    for (const qn of qs) {
      const w = en.words.find((x) => x.id === qn.wordId)!
      expect(qn.sentence.replace('___', w.word)).toBe(w.exampleEn)
      expect(qn.options[qn.answer]).toBe(w.word)
      expect(qn.hint).toBe(w.exampleVi)
    }
  })

  it('never offers a distractor that already appears in the sentence', () => {
    for (const qn of qs)
      for (const o of qn.options.slice(1))
        expect(qn.sentence.toLowerCase(), o).not.toContain(o.toLowerCase())
  })
})

describe('a round', () => {
  it('asks ten different questions, each with the right answer among four', () => {
    const round = part5Round(en.words, seeded(3))
    expect(round).toHaveLength(PART5_ROUND)
    expect(new Set(round.map((qn) => qn.sentence)).size).toBe(PART5_ROUND)
    for (const qn of round) {
      expect(qn.options).toHaveLength(4)
      const source =
        PART5_BANK.find((b) => b.sentence === qn.sentence) ??
        vocabQuestions(en.words).find((v) => v.sentence === qn.sentence)!
      expect(qn.options[qn.answer]).toBe(source.options[source.answer])
    }
    expect(round.filter((qn) => qn.wordId).length).toBe(3)
  })

  it('sums up the kinds, weakest first', () => {
    expect(
      part5Summary([
        { kind: 'form', ok: true },
        { kind: 'prep', ok: false },
        { kind: 'form', ok: false },
        { kind: 'prep', ok: false },
      ])
    ).toEqual([
      ['prep', 0, 2],
      ['form', 1, 2],
    ])
  })
})
