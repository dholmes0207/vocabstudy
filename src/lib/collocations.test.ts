import { describe, expect, it } from 'vitest'
import {
  COLLOCATION_PACKS,
  COLLOCATIONS,
  COLLOCATIONS_ZH,
  GAP,
  THEMES,
  collocationRound,
  collocationXp,
  filled,
} from './collocations'
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
    round.forEach((q, n) => {
      if (n % 2 === 0) {
        // Fill the gap: the partner beside two traps.
        expect(q.kind).toBe('fill')
        expect(q.options).toHaveLength(3)
        expect(q.options[q.answer]).toBe(q.item.answer)
      } else {
        // Pick the natural sentence: the slip is the other one.
        expect(q.kind).toBe('pick')
        expect(q.options).toHaveLength(2)
        expect(q.options[q.answer]).toBe(filled(q.item))
        expect(q.options[1 - q.answer]).toBe(filled(q.item, q.item.traps[0]))
      }
    })
  })

  it('keeps to one theme when asked', () => {
    const round = collocationRound(10, 'ielts', mulberry32(5))
    expect(round.length).toBe(COLLOCATIONS.filter((x) => x.theme === 'ielts').length)
    expect(round.every((q) => q.item.theme === 'ielts')).toBe(true)
  })

  it('gives Chinese items their pinyin and a sentence in characters, per theme', () => {
    const { themes, items } = COLLOCATION_PACKS.zh
    for (const th of themes)
      expect(items.filter((x) => x.theme === th.id).length, th.id).toBeGreaterThanOrEqual(5)
    for (const x of COLLOCATIONS_ZH) {
      expect(x.sentence.split(GAP).length, x.vi).toBe(2)
      expect(x.right, x.vi).toContain(x.answer)
      expect(x.slip, x.vi).toContain(x.traps[0])
      expect(x.reading, x.vi).toMatch(/^[a-zāáǎàēéěèīíǐìōóǒòūúǔùü ]+$/)
      expect(new Set([x.answer, ...x.traps]).size, x.vi).toBe(3)
    }
    const round = collocationRound(10, undefined, mulberry32(7), COLLOCATIONS_ZH)
    expect(
      round.every((q) =>
        q.kind === 'fill'
          ? q.options[q.answer] === q.item.answer
          : q.options[q.answer] === filled(q.item)
      )
    ).toBe(true)
  })

  it('pays a bonus for a perfect round', () => {
    expect(collocationXp(10, 10)).toBe(30)
    expect(collocationXp(9, 10)).toBe(23)
  })
})
