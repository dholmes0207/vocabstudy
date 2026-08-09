// Shared helpers for Cloudflare Pages Functions (Workers runtime).
// Secrets live in Cloudflare env: OPENAI_API_KEY, SUPABASE_URL,
// SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.

export interface Env {
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
  OPENAI_BASE_URL?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export interface Ctx {
  request: Request
  env: Env
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

/** Verify the Supabase access token in the Authorization header → the user. */
export async function getUser(env: Env, request: Request): Promise<{ id: string; email: string } | null> {
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

export async function getProfile(env: Env, userId: string): Promise<{ role: string; status: string } | null> {
  const r = await adminRest(env, `/profiles?id=eq.${userId}&select=role,status`)
  if (!r.ok) return null
  const rows = (await r.json()) as { role: string; status: string }[]
  return rows[0] ?? null
}

/** Require a logged-in, active user; returns the user or a Response to return. */
export async function requireUser(env: Env, request: Request): Promise<{ id: string; email: string } | Response> {
  const user = await getUser(env, request)
  if (!user) return json({ error: 'Chưa đăng nhập.' }, 401)
  const profile = await getProfile(env, user.id)
  if (profile?.status === 'locked') return json({ error: 'Tài khoản đã bị khoá.' }, 403)
  return user
}
