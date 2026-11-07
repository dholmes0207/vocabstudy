import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CONFUSABLES, GAP, confusableRound, confusableXp, filled } from './confusables'
import { mulberry32 } from './sky'

const words = (
  JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as { words: { word: string }[] }
).words

describe('look-alike characters', () => {
  it('give every group two or more characters, a rule, and a sentence for each character', () => {
    const ids = new Set<string>()
    for (const g of CONFUSABLES) {
      expect(ids.has(g.id), g.id).toBe(false)
      ids.add(g.id)
      expect(g.chars.length, g.id).toBeGreaterThanOrEqual(2)
      expect(
        g.rule.every((r) => r.length > 20),
        g.id
      ).toBe(true)
      const chars = g.chars.map((c) => c.ch)
      for (const c of chars)
        expect(
          g.sentences.some((s) => s.answer === c),
          `${g.id}: ${c}`
        ).toBe(true)
      for (const s of g.sentences) {
        expect(s.zh.split(GAP), s.zh).toHaveLength(2)
        expect(chars, s.zh).toContain(s.answer)
        expect(s.pinyin, s.zh).toMatch(/^[A-ZÀ-Ž“]/)
        expect(s.vi.length, s.zh).toBeGreaterThan(3)
      }
    }
  })

  it('use characters a learner of the pack has met', () => {
    const text = words.map((w) => w.word).join('')
    for (const g of CONFUSABLES) for (const c of g.chars) expect(text, c.ch).toContain(c.ch)
  })

  it('makes a mixed round that visits every group, or a round of one group', () => {
    const mixed = confusableRound(10, undefined, mulberry32(3))
    expect(mixed).toHaveLength(10)
    expect(new Set(mixed.map((q) => q.group.id)).size).toBe(Math.min(10, CONFUSABLES.length))
    expect(new Set(mixed.map((q) => q.sentence.zh)).size).toBe(10)
    const de = confusableRound(10, 'de', mulberry32(3))
    expect(de.every((q) => q.group.id === 'de')).toBe(true)
    expect(de).toHaveLength(CONFUSABLES.find((g) => g.id === 'de')!.sentences.length)
  })

  it('fills the gap and scores a round', () => {
    expect(filled({ zh: `我${GAP}家。`, answer: '在', pinyin: '', vi: '' })).toBe('我在家。')
    expect(confusableXp(10, 10)).toBe(30)
    expect(confusableXp(0, 10)).toBe(5)
  })
})
