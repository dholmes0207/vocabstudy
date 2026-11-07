import { describe, expect, it } from 'vitest'
import type { PosCategory, SRSCard, Word } from '@/types'
import {
  BLITZ_SECONDS,
  blitzMultiplier,
  blitzXp,
  matchXp,
  pickBlitzDeck,
  orderXp,
  pickMatchRound,
  pickOrderRound,
  placeToken,
  shortMeaning,
  startOrder,
  tokenize,
  wordOfDay,
} from './games'

function word(id: number, over: Partial<Word> = {}): Word {
  return {
    id,
    word: `word${id}`,
    ipa: '',
    viRead: '',
    pos: 'n.',
    posCategory: 'noun' as PosCategory,
    meaning: `nghĩa ${id}`,
    exampleEn: `I like word${id} very much today.`,
    exampleVi: `Tôi rất thích từ ${id} hôm nay.`,
    ...over,
  }
}

const card = (id: number): SRSCard => ({
  id,
  box: 1,
  dueDay: 1,
  lastReviewedDay: 0,
  correctCount: 1,
  wrongCount: 0,
  createdDay: 0,
})

const pool = Array.from({ length: 40 }, (_, i) => word(i + 1))

describe('shortMeaning — fits on a tile', () => {
  it('drops the part in brackets and keeps the first two senses', () => {
    expect(shortMeaning('(mạo từ xác định) cái, con, người... đã xác định')).toBe('cái, con')
    expect(shortMeaning('đến, tới, cho, để')).toBe('đến, tới')
  })

  it('stops at the first semicolon', () => {
    expect(shortMeaning('tiết kiệm; cứu; lưu (tệp)')).toBe('tiết kiệm')
  })

  it('keeps a single sense as it is', () => {
    expect(shortMeaning('quả táo')).toBe('quả táo')
  })
})

describe('pickMatchRound', () => {
  it('returns the requested number of pairs, all different words and meanings', () => {
    const pairs = pickMatchRound(pool, {}, 6)
    expect(pairs).toHaveLength(6)
    expect(new Set(pairs.map((p) => p.id)).size).toBe(6)
    expect(new Set(pairs.map((p) => p.vi)).size).toBe(6)
  })

  it('uses words the learner has already met first', () => {
    const cards = Object.fromEntries([3, 7, 9, 12, 20, 33, 38].map((id) => [id, card(id)]))
    for (let i = 0; i < 20; i++) {
      const ids = pickMatchRound(pool, cards, 6).map((p) => p.id)
      expect(ids.every((id) => id in cards)).toBe(true)
    }
  })

  it('tops up from the start of the curriculum when too few words are learned', () => {
    const ids = pickMatchRound(pool, { 30: card(30) }, 6).map((p) => p.id)
    expect(ids).toContain(30)
    expect(ids.filter((id) => id !== 30).every((id) => id <= 10)).toBe(true)
  })

  it('never shows two tiles with the same meaning', () => {
    const same = [
      word(1, { meaning: 'to lớn' }),
      word(2, { meaning: 'to lớn, rộng' }),
      ...Array.from({ length: 10 }, (_, i) => word(i + 3)),
    ]
    for (let i = 0; i < 20; i++) {
      const vis = pickMatchRound(same, {}, 6).map((p) => p.vi)
      expect(new Set(vis).size).toBe(vis.length)
    }
  })
})

describe('tokenize', () => {
  it('splits a sentence into word tiles, punctuation stays attached', () => {
    expect(tokenize('I need to make a decision today.')).toEqual([
      'I',
      'need',
      'to',
      'make',
      'a',
      'decision',
      'today.',
    ])
  })

  it('splits Chinese at the invisible word breaks its examples carry', () => {
    expect(tokenize('我\u200b喜欢\u200b喝\u200b咖啡。')).toEqual(['我', '喜欢', '喝', '咖啡。'])
  })

  it('collapses extra spaces', () => {
    expect(tokenize('  Hello   there  ')).toEqual(['Hello', 'there'])
  })
})

