import { useState } from 'react'
import { CalendarPlus, Download } from 'lucide-react'
import {
  APP_URL,
  DEFAULT_REMINDER,
  REMINDER_KEY,
  googleCalendarUrl,
  parseTime,
  reminderIcs,
  savedReminder,
} from '@/lib/reminder'
import { useT, useUiLang } from '@/lib/i18n'

/**
 * Pick a time, then add a daily event to the phone's calendar — Google
 * Calendar by link, anything else by .ics file (docs/design/reminder.md).
 */
export default function ReminderSetup({ onAdded }: { onAdded?: (time: string) => void }) {
  const [time, setTime] = useState(() => savedReminder() ?? DEFAULT_REMINDER)
  const [added, setAdded] = useState<string | null>(null)
  const valid = parseTime(time) !== null
  const t = useT()
  const lang = useUiLang()

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
    const blob = new Blob([reminderIcs(time, new Date(), APP_URL, lang)], {
      type: 'text/calendar;charset=utf-8',
    })
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
        {t('Nhắc lúc', 'Remind me at')}
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-semibold dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <a
          href={valid ? googleCalendarUrl(time, new Date(), APP_URL, lang) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={valid ? remember : undefined}
          aria-disabled={!valid}
          className="btn-primary aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <CalendarPlus className="h-4 w-4" /> {t('Lịch Google', 'Google Calendar')}
        </a>
        <button onClick={download} disabled={!valid} className="btn-secondary">
          <Download className="h-4 w-4" />{' '}
          {t('iPhone / lịch khác (.ics)', 'iPhone / other calendars (.ics)')}
        </button>
      </div>
      {added && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          ✓{' '}
          {t(
            `Đã tạo nhắc nhở lúc ${added} mỗi ngày — nhớ bấm “Lưu” trong ứng dụng Lịch nhé.`,
            `Daily reminder at ${added} created — remember to tap “Save” in your Calendar app.`
          )}
        </p>
      )}
    </div>
  )
}
