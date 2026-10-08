import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SOUND_LESSONS, earRound, lessonWords } from './sounds'

describe('sound lessons', () => {
  it('have unique ids, words to hear, and two different words per pair', () => {
    const ids = SOUND_LESSONS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of SOUND_LESSONS) {
      expect(l.words.length).toBeGreaterThanOrEqual(2)
      for (const [a, b] of l.pairs) expect(a).not.toBe(b)
    }
  })

  it('only use words the English pack has (so both sides play in the same voice)', () => {
    const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as {
      words: { word: string }[]
    }
    const have = new Set(pack.words.map((w) => w.word.toLowerCase()))
    expect(lessonWords().filter((w) => !have.has(w))).toEqual([])
  })
})

describe('earRound', () => {
  const pairs: [string, string][] = [
    ['ship', 'sheep'],
    ['man', 'men'],
  ]

  it('picks a pair and a side from the random source', () => {
    const seq = [0.9, 0.1]
    const r = earRound(pairs, () => seq.shift()!)
    expect(r).toEqual({ pair: ['man', 'men'], answer: 0 })
  })

  it('always returns one of the given pairs', () => {
    for (let i = 0; i < 20; i++) expect(pairs).toContainEqual(earRound(pairs).pair)
  })
})
