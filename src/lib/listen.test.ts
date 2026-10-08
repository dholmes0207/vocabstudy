import { describe, expect, it } from 'vitest'
import type { SRSCard, Word } from '@/types'
import { defaultSource, isHard, listenSteps, pickListenWords } from './listen'

function word(id: number, exampleEn = `Example ${id}.`): Word {
  return {
    id,
    word: `w${id}`,
    ipa: '',
    viRead: '',
    pos: 'n.',
    posCategory: 'noun',
    meaning: `nghĩa ${id}`,
    exampleEn,
    exampleVi: '',
  }
}

function card(id: number, over: Partial<SRSCard> = {}): SRSCard {
  return {
    id,
    box: 1,
    dueDay: 10,
    lastReviewedDay: 5,
    correctCount: 1,
    wrongCount: 0,
    createdDay: 1,
    ...over,
  }
}

const words = [1, 2, 3, 4, 5, 6].map((id) => word(id))
const cards: Record<number, SRSCard> = {
  1: card(1, { lastReviewedDay: 3 }),
  2: card(2, { lastReviewedDay: 9, wrongCount: 4, correctCount: 1 }),
  3: card(3, { lastReviewedDay: null, createdDay: 7, wrongCount: 2, correctCount: 1 }),
}
const keepOrder = () => 0.999

describe('pickListenWords', () => {
  it('previews the next unlearned words in learning order', () => {
    expect(pickListenWords(words, cards, 'upcoming', 2).map((w) => w.id)).toEqual([4, 5])
  })

  it('puts the most-missed words first', () => {
    expect(pickListenWords(words, cards, 'hard').map((w) => w.id)).toEqual([2, 3])
  })

  it('takes the most recently studied words (never-reviewed ones by the day learned)', () => {
    const ids = pickListenWords(words, cards, 'learned', 2, keepOrder).map((w) => w.id)
    expect(ids.sort()).toEqual([2, 3])
  })

  it('never returns an unlearned word for the learned list', () => {
    const ids = pickListenWords(words, cards, 'learned').map((w) => w.id)
    expect(ids.every((id) => cards[id])).toBe(true)
  })
})

describe('defaults', () => {
  it('offers a preview to a brand-new learner', () => {
    expect(defaultSource(0)).toBe('upcoming')
    expect(defaultSource(12)).toBe('learned')
  })

  it('counts a card as hard only when misses outnumber hits', () => {
    expect(isHard(undefined)).toBe(false)
    expect(isHard(card(1, { wrongCount: 2, correctCount: 2 }))).toBe(false)
    expect(isHard(card(1, { wrongCount: 3, correctCount: 2 }))).toBe(true)
  })
})

describe('listenSteps', () => {
  it('says the word, the meaning, the word again slower, then the example', () => {
    const kinds = listenSteps(word(1))
      .filter((s) => s.kind !== 'pause')
      .map((s) => (s.kind === 'word' ? `word@${s.rate}` : s.kind))
    expect(kinds).toEqual(['word@1', 'meaning', 'word@0.8', 'example'])
  })

  it('skips the example when the word has none', () => {
    expect(listenSteps(word(1, '')).some((s) => s.kind === 'example')).toBe(false)
  })

  it('stretches or shortens every pause with the pace', () => {
    const total = (pace: 'short' | 'normal' | 'long') =>
      listenSteps(word(1), pace).reduce((n, s) => n + (s.kind === 'pause' ? s.ms : 0), 0)
    expect(total('short')).toBeLessThan(total('normal'))
    expect(total('long')).toBeGreaterThan(total('normal'))
  })
})
