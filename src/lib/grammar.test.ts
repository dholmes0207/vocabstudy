import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  PASS_SCORE,
  buildGrammarRound,
  dueDay,
  dueUnits,
  grammarXp,
  isPassed,
  recordAttempt,
  validateGrammarPack,
  type GrammarProgress,
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

describe('the Korean grammar pack', () => {
  const ko = validateGrammarPack(JSON.parse(readFileSync('public/data/grammar/ko.json', 'utf8')))

  it('validates, in Korean, with lessons for the particles and the polite ending', () => {
    expect(ko.units.map((u) => u.id)).toEqual(
      expect.arrayContaining(['ko-ieyo', 'ko-eun-neun', 'ko-i-ga', 'ko-eul-reul', 'ko-ayo-eoyo'])
    )
    for (const u of ko.units) for (const ex of u.examples) expect(ex.en, u.id).toMatch(/[가-힣]/)
    // A2: past, wanting, plans, the long negative.
    expect(ko.units.filter((u) => u.level === 'A2').map((u) => u.id)).toEqual(
      expect.arrayContaining(['ko-past', 'ko-want', 'ko-future', 'ko-ji-anayo'])
    )
  })

  it('picks each particle by whether the noun ends in a consonant (받침)', () => {
    const pairs = [
      ['이에요', '예요'],
      ['은', '는'],
      ['이', '가'],
      ['을', '를'],
    ]
    const hasFinal = (s: string) => (s.charCodeAt(s.length - 1) - 0xac00) % 28 !== 0
    let checked = 0
    for (const u of ko.units)
      for (const e of u.exercises) {
        if (e.type !== 'choice' || !pairs.some((p) => p.join() === e.options.join())) continue
        const noun = /([가-힣]+)___/.exec(e.prompt)![1]
        expect(e.answer, e.prompt).toBe(hasFinal(noun) ? 0 : 1)
        checked++
      }
    expect(checked).toBeGreaterThanOrEqual(15)
  })
})

describe('the Chinese grammar pack', () => {
  const zh = validateGrammarPack(JSON.parse(readFileSync('public/data/grammar/zh.json', 'utf8')))

  it('validates, in Chinese, with the core beginner points', () => {
    expect(zh.units.map((u) => u.id)).toEqual(
      expect.arrayContaining(['zh-shi', 'zh-bu-mei', 'zh-questions', 'zh-de', 'zh-measure'])
    )
    for (const u of zh.units)
      for (const ex of u.examples) expect(ex.en, u.id).toMatch(/\p{Script=Han}/u)
  })

  it('builds word-order tiles from invisible word breaks, never visible spaces', () => {
    for (const u of zh.units)
      for (const e of u.exercises)
        if (e.type === 'order') {
          expect(e.en, u.id).toContain('\u200b')
          expect(e.en, u.id).not.toMatch(/ /)
        }
  })

  it('gives every example a pinyin line starting with a capital letter', () => {
    for (const u of zh.units)
      for (const ex of u.examples) {
        expect(ex.read, ex.en).toMatch(
          /^[A-Z\u0100\u00c1\u01cd\u00c0\u0112\u00c9\u011a\u00c8\u014c\u00d3\u01d1\u00d2]/u
        )
        expect(ex.read, ex.en).not.toMatch(/\p{Script=Han}/u)
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
    expect(p['to-be']).toMatchObject({ best: 100, attempts: 3, lastDay: 102 })
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

describe('grammar review schedule', () => {
  const pass = (p: GrammarProgress, day: number) => recordAttempt(p, 'u', 9, 10, day)
  const fail = (p: GrammarProgress, day: number) => recordAttempt(p, 'u', 3, 10, day)

  it('schedules a passed lesson 3, 7, 21, then 60 days out, advancing only when due', () => {
    let p = pass({}, 100)
    expect(dueDay(p.u)).toBe(103)
    p = pass(p, 101) // practising early changes nothing
    expect(dueDay(p.u)).toBe(103)
    p = pass(p, 103)
    expect(dueDay(p.u)).toBe(110)
    p = pass(p, 110)
    expect(dueDay(p.u)).toBe(131)
    p = pass(p, 131)
    expect(dueDay(p.u)).toBe(191)
    p = pass(p, 191)
    expect(dueDay(p.u)).toBe(251)
  })

  it('brings a failed review back tomorrow, then restarts the ladder', () => {
    let p = pass({}, 100)
    p = fail(p, 103)
    expect(dueDay(p.u)).toBe(104)
    expect(isPassed(p.u)).toBe(true) // the best score still stands
    p = pass(p, 104)
    expect(dueDay(p.u)).toBe(107)
  })

  it('reads records saved before the schedule existed', () => {
    const old: GrammarProgress = { u: { best: 90, attempts: 1, lastDay: 50 } }
    expect(dueDay(old.u)).toBe(53)
    expect(dueDay({ best: 40, attempts: 1, lastDay: 50 })).toBeNull()
  })

  it('lists the due lessons, most overdue first', () => {
    const p: GrammarProgress = {
      a: { best: 90, attempts: 1, lastDay: 1, step: 0, due: 10 },
      b: { best: 90, attempts: 1, lastDay: 1, step: 0, due: 5 },
      c: { best: 90, attempts: 1, lastDay: 1, step: 0, due: 30 },
      d: { best: 50, attempts: 1, lastDay: 1 },
    }
    expect(dueUnits(p, ['a', 'b', 'c', 'd', 'e'], 12)).toEqual(['b', 'a'])
  })
})
