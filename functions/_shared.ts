import {
  accessDecision,
  adminDecision,
  isUuid,
  type ProfileLookup,
  type Role,
} from '../src/lib/authz'

// Shared helpers for Cloudflare Pages Functions (Workers runtime).
// Secrets live in Cloudflare env: OPENAI_API_KEY, SUPABASE_URL,
// SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.

export interface Env {
  OPENAI_API_KEY?: string
  /** Daily AI requests per learner; "0" disables the cap. Default 30. */
  AI_DAILY_LIMIT?: string
  OPENAI_MODEL?: string
  OPENAI_BASE_URL?: string
  OPENAI_REASONING_EFFORT?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export interface Ctx {
  request: Request
  env: Env
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Verify the Supabase access token in the Authorization header → the user. */
export async function getUser(
  env: Env,
  request: Request
): Promise<{ id: string; email: string } | null> {
  const header = request.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_ANON_KEY },
  })
  if (!r.ok) return null
  const u = (await r.json()) as { id?: string; email?: string }
  return u?.id ? { id: u.id, email: u.email ?? '' } : null
}

/** Supabase REST (PostgREST) call with the service-role key (bypasses RLS). */
export function adminRest(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

/** Supabase Auth admin API call with the service-role key. */
export function adminAuth(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}/auth/v1/admin${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

/**
 * Look a profile up, keeping "the lookup failed" distinct from "there is no
 * row". Collapsing the two (the previous `getProfile` returned null for both)
 * meant a Supabase blip silently re-admitted locked accounts.
 */
export async function lookupProfile(env: Env, userId: string): Promise<ProfileLookup> {
  if (!isUuid(userId)) return { ok: true, profile: null }
  let r: Response
  try {
    r = await adminRest(env, `/profiles?id=eq.${encodeURIComponent(userId)}&select=role,status`)
  } catch {
    return { ok: false }
  }
  if (!r.ok) return { ok: false }
  try {
    const rows = (await r.json()) as { role: string; status: string }[]
    return { ok: true, profile: rows[0] ?? null }
  } catch {
    return { ok: false }
  }
}

export interface AuthedUser {
  id: string
  email: string
  role: Role
}

/** Require a signed-in, non-locked user; returns the user or a Response. */
export async function requireUser(env: Env, request: Request): Promise<AuthedUser | Response> {
  const user = await getUser(env, request)
  if (!user) return json({ error: 'Chưa đăng nhập.' }, 401)
  const decision = accessDecision(await lookupProfile(env, user.id))
  if (!decision.allow) return json({ error: decision.error }, decision.status)
  return { ...user, role: decision.role }
}

/** Require a signed-in admin; returns the admin or a Response. */
export async function requireAdmin(env: Env, request: Request): Promise<AuthedUser | Response> {
  const user = await getUser(env, request)
  if (!user) return json({ error: 'Chưa đăng nhập.' }, 401)
  const decision = adminDecision(await lookupProfile(env, user.id))
  if (!decision.allow) return json({ error: decision.error }, decision.status)
  return { ...user, role: decision.role }
}

/**
 * Count one AI request for today and return the learner's new total, or null
 * when the counter is unavailable.
 *
 * Null deliberately means "carry on without a cap": if the migration adding
 * public.ai_usage has not been run yet, or Postgres is briefly unreachable, the
 * tutor must keep answering rather than appear broken. Losing the cap for the
 * duration of an outage is the cheaper failure.
 */
export async function bumpAiUsage(env: Env, userId: string): Promise<number | null> {
  if (!isUuid(userId) || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const r = await adminRest(env, '/rpc/bump_ai_usage', {
      method: 'POST',
      body: JSON.stringify({ p_user: userId }),
    })
    if (!r.ok) {
      // Loud in the Pages Functions log, because failing open is otherwise
      // completely invisible: a stale PostgREST schema cache right after the
      // migration looks exactly like a working cap. A 404 here means the
      // function is not visible to the API — run `notify pgrst, 'reload schema';`
      const detail = await r.text().catch(() => '')
      console.warn(`[ai-quota] bump_ai_usage ${r.status}: ${detail}`.slice(0, 300))
      return null
    }
    const n = await r.json()
    if (typeof n !== 'number') {
      console.warn(`[ai-quota] bump_ai_usage returned ${typeof n}, expected a number`)
      return null
    }
    return n
  } catch (err) {
    console.warn('[ai-quota] bump_ai_usage unreachable:', err)
    return null
  }
}
