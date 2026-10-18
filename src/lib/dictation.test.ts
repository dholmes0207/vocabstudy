import { describe, expect, it } from 'vitest'
import type { Word } from '@/types'
import {
  DICTATION_PASS,
  dictationScore,
  diffWords,
  normalizeWords,
  dictationTiles,
  pickDictationRound,
  tileScore,
} from './dictation'

describe('normalizeWords', () => {
  it('ignores case, punctuation and apostrophes', () => {
    expect(normalizeWords('“I don’t know,” she said.')).toEqual([
      'i',
      'dont',
      'know',
      'she',
      'said',
    ])
  })

  it('keeps Korean words as they are', () => {
    expect(normalizeWords('늦어서 미안해요.')).toEqual(['늦어서', '미안해요'])
  })
})

describe('diffWords', () => {
  it('accepts "dont" for "don\'t" and keeps the original spelling to show', () => {
    const parts = diffWords("I don't like coffee.", 'i dont like coffee')
    expect(parts).toEqual([
      { text: 'I', status: 'ok' },
      { text: "don't", status: 'ok' },
      { text: 'like', status: 'ok' },
      { text: 'coffee.', status: 'ok' },
    ])
  })

  it('finds the missing and the extra words', () => {
    const parts = diffWords('She goes to work by bus.', 'she go to work bus')
    expect(parts).toEqual([
      { text: 'She', status: 'ok' },
      { text: 'go', status: 'extra' },
      { text: 'goes', status: 'missing' },
      { text: 'to', status: 'ok' },
      { text: 'work', status: 'ok' },
      { text: 'by', status: 'missing' },
      { text: 'bus.', status: 'ok' },
    ])
  })

  it('marks Chinese character by character, since it is typed without spaces', () => {
    const parts = diffWords('我\u200b喜欢\u200b喝\u200b咖啡。', '我喜欢吃咖啡')
    expect(parts.map((p) => `${p.text}:${p.status}`)).toEqual([
      '我:ok',
      '喜:ok',
      '欢:ok',
      '吃:extra',
      '喝:missing',
      '咖:ok',
      '啡:ok',
    ])
    expect(dictationScore(diffWords('我\u200b喜欢\u200b喝\u200b咖啡。', '我喜欢喝咖啡'))).toBe(1)
  })

  it('accepts a copy without punctuation or capitals', () => {
    const parts = diffWords('Where do you live?', 'where do you live')
    expect(parts.every((p) => p.status === 'ok')).toBe(true)
    expect(dictationScore(parts)).toBe(1)
  })
})

describe('dictationScore', () => {
  it('counts what was caught, and charges a little for extra words', () => {
    const parts = diffWords('She goes to work by bus.', 'she go to work bus')
    // 4 of 6 words right, 1 extra word → (4 - 0.5) / 6
    expect(dictationScore(parts)).toBeCloseTo(3.5 / 6)
    expect(dictationScore(parts) >= DICTATION_PASS).toBe(false)
  })

  it('never goes below zero', () => {
    expect(dictationScore(diffWords('Hi there you', 'a b c d e f g'))).toBe(0)
  })
})

describe('pickDictationRound', () => {
  const word = (id: number, exampleEn: string) => ({ id, exampleEn }) as Word

  it('prefers sentences from words already met, 4–12 words long', () => {
    const words = [
      word(1, 'Too short.'),
      word(2, 'I drink coffee every morning.'),
      word(3, 'My mother works in a hospital.'),
      word(4, 'We went to the beach last summer.'),
    ]
    const cards = { 1: {}, 2: {}, 3: {}, 4: {} } as never
    const round = pickDictationRound(words, cards, 3, () => 0.5)
    expect(round.map((w) => w.id).sort()).toEqual([2, 3, 4])
  })

  it('still has something to offer before any study', () => {
    const words = Array.from({ length: 10 }, (_, i) => word(i + 1, 'This is a simple sentence.'))
    expect(pickDictationRound(words, {}, 6)).toHaveLength(6)
  })
})

describe('tiles for dictation without a keyboard', () => {
  it('uses the words of a sentence', () => {
    expect(dictationTiles('저는 학생이에요.')).toEqual(['저는', '학생이에요.'])
    expect(dictationTiles('我\u200b叫\u200b安娜。')).toEqual(['我', '叫', '安娜。'])
  })

  it('splits an unsegmented Chinese sentence into characters, punctuation kept on', () => {
    expect(dictationTiles('他是我的老师。')).toEqual(['他', '是', '我', '的', '老', '师。'])
    expect(dictationTiles('“谢谢！”')).toEqual(['“谢', '谢！”'])
  })

  it('scores a wrong tap as half a tile, like an extra typed word', () => {
    expect(tileScore(5, 0)).toBe(1)
    expect(tileScore(4, 1)).toBe(0.875)
    expect(tileScore(4, 1)).toBeGreaterThanOrEqual(DICTATION_PASS)
    expect(tileScore(4, 2)).toBeLessThan(DICTATION_PASS)
    expect(tileScore(2, 5)).toBe(0)
    expect(tileScore(0, 0)).toBe(0)
  })
})
