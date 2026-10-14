import { type Ctx, adminRest, json } from '../_shared'

// /api/health — is the app able to reach its database?
//
// Two jobs (docs/design/keepalive.md):
//  1. Supabase pauses a free project after 7 days without activity. The daily
//     GitHub Actions job .github/workflows/keepalive.yml calls this, and the
//     one-row query below is real database activity, so the project stays awake
//     even in a quiet week.
//  2. Monitoring: a failed check fails that job, and GitHub emails the owner.
//
// Says nothing about any user: one id is read and thrown away.

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  const started = Date.now()
  let db = false
  try {
    const r = await adminRest(ctx.env, '/profiles?select=id&limit=1')
    db = r.ok
    if (!r.ok) console.warn(`[health] database answered ${r.status}`)
  } catch (err) {
    console.warn('[health] database unreachable:', err)
  }
  const res = json({ ok: db, db, ms: Date.now() - started }, db ? 200 : 503)
  res.headers.set('Cache-Control', 'no-store')
  return res
}
