import { describe, expect, it } from 'vitest'
import { INFO_SETS, OPINIONS, READ_ALOUD, SURVEYS } from './toeicSpeaking'

const words = (s: string) => s.trim().split(/\s+/).length

describe('TOEIC Speaking data', () => {
  it('has short texts to read aloud, about as long as the test’s', () => {
    expect(READ_ALOUD.length).toBeGreaterThanOrEqual(4)
    for (const r of READ_ALOUD) {
      expect(words(r.text), r.id).toBeGreaterThanOrEqual(40)
      expect(words(r.text), r.id).toBeLessThanOrEqual(70)
    }
  })

  it('times survey answers 15, 15 and 30 seconds, each with a sample and its key phrase', () => {
    expect(SURVEYS.length).toBeGreaterThanOrEqual(3)
    for (const s of SURVEYS) {
      expect(s.intro, s.id).toMatch(/^Imagine that/)
      expect(
        s.questions.map((x) => x.seconds),
        s.id
      ).toEqual([15, 15, 30])
      for (const x of s.questions) expect(x.sample.a, x.q).toContain(x.sample.key)
    }
  })

  it('gives Questions 8–10 a schedule and a caller, timed 15, 15 and 30 seconds', () => {
    expect(INFO_SETS.length).toBeGreaterThanOrEqual(3)
    for (const s of INFO_SETS) {
      expect(s.lines.length, s.id).toBeGreaterThanOrEqual(5)
      expect(
        s.questions.map((x) => x.seconds),
        s.id
      ).toEqual([15, 15, 30])
      for (const x of s.questions) expect(x.sample.a, x.q).toContain(x.sample.key)
    }
  })

  it('gives each opinion question a sample of a minute’s talk', () => {
    expect(OPINIONS.length).toBeGreaterThanOrEqual(3)
    for (const o of OPINIONS) {
      expect(o.sample.a, o.id).toContain(o.sample.key)
      expect(words(o.sample.a), o.id).toBeGreaterThanOrEqual(70)
    }
    const ids = [...READ_ALOUD, ...SURVEYS, ...INFO_SETS, ...OPINIONS].map((x) => x.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
