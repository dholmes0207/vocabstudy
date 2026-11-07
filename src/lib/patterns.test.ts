import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PATTERN_PACKS, patternRound, rolesUsed, sentenceText, validatePatterns } from './patterns'
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

describe('Chinese sentence patterns', () => {
  const { patterns } = validatePatterns(
    JSON.parse(readFileSync('public/data/patterns/zh.json', 'utf8'))
  )
  const say = (s: (typeof patterns)[number]['sentences'][number]) =>
    sentenceText(s, PATTERN_PACKS.zh.joiner)

  it('follow their frames, are written in Hanzi with no spaces, and carry pinyin', () => {
    expect(patterns.length).toBeGreaterThanOrEqual(7)
    for (const p of patterns)
      for (const s of p.sentences) {
        const roles = s.chunks.map(([, r]) => r)
        let at = 0
        for (const r of p.formula) {
          at = roles.indexOf(r, at)
          expect(at, `${p.id}: ${say(s)}`).toBeGreaterThanOrEqual(0)
          at++
        }
        expect(say(s)).toMatch(/^[\u4e00-\u9fff]+$/)
        expect(s.py, say(s)).toMatch(/^[A-Z]/)
      }
  })

  it('puts time and 在 places before the verb, and 把 always has something after its verb', () => {
    for (const p of patterns)
      for (const s of p.sentences) {
        const roles = s.chunks.map(([, r]) => r)
        const verb = roles.indexOf('V')
        if (verb < 0) continue
        for (const r of ['T', 'K'] as const)
          if (roles.includes(r)) expect(roles.indexOf(r), say(s)).toBeLessThan(verb)
        if (s.chunks.some(([t]) => t.startsWith('把')))
          expect(roles.length, say(s)).toBeGreaterThan(verb + 1)
      }
  })

  it('shows only the roles its sentences use', () => {
    expect(rolesUsed(patterns)).toContain('K')
    expect(rolesUsed(patterns)).not.toContain('M')
  })
})
