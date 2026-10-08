import { describe, expect, it } from 'vitest'
import { activityLevel, compareWeeks, recentCalendar } from './calendar'

describe('calendar', () => {
  it('grades activity from nothing to a lot', () => {
    expect([0, 1, 5, 15, 30, 100].map(activityLevel)).toEqual([0, 1, 2, 3, 4, 4])
  })

  it('covers the last weeks ending today, oldest first', () => {
    const cells = recentCalendar({ 100: 3, 70: 50 }, 100, 5)
    expect(cells).toHaveLength(35)
    expect(cells[0].day).toBe(66)
    expect(cells[34]).toMatchObject({ day: 100, count: 3, level: 1, isToday: true })
    expect(cells.find((c) => c.day === 70)!.level).toBe(4)
  })
})

describe('compareWeeks', () => {
  it('stays hidden with nothing to compare', () => {
    expect(compareWeeks({}, {}, 100)).toBeNull()
  })

  it('counts answers, new words and study days in each 7-day window', () => {
    const reviews = { 100: 10, 95: 5, 94: 8, 93: 20 }
    const news = { 100: 5, 93: 10 }
    const r = compareWeeks(reviews, news, 100)!
    expect(r.now).toEqual({ answers: 23, words: 5, days: 3 })
    expect(r.before).toEqual({ answers: 20, words: 10, days: 1 })
    expect(r.message).toContain('15%')
  })

  it('welcomes a first week and never scolds a slower one', () => {
    expect(compareWeeks({ 100: 3 }, {}, 100)!.message).toContain('Tuần đầu tiên')
    const slower = compareWeeks({ 100: 3, 92: 40 }, {}, 100)!
    expect(slower.message).toContain('không sao')
    expect(compareWeeks({ 100: 4, 92: 4 }, {}, 100)!.message).toContain('Đều đặn')
  })
})
