import { type Ctx, adminAuth, json, requireUser } from '../_shared'

// /api/account — the signed-in learner's own account (docs/design/account.md).
//
// DELETE erases it. Only the auth user is deleted here: profiles, progress and
// ai_usage reference auth.users ON DELETE CASCADE (supabase/schema.sql), so the
// synced data goes with it in the same statement. The browser re-checks the
// password before calling this.

export const onRequestDelete = async (ctx: Ctx): Promise<Response> => {
  const user = await requireUser(ctx.env, ctx.request)
  if (user instanceof Response) return user
  // Never leave the app without anyone who can approve new accounts.
  if (user.role === 'admin') return json({ error: 'Tài khoản quản trị không tự xoá được.' }, 400)
  const r = await adminAuth(ctx.env, `/users/${encodeURIComponent(user.id)}`, { method: 'DELETE' })
  if (!r.ok) return json({ error: 'Xoá tài khoản thất bại.' }, 502)
  return json({ ok: true })
}
