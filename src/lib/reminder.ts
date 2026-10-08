// Daily study reminder through the learner's own calendar. Without a push
// server, a repeating calendar event is the one reminder that reliably rings on
// every phone — Google Calendar via a link, everything else (iPhone, Outlook,
// Samsung…) via an .ics file. Pure; ReminderSetup.tsx does the clicking.

export const APP_URL = 'https://vocastudy.app/'
/** localStorage: the "HH:MM" of the reminder the learner last added. */
export const REMINDER_KEY = 'vocab.reminder'
export const DEFAULT_REMINDER = '20:00'

const TITLE = '📚 2 phút học từ vựng'
const DURATION_MIN = 10

/** The reminder time the learner last added (null = never set one up). */
export function savedReminder(): string | null {
  try {
    return localStorage.getItem(REMINDER_KEY)
  } catch {
    return null
  }
}

export function parseTime(t: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  return h < 24 && min < 60 ? { h, m: min } : null
}

/** The first reminder: today if the time is still ahead, otherwise tomorrow. */
export function firstReminder(now: Date, time: string): Date {
  const t = parseTime(time) ?? parseTime(DEFAULT_REMINDER)!
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.h, t.m)
  if (d <= now) d.setDate(d.getDate() + 1)
  return d
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Floating local time ("20261009T200000"): the calendar keeps it at 20:00 wherever you are. */
function local(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
}

function utc(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

/** RFC 5545 text escaping. */
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Fold a content line at 75 octets without splitting a UTF-8 character. */
export function fold(line: string): string {
  const enc = new TextEncoder()
  const out: string[] = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    const n = enc.encode(ch).length
    const limit = out.length === 0 ? 75 : 74 // continuation lines start with a space
    if (bytes + n > limit) {
      out.push(cur)
      cur = ''
      bytes = 0
    }
    cur += ch
    bytes += n
  }
  out.push(cur)
  return out.join('\r\n ')
}

/** A calendar file with one event that repeats every day at `time`. */
export function reminderIcs(time: string, now: Date, url = APP_URL): string {
  const start = firstReminder(now, time)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VocabStudy//Nhac hoc//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:vocabstudy-daily-${utc(now)}@vocastudy.app`,
    `DTSTAMP:${utc(now)}`,
    `DTSTART:${local(start)}`,
    `DURATION:PT${DURATION_MIN}M`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${esc(TITLE)}`,
    `DESCRIPTION:${esc(`Mở VocabStudy và học nhanh 2 phút: ${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc('Đến giờ học từ vựng rồi!')}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

/** The same daily event as a pre-filled Google Calendar link. */
export function googleCalendarUrl(time: string, now: Date, url = APP_URL): string {
  const start = firstReminder(now, time)
  const end = new Date(start.getTime() + DURATION_MIN * 60_000)
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: TITLE,
    details: `Mở VocabStudy và học nhanh 2 phút: ${url}`,
    dates: `${local(start)}/${local(end)}`,
    recur: 'RRULE:FREQ=DAILY',
  })
  return `https://calendar.google.com/calendar/render?${q}`
}