describe('sentence ordering', () => {
  it('accepts the next token and rejects any other', () => {
    const s = startOrder(['I', 'like', 'tea.'], [2, 0, 1])
    const wrong = placeToken(s, 0) // "tea." first
    expect(wrong.correct).toBe(false)
    expect(wrong.state.placed).toEqual([])
    const right = placeToken(s, 1) // "I"
    expect(right.correct).toBe(true)
    expect(right.state.placed).toEqual([1])
  })

  it('treats duplicate words as interchangeable', () => {
    // "the cat and the dog": either "the" tile can go first.
    const tokens = ['the', 'cat', 'and', 'the', 'dog']
    const s = startOrder(tokens, [3, 1, 0, 2, 4])
    // pool position 0 holds tokens[3] = "the" — the second "the" is fine first.
    expect(placeToken(s, 0).correct).toBe(true)
  })

  it('knows when the sentence is complete', () => {
    let s = startOrder(['Go', 'home.'], [1, 0])
    s = placeToken(s, 1).state
    expect(s.done).toBe(false)
    s = placeToken(s, 0).state
    expect(s.done).toBe(true)
  })

  it('ignores taps on a tile already placed', () => {
    let s = startOrder(['Go', 'home.'], [0, 1])
    s = placeToken(s, 0).state
    const again = placeToken(s, 0)
    expect(again.correct).toBe(false)
    expect(again.state.placed).toEqual([0])
    expect(again.state.mistakes).toBe(0)
  })
})

describe('pickOrderRound', () => {
  it('picks sentences of a comfortable length, learned words first', () => {
    const long = word(50, {
      exampleEn: 'This sentence is far too long to be fun to order on a small phone screen.',
    })
    const short = word(51, { exampleEn: 'Hi.' })
    const learned = [word(52), word(53)]
    const round = pickOrderRound(
      [...pool.slice(0, 10), long, short, ...learned],
      {
        52: card(52),
        53: card(53),
      },
      5
    )
    const ids = round.map((w) => w.id)
    expect(ids).toHaveLength(5)
    expect(ids).toContain(52)
    expect(ids).toContain(53)
    expect(ids).not.toContain(50)
    expect(ids).not.toContain(51)
  })
})

describe('wordOfDay', () => {
  it('is the same all day and changes the next day', () => {
    const a = wordOfDay(pool, {}, 20000)
    expect(wordOfDay(pool, {}, 20000).id).toBe(a.id)
    const days = new Set(Array.from({ length: 10 }, (_, i) => wordOfDay(pool, {}, 20000 + i).id))
    expect(days.size).toBeGreaterThan(1)
  })

  it('prefers a word the learner has met but not mastered', () => {
    const cards = { 17: card(17) }
    expect(wordOfDay(pool, cards, 20001).id).toBe(17)
  })
})

describe('xp for play', () => {
  it('rewards finishing, more for fewer mistakes, never negative', () => {
    expect(matchXp(6, 0, 20)).toBeGreaterThan(matchXp(6, 3, 20))
    expect(matchXp(6, 50, 999)).toBeGreaterThan(0)
    expect(orderXp(5, 0)).toBeGreaterThan(orderXp(5, 4))
    expect(orderXp(5, 99)).toBeGreaterThan(0)
  })
})

describe('true or false (blitz)', () => {
  const words = Array.from({ length: 30 }, (_, i) => word(i + 1))
  let seed = 1
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  it('deals true and false cards, a false one always showing another word’s meaning', () => {
    const deck = pickBlitzDeck(words, {}, 30, rand)
    expect(deck).toHaveLength(30)
    const truths = deck.filter((c) => c.truth).length
    expect(truths).toBeGreaterThan(5)
    expect(truths).toBeLessThan(25)
    for (const c of deck) {
      const own = shortMeaning(words.find((w) => w.id === c.id)!.meaning)
      if (c.truth) expect(c.meaning).toBe(own)
      else expect(c.meaning).not.toBe(own)
    }
  })

  it('shows IPA, or the reading a pack has instead (pinyin)', () => {
    const zh = [word(1, { ipa: '', viRead: 'nǐ hǎo' }), word(2, { ipa: 'həˈloʊ' })]
    const deck = pickBlitzDeck(zh, {}, 10, rand)
    expect(deck.find((c) => c.id === 1)?.reading).toBe('nǐ hǎo')
    expect(deck.find((c) => c.id === 2)?.reading).toBe('həˈloʊ')
  })

  it('skips repeated meanings and needs two words to play', () => {
    const same = [word(1, { meaning: 'nhà' }), word(2, { meaning: 'nhà' })]
    expect(pickBlitzDeck(same, {}, 10, rand)).toEqual([])
  })

  it('multiplies points for a run of right answers, up to ×4, and turns a score into XP', () => {
    expect([0, 4, 5, 9, 10, 15, 40].map(blitzMultiplier)).toEqual([1, 1, 2, 2, 3, 4, 4])
    expect(blitzXp(0)).toBe(2)
    expect(blitzXp(300)).toBe(10)
    expect(BLITZ_SECONDS).toBe(60)
  })
})
