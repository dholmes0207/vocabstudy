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
  if (profile?.status === 'locked') {
    return { allow: false, status: 403, error: 'Tài khoản đã bị khoá.' }
  }
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
