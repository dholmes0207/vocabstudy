import { describe, expect, it } from 'vitest'
import { cefrFor, estimateSection } from './toeicScore'

describe('TOEIC mini test estimate', () => {
  it('gives a range on the 5–495 scale, in steps of five', () => {
    expect(estimateSection(13, 13)).toEqual({ low: 435, high: 495 })
    expect(estimateSection(0, 13)).toEqual({ low: 5, high: 65 })
    const mid = estimateSection(7, 13)
    expect(mid.low % 5).toBe(0)
    expect(mid.high - mid.low).toBe(120)
  })

  it("reads the CEFR level from ETS's cut scores, each section its own", () => {
    expect(cefrFor('listening', 400)).toBe('B2')
    expect(cefrFor('reading', 385)).toBe('B2')
    expect(cefrFor('reading', 384)).toBe('B1')
    expect(cefrFor('listening', 109)).toBe('A1')
    expect(cefrFor('listening', 30)).toBeNull()
  })
})
