import { describe, expect, it } from 'vitest'
import { PROVERBS, proverbOfDay } from './proverbs'

describe('proverbOfDay', () => {
  it('is stable for a day and changes the next day', () => {
    expect(proverbOfDay(20000)).toBe(proverbOfDay(20000))
    expect(proverbOfDay(20000)).not.toBe(proverbOfDay(20001))
  })

  it('cycles through every saying, even for odd day numbers', () => {
    const seen = new Set(Array.from({ length: PROVERBS.length }, (_, d) => proverbOfDay(d)!.text))
    expect(seen.size).toBe(PROVERBS.length)
    expect(proverbOfDay(-1)).toBeDefined()
  })

  it('every saying has both languages', () => {
    for (const p of PROVERBS) {
      expect(p.text.trim()).not.toBe('')
      expect(p.vi.trim()).not.toBe('')
    }
  })
})

describe('proverbOfDay by language', () => {
  it('gives a saying in the language being learned', () => {
    expect(proverbOfDay(20000, 'en')!.text).toMatch(/^[A-Za-z]/)
    expect(proverbOfDay(20000, 'ko')!.text).toMatch(/[\uac00-\ud7a3]/)
    expect(proverbOfDay(20000, 'zh')!.text).toMatch(/[\u4e00-\u9fff]/)
  })

  it('shows nothing for a language with no sayings yet', () => {
    expect(proverbOfDay(20000, 'ja')).toBeNull()
  })
})
