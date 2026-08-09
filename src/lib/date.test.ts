import { describe, expect, it } from 'vitest'
import { dayToDate, epochDay, formatDay, relativeDays } from './date'

describe('epochDay', () => {
  it('gives the same index for any time on the same local calendar day', () => {
    const morning = new Date(2026, 7, 9, 0, 0, 1).getTime()
    const night = new Date(2026, 7, 9, 23, 59, 59).getTime()
    expect(epochDay(morning)).toBe(epochDay(night))
  })

  it('advances by exactly 1 across local midnight', () => {
    const d9 = epochDay(new Date(2026, 7, 9, 12).getTime())
    const d10 = epochDay(new Date(2026, 7, 10, 12).getTime())
    expect(d10 - d9).toBe(1)
  })

  it('round-trips back to the same calendar date via formatDay', () => {
    // Regression guard: an earlier version built the index from local time but
    // read it back with getUTC*, shifting every label by a day outside UTC.
    for (const [y, m, d] of [
      [2026, 0, 1],
      [2026, 7, 9],
      [2026, 11, 31],
    ] as const) {
      const day = epochDay(new Date(y, m, d, 13, 45).getTime())
      expect(formatDay(day)).toBe(`${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}`)
      expect(dayToDate(day).getUTCFullYear()).toBe(y)
    }
  })
})

describe('relativeDays', () => {
  it('labels today and anything overdue as ready to review', () => {
    expect(relativeDays(100, 100)).toBe('sẵn sàng ôn')
    expect(relativeDays(100, 97)).toBe('sẵn sàng ôn')
  })

  it('labels tomorrow and further out', () => {
    expect(relativeDays(100, 101)).toBe('ngày mai')
    expect(relativeDays(100, 105)).toBe('trong 5 ngày')
  })
})
