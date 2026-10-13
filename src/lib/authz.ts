// Authorization decisions for the Cloudflare Pages Functions, kept here as pure
// functions so they can be unit-tested without a Workers runtime (the Functions
// already import shared code from src/lib — see functions/api/ai/chat.ts).

/** Result of looking a profile up: whether the lookup worked, then the row. */
export type ProfileLookup =
  { ok: true; profile: { role: string; status: string } | null } | { ok: false }

export type Role = 'admin' | 'student'

export type Decision = { allow: true; role: Role } | { allow: false; status: number; error: string }

/**
 * True only for a canonical UUID. Admin endpoints paste the id straight into a
 * PostgREST filter, so anything carrying `&`, `,`, `*` or whitespace has to be
 * refused before it becomes part of a query.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value)
}

/**
 * Why an account may not be used yet, in words for the learner — or null when
 * it may. New sign-ups start as `pending` until an admin approves them
 * (docs/design/registration-approval.md); `locked` is an admin's decision.
 * Shared by the Functions and the browser so both say the same thing.
 */
export function accountBlockMessage(
  status: string | null | undefined,
  lang: 'vi' | 'en' = 'vi'
): string | null {
  const en = lang === 'en'
  if (status === 'locked') {
    return en
      ? 'This account has been locked. Please contact an admin.'
      : 'Tài khoản đã bị khoá. Liên hệ quản trị viên.'
  }
  // Worded as a beta waitlist (docs/design/account.md): the mechanism is the
  // same admin approval, but a learner should feel welcome, not suspected.
  if (status === 'pending') {
    return en
      ? "You're on the beta waitlist — new accounts are approved by hand. Meanwhile, keep learning as a guest: your progress on this device will sync once you're in."
      : 'Bạn đang trong danh sách chờ bản beta — tài khoản mới được duyệt thủ công. Trong lúc chờ, cứ học ở chế độ khách nhé: tiến độ trên máy này sẽ được đồng bộ khi tài khoản được mở.'
  }
  return null
}

/**
 * Can this signed-in user use the app at all?
 *
 * A failed lookup is NOT the same as "nothing is wrong": the old code returned
 * null for both, so a Supabase blip re-admitted locked accounts. A failed
 * lookup now answers 503 (the caller should retry), while a genuinely missing
 * profile row — the trigger has not fired yet, say — is treated as an ordinary
 * student so a real learner is never locked out of their own account.
 */
export function accessDecision(lookup: ProfileLookup): Decision {
  if (!lookup.ok) {
    return {
      allow: false,
      status: 503,
      error: 'Chưa kiểm tra được tài khoản. Thử lại sau giây lát nhé.',
    }
  }
  const profile = lookup.profile
  const blocked = accountBlockMessage(profile?.status)
  if (blocked) return { allow: false, status: 403, error: blocked }
  return { allow: true, role: profile?.role === 'admin' ? 'admin' : 'student' }
}

/** Same, but the endpoint additionally requires the admin role. */
export function adminDecision(lookup: ProfileLookup): Decision {
  const base = accessDecision(lookup)
  if (!base.allow) return base
  if (base.role !== 'admin') {
    return { allow: false, status: 403, error: 'Không có quyền truy cập.' }
  }
  return base
}
