import { describe, expect, it } from 'vitest'
import { itemFor, koNumberQuiz, monthName, nativeNumber, sinoNumber } from './koNumbers'

describe('sinoNumber', () => {
  it.each([
    [0, '영'],
    [10, '십'],
    [15, '십오'],
    [41, '사십일'],
    [105, '백오'],
    [3500, '삼천오백'],
    [10000, '만'],
    [15000, '만 오천'],
    [23500, '이만 삼천오백'],
  ])('%i → %s', (n, ko) => expect(sinoNumber(n)).toBe(ko))
})

describe('nativeNumber', () => {
  it('counts 1–99 and shortens before a counter', () => {
    expect(nativeNumber(3)).toBe('셋')
    expect(nativeNumber(3, true)).toBe('세')
    expect(nativeNumber(20)).toBe('스물')
    expect(nativeNumber(20, true)).toBe('스무')
    expect(nativeNumber(21, true)).toBe('스물한')
    expect(nativeNumber(34, true)).toBe('서른네')
    expect(nativeNumber(12, true)).toBe('열두')
  })
})

describe('itemFor', () => {
  it('uses native numbers for hours and Sino-Korean for minutes', () => {
    expect(itemFor('time', 3, 20).han).toBe('세 시 이십 분')
    expect(itemFor('time', 12, 30).han).toBe('열두 시 반')
    expect(itemFor('time', 1, 0).han).toBe('한 시')
  })
  it('reads money and dates in Sino-Korean, with 유월 and 시월', () => {
    expect(itemFor('price', 3500)).toMatchObject({
      han: '삼천오백 원',
      label: ['3.500 won', '3,500 won'],
    })
    expect(monthName(6)).toBe('유월')
    expect(monthName(10)).toBe('시월')
    expect(itemFor('date', 3, 12)).toMatchObject({ han: '삼월 십이일', label: ['12/3', '12 Mar'] })
  })
  it('counts things and age with native numbers', () => {
    expect(itemFor('count', 2).han).toBe('두 개')
    expect(itemFor('age', 20).han).toBe('스무 살')
    expect(itemFor('age', 25).han).toBe('스물다섯 살')
    expect(itemFor('weekday', 3).han).toBe('수요일')
  })
})

describe('koNumberQuiz', () => {
  it('asks ten questions with four distinct options of the same kind', () => {
    for (let round = 0; round < 50; round++) {
      const qs = koNumberQuiz()
      expect(qs).toHaveLength(10)
      for (const q of qs) {
        expect(new Set(q.options.map((o) => o.label[0])).size).toBe(4)
        expect(q.options[q.answer]).toBe(q.item)
        for (const o of q.options) expect(o.kind).toBe(q.item.kind)
      }
    }
  })
})
