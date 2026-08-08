// Day-granularity date helpers. We schedule SRS at the granularity of local
// calendar days, so "due today" is stable regardless of the time of day.

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Timezone-neutral day index for a given timestamp, based on the *local*
 * calendar date. Two timestamps on the same local calendar day yield the same
 * number, and the index round-trips back to the same date via `dayToDate` /
 * `formatDay` in ANY timezone.
 *
 * We read the local Y/M/D but assemble the index with `Date.UTC`, so the index
 * always corresponds to "that calendar day at UTC midnight". `dayToDate` and
 * `formatDay` then read it back with `getUTC*`, keeping both ends consistent.
 * (A previous version mixed local construction with local reading, which
 * shifted labels by a day for every non-UTC user — including UTC+7.)
 */
export function epochDay(ts: number = Date.now()): number {
  const d = new Date(ts)
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY)
}

/** Today's epoch day (local). */
export function today(): number {
  return epochDay()
}

/** Convert an epoch day back to a JS Date at local midnight. */
export function dayToDate(day: number): Date {
  return new Date(day * MS_PER_DAY)
}

/** Human-readable difference like "hôm nay", "ngày mai", "trong 5 ngày". */
export function relativeDays(fromDay: number, toDay: number): string {
  const diff = toDay - fromDay
  if (diff <= 0) return 'sẵn sàng ôn'
  if (diff === 1) return 'ngày mai'
  return `trong ${diff} ngày`
}

/** Format a day index as a short date string (dd/mm). Reads in UTC to match `epochDay`. */
export function formatDay(day: number): string {
  const d = dayToDate(day)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
