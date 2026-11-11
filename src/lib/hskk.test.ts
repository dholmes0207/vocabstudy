import { describe, expect, it } from 'vitest'
import { HSKK_LEVELS, HSKK_PARTS, HSKK_ROUND, hskkRound, type HskkLine } from './hskk'
import { mulberry32 } from './sky'

const filled = (l: HskkLine) => [l.zh, l.pinyin, l.vi].every((x) => x.trim().length > 0)

describe('HSKK Elementary', () => {
  it('has lines with pinyin and meaning, and a sample answer for Parts 2 and 3', () => {
    expect(HSKK_PARTS[1].length).toBeGreaterThanOrEqual(10)
    expect(HSKK_PARTS[2].length).toBeGreaterThanOrEqual(10)
    expect(HSKK_PARTS[3].length).toBeGreaterThanOrEqual(2)
    for (const part of [1, 2, 3] as const)
      for (const it of HSKK_PARTS[part]) {
        expect(filled(it), it.zh).toBe(true)
        // Pinyin starts with a capital, as a sentence does.
        expect(it.pinyin, it.zh).toMatch(/^[A-ZÀ-Ž]/)
        if (part === 1) expect(it.sample, it.zh).toBeUndefined()
        else expect(it.sample && filled(it.sample), it.zh).toBe(true)
      }
    // A Part 3 sample is a short talk: five sentences or more.
    for (const it of HSKK_PARTS[3])
      expect(it.sample!.zh.split('。').filter(Boolean).length, it.zh).toBeGreaterThanOrEqual(5)
    const all = Object.values(HSKK_LEVELS).flatMap((lv) => Object.values(lv.parts).flat())
    expect(new Set(all.map((it) => it.zh)).size).toBe(all.length)
  })

  it('makes a round of each part without repeats', () => {
    for (const part of [1, 2, 3] as const) {
      const r = hskkRound(part, mulberry32(part))
      expect(r).toHaveLength(HSKK_ROUND[part])
      expect(new Set(r.map((it) => it.zh)).size).toBe(r.length)
    }
  })
})

describe('HSKK Intermediate', () => {
  const mid = HSKK_LEVELS.intermediate

  it('has longer sentences to repeat, pictures with a talk, and two-minute questions', () => {
    expect(mid.parts[1].length).toBeGreaterThanOrEqual(10)
    for (const it of mid.parts[1]) {
      expect(filled(it), it.zh).toBe(true)
      expect([...it.zh].length, it.zh).toBeGreaterThanOrEqual(10)
    }
    for (const it of mid.parts[2]) {
      expect(it.scene && it.shows, it.zh).toBeTruthy()
      expect(it.sample && filled(it.sample), it.zh).toBe(true)
    }
    // A two-minute sample: five sentences or more.
    for (const it of [...mid.parts[2], ...mid.parts[3]])
      expect(it.sample!.zh.split('。').filter(Boolean).length, it.zh).toBeGreaterThanOrEqual(5)
    expect(mid.seconds).toEqual({ 2: 120, 3: 120 })
  })

  it('makes rounds of each intermediate part', () => {
    for (const part of [1, 2, 3] as const)
      expect(hskkRound(part, mulberry32(part), 'intermediate')).toHaveLength(mid.round[part])
  })
})
