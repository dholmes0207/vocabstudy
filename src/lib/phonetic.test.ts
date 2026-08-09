import { describe, expect, it } from 'vitest'
import { levenshtein, metaphone, phoneticKey, similarity } from './phonetic'

describe('metaphone', () => {
  it('collapses common English homophones onto one key', () => {
    // This is the whole point: a recognizer that spells "for" when the learner
    // said "four" must not cost them the question.
    const pairs = [
      ['four', 'for'],
      ['their', 'there'],
      ['write', 'right'],
      ['know', 'no'],
      ['see', 'sea'],
      ['hear', 'here'],
      ['buy', 'by'],
      ['son', 'sun'],
      ['week', 'weak'],
      ['piece', 'peace'],
      ['wait', 'weight'],
      ['knight', 'night'],
      ['whether', 'weather'],
    ]
    for (const [a, b] of pairs) {
      expect(metaphone(a), `${a} vs ${b}`).toBe(metaphone(b))
    }
  })

  it('keeps consonant minimal pairs distinct — those are real mistakes', () => {
    const pairs = [
      ['light', 'right'],
      ['thin', 'sin'],
      ['ship', 'sip'],
      ['three', 'tree'],
      ['rice', 'lice'],
      ['very', 'berry'],
      ['work', 'walk'],
    ]
    for (const [a, b] of pairs) {
      expect(metaphone(a), `${a} vs ${b}`).not.toBe(metaphone(b))
    }
  })

  it('treats CH as a single sound', () => {
    // Regression: an earlier version emitted the H twice, giving SKHL / XHR.
    expect(metaphone('school')).toBe('SKL')
    expect(metaphone('chair')).toBe('XR')
    expect(metaphone('teacher')).toBe('TXR')
    expect(metaphone('change')).toBe('XNJ')
  })

  it('applies the classic digraph and silent-letter rules', () => {
    expect(metaphone('phone')).toBe('FN')
    expect(metaphone('thumb')).toBe('0M') // silent final B after M
    expect(metaphone('sign')).toBe('SN') // silent G in final -GN
    expect(metaphone('knight')).toBe('NT') // silent K, silent GH
    expect(metaphone('box')).toBe('BKS')
    expect(metaphone('nation')).toBe('NXN') // -TIO- sounds like "sh"
  })

  it('keeps a vowel only in first position', () => {
    expect(metaphone('ability')).toBe('ABLT')
    expect(metaphone('able')).toBe('ABL')
  })

  it('is case- and punctuation-insensitive', () => {
    expect(metaphone('Ability!')).toBe(metaphone('ability'))
    expect(metaphone('  ability  ')).toBe(metaphone('ability'))
  })

  it('returns an empty key for input with no letters', () => {
    expect(metaphone('')).toBe('')
    expect(metaphone('123 !?')).toBe('')
  })

  it('cannot distinguish words that differ only in a middle vowel', () => {
    // Documented limitation — the scorer must not award "great" on a key match
    // alone. See pronunciation.ts.
    expect(metaphone('cat')).toBe(metaphone('cut'))
  })
})

describe('phoneticKey', () => {
  it('encodes each word of a phrase', () => {
    expect(phoneticKey('ice cream')).toBe('IS KRM')
  })

  it('ignores extra whitespace', () => {
    expect(phoneticKey('  ice   cream ')).toBe(phoneticKey('ice cream'))
  })

  it('returns an empty string for empty input', () => {
    expect(phoneticKey('   ')).toBe('')
  })
})

describe('levenshtein', () => {
  it('counts single-edit operations', () => {
    expect(levenshtein('cat', 'cat')).toBe(0)
    expect(levenshtein('cat', 'cut')).toBe(1) // substitute
    expect(levenshtein('cat', 'cart')).toBe(1) // insert
    expect(levenshtein('cart', 'cat')).toBe(1) // delete
  })

  it('handles empty strings', () => {
    expect(levenshtein('', '')).toBe(0)
    expect(levenshtein('', 'abc')).toBe(3)
    expect(levenshtein('abc', '')).toBe(3)
  })

  it('is symmetric', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(levenshtein('sitting', 'kitten'))
    expect(levenshtein('kitten', 'sitting')).toBe(3)
  })
})

describe('similarity', () => {
  it('is 1 for identical strings and 0 for fully different ones', () => {
    expect(similarity('ability', 'ability')).toBe(1)
    expect(similarity('', '')).toBe(1)
    expect(similarity('abc', 'xyz')).toBe(0)
  })

  it('stays inside 0..1 and grows as strings converge', () => {
    const far = similarity('ability', 'dog')
    const near = similarity('ability', 'abilty')
    expect(far).toBeGreaterThanOrEqual(0)
    expect(near).toBeLessThanOrEqual(1)
    expect(near).toBeGreaterThan(far)
  })
})
