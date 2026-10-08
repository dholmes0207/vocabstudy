import { describe, expect, it } from 'vitest'
import { activityLevel, recentCalendar } from './calendar'

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
