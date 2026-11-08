import { describe, expect, it } from 'vitest'
import { GAP, IDIOMS, idiomRound, idiomXp, withGap } from './idiomsEn'
import { mulberry32 } from './sky'

describe('English idioms data', () => {
  it('hides a word that appears exactly once, and uses the idiom in its example', () => {
    expect(IDIOMS.length).toBeGreaterThanOrEqual(20)
    expect(new Set(IDIOMS.map((x) => x.phrase)).size).toBe(IDIOMS.length)
    expect(new Set(IDIOMS.map((x) => x.key)).size).toBe(IDIOMS.length)
    expect(new Set(IDIOMS.map((x) => x.meaning[0])).size).toBe(IDIOMS.length)
    for (const x of IDIOMS) {
      expect(
        x.phrase.split(' ').filter((w) => w === x.key),
        x.phrase
      ).toHaveLength(1)
      expect(withGap(x).split(GAP), x.phrase).toHaveLength(2)
      // The example may change the verb's form (costs, kills), not the rest.
      const tail = x.phrase.split(' ').slice(1).join(' ')
      expect(x.example.en, x.phrase).toContain(tail)
      expect(x.literal.trim() && x.example.vi.trim(), x.phrase).toBeTruthy()
    }
  })
})

describe('idiomRound', () => {
  it('asks about different idioms, alternating meaning and missing word', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const qs = idiomRound(10, mulberry32(seed))
      expect(new Set(qs.map((q) => q.item.phrase)).size).toBe(10)
      qs.forEach((q, n) => {
        expect(q.kind).toBe(n % 2 === 0 ? 'meaning' : 'missing')
        expect(new Set(q.options.map(String)).size).toBe(4)
        if (q.kind === 'meaning') expect(q.options[q.answer]).toBe(q.item.meaning)
        else expect(q.options[q.answer]).toBe(q.item.key)
      })
    }
    expect(idiomXp(10, 10)).toBe(30)
  })
})
