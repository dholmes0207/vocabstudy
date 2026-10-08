import { describe, expect, it } from 'vitest'
import { PROVERBS, proverbOfDay } from './proverbs'

describe('proverbOfDay', () => {
  it('is stable for a day and changes the next day', () => {
    expect(proverbOfDay(20000)).toBe(proverbOfDay(20000))
    expect(proverbOfDay(20000)).not.toBe(proverbOfDay(20001))
  })

  it('cycles through every saying, even for odd day numbers', () => {
    const seen = new Set(Array.from({ length: PROVERBS.length }, (_, d) => proverbOfDay(d).en))
    expect(seen.size).toBe(PROVERBS.length)
    expect(proverbOfDay(-1)).toBeDefined()
  })

  it('every saying has both languages', () => {
    for (const p of PROVERBS) {
      expect(p.en.trim()).not.toBe('')
      expect(p.vi.trim()).not.toBe('')
    }
  })
})
