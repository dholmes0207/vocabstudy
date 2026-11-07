import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pickPassage, readingRound, validateIeltsBank } from './ielts'
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
