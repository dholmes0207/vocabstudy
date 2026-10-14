import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  PASS_SCORE,
  buildGrammarRound,
  grammarXp,
  isPassed,
  recordAttempt,
  validateGrammarPack,
  type GrammarUnit,
} from './grammar'

const shipped = JSON.parse(readFileSync('public/data/grammar/en.json', 'utf8'))

describe('the shipped grammar pack', () => {
  const pack = validateGrammarPack(shipped)

  it('validates, with examples and typical mistakes in every unit', () => {
    expect(pack.units.length).toBeGreaterThanOrEqual(12)
    for (const u of pack.units) {
      expect(u.examples.length, u.id).toBeGreaterThanOrEqual(3)
      expect(u.mistakes.length, u.id).toBeGreaterThanOrEqual(2)
      expect(u.patterns.length, u.id).toBeGreaterThanOrEqual(2)
    }
  })

  it('mixes both kinds of exercise in every unit', () => {
    for (const u of pack.units) {
      const kinds = new Set(u.exercises.map((e) => e.type))
      expect([...kinds].sort(), u.id).toEqual(['choice', 'order'])
    }
  })
})

describe('validateGrammarPack', () => {
  const unit = (over: Partial<GrammarUnit>): GrammarUnit => ({
    id: 'x',
    emoji: '🙂',
    level: 'A1',
    title: ['a', 'b'],
    summary: ['a', 'b'],
    explain: ['…'],
    patterns: ['…'],
    examples: [],
    mistakes: [],
    exercises: Array.from({ length: 5 }, () => ({
      type: 'choice' as const,
      prompt: 'I ___ here.',
      options: ['am', 'is'],
      answer: 0,
    })),
    ...over,
  })

  it('refuses an answer that points past the options', () => {
    expect(() =>
      validateGrammarPack({
        units: [
          unit({
            exercises: Array.from({ length: 5 }, () => ({
              type: 'choice' as const,
              prompt: 'I ___ here.',
              options: ['am', 'is'],
              answer: 2,
            })),
          }),
        ],
      })
    ).toThrow(/bad choice/)
  })

  it('refuses a sentence to build that is too short', () => {
    expect(() =>
      validateGrammarPack({
        units: [
          unit({
            exercises: [...unit({}).exercises, { type: 'order', en: 'Hi there', vi: 'Chào' }],
          }),
        ],
      })
    ).toThrow(/3–10 words/)
  })
})

describe('progress', () => {
  it('keeps the best score and counts attempts', () => {
    let p = recordAttempt({}, 'to-be', 6, 9, 100)
    p = recordAttempt(p, 'to-be', 9, 9, 101)
    p = recordAttempt(p, 'to-be', 3, 9, 102)
    expect(p['to-be']).toEqual({ best: 100, attempts: 3, lastDay: 102 })
    expect(isPassed(p['to-be'])).toBe(true)
    expect(isPassed(recordAttempt({}, 'x', 7, 9, 1).x)).toBe(PASS_SCORE <= 78)
  })
})

describe('buildGrammarRound', () => {
  it('shuffles options but keeps every answer pointing at the right one', () => {
    const pack = validateGrammarPack(shipped)
    let seed = 7
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    for (const u of pack.units) {
      const round = buildGrammarRound(u, random)
      expect(round).toHaveLength(u.exercises.length)
      for (const e of round) {
        if (e.type !== 'choice') continue
        const original = u.exercises.find((o) => o.type === 'choice' && o.prompt === e.prompt)
        expect(original?.type === 'choice' && e.options[e.answer]).toBe(
          original?.type === 'choice' && original.options[original.answer]
        )
      }
    }
  })
})

describe('grammarXp', () => {
  it('rewards a perfect round', () => {
    expect(grammarXp(9, 9)).toBe(32)
    expect(grammarXp(0, 9)).toBe(3)
  })
})
