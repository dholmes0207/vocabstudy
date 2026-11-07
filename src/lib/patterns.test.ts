import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { patternRound, sentenceText, validatePatterns } from './patterns'
import { mulberry32 } from './sky'

const raw = () => JSON.parse(readFileSync('public/data/patterns/en.json', 'utf8'))

describe('sentence patterns', () => {
  const { patterns } = validatePatterns(raw())

  it('pass their check, and each sentence follows its pattern’s frame in order', () => {
    expect(patterns.length).toBeGreaterThanOrEqual(8)
    for (const p of patterns)
      for (const s of p.sentences) {
        // The frame's roles appear in the sentence in that order (others may sit between).
        const roles = s.chunks.map(([, r]) => r)
        let at = 0
        for (const r of p.formula) {
          at = roles.indexOf(r, at)
          expect(at, `${p.id}: ${sentenceText(s)}`).toBeGreaterThanOrEqual(0)
          at++
        }
        expect(sentenceText(s)).toMatch(/^[A-Z]/)
      }
  })

  it('turns down a block with an unknown role', () => {
    const b = raw()
    b.patterns[0].sentences[0].chunks[0][1] = 'X'
    expect(() => validatePatterns(b)).toThrow(/three blocks with roles/)
  })

  it('makes a mixed round of one sentence per pattern, or a round of one pattern', () => {
    const mixed = patternRound(patterns, undefined, 6, mulberry32(2))
    expect(mixed).toHaveLength(6)
    expect(new Set(mixed.map((i) => i.pattern.id)).size).toBe(6)
    const one = patternRound(patterns, 'there-is', 6, mulberry32(2))
    expect(one.every((i) => i.pattern.id === 'there-is')).toBe(true)
    expect(one).toHaveLength(patterns.find((p) => p.id === 'there-is')!.sentences.length)
  })
})
