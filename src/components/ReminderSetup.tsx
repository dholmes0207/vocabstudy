import { useState } from 'react'
import { CalendarPlus, Download } from 'lucide-react'
import {
  DEFAULT_REMINDER,
  REMINDER_KEY,
  googleCalendarUrl,
  parseTime,
  reminderIcs,
  savedReminder,
} from '@/lib/reminder'

/**
 * Pick a time, then add a daily event to the phone's calendar — Google
 * Calendar by link, anything else by .ics file (docs/design/reminder.md).
 */
export default function ReminderSetup({ onAdded }: { onAdded?: (time: string) => void }) {
  const [time, setTime] = useState(() => savedReminder() ?? DEFAULT_REMINDER)
  const [added, setAdded] = useState<string | null>(null)
  const valid = parseTime(time) !== null

  const remember = () => {
    try {
      localStorage.setItem(REMINDER_KEY, time)
    } catch {
      // private mode — the calendar event works all the same
    }
    setAdded(time)
    onAdded?.(time)
  }

  const download = () => {
    const blob = new Blob([reminderIcs(time, new Date())], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vocabstudy-nhac-hoc.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    remember()
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 text-sm font-semibold">
        Nhắc lúc
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-semibold dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <a
          href={valid ? googleCalendarUrl(time, new Date()) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={valid ? remember : undefined}
          aria-disabled={!valid}
          className="btn-primary aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <CalendarPlus className="h-4 w-4" /> Lịch Google
        </a>
        <button onClick={download} disabled={!valid} className="btn-secondary">
          <Download className="h-4 w-4" /> iPhone / lịch khác (.ics)
        </button>
      </div>
      {added && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          ✓ Đã tạo nhắc nhở lúc {added} mỗi ngày — nhớ bấm “Lưu” trong ứng dụng Lịch nhé.
        </p>
      )}
    </div>
  )
}
