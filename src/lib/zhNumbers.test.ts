import { describe, expect, it } from 'vitest'
import { hanNumber, itemFor, numberPinyin, numberQuiz, numbersXp } from './zhNumbers'

describe('hanNumber', () => {
  it.each([
    [0, '零'],
    [7, '七'],
    [10, '十'],
    [14, '十四'],
    [40, '四十'],
    [41, '四十一'],
    [100, '一百'],
    [105, '一百零五'],
    [110, '一百一十'],
    [115, '一百一十五'],
    [199, '一百九十九'],
  ])('%i → %s', (n, han) => expect(hanNumber(n)).toBe(han))
})

describe('itemFor', () => {
  it('says 两 for two of something, but not inside a bigger number', () => {
    expect(itemFor('price', 2).han).toBe('两块')
    expect(itemFor('price', 12).han).toBe('十二块')
    expect(itemFor('time', 2, 0).han).toBe('两点')
    expect(itemFor('time', 12, 0).han).toBe('十二点')
  })

  it('reads clock times, dates and weekdays the usual way', () => {
    expect(itemFor('time', 7, 30)).toMatchObject({ label: ['7:30', '7:30'], han: '七点半' })
    expect(itemFor('time', 8, 5).han).toBe('八点零五分')
    expect(itemFor('time', 9, 45).han).toBe('九点四十五分')
    expect(itemFor('date', 3, 12)).toMatchObject({ label: ['12/3', '12 Mar'], han: '三月十二号' })
    expect(itemFor('weekday', 0).han).toBe('星期天')
    expect(itemFor('weekday', 3)).toMatchObject({ label: ['Thứ Tư', 'Wednesday'], han: '星期三' })
  })

  it('writes pinyin syllable by syllable, 一 changing before 百', () => {
    expect(numberPinyin('一百零五')).toBe('yì bǎi líng wǔ')
    expect(numberPinyin('十四')).toBe('shí sì')
    expect(numberPinyin('两点半')).toBe('liǎng diǎn bàn')
  })
})

describe('numberQuiz', () => {
  it('asks ten questions, each with four different options and the answer among them', () => {
    for (let round = 0; round < 50; round++) {
      const qs = numberQuiz()
      expect(qs).toHaveLength(10)
      for (const q of qs) {
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options.map((o) => o.label[0])).size).toBe(4)
        expect(q.options[q.answer]).toBe(q.item)
        for (const o of q.options) expect(o.kind).toBe(q.item.kind)
      }
    }
  })

  it('offers the swapped-digit trap for a plain number', () => {
    const always = () => 0.07 // n = 2 + floor(0.07 * 198) = 15
    const q = numberQuiz(always).find((x) => x.item.kind === 'number')!
    expect(q.item.label[0]).toBe('15')
    expect(q.options.map((o) => o.label[0])).toContain('51')
  })

  it('scores like the other quick checks', () => {
    expect(numbersXp(10, 10)).toBe(30)
  })
})
