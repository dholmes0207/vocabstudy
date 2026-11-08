import { describe, expect, it } from 'vitest'
import { CHENGYU, GAP, charsOf, chengyuRound, chengyuXp, withGap } from './chengyu'
import { mulberry32 } from './sky'

describe('chengyu data', () => {
  it('has four characters, and one pinyin and one Hán Việt syllable for each', () => {
    expect(CHENGYU.length).toBeGreaterThanOrEqual(20)
    for (const it of CHENGYU) {
      expect([...it.zh], it.id).toHaveLength(4)
      expect(it.pinyin.split(' '), it.id).toHaveLength(4)
      expect(it.hv.split(' '), it.id).toHaveLength(4)
      expect(it.example.zh, it.id).toContain(it.zh)
      expect(
        it.meaning.every((m) => m.trim()),
        it.id
      ).toBe(true)
    }
    expect(new Set(CHENGYU.map((it) => it.id)).size).toBe(CHENGYU.length)
    expect(new Set(CHENGYU.map((it) => it.meaning[0])).size).toBe(CHENGYU.length)
  })

  it('pairs each character with its syllables, and hides one', () => {
    const it = CHENGYU.find((x) => x.zh === '半信半疑')!
    expect(charsOf(it)[1]).toEqual({ ch: '信', hv: 'tín', pinyin: 'xìn' })
    expect(withGap(it, 3)).toBe(`半信半${GAP}`)
  })
})

describe('chengyuRound', () => {
  it('asks about different idioms, alternating meaning and missing character', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const qs = chengyuRound(10, mulberry32(seed))
      expect(qs).toHaveLength(10)
      expect(new Set(qs.map((q) => q.item.id)).size).toBe(10)
      qs.forEach((q, i) => {
        expect(q.kind).toBe(i % 2 === 0 ? 'meaning' : 'missing')
        expect(q.options).toHaveLength(4)
        if (q.kind === 'meaning') {
          expect(q.options[q.answer]).toBe(q.item.meaning)
          expect(new Set(q.options.map((o) => o[0])).size).toBe(4)
        } else {
          expect(q.options[q.answer].ch).toBe([...q.item.zh][q.at])
          const wrong = q.options.filter((_, j) => j !== q.answer)
          for (const o of wrong) expect(q.item.zh).not.toContain(o.ch)
          expect(new Set(q.options.map((o) => o.ch)).size).toBe(4)
        }
      })
    }
  })

  it('gives XP like the other character rounds', () => {
    expect(chengyuXp(10, 10)).toBe(30)
    expect(chengyuXp(4, 10)).toBe(13)
  })
})
