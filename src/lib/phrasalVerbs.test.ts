import { describe, expect, it } from 'vitest'
import { GAP, PARTICLES, filled, phrasalRound, phrasalXp } from './phrasalVerbs'
import { mulberry32 } from './sky'

describe('phrasal verbs data', () => {
  it('gives every particle five verbs, each in a sentence with one gap', () => {
    expect(PARTICLES.map((p) => p.id)).toEqual(['up', 'out', 'off', 'on', 'down', 'back'])
    const verbs = PARTICLES.flatMap((p) => p.verbs)
    expect(new Set(verbs.map((v) => v.verb)).size).toBe(verbs.length)
    for (const p of PARTICLES) {
      expect(p.verbs.length, p.id).toBeGreaterThanOrEqual(5)
      for (const v of p.verbs) {
        expect(v.verb.split(' ')[1], v.verb).toBe(p.id)
        expect(v.sentence.split(GAP), v.verb).toHaveLength(2)
        expect(v.vi.trim() && v.meaning.every((m) => m.trim()), v.verb).toBeTruthy()
      }
    }
  })

  it('puts the particle back into the sentence', () => {
    const up = PARTICLES[0]
    expect(filled({ particle: up, item: up.verbs[0] })).toMatch(/^Don’t give up now/)
  })
})

describe('phrasalRound', () => {
  it('spreads a mixed round over every particle without repeats', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const qs = phrasalRound(12, undefined, mulberry32(seed))
      expect(qs).toHaveLength(12)
      expect(new Set(qs.map((q) => q.item.verb)).size).toBe(12)
      for (const p of PARTICLES)
        expect(qs.filter((q) => q.particle.id === p.id).length, p.id).toBe(2)
    }
  })

  it('drills one particle, and scores like the other rounds', () => {
    const qs = phrasalRound(10, 'off', mulberry32(3))
    expect(qs).toHaveLength(5)
    expect(qs.every((q) => q.particle.id === 'off')).toBe(true)
    expect(phrasalXp(10, 10)).toBe(30)
    expect(phrasalXp(0, 10)).toBe(5)
  })
})
