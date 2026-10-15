import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Word } from '@/types'
import {
  bareWord,
  buildGlossary,
  glossFor,
  readingXp,
  recordReading,
  shuffleOptions,
  validateReadingPack,
} from './reading'

const shipped = JSON.parse(readFileSync('public/data/reading/en.json', 'utf8'))
const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as { words: Word[] }

describe('the shipped stories', () => {
  const reading = validateReadingPack(shipped)

  it('validate, with short sentences a beginner can follow', () => {
    expect(reading.stories.length).toBeGreaterThanOrEqual(14)
    for (const s of reading.stories)
      for (const line of s.sentences)
        expect(line.en.split(/\s+/).length, line.en).toBeLessThanOrEqual(14)
  })

  it('are mostly made of words from the pack, so almost every word can be tapped', () => {
    const glossary = buildGlossary(pack.words)
    for (const s of reading.stories) {
      const tokens = s.sentences.flatMap((l) => l.en.split(/\s+/))
      const known = tokens.filter((t) => glossFor(t, glossary)).length
      expect(known / tokens.length, s.id).toBeGreaterThan(0.75)
    }
  })
})

describe('glossary', () => {
  const glossary = buildGlossary(pack.words)

  it('finds a word from its inflected form', () => {
    expect(glossFor('drinks', glossary)?.word).toBe('drink')
    expect(glossFor('bought', glossary)?.word).toBe('buy')
    expect(glossFor('mangoes?"', glossary)).not.toBeNull()
  })

  it('prefers a headword over a form of another word', () => {
    expect(glossFor('evening,', glossary)?.word).toBe('evening')
    expect(glossFor('rose', glossary)?.word).toBe('rose')
    // The pack's own entry for a past form says what it is: "đã đi (quá khứ của go)".
    expect(glossFor('went', glossary)?.word).toBe('went')
  })

  it('reads through punctuation and possessives', () => {
    expect(bareWord('"How')).toBe('how')
    expect(bareWord("Mai's")).toBe('mai')
    expect(bareWord('kilo,')).toBe('kilo')
  })
})

describe('progress', () => {
  it('keeps the best score and counts reads', () => {
    let p = recordReading({}, 'x', 1, 3)
    p = recordReading(p, 'x', 3, 3)
    p = recordReading(p, 'x', 2, 3)
    expect(p.x).toEqual({ best: 100, reads: 3 })
    expect(readingXp(3, 3)).toBe(19)
  })
})

describe('shuffleOptions', () => {
  const q = { q: 'Ai?', options: ['Bố', 'Mẹ', 'Bạn'], answer: 1 }

  it('keeps every option and moves the answer with its text', () => {
    for (const r of [0, 0.34, 0.5, 0.99]) {
      const s = shuffleOptions(q, () => r)
      expect([...s.options].sort()).toEqual([...q.options].sort())
      expect(s.options[s.answer]).toBe('Mẹ')
    }
  })

  it('does not always leave the answer in its written slot', () => {
    const slots = new Set([0, 0.5, 0.99].map((r) => shuffleOptions(q, () => r).answer))
    expect(slots.size).toBeGreaterThan(1)
  })
})
