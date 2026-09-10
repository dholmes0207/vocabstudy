import { parseDailyLimit, summarizeUsage } from '../../../src/lib/quota'
import { type Ctx, adminRest, json, requireAdmin } from '../../_shared'

// GET /api/admin/ai-usage — is the AI cap actually counting, and how much has
// been spent today?
//
// The cap fails open on purpose (a missing migration or a stale PostgREST
// schema cache must not take the tutor down for a whole class), which means a
// silently broken counter and a working one look identical from the outside.
// This endpoint is the difference between the two.

/**
 * Today, on the same clock `bump_ai_usage()` uses. Vietnam is UTC+7 all year
 * with no daylight saving, so shifting then taking the UTC date is exact — and
 * a day boundary that disagreed with the SQL would report the wrong figures
 * every evening.
 */
function vietnamToday(now = Date.now()): string {
  return new Date(now + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx.env, ctx.request)
  if (admin instanceof Response) return admin

  const limit = parseDailyLimit(ctx.env.AI_DAILY_LIMIT, 30)
  const day = vietnamToday()

  try {
    const r = await adminRest(ctx.env, `/ai_usage?select=user_id,used&day=eq.${day}`)
    if (!r.ok) {
      const detail = (await r.text().catch(() => '')).slice(0, 200)
      return json({
        limit,
        day,
        reachable: false,
        today: { users: 0, requests: 0 },
        error:
          r.status === 404
            ? "API chưa thấy bảng ai_usage. Chạy supabase/schema.sql, rồi chạy: notify pgrst, 'reload schema';"
            : `Supabase trả về ${r.status}. ${detail}`,
      })
    }
    return json({ limit, day, reachable: true, today: summarizeUsage(await r.json()) })
  } catch {
    return json({
      limit,
      day,
      reachable: false,
      today: { users: 0, requests: 0 },
      error: 'Không kết nối được Supabase để đọc bộ đếm.',
    })
  }
}
