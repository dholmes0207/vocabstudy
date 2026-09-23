import { describe, expect, it } from 'vitest'
import type { PosCategory, SRSCard, Word } from '@/types'
import { newCard } from './srs'
import {
  GROUP_SIZE,
  MAX_ATTEMPTS,
  REQUEUE_GAP,
  chunk,
  learnDrills,
  requeue,
  reviewModeFor,
} from './practice'

const DAY = 20000

function word(id: number, over: Partial<Word> = {}): Word {
  return {
    id,
    word: `word${id}`,
    ipa: '',
    viRead: '',
    pos: 'n.',
    posCategory: 'noun' as PosCategory,
    meaning: `nghĩa ${id}`,
    exampleEn: `This is word${id} here.`,
    exampleVi: `Đây là từ ${id}.`,
    ...over,
  }
}

const card = (box: number, over: Partial<SRSCard> = {}): SRSCard => ({
  ...newCard(1, DAY - 10),
  box,
  lastReviewedDay: DAY - 1,
  dueDay: DAY,
  ...over,
})

describe('chunk', () => {
  it('splits into groups of the given size, keeping order', () => {
    expect(chunk([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('defaults to a group size a beginner can hold in mind', () => {
    expect(GROUP_SIZE).toBeGreaterThanOrEqual(3)
    expect(GROUP_SIZE).toBeLessThanOrEqual(7)
  })

  it('returns nothing for nothing', () => {
    expect(chunk([], 5)).toEqual([])
  })
})

describe('learnDrills', () => {
  const group = [word(1), word(2), word(3)]

  it('asks two questions per word — recognise first, then recall', () => {
    const drills = learnDrills(group)
    expect(drills).toHaveLength(group.length * 2)
    const firstRound = drills.slice(0, group.length)
    const secondRound = drills.slice(group.length)
    expect(firstRound.every((d) => d.mode === 'en-to-vi')).toBe(true)
    expect(secondRound.every((d) => d.mode === 'context' || d.mode === 'vi-to-en')).toBe(true)
  })

  it('covers every word in each round', () => {
    const drills = learnDrills(group)
    const ids = (round: typeof drills) => round.map((d) => d.wordId).sort()
    expect(ids(drills.slice(0, 3))).toEqual([1, 2, 3])
    expect(ids(drills.slice(3))).toEqual([1, 2, 3])
  })

  it('uses the sentence when the word can be found in it, the meaning otherwise', () => {
    const noSentence = word(9, { exampleEn: 'Nothing to see.' })
    const drills = learnDrills([word(1), noSentence])
    const recall = drills.slice(2)
    expect(recall.find((d) => d.wordId === 1)?.mode).toBe('context')
    expect(recall.find((d) => d.wordId === 9)?.mode).toBe('vi-to-en')
  })

  it('does not ask the same word twice in a row across the round boundary', () => {
    for (let i = 0; i < 30; i++) {
      const drills = learnDrills(group)
      for (let j = 1; j < drills.length; j++) {
        expect(drills[j].wordId).not.toBe(drills[j - 1].wordId)
      }
    }
  })

  it('handles a single word (no neighbour to separate it from)', () => {
    expect(learnDrills([word(1)])).toHaveLength(2)
  })
})

describe('reviewModeFor — harder questions as a card matures', () => {
  const w = word(1)

  it('young cards (box 0–1) are recognised: pick the meaning, or hear it', () => {
    for (const box of [0, 1]) {
      expect(['en-to-vi', 'listen']).toContain(reviewModeFor(card(box), w, DAY))
    }
  })

  it('middle cards (box 2–3) are recalled: produce the English word', () => {
    for (const box of [2, 3]) {
      expect(['vi-to-en', 'context']).toContain(reviewModeFor(card(box), w, DAY))
    }
  })

  it('mature cards (box 4+) must be written out', () => {
    for (const box of [4, 5]) {
      expect(['fill', 'spell']).toContain(reviewModeFor(card(box), w, DAY))
    }
  })

  it('never picks a sentence-based mode the example cannot support', () => {
    const bare = word(2, { exampleEn: 'Nothing to see.' })
    for (let day = DAY; day < DAY + 10; day++) {
      expect(reviewModeFor(card(3), bare, day)).toBe('vi-to-en')
      expect(reviewModeFor(card(5), bare, day)).toBe('spell')
    }
  })

  it('does not ask to spell a one-letter word (nothing left to recall)', () => {
    const a = word(3, { word: 'a / an', exampleEn: 'Nothing to see.' })
    for (let day = DAY; day < DAY + 4; day++) {
      expect(reviewModeFor(card(5), a, day)).toBe('vi-to-en')
    }
  })

  it('is stable within a day but varies across days', () => {
    const a = reviewModeFor(card(1), w, DAY)
    expect(reviewModeFor(card(1), w, DAY)).toBe(a)
    const seen = new Set(Array.from({ length: 6 }, (_, i) => reviewModeFor(card(1), w, DAY + i)))
    expect(seen.size).toBe(2)
  })
})

describe('requeue — a missed question comes back a little later', () => {
  it(`reinserts the item ${REQUEUE_GAP} places after the current one`, () => {
    const q = ['a', 'b', 'c', 'd', 'e', 'f']
    expect(requeue(q, 0, 'a*')).toEqual(['a', 'b', 'c', 'd', 'a*', 'e', 'f'])
  })

  it('appends at the end when the queue is short', () => {
    expect(requeue(['a', 'b'], 0, 'a*')).toEqual(['a', 'b', 'a*'])
    expect(requeue(['a'], 0, 'a*')).toEqual(['a', 'a*'])
  })

  it('does not mutate its input', () => {
    const q = ['a', 'b']
    requeue(q, 0, 'x')
    expect(q).toEqual(['a', 'b'])
  })

  it('caps how often one question may come back, so a session always ends', () => {
    expect(MAX_ATTEMPTS).toBeGreaterThanOrEqual(2)
    expect(MAX_ATTEMPTS).toBeLessThanOrEqual(4)
  })
})
