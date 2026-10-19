import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  COUNTERS,
  COUNTER_ITEMS,
  counterMeaning,
  counterOf,
  counterPhrase,
  koCounterQuiz,
} from './koCounters'

const pack = JSON.parse(readFileSync('public/data/ko.json', 'utf8')) as {
  words: { word: string }[]
}
const heads = new Set(pack.words.map((w) => w.word))

describe('Korean counter data', () => {
  it('uses nouns of the Korean pack and counters from the table, each counter asked', () => {
    for (const i of COUNTER_ITEMS) {
      expect(heads.has(i.noun), i.noun).toBe(true)
      expect(counterOf(i.counter), i.noun).toBeDefined()
      for (const a of i.also ?? []) expect(counterOf(a), `${i.noun} also ${a}`).toBeDefined()
    }
    const asked = new Set(COUNTER_ITEMS.map((i) => i.counter))
    for (const c of COUNTERS) expect(asked.has(c.ch), c.ch).toBe(true)
  })
})

describe('counterPhrase', () => {
  it('puts the short native number before the counter', () => {
    const book = COUNTER_ITEMS.find((i) => i.noun === '책')!
    expect(counterPhrase({ item: book, n: 2 })).toBe('책 두 권')
    expect(counterPhrase({ item: book, n: 2 }, true)).toBe('책 두 ___')
    expect(counterPhrase({ item: book, n: 1 })).toBe('책 한 권')
    expect(counterMeaning({ item: book, n: 2 })).toEqual(['hai quyển sách', '2 books'])
    expect(counterMeaning({ item: book, n: 1 })).toEqual(['một quyển sách', '1 book'])
  })
})

describe('koCounterQuiz', () => {
  it('gives distinct nouns, four distinct counters and never a wrong option that is also right', () => {
    for (let r = 0; r < 30; r++) {
      const qs = koCounterQuiz(10)
      expect(qs).toHaveLength(10)
      expect(new Set(qs.map((q) => q.item.noun)).size).toBe(10)
      for (const q of qs) {
        expect(new Set(q.options).size).toBe(4)
        expect(q.options[q.answer]).toBe(q.item.counter)
        expect(q.n).toBeGreaterThanOrEqual(1)
        expect(q.n).toBeLessThanOrEqual(5)
        for (const a of q.item.also ?? []) expect(q.options).not.toContain(a)
      }
    }
  })
})
