import { describe, expect, it } from 'vitest'
import { SLANG, slangRound, slangXp } from './netSlang'
import { mulberry32 } from './sky'

describe('net slang data', () => {
  it('gives every word a reading, a Hán Việt sound, a meaning and an example using it', () => {
    expect(SLANG.length).toBeGreaterThanOrEqual(20)
    expect(new Set(SLANG.map((s) => s.zh)).size).toBe(SLANG.length)
    expect(new Set(SLANG.map((s) => s.meaning[0])).size).toBe(SLANG.length)
    for (const s of SLANG) {
      expect(s.pinyin.trim() && s.hv.trim(), s.zh).toBeTruthy()
      // One Hán Việt syllable per character.
      expect(s.hv.split(' '), s.zh).toHaveLength([...s.zh].length)
      expect(s.example.zh, s.zh).toContain(s.zh)
      expect(
        s.meaning.every((m) => m.trim()),
        s.zh
      ).toBe(true)
    }
  })
})

describe('slangRound', () => {
  it('asks about different words, alternating the two directions', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const qs = slangRound(10, mulberry32(seed))
      expect(new Set(qs.map((q) => q.item.zh)).size).toBe(10)
      qs.forEach((q, i) => {
        expect(q.kind).toBe(i % 2 === 0 ? 'meaning' : 'word')
        expect(q.options).toHaveLength(4)
        if (q.kind === 'meaning') expect(q.options[q.answer]).toBe(q.item.meaning)
        else expect(q.options[q.answer]).toBe(q.item)
      })
    }
    expect(slangXp(10, 10)).toBe(30)
  })
})
