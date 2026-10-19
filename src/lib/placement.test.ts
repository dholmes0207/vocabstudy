import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack, SRSCard, Word } from '@/types'
import { PER_BAND, bandQuestions, passed, placementBands } from './placement'
import { isGrammarWord, nextNewWords } from './summary'

const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

describe('placementBands', () => {
  it('starts small and doubles, covering the pack exactly once', () => {
    expect(placementBands(4440).map((b) => b.end)).toEqual([
      25, 50, 100, 200, 400, 800, 1600, 3200, 4440,
    ])
    for (const n of [1, 30, 156, 192, 4440]) {
      const bands = placementBands(n)
      expect(bands[0].start).toBe(0)
      expect(bands.at(-1)!.end).toBe(n)
      bands.slice(1).forEach((b, i) => expect(b.start).toBe(bands[i].end))
    }
  })

  it('folds a short tail into the last band', () => {
    // 156: 25, 50, 100, then 56 left — more than half of 50, so it stays a band.
    expect(placementBands(156).map((b) => b.end)).toEqual([25, 50, 100, 156])
    // 110: 10 left after 100 is less than half a band, so 50–110 is one band.
    expect(placementBands(110).map((b) => b.end)).toEqual([25, 50, 110])
  })
})

describe('bandQuestions', () => {
  it.each(['en', 'ko', 'zh'])('asks %s meanings of distinct words from the band', (code) => {
    const { words } = pack(code)
    for (const band of placementBands(words.length)) {
      const qs = bandQuestions(words, band)
      const inBand = new Set(words.slice(band.start, band.end).map((w) => w.id))
      expect(qs).toHaveLength(Math.min(PER_BAND, band.end - band.start))
      expect(new Set(qs.map((q) => q.wordId)).size).toBe(qs.length)
      for (const q of qs) {
        expect(inBand.has(q.wordId)).toBe(true)
        expect(q.options.filter((o) => o.correct)).toHaveLength(1)
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options.map((o) => o.text)).size).toBe(4)
      }
    }
  })
})

it('passes a band at 4 of 5', () => {
  expect([3, 4, 5].map(passed)).toEqual([false, true, true])
})

describe('nextNewWords with a placement start', () => {
  const words = [1, 2, 3, 4, 5, 6].map(
    (id) => ({ id, word: `w${id}`, posCategory: 'noun' }) as Word
  )
  const started = { id: 5 } as SRSCard
  const progress = { cards: { 5: started }, stats: {} } as never

  it('starts at the placement point, then comes back for the skipped words', () => {
    expect(nextNewWords(words, progress, 10, 3).map((w) => w.id)).toEqual([4, 6, 1, 2, 3])
    expect(nextNewWords(words, progress, 2, 3).map((w) => w.id)).toEqual([4, 6])
  })

  it('keeps the old behaviour without one', () => {
    expect(nextNewWords(words, progress, 3).map((w) => w.id)).toEqual([1, 2, 3])
  })
})

describe('nextNewWords mixes grammar words in', () => {
  const en = pack('en')

  it('keeps the first lesson from being all "the, of, to, in, is"', () => {
    const lesson = nextNewWords(en.words, undefined, 5)
    expect(lesson.map((w) => w.word)).toEqual(['the', 'said', 'like', 'look', 'go'])
  })

  it('allows a third of a lesson (at least one), and brings the rest back next time', () => {
    const grammar = (ws: Word[]) => ws.filter((w) => isGrammarWord(w)).length
    expect(grammar(nextNewWords(en.words, undefined, 5))).toBe(1)
    expect(grammar(nextNewWords(en.words, undefined, 15))).toBe(5)
    const first = nextNewWords(en.words, undefined, 5)
    const cards = Object.fromEntries(first.map((w) => [w.id, { id: w.id } as SRSCard]))
    const second = nextNewWords(en.words, { cards, stats: {} } as never, 5)
    expect(second[0].word).toBe('of')
  })

  it('still fills a lesson when only grammar words are left', () => {
    const left = en.words.filter((w) => isGrammarWord(w)).slice(0, 4)
    expect(nextNewWords(left, undefined, 5)).toHaveLength(4)
  })
})
