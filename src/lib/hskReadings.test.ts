import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { HSK_LEVELS, levelWords } from './hskPractice'
import { readingRound } from './hskReadings'
import { validateHskBank } from './hskBank'
import { mulberry32 } from './sky'

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack
const HSK3_READINGS = validateHskBank(
  JSON.parse(readFileSync('public/data/hsk/zh.json', 'utf8'))
).readings
const known = new Set(
  HSK_LEVELS.flatMap((l) => levelWords(l, zh.words)).flatMap((w) => [...w.word, ...w.exampleEn])
)
const han = (s: string) => [...s].filter((c) => /\p{Script=Han}/u.test(c))

describe('HSK 3 reading passages', () => {
  it('use only HSK 1–3 characters, with three options and an explanation', () => {
    expect(HSK3_READINGS.length).toBeGreaterThanOrEqual(40)
    expect(new Set(HSK3_READINGS.map((r) => r.id)).size).toBe(HSK3_READINGS.length)
    for (const r of HSK3_READINGS) {
      expect(
        han(r.text + r.q + r.options.join('')).filter((c) => !known.has(c)),
        r.id
      ).toEqual([])
      expect(new Set(r.options).size, r.id).toBe(3)
      expect(r.vi.trim() && r.qVi.trim() && r.why.trim(), r.id).toBeTruthy()
    }
  })

  it('keeps the right option after shuffling', () => {
    const round = readingRound(HSK3_READINGS, 5, mulberry32(9))
    expect(round).toHaveLength(5)
    for (const r of round) {
      const original = HSK3_READINGS.find((x) => x.id === r.id)!
      expect(r.options[r.answer]).toBe(original.options[0])
    }
  })
})
