// The "don't break the chain" calendar on the stats page: the last few weeks
// as a grid, each studied day lit by how much was done.

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
