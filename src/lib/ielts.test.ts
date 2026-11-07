import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { clock, pickOther, pickPassage, readingRound, validateIeltsBank } from './ielts'
import { mulberry32 } from './sky'

const raw = () => JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8'))

describe('the IELTS bank', () => {
  it('passes its check, and every passage practises all three answers', () => {
    const bank = validateIeltsBank(raw())
    expect(bank.reading.length).toBeGreaterThanOrEqual(6)
    for (const p of bank.reading) {
      expect(new Set(p.questions.map((q) => q.answer)), p.id).toEqual(new Set(['T', 'F', 'NG']))
      expect(new Set(p.questions.map((q) => q.statement)).size, p.id).toBe(p.questions.length)
    }
  })

  it('turns down a broken edit', () => {
    const broken = (edit: (b: ReturnType<typeof raw>) => void) => {
      const b = raw()
      edit(b)
      return () => validateIeltsBank(b)
    }
    expect(broken((b) => delete b.reading)).toThrow(/"reading" is missing/)
    expect(broken((b) => (b.reading[1].id = b.reading[0].id))).toThrow(/repeated/)
    expect(broken((b) => (b.reading[0].questions[0].answer = 'YES'))).toThrow(/bad answer/)
    expect(broken((b) => (b.reading[0].questions[0].why = ''))).toThrow(/no explanation/)
    expect(broken((b) => (b.reading[0].passage = []))).toThrow(/no text/)
  })
})

describe('picking a passage', () => {
  const { reading } = validateIeltsBank(raw())

  it('offers one not read yet, and never the one just done', () => {
    const done = new Set(reading.slice(1).map((p) => p.id))
    for (let seed = 1; seed < 10; seed++)
      expect(pickPassage(reading, (id) => done.has(id), undefined, mulberry32(seed)).id).toBe(
        reading[0].id
      )
    for (let seed = 1; seed < 10; seed++)
      expect(pickPassage(reading, () => true, reading[2].id, mulberry32(seed)).id).not.toBe(
        reading[2].id
      )
  })

  it('shuffles the statements but keeps each with its answer', () => {
    const p = reading[0]
    const round = readingRound(p, mulberry32(4))
    expect([...round.questions].sort((a, b) => a.statement.localeCompare(b.statement))).toEqual(
      [...p.questions].sort((a, b) => a.statement.localeCompare(b.statement))
    )
  })
})

describe('speaking practice', () => {
  const { speaking } = validateIeltsBank(raw())

  it('has Part 1 topics and Part 2 cards with a plan, phrases and Part 3 questions', () => {
    expect(speaking.part1.length).toBeGreaterThanOrEqual(6)
    expect(speaking.part2.length).toBeGreaterThanOrEqual(6)
    for (const c of speaking.part2) {
      expect(c.cue, c.id).toMatch(/^Describe /)
      expect(c.points.at(-1), c.id).toMatch(/^and explain/)
    }
    const ids = [...speaking.part1, ...speaking.part2].map((x) => x.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('turns down a card without its Part 3', () => {
    const b = raw()
    b.speaking.part2[0].part3 = []
    expect(() => validateIeltsBank(b)).toThrow(/Part 3 questions/)
    const c = raw()
    delete c.speaking
    expect(() => validateIeltsBank(c)).toThrow(/"speaking" is missing/)
  })

  it('never gives the same topic twice in a row, and shows time as m:ss', () => {
    for (let seed = 1; seed < 10; seed++)
      expect(pickOther(speaking.part1, 'food', mulberry32(seed)).id).not.toBe('food')
    expect(clock(65)).toBe('1:05')
    expect(clock(120)).toBe('2:00')
  })
})
