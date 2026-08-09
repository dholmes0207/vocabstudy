import { describe, expect, it } from 'vitest'
import {
  STRICTNESS,
  feedbackFor,
  isPass,
  normalizeSpoken,
  scorePronunciation,
  targetForms,
} from './pronunciation'

describe('normalizeSpoken', () => {
  it('lowercases, strips punctuation and collapses whitespace', () => {
    expect(normalizeSpoken('  Ability.  ')).toBe('ability')
    expect(normalizeSpoken('Ice   Cream!')).toBe('ice cream')
  })

  it('keeps apostrophes, which carry meaning in contractions', () => {
    expect(normalizeSpoken("don't")).toBe("don't")
  })

  it('keeps non-Latin letters rather than deleting them', () => {
    expect(normalizeSpoken('khả năng')).toBe('khả năng')
  })
})

describe('targetForms', () => {
  it('splits a slashed headword into acceptable spellings', () => {
    expect(targetForms('a / an')).toEqual(['a', 'an'])
  })

  it('drops empty segments', () => {
    expect(targetForms('ability //')).toEqual(['ability'])
  })
})

describe('scorePronunciation', () => {
  it('gives a perfect score and "great" for an exact match', () => {
    const r = scorePronunciation('ability', ['ability'])
    expect(r.score).toBe(100)
    expect(r.verdict).toBe('great')
    expect(r.exact).toBe(true)
  })

  it('ignores case and punctuation from the recognizer', () => {
    expect(scorePronunciation('ability', ['Ability.']).score).toBe(100)
  })

  it('accepts any form of a slashed headword', () => {
    expect(scorePronunciation('a / an', ['an']).verdict).toBe('great')
    expect(scorePronunciation('a / an', ['a']).verdict).toBe('great')
  })

  it('accepts the word wrapped in filler speech', () => {
    const r = scorePronunciation('ability', ['uh the ability'])
    expect(r.exact).toBe(true)
    expect(r.score).toBe(100)
  })

  it('does not let a short headword match any sentence containing it', () => {
    // "a" appears inside almost every transcript; containment must not apply.
    const r = scorePronunciation('a / an', ['this is a test'])
    expect(r.exact).toBe(false)
  })

  it('scans every alternative, not just the recognizer top guess', () => {
    const r = scorePronunciation('ability', ['a bill of tea', 'ability'])
    expect(r.score).toBe(100)
    expect(r.heard).toBe('ability')
  })

  it('rewards a homophone but never calls it "great"', () => {
    // The learner said "four" correctly; the recognizer wrote "for".
    const r = scorePronunciation('four', ['for'])
    expect(r.homophone).toBe(true)
    expect(r.verdict).toBe('good')
    expect(r.score).toBeGreaterThanOrEqual(80)
    expect(r.exact).toBe(false)
  })

  it('treats a vowel slip like a homophone in score but still not "great"', () => {
    // Metaphone cannot separate cat/cut. Withholding "great" plus showing what
    // was heard is what keeps this honest.
    const r = scorePronunciation('cat', ['cut'])
    expect(r.verdict).toBe('good')
    expect(r.exact).toBe(false)
    expect(r.heard).toBe('cut')
  })

  it('marks a clearly different word as retry', () => {
    const r = scorePronunciation('ability', ['dog'])
    expect(r.verdict).toBe('retry')
    expect(r.score).toBeLessThan(60)
  })

  it('rejects a consonant minimal pair', () => {
    expect(scorePronunciation('light', ['right']).verdict).toBe('retry')
    expect(scorePronunciation('thin', ['sin']).verdict).toBe('retry')
  })

  it('gives partial credit for a near miss', () => {
    const r = scorePronunciation('ability', ['abilities'])
    expect(r.score).toBeGreaterThanOrEqual(60)
    expect(r.score).toBeLessThanOrEqual(80) // partials stay below the homophone tier
    expect(r.verdict).toBe('good')
  })

  it('ignores word boundaries, which recognizers place unreliably', () => {
    // "ice cream" is routinely transcribed as "i scream".
    const r = scorePronunciation('ice cream', ['i scream'])
    expect(r.homophone).toBe(true)
    expect(r.verdict).toBe('good')
  })

  it('scores 0 when nothing was recognized', () => {
    for (const alts of [[], [''], ['   ']]) {
      const r = scorePronunciation('ability', alts)
      expect(r.score).toBe(0)
      expect(r.verdict).toBe('retry')
      expect(r.heard).toBe('')
    }
  })

  it('never returns a negative score or one above 100', () => {
    const cases: [string, string[]][] = [
      ['ability', ['ability']],
      ['ability', ['xyzzy']],
      ['a / an', ['']],
      ['ice cream', ['i scream']],
    ]
    for (const [target, alts] of cases) {
      const r = scorePronunciation(target, alts)
      expect(r.score).toBeGreaterThanOrEqual(0)
      expect(r.score).toBeLessThanOrEqual(100)
    }
  })
})

describe('isPass', () => {
  it('lets an exact match through at every strictness', () => {
    const r = scorePronunciation('ability', ['ability'])
    expect(isPass(r, 'easy')).toBe(true)
    expect(isPass(r, 'normal')).toBe(true)
    expect(isPass(r, 'hard')).toBe(true)
  })

  it('still accepts a homophone on hard — it is not the learner’s fault', () => {
    expect(isPass(scorePronunciation('four', ['for']), 'hard')).toBe(true)
  })

  it('rejects every partial match on hard but accepts near misses on easy', () => {
    const near = scorePronunciation('ability', ['abilities'])
    expect(isPass(near, 'hard')).toBe(false)
    expect(isPass(near, 'easy')).toBe(true)
  })

  it('rejects a total miss at every strictness', () => {
    const miss = scorePronunciation('ability', ['dog'])
    for (const s of ['easy', 'normal', 'hard'] as const) {
      expect(isPass(miss, s)).toBe(false)
    }
  })

  it('orders the thresholds easy < normal < hard', () => {
    expect(STRICTNESS.easy).toBeLessThan(STRICTNESS.normal)
    expect(STRICTNESS.normal).toBeLessThan(STRICTNESS.hard)
  })
})

describe('feedbackFor', () => {
  it('always returns a non-empty Vietnamese line', () => {
    const cases = [
      scorePronunciation('ability', ['ability']),
      scorePronunciation('four', ['for']),
      scorePronunciation('ability', ['abilty']),
      scorePronunciation('ability', ['dog']),
      scorePronunciation('ability', []),
    ]
    for (const r of cases) {
      expect(feedbackFor(r, 'ability').trim().length).toBeGreaterThan(0)
    }
  })

  it('quotes what the recognizer heard so the learner can self-diagnose', () => {
    const r = scorePronunciation('cat', ['cut'])
    expect(feedbackFor(r, 'cat')).toContain('cut')
  })

  it('says nothing was heard when the transcript is empty', () => {
    expect(feedbackFor(scorePronunciation('cat', []), 'cat')).toContain('Chưa nghe thấy')
  })
})
