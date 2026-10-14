import { cleanDisplayName } from '../../src/lib/displayName'
import { nameChangeDecision } from '../../src/lib/authz'
import {
  type Ctx,
  adminAuth,
  adminRest,
  getUser,
  json,
  lookupProfile,
  requireUser,
} from '../_shared'

// /api/account — the signed-in learner's own account (docs/design/account.md).
//
// PATCH { name } changes the display name — and nothing else. Profiles have no
// user-facing UPDATE policy on purpose (no one may raise their own role), so
// the one field a learner may edit goes through here with the service role.
//
// DELETE erases it. Only the auth user is deleted here: profiles, progress and
// ai_usage reference auth.users ON DELETE CASCADE (supabase/schema.sql), so the
// synced data goes with it in the same statement. The browser re-checks the
// password before calling this.

export const onRequestPatch = async (ctx: Ctx): Promise<Response> => {
  // A waitlisted (pending) account may name itself too — that happens right
  // after sign-up — so this checks the profile itself instead of requireUser.
  const user = await getUser(ctx.env, ctx.request)
  if (!user) return json({ error: 'Chưa đăng nhập.' }, 401)
  const decision = nameChangeDecision(await lookupProfile(ctx.env, user.id))
  if (!decision.allow) return json({ error: decision.error }, decision.status)
  const body = (await ctx.request.json().catch(() => ({}))) as { name?: unknown }
  const name = cleanDisplayName(body.name)
  if (name === null) return json({ error: 'Tên hiển thị không hợp lệ.' }, 400)
  const r = await adminRest(ctx.env, `/profiles?id=eq.${encodeURIComponent(user.id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ name }),
  })
  if (!r.ok) return json({ error: 'Đổi tên thất bại.' }, 502)
  return json({ ok: true, name })
}

export const onRequestDelete = async (ctx: Ctx): Promise<Response> => {
  const user = await requireUser(ctx.env, ctx.request)
  if (user instanceof Response) return user
  // Never leave the app without anyone who can approve new accounts.
  if (user.role === 'admin') return json({ error: 'Tài khoản quản trị không tự xoá được.' }, 400)
  const r = await adminAuth(ctx.env, `/users/${encodeURIComponent(user.id)}`, { method: 'DELETE' })
  if (!r.ok) return json({ error: 'Xoá tài khoản thất bại.' }, 502)
  return json({ ok: true })
}
