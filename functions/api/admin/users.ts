import { type Ctx, adminAuth, adminRest, getProfile, getUser, json } from '../../_shared'

// /api/admin/users — user management. Enforced server-side: the caller must be
// an admin (checked against the profiles table via the service-role key).

async function requireAdmin(ctx: Ctx): Promise<{ id: string } | Response> {
  const u = await getUser(ctx.env, ctx.request)
  if (!u) return json({ error: 'Chưa đăng nhập.' }, 401)
  const p = await getProfile(ctx.env, u.id)
  if (p?.role !== 'admin') return json({ error: 'Không có quyền truy cập.' }, 403)
  return { id: u.id }
}

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx)
  if (admin instanceof Response) return admin
  const r = await adminRest(
    ctx.env,
    '/profiles?select=id,email,name,role,status,created_at&order=created_at.desc'
  )
  if (!r.ok) return json({ error: 'Không tải được danh sách tài khoản' }, 502)
  const rows = (await r.json()) as Record<string, unknown>[]
  return json({ users: rows.map((u) => ({ ...u, last_sign_in_at: null })) })
}

export const onRequestPatch = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx)
  if (admin instanceof Response) return admin
  const b = (await ctx.request.json().catch(() => ({}))) as {
    id?: string
    role?: string
    status?: string
  }
  if (!b.id || (b.role === undefined && b.status === undefined))
    return json({ error: 'Dữ liệu không hợp lệ' }, 400)
  if (b.id === admin.id) return json({ error: 'Không thể tự đổi vai/khoá chính mình.' }, 400)
  const patch: Record<string, string> = {}
  if (b.role === 'student' || b.role === 'admin') patch.role = b.role
  if (b.status === 'active' || b.status === 'locked') patch.status = b.status
  if (!Object.keys(patch).length) return json({ error: 'Dữ liệu không hợp lệ' }, 400)
  const r = await adminRest(ctx.env, `/profiles?id=eq.${b.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  })
  if (!r.ok) return json({ error: 'Cập nhật thất bại' }, 502)
  return json({ ok: true })
}

// Reset a user's password.
export const onRequestPost = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx)
  if (admin instanceof Response) return admin
  const b = (await ctx.request.json().catch(() => ({}))) as { id?: string; password?: string }
  if (!b.id || typeof b.password !== 'string' || b.password.length < 6)
    return json({ error: 'Mật khẩu mới tối thiểu 6 ký tự' }, 400)
  const r = await adminAuth(ctx.env, `/users/${b.id}`, {
    method: 'PUT',
    body: JSON.stringify({ password: b.password }),
  })
  if (!r.ok) return json({ error: 'Đặt lại mật khẩu thất bại' }, 502)
  return json({ ok: true })
}

export const onRequestDelete = async (ctx: Ctx): Promise<Response> => {
  const admin = await requireAdmin(ctx)
  if (admin instanceof Response) return admin
  const b = (await ctx.request.json().catch(() => ({}))) as { id?: string }
  if (!b.id) return json({ error: 'Thiếu id' }, 400)
  if (b.id === admin.id) return json({ error: 'Không thể tự xoá chính mình.' }, 400)
  const r = await adminAuth(ctx.env, `/users/${b.id}`, { method: 'DELETE' })
  if (!r.ok) return json({ error: 'Xoá thất bại' }, 502)
  return json({ ok: true })
}
