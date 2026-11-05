import { describe, expect, it } from 'vitest'
import { READING_SETS, pickSet, shuffleSet } from './toeicReading'

describe('Part 6 texts', () => {
  const p6 = READING_SETS.filter((s) => s.part === 6)

  it('have gaps [1]–[4], each once, one question per gap and one whole-sentence gap', () => {
    expect(p6.length).toBeGreaterThanOrEqual(12)
    for (const s of p6) {
      const text = s.passages.map((p) => p.text).join('\n')
      for (const n of [1, 2, 3, 4]) expect(text.split(`[${n}]`), `${s.id} [${n}]`).toHaveLength(2)
      expect(s.questions, s.id).toHaveLength(4)
      // The sentence gap: an option that ends like a sentence.
      expect(
        s.questions.filter((q) => /[.!?]$/.test(q.options[0])),
        s.id
      ).toHaveLength(1)
    }
  })
})

describe('Part 7 sets', () => {
  const p7 = READING_SETS.filter((s) => s.part === 7)

  it('include single and double passages, every question asked in words', () => {
    expect(p7.filter((s) => s.passages.length === 1).length).toBeGreaterThanOrEqual(13)
    expect(p7.filter((s) => s.passages.length === 2).length).toBeGreaterThanOrEqual(7)
    for (const s of p7) for (const q of s.questions) expect(q.q.trim(), s.id).not.toBe('')
  })
})

describe('every set', () => {
  it('has four different options and an explanation per question', () => {
    expect(new Set(READING_SETS.map((s) => s.id)).size).toBe(READING_SETS.length)
    for (const s of READING_SETS)
      for (const q of s.questions) {
        expect(new Set(q.options).size, `${s.id}: ${q.q}`).toBe(4)
        expect(q.why.trim(), `${s.id}: ${q.q}`).not.toBe('')
      }
  })

  it('keeps the right option after shuffling, and offers another text next time', () => {
    for (const s of READING_SETS) {
      const { questions } = shuffleSet(s)
      questions.forEach((q, i) => expect(q.options[q.answer]).toBe(s.questions[i].options[0]))
    }
    for (let i = 0; i < 20; i++) expect(pickSet(6, 'p6-parking').id).not.toBe('p6-parking')
  })
})
