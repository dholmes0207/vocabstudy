import { describe, expect, it } from 'vitest'
import { firstReminder, fold, googleCalendarUrl, parseTime, reminderIcs } from './reminder'

const evening = new Date(2026, 9, 8, 18, 30) // 8 Oct 2026, 18:30 local
const late = new Date(2026, 9, 8, 22, 15)

describe('parseTime', () => {
  it('accepts HH:MM and rejects nonsense', () => {
    expect(parseTime('20:00')).toEqual({ h: 20, m: 0 })
    expect(parseTime('7:05')).toEqual({ h: 7, m: 5 })
    expect(parseTime('24:00')).toBeNull()
    expect(parseTime('12:60')).toBeNull()
    expect(parseTime('soon')).toBeNull()
  })
})

describe('firstReminder', () => {
  it('starts today when the time is still ahead, otherwise tomorrow', () => {
    expect(firstReminder(evening, '20:00').getDate()).toBe(8)
    expect(firstReminder(late, '20:00').getDate()).toBe(9)
    expect(firstReminder(late, '20:00').getHours()).toBe(20)
  })

  it('falls back to the default time for a bad value', () => {
    expect(firstReminder(evening, 'oops').getHours()).toBe(20)
  })
})

describe('reminderIcs', () => {
  const ics = reminderIcs('20:00', late)

  it('is one daily event at the chosen local time, with an alarm', () => {
    expect(ics).toContain('DTSTART:20261009T200000\r\n')
    expect(ics).toContain('RRULE:FREQ=DAILY')
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('https://vocastudy.app/')
  })

  it('uses CRLF line endings and folds long lines at 75 octets', () => {
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    const enc = new TextEncoder()
    for (const line of ics.split('\r\n')) expect(enc.encode(line).length).toBeLessThanOrEqual(75)
  })
})

describe('fold', () => {
  it('never splits a Vietnamese character and unfolds back to the original', () => {
    const line = 'DESCRIPTION:' + 'Đến giờ học từ vựng rồi! '.repeat(6)
    expect(fold(line).replace(/\r\n /g, '')).toBe(line)
  })
})

describe('googleCalendarUrl', () => {
  it('pre-fills a ten-minute daily event', () => {
    const url = new URL(googleCalendarUrl('07:30', evening))
    expect(url.hostname).toBe('calendar.google.com')
    expect(url.searchParams.get('dates')).toBe('20261009T073000/20261009T074000')
    expect(url.searchParams.get('recur')).toBe('RRULE:FREQ=DAILY')
  })

  it('crosses midnight cleanly', () => {
    const url = new URL(googleCalendarUrl('23:55', evening))
    expect(url.searchParams.get('dates')).toBe('20261008T235500/20261009T000500')
  })
})
