// The "don't break the chain" calendar on the stats page: the last few weeks
// as a grid, each studied day lit by how much was done.

import type { UiLang } from '@/types'

export interface CalendarCell {
  day: number
  count: number
  /** 0 = nothing, 1..4 = a little → a lot. */
  level: 0 | 1 | 2 | 3 | 4
  isToday: boolean
}

export function activityLevel(count: number): CalendarCell['level'] {
  if (count <= 0) return 0
  if (count < 5) return 1
  if (count < 15) return 2
  if (count < 30) return 3
  return 4
}

/** The last `weeks` × 7 days ending today, oldest first. */
export function recentCalendar(
  byDay: Record<number, number>,
  today: number,
  weeks = 5
): CalendarCell[] {
  const n = weeks * 7
  return Array.from({ length: n }, (_, i) => {
    const day = today - (n - 1 - i)
    const count = byDay[day] ?? 0
    return { day, count, level: activityLevel(count), isToday: day === today }
  })
}

export interface WeekTotals {
  /** Answers given (reviews + learning drills). */
  answers: number
  /** New words learned. */
  words: number
  /** Days with any study. */
  days: number
}

function weekTotals(
  reviews: Record<number, number>,
  news: Record<number, number>,
  lastDay: number
): WeekTotals {
  const t: WeekTotals = { answers: 0, words: 0, days: 0 }
  for (let d = lastDay - 6; d <= lastDay; d++) {
    const r = reviews[d] ?? 0
    t.answers += r
    t.words += news[d] ?? 0
    if (r > 0) t.days++
  }
  return t
}

export interface WeekCompare {
  now: WeekTotals
  before: WeekTotals
  message: string
}

/**
 * The last 7 days against the 7 before — progress measured against yourself,
 * never against others. A slower week gets a nudge, never a scolding; nothing
 * to compare yet returns null so the card stays hidden.
 */
export function compareWeeks(
  reviews: Record<number, number>,
  news: Record<number, number>,
  today: number,
  lang: UiLang = 'vi'
): WeekCompare | null {
  const en = lang === 'en'
  const now = weekTotals(reviews, news, today)
  const before = weekTotals(reviews, news, today - 7)
  if (now.answers === 0 && before.answers === 0) return null
  let message: string
  if (before.answers === 0) {
    message = en ? 'Your first week — a great start! 🌱' : 'Tuần đầu tiên — khởi đầu tốt lắm! 🌱'
  } else if (now.answers >= before.answers) {
    const pct = Math.round(((now.answers - before.answers) / before.answers) * 100)
    message =
      pct === 0
        ? en
          ? 'As steady as last week — keeping the rhythm is great 👏'
          : 'Đều đặn như tuần trước — giữ nhịp vậy là tuyệt 👏'
        : en
          ? `${pct}% more than last week — you're really improving 📈`
          : `Nhiều hơn tuần trước ${pct}% — bạn đang tiến bộ thật đấy 📈`
  } else {
    message = en
      ? "A lighter week — that's fine, a few answers today gets you back in rhythm 💪"
      : 'Tuần này nhẹ hơn một chút — không sao, vài câu hôm nay là lại vào nhịp 💪'
  }
  return { now, before, message }
}
