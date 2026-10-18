import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  MEASURES,
  MEASURE_ITEMS,
  measureOf,
  measureQuiz,
  measureXp,
  phrase,
  yiBefore,
} from './measureWords'

const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as {
  words: { word: string; viRead: string }[]
}
const reads = new Map(pack.words.map((w) => [w.word, w.viRead]))

describe('measure word data', () => {
  it('uses nouns of the Chinese pack and measure words from the table', () => {
    for (const item of MEASURE_ITEMS) {
      expect(reads.has(item.noun), item.noun).toBe(true)
      expect(measureOf(item.measure), item.noun).toBeDefined()
      for (const a of item.also ?? []) expect(measureOf(a), `${item.noun} also ${a}`).toBeDefined()
    }
    expect(new Set(MEASURE_ITEMS.map((i) => i.noun)).size).toBe(MEASURE_ITEMS.length)
  })

  it('asks about every measure word in the table', () => {
    const asked = new Set(MEASURE_ITEMS.map((i) => i.measure))
    for (const m of MEASURES) expect(asked.has(m.ch), m.ch).toBe(true)
  })
})

describe('phrase', () => {
  it('reads 一 by the tone that follows', () => {
    expect(yiBefore('gè')).toBe('yí')
    expect(yiBefore('běn')).toBe('yì')
    expect(yiBefore('bēi')).toBe('yì')
    expect(phrase(MEASURE_ITEMS[0], 'shū')).toEqual({ zh: '一本书', pinyin: 'yì běn shū' })
    const cup = MEASURE_ITEMS.find((i) => i.noun === '杯子')!
    expect(phrase(cup, 'bēizi')).toEqual({ zh: '一个杯子', pinyin: 'yí gè bēizi' })
  })

  it('uses the frame when there is one', () => {
    const family = MEASURE_ITEMS.find((i) => i.noun === '人')!
    expect(phrase(family, 'rén').zh).toBe('我家有三口人。')
  })
})

describe('measureQuiz', () => {
  it('gives distinct nouns, four distinct options and the right answer among them', () => {
    const qs = measureQuiz(10)
    expect(qs).toHaveLength(10)
    expect(new Set(qs.map((q) => q.item.noun)).size).toBe(10)
    for (const q of qs) {
      expect(new Set(q.options).size).toBe(4)
      expect(q.options[q.answer]).toBe(q.item.measure)
    }
  })

  it('never offers an acceptable alternative as a wrong option', () => {
    for (let n = 0; n < 30; n++)
      for (const q of measureQuiz(MEASURE_ITEMS.length))
        for (const a of q.item.also ?? []) expect(q.options, q.item.noun).not.toContain(a)
  })

  it('scores like the other quick checks', () => {
    expect(measureXp(10, 10)).toBe(30)
    expect(measureXp(0, 10)).toBe(5)
  })
})
