import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack, SRSCard } from '@/types'
import { buildDecks } from './decks'
import { TEST_OUT_SIZE, newWordsOf, testOutPassMark, testOutQuestions } from './testOut'

const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

describe('test out of a deck', () => {
  it('asks the meaning of distinct new words from the deck', () => {
    const deck = buildDecks(pack.words, {})[3]
    const started = { [deck.words[0].id]: { lastReviewedDay: 0, box: 1 } as SRSCard }
    const fresh = newWordsOf(deck.words, started)
    expect(fresh).toHaveLength(deck.words.length - 1)

    const qs = testOutQuestions(deck.words, fresh)
    expect(qs).toHaveLength(TEST_OUT_SIZE)
    expect(new Set(qs.map((q) => q.wordId)).size).toBe(TEST_OUT_SIZE)
    const ids = new Set(fresh.map((w) => w.id))
    for (const q of qs) {
      expect(ids.has(q.wordId)).toBe(true)
      expect(q.mode).toBe('en-to-vi')
      expect(q.options.filter((o) => o.correct)).toHaveLength(1)
    }
  })

  it('needs 7 of 8, or the same share of a shorter check', () => {
    expect(testOutPassMark(8)).toBe(7)
    expect(testOutPassMark(6)).toBe(6)
    expect(testOutPassMark(5)).toBe(5)
  })
})
