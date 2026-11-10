import { describe, expect, it } from 'vitest'
import { GAP, OPTIONS, PARTICLES, filled, phrasalRound, phrasalXp } from './phrasalVerbs'
import { mulberry32 } from './sky'

describe('phrasal verbs data', () => {
  it('gives every particle five verbs, each in a sentence with one gap', () => {
    expect(PARTICLES.map((p) => p.id)).toEqual([
      'up',
      'out',
      'off',
      'on',
      'down',
      'back',
      'over',
      'away',
    ])
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
  it('offers the answer and three particles that cannot fit the gap', () => {
    for (let seed = 1; seed <= 30; seed++)
      for (const q of phrasalRound(16, undefined, mulberry32(seed))) {
        expect(q.options).toHaveLength(OPTIONS)
        expect(new Set(q.options).size).toBe(OPTIONS)
        expect(q.options).toContain(q.particle.id)
        for (const o of q.item.alsoFits ?? []) expect(q.options, q.item.verb).not.toContain(o)
      }
  })

  it('never offers "over" for turn off or come back, where it would also fit', () => {
    const off = PARTICLES.find((p) => p.id === 'off')!
    expect(off.verbs.find((v) => v.verb === 'turn off')!.alsoFits).toContain('over')
    const back = PARTICLES.find((p) => p.id === 'back')!
    expect(back.verbs.find((v) => v.verb === 'come back')!.alsoFits).toContain('over')
  })

  it('spreads a mixed round over every particle without repeats', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const qs = phrasalRound(16, undefined, mulberry32(seed))
      expect(qs).toHaveLength(16)
      expect(new Set(qs.map((q) => q.item.verb)).size).toBe(16)
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
