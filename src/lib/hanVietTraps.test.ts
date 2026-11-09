import { describe, expect, it } from 'vitest'
import { HAN_VIET_TRAPS, trapRound, trapXp } from './hanVietTraps'
import { mulberry32 } from './sky'

describe('Hán Việt traps', () => {
  it('gives every word one Hán Việt syllable per character, a trap that differs from its meaning, and an example', () => {
    expect(HAN_VIET_TRAPS.length).toBeGreaterThanOrEqual(20)
    expect(new Set(HAN_VIET_TRAPS.map((x) => x.zh)).size).toBe(HAN_VIET_TRAPS.length)
    for (const x of HAN_VIET_TRAPS) {
      expect(x.hv.split(' '), x.zh).toHaveLength([...x.zh].length)
      expect(x.trap[0], x.zh).not.toBe(x.meaning[0])
      expect(x.example.zh, x.zh).toContain(x.zh)
      expect(
        [...x.trap, ...x.meaning].every((s) => s.trim()),
        x.zh
      ).toBe(true)
    }
    const meanings = HAN_VIET_TRAPS.map((x) => x.meaning[0])
    expect(new Set(meanings).size).toBe(meanings.length)
  })

  it('makes rounds whose options hold the meaning and the trap, all different', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const qs = trapRound(10, mulberry32(seed))
      expect(new Set(qs.map((q) => q.item.zh)).size).toBe(10)
      for (const q of qs) {
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options.map((o) => o[0])).size).toBe(4)
        expect(q.options[q.answer]).toBe(q.item.meaning)
        expect(q.options[q.trapAt]).toBe(q.item.trap)
      }
    }
    expect(trapXp(10, 10)).toBe(30)
  })
})
