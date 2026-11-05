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
  retryRound,
  weakestKind,
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
      expect(PART5_BANK.filter((qn) => qn.kind === kind).length, kind).toBeGreaterThanOrEqual(20)
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

describe('Part 5 retry', () => {
  it('asks only the missed questions of the bank, each with its right answer', () => {
    const missed = PART5_BANK.slice(0, 3).map((q) => q.sentence)
    const round = retryRound([...missed, 'Not a question ___.'])
    expect(round.map((q) => q.sentence).sort()).toEqual([...missed].sort())
    for (const q of round) {
      const original = PART5_BANK.find((b) => b.sentence === q.sentence)!
      expect(q.options[q.answer]).toBe(original.options[original.answer])
      expect([...q.options].sort()).toEqual([...original.options].sort())
    }
    expect(retryRound(PART5_BANK.map((q) => q.sentence))).toHaveLength(10)
  })
})

describe('Part 5 weakest kind', () => {
  it('waits for enough answers, then names the kind answered worst', () => {
    expect(weakestKind({ prep: [1, 4] })).toBeNull()
    expect(weakestKind({ prep: [3, 6], form: [5, 6] })).toEqual(['prep', 3, 6])
    // A kind asked too few times is not judged yet.
    expect(weakestKind({ prep: [0, 2], form: [4, 6], verb: [6, 6] })).toEqual(['form', 4, 6])
    // All right: nothing to point at.
    expect(weakestKind({ form: [10, 10] })).toBeNull()
  })
})
