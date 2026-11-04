import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack, Word } from '@/types'
import { ENDINGS, endingOf, formRound } from './wordFormDrill'

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack
const word = (w: string, pos: string) => ({ word: w, pos }) as Word

describe('word endings', () => {
  it('reads the part of speech from the ending only when the word agrees', () => {
    expect(endingOf(word('decision', 'n.'))?.cat).toBe('noun')
    expect(endingOf(word('information', 'n.'))?.ending).toBe('ation')
    expect(endingOf(word('quickly', 'adv.'))?.cat).toBe('adverb')
    // "friendly" ends in -ly but is an adjective: not a word to teach the rule with.
    expect(endingOf(word('friendly', 'adj.'))).toBeNull()
    // Two parts of speech: the ending cannot decide.
    expect(endingOf(word('increase', 'n./v.'))).toBeNull()
  })

  it('finds plenty of pack words for every part of speech', () => {
    const cats = en.words
      .map(endingOf)
      .filter(Boolean)
      .map((r) => r!.cat)
    for (const c of ['noun', 'verb', 'adjective', 'adverb'])
      expect(cats.filter((x) => x === c).length, c).toBeGreaterThanOrEqual(10)
    expect(ENDINGS.length).toBeGreaterThan(15)
  })

  it('makes a round of ten different words across the parts of speech', () => {
    const round = formRound(en.words, 10)
    expect(round).toHaveLength(10)
    expect(new Set(round.map((q) => q.word.id)).size).toBe(10)
    expect(new Set(round.map((q) => q.answer)).size).toBe(4)
    for (const q of round) expect(q.word.word.endsWith(q.ending)).toBe(true)
  })
})
