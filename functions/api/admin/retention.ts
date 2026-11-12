import {
  activeDaysByLearner,
  deviceReport,
  retentionReport,
  type DeviceDay,
  type DeviceReport,
  type ProgressDays,
} from '../../../src/lib/retention'
import { type Ctx, adminRest, json, requireAdmin } from '../../_shared'

// GET /api/admin/retention — how many learners come back (docs/design/retention.md).
// Read from the synced progress rows, only the two day maps each one needs, so
// the whole table never crosses the wire. Also, for every device signed in or
// not, from the anonymous usage signal (docs/design/usage-metrics.md):
// `devices` is null until public.usage_days exists.

const PAGE = 1000
const MS_PER_DAY = 86_400_000

/** Today's epoch day on Vietnam time (UTC+7, no daylight saving), as the app counts days. */
function vietnamEpochDay(now = Date.now()): number {
  return Math.floor((now + 7 * 60 * 60 * 1000) / MS_PER_DAY)
}

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx.env, ctx.request)
  if (admin instanceof Response) return admin

  const rows: ProgressDays[] = []
  try {
    for (let offset = 0; ; offset += PAGE) {
      const r = await adminRest(
        ctx.env,
        `/progress?select=user_id,reviews:data->stats->reviewsByDay,news:data->stats->newByDay&order=user_id,lang_code&limit=${PAGE}&offset=${offset}`
      )
      if (!r.ok) return json({ error: `Supabase trả về ${r.status} khi đọc tiến độ.` }, 502)
      const page = (await r.json()) as ProgressDays[]
      rows.push(...page)
      if (page.length < PAGE) break
    }
  } catch {
    return json({ error: 'Không kết nối được Supabase để đọc tiến độ.' }, 502)
  }
  const today = vietnamEpochDay()
  return json({
    ...retentionReport(activeDaysByLearner(rows), today),
    devices: await readDevices(ctx, today),
  })
}

/** "2026-11-12" → its epoch day. */
function epochDayOf(date: unknown): number | null {
  if (typeof date !== 'string') return null
  const ms = Date.parse(`${date}T00:00:00Z`)
  return Number.isNaN(ms) ? null : Math.floor(ms / MS_PER_DAY)
}

async function readDevices(ctx: Ctx, today: number): Promise<DeviceReport | null> {
  const rows: DeviceDay[] = []
  try {
    for (let offset = 0; ; offset += PAGE) {
      const r = await adminRest(
        ctx.env,
        `/usage_days?select=device,day,first_lesson&order=device,day&limit=${PAGE}&offset=${offset}`
      )
      // 404 = the table is not created yet (supabase/schema.sql).
      if (!r.ok) return null
      const page = (await r.json()) as { device: unknown; day: unknown; first_lesson: unknown }[]
      for (const row of page) rows.push({ ...row, day: epochDayOf(row.day) })
      if (page.length < PAGE) break
    }
  } catch {
    return null
  }
  return deviceReport(rows, today)
}
