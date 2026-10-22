// "Bao nhiêu người quay lại?" for the Admin page (docs/design/retention.md).
// Counted from the progress the app already syncs: a learner's active days are
// the days their stats record any answer or any new word. Only signed-in
// learners sync, so learners who never log in are not in these numbers.

/** Answered: `returned` of the `eligible` learners came back. */
export interface Rate {
  eligible: number
  returned: number
}

export interface Cohort {
  /** Epoch day of the Monday the week starts. */
  week: number
  /** Learners whose first active day falls in that week. */
  learners: number
  nextDay: Rate
  firstWeek: Rate
}

export interface RetentionReport {
  /** Epoch day the report is for, on Vietnam time. */
  today: number
  learners: number
  activeToday: number
  /** Active at least once in the last 7 days, today included. */
  active7: number
  /** Came back the day after their first day. */
  nextDay: Rate
  /** Came back at least once within 7 days of their first day. */
  firstWeek: Rate
  /** Newest week first. */
  cohorts: Cohort[]
}

/** One synced progress row: a learner's stats for one language. */
export interface ProgressDays {
  user_id: unknown
  reviews?: unknown
  news?: unknown
}

/** The days a `{ day: count }` map has any activity on. */
function daysOf(map: unknown): number[] {
  if (!map || typeof map !== 'object') return []
  return Object.entries(map as Record<string, unknown>)
    .filter(([, n]) => typeof n === 'number' && n > 0)
    .map(([d]) => Number(d))
    .filter(Number.isInteger)
}

/** Active days per learner, all languages together (a learner may study two). */
export function activeDaysByLearner(rows: ProgressDays[]): number[][] {
  const by = new Map<string, Set<number>>()
  for (const row of rows) {
    if (typeof row.user_id !== 'string' || !row.user_id) continue
    const days = by.get(row.user_id) ?? new Set<number>()
    for (const d of [...daysOf(row.reviews), ...daysOf(row.news)]) days.add(d)
    by.set(row.user_id, days)
  }
  return [...by.values()].filter((s) => s.size > 0).map((s) => [...s].sort((a, b) => a - b))
}

/** Epoch day 0 was a Thursday; weeks start on Monday as in Vietnam. */
export function weekStart(day: number): number {
  return day - ((((day + 3) % 7) + 7) % 7)
}

function rates(learners: number[][], today: number) {
  const nextDay: Rate = { eligible: 0, returned: 0 }
  const firstWeek: Rate = { eligible: 0, returned: 0 }
  for (const days of learners) {
    const first = days[0]
    // A learner counts once the window has passed, so a newcomer from today
    // does not pull the rate down before they had the chance to come back.
    if (first + 1 <= today) {
      nextDay.eligible++
      if (days.includes(first + 1)) nextDay.returned++
    }
    if (first + 7 <= today) {
      firstWeek.eligible++
      if (days.some((d) => d > first && d <= first + 7)) firstWeek.returned++
    }
  }
  return { nextDay, firstWeek }
}

export function retentionReport(learners: number[][], today: number, weeks = 8): RetentionReport {
  const cohorts: Cohort[] = []
  for (let i = 0; i < weeks; i++) {
    const week = weekStart(today) - 7 * i
    const group = learners.filter((days) => weekStart(days[0]) === week)
    cohorts.push({ week, learners: group.length, ...rates(group, today) })
  }
  return {
    today,
    learners: learners.length,
    activeToday: learners.filter((days) => days.includes(today)).length,
    active7: learners.filter((days) => days.some((d) => d > today - 7 && d <= today)).length,
    ...rates(learners, today),
    cohorts,
  }
}

/** "62%" of a rate, or null while nobody is eligible yet. */
export function percent(rate: Rate): string | null {
  return rate.eligible ? `${Math.round((100 * rate.returned) / rate.eligible)}%` : null
}
