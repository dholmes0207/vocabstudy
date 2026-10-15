import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  COMPOUND_VOWELS,
  CONSONANTS,
  FINAL_SOUNDS,
  TENSE,
  VOWELS,
  compose,
  decompose,
  hangulQuiz,
  hangulXp,
  readSyllable,
} from './hangul'

const pack = JSON.parse(readFileSync('public/data/ko.json', 'utf8')) as {
  words: { word: string; viRead: string; meaning: string }[]
}
const packWords = new Set(pack.words.map((w) => w.word))

describe('the letter tables', () => {
  it('cover the 14 + 5 consonants and 10 + 11 vowels of Hangul', () => {
    expect(CONSONANTS).toHaveLength(14)
    expect(TENSE).toHaveLength(5)
    expect(VOWELS).toHaveLength(10)
    expect(COMPOUND_VOWELS).toHaveLength(11)
  })

  it('give every letter a sound that is unique in its group', () => {
    for (const group of [CONSONANTS, TENSE, VOWELS, COMPOUND_VOWELS])
      expect(new Set(group.map((j) => j.vi)).size).toBe(group.length)
  })

  it('only point at real words of the Korean pack that contain the letter', () => {
    const all = [...CONSONANTS, ...TENSE, ...VOWELS, ...COMPOUND_VOWELS]
    for (const j of all) {
      if (!j.word) continue
      expect(packWords.has(j.word), j.word).toBe(true)
      const letters = [...j.word].flatMap((s) => {
        const p = decompose(s)
        return p ? [p.initial, p.medial, p.final] : []
      })
      expect(letters, `${j.ch} in ${j.word}`).toContain(j.ch)
    }
  })

  it('play a syllable made from the letter', () => {
    for (const j of [...CONSONANTS, ...TENSE]) expect(decompose(j.sample)?.initial).toBe(j.ch)
    for (const j of [...VOWELS, ...COMPOUND_VOWELS]) {
      expect(decompose(j.sample)).toEqual({ initial: 'ㅇ', medial: j.ch, final: '' })
    }
  })
})

describe('syllable blocks', () => {
  it('compose and decompose', () => {
    expect(compose('ㅎ', 'ㅏ', 'ㄴ')).toBe('한')
    expect(compose('ㄱ', 'ㅜ', 'ㄱ')).toBe('국')
    expect(compose('ㅇ', 'ㅏ')).toBe('아')
    expect(compose('x', 'ㅏ')).toBeNull()
    expect(decompose('밥')).toEqual({ initial: 'ㅂ', medial: 'ㅏ', final: 'ㅂ' })
    expect(decompose('a')).toBeNull()
  })

  it('read the Vietnamese way, matching how the pack spells them', () => {
    expect(readSyllable('가')).toBe('ca')
    expect(readSyllable('기')).toBe('ki')
    expect(readSyllable('한')).toBe('han')
    expect(readSyllable('밥')).toBe('báp')
    expect(readSyllable('옷')).toBe('ốt')
    expect(readSyllable('역')).toBe('yớc')
    expect(readSyllable('회')).toBe('huê')
    expect(readSyllable('의')).toBe('ưi')
    for (const f of FINAL_SOUNDS) expect(readSyllable(f.word), f.word).toBe(f.read)
    // One-block words of the pack agree with the table.
    for (const w of pack.words.filter((w) => [...w.word].length === 1))
      expect(readSyllable(w.word), w.word).toBe(w.viRead)
  })
})

describe('the quick check', () => {
  it('asks letters and syllables, each with one right answer among distinct options', () => {
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    const qs = hangulQuiz(10, rand)
    expect(qs).toHaveLength(10)
    expect(qs.filter((q) => q.kind === 'letter')).toHaveLength(5)
    for (const q of qs) {
      expect(new Set(q.options).size, q.prompt).toBe(q.options.length)
      expect(q.options.length).toBeGreaterThanOrEqual(2)
      if (q.kind === 'syllable') expect(q.options[q.answer]).toBe(readSyllable(q.prompt))
    }
  })

  it('adds whole words from the pack, read the way the pack says them', () => {
    const qs = hangulQuiz(10, Math.random, pack.words)
    const words = qs.filter((q) => q.kind === 'word')
    expect(words).toHaveLength(3)
    expect(qs.filter((q) => q.kind === 'letter')).toHaveLength(4)
    for (const q of words) {
      const w = pack.words.find((p) => p.word === q.prompt)!
      expect(q.options[q.answer]).toBe(w.viRead)
      expect(q.prompt).toMatch(/^[가-힣]{2,4}$/)
      expect(new Set(q.options).size).toBe(q.options.length)
    }
  })

  it('finishes even when every random draw is the same', () => {
    const qs = hangulQuiz(10, () => 0.42, pack.words)
    expect(qs).toHaveLength(10)
    expect(new Set(qs.map((q) => q.prompt)).size).toBe(10)
  })

  it('gives XP for trying and for each right answer', () => {
    expect(hangulXp(0, 10)).toBe(5)
    expect(hangulXp(10, 10)).toBe(30)
  })
})
