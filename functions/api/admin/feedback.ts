import { isUuid } from '../../../src/lib/authz'
import { type Ctx, adminRest, json, requireAdmin } from '../../_shared'

// /api/admin/feedback — read learners' feedback and choose which quotable ones
// appear on the homepage (docs/design/feedback.md). `enabled: false` means the
// table does not exist yet (supabase/schema.sql not re-run).

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx.env, ctx.request)
  if (admin instanceof Response) return admin
  const r = await adminRest(
    ctx.env,
    '/feedback?select=id,created_at,name,message,rating,allow_quote,featured,page&order=created_at.desc&limit=50'
  )
  if (r.status === 404) return json({ enabled: false, feedback: [] })
  if (!r.ok) return json({ error: 'Không tải được góp ý.' }, 502)
  return json({ enabled: true, feedback: await r.json() })
}

// Feature or unfeature one message. Only a message whose author allowed
// quoting can ever be featured — enforced here, not just in the UI.
export const onRequestPatch = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx.env, ctx.request)
  if (admin instanceof Response) return admin
  const b = (await ctx.request.json().catch(() => ({}))) as { id?: string; featured?: unknown }
  if (!isUuid(b.id) || typeof b.featured !== 'boolean')
    return json({ error: 'Dữ liệu không hợp lệ' }, 400)
  const filter = `id=eq.${encodeURIComponent(b.id)}${b.featured ? '&allow_quote=eq.true' : ''}`
  const r = await adminRest(ctx.env, `/feedback?${filter}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ featured: b.featured }),
  })
  if (!r.ok) return json({ error: 'Cập nhật thất bại' }, 502)
  const rows = (await r.json()) as unknown[]
  if (rows.length === 0)
    return json({ error: 'Người viết chưa cho phép trích dẫn góp ý này.' }, 400)
  return json({ ok: true })
}
