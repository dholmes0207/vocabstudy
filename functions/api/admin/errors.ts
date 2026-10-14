import { type Ctx, adminRest, json, requireAdmin } from '../../_shared'

// GET /api/admin/errors — the most recent grouped error reports for the Admin
// page (docs/design/error-reports.md). `enabled: false` means the table does
// not exist yet: supabase/schema.sql has not been re-run since it was added.

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx.env, ctx.request)
  if (admin instanceof Response) return admin
  const r = await adminRest(
    ctx.env,
    '/client_errors?select=signature,message,stack,path,release,kind,count,first_seen,last_seen&order=last_seen.desc&limit=30'
  )
  if (r.status === 404) return json({ enabled: false, errors: [] })
  if (!r.ok) return json({ error: 'Không tải được danh sách lỗi.' }, 502)
  return json({ enabled: true, errors: await r.json() })
}
