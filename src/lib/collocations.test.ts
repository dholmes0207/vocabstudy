import { describe, expect, it } from 'vitest'
import { COLLOCATIONS, GAP, THEMES, collocationRound, collocationXp, filled } from './collocations'
import { mulberry32 } from './sky'

describe('collocations', () => {
  it('gives every theme at least five items, each with a gap the answer fills', () => {
    for (const th of THEMES)
      expect(COLLOCATIONS.filter((x) => x.theme === th.id).length, th.id).toBeGreaterThanOrEqual(5)
    for (const x of COLLOCATIONS) {
      expect(x.sentence.split(GAP).length, x.sentence).toBe(2)
      expect(filled(x), x.vi).not.toContain(GAP)
      // The right partner and two traps, all different.
      expect(new Set([x.answer, ...x.traps]).size, x.vi).toBe(3)
      // The slip is not the natural phrase, and every item says why.
      expect(x.slip, x.vi).not.toBe(x.right)
      expect(x.why.length, x.vi).toBeGreaterThan(20)
    }
    expect(new Set(COLLOCATIONS.map((x) => x.vi)).size).toBe(COLLOCATIONS.length)
  })

  it('builds a round of different items with the answer among three options', () => {
    const round = collocationRound(10, undefined, mulberry32(3))
    expect(round).toHaveLength(10)
    expect(new Set(round.map((q) => q.item.vi)).size).toBe(10)
    for (const q of round) {
      expect(q.options).toHaveLength(3)
      expect(q.options[q.answer]).toBe(q.item.answer)
    }
  })

  it('keeps to one theme when asked', () => {
    const round = collocationRound(10, 'ielts', mulberry32(5))
    expect(round.length).toBe(COLLOCATIONS.filter((x) => x.theme === 'ielts').length)
    expect(round.every((q) => q.item.theme === 'ielts')).toBe(true)
  })

  it('pays a bonus for a perfect round', () => {
    expect(collocationXp(10, 10)).toBe(30)
    expect(collocationXp(9, 10)).toBe(23)
  })
})
