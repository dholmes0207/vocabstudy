import { describe, expect, it } from 'vitest'
import { ENDINGS } from './wordFormDrill'
import { familyRound, familySlots, markingEnding, WORD_FAMILIES } from './wordFamilies'
import { mulberry32 } from './sky'

describe('word families', () => {
  it('has enough families, each with three or four different forms', () => {
    expect(WORD_FAMILIES.length).toBeGreaterThanOrEqual(40)
    const seen = new Set<string>()
    for (const fam of WORD_FAMILIES) {
      const slots = familySlots(fam)
      const forms = slots.map((s) => s.en)
      expect(slots.length, forms.join()).toBeGreaterThanOrEqual(3)
      expect(new Set(forms).size, forms.join()).toBe(forms.length)
      for (const s of slots) {
        expect(s.en).toMatch(/^[a-z]+$/)
        expect(s.vi.trim()).not.toBe('')
        // A form belongs to one family only, so no round shows it twice.
        expect(seen.has(s.en), s.en).toBe(false)
        seen.add(s.en)
      }
    }
  })

  it('never contradicts the ending rules the endings drill teaches', () => {
    for (const fam of WORD_FAMILIES)
      for (const s of familySlots(fam)) {
        const rule = ENDINGS.find(
          (e) => s.en.endsWith(e.ending) && s.en.length > e.ending.length + 2
        )
        if (rule) expect(rule.cat, s.en).toBe(s.cat)
      }
    expect(markingEnding('decisively', 'adverb')).toBe('ly')
    expect(markingEnding('decision', 'noun')).toBe('sion')
    expect(markingEnding('decide', 'verb')).toBeNull()
  })

  it('puts the slots in noun, verb, adjective, adverb order', () => {
    const decide = WORD_FAMILIES.find((fam) => fam.forms.verb?.[0] === 'decide')!
    expect(familySlots(decide).map((s) => s.en)).toEqual([
      'decision',
      'decide',
      'decisive',
      'decisively',
    ])
  })

  it('makes a round of different families', () => {
    const round = familyRound(6, mulberry32(3))
    expect(round).toHaveLength(6)
    expect(new Set(round).size).toBe(6)
  })
})
