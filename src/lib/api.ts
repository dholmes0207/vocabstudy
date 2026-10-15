import { getAccessToken } from './supabase'
import { tx } from './i18n'

// Client for the Cloudflare Pages Functions API (server-side pieces that must
// hold secrets): the AI proxy and admin operations. Auth and progress talk to
// Supabase directly (see authStore / useProgressSync). Requests carry the
// Supabase access token as a Bearer so the Function can verify the caller.

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'student' | 'admin'
  status: 'active' | 'locked' | 'pending'
  created_at: string
  last_sign_in_at: string | null
}

/** Whether the AI daily cap is actually counting, plus today's figures. */
export interface AiUsageReport {
  limit: number
  /** The day being reported, on Vietnam time (matches the SQL counter). */
  day: string
  /** False means the cap is silently inactive — requests are not being counted. */
  reachable: boolean
  today: { users: number; requests: number }
  error?: string
}

/** One grouped bug from learners' browsers (docs/design/error-reports.md). */
export interface ClientErrorRow {
  signature: string
  message: string
  stack: string
  path: string
  release: string
  kind: string
  count: number
  first_seen: string
  last_seen: string
}

/** A learner's message from the in-app form (docs/design/feedback.md). */
export interface FeedbackRow {
  id: string
  created_at: string
  name: string
  message: string
  rating: number | null
  allow_quote: boolean
  featured: boolean
  page: string
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    })
  } catch {
    throw new ApiError(
      0,
      tx(
        'Không kết nối được máy chủ. Kiểm tra mạng nhé.',
        "Can't reach the server. Check your connection."
      )
    )
  }
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json().catch(() => ({})) : {}
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `Lỗi (${res.status})`)
  return body as T
}

export const api = {
  // AI (Cloudflare Pages Function — OpenAI key stays a server-side secret)
  aiStatus: () => req<{ configured: boolean; model: string }>('/ai/status'),
  aiChat: (payload: {
    history: { role: 'user' | 'assistant'; content: string }[]
    level?: number
    context?: string
    /** Interface language, so the tutor replies in it. */
    lang?: 'vi' | 'en'
    /** The language pack being studied (only allow-listed codes matter server-side). */
    target?: string
  }) =>
    req<{ reply: string; remaining?: number }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // The in-app feedback form (docs/design/feedback.md); guests may send too.
  sendFeedback: (f: {
    message: string
    name: string
    rating: number | null
    allowQuote: boolean
    page: string
  }) => req<{ ok: true }>('/feedback', { method: 'POST', body: JSON.stringify(f) }),

  // The signed-in learner's own account (docs/design/account.md)
  deleteAccount: () => req<{ ok: true }>('/account', { method: 'DELETE' }),
  updateDisplayName: (name: string) =>
    req<{ ok: true; name: string }>('/account', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  // Admin (Function uses the Supabase service-role key to bypass RLS)
  adminUsers: () => req<{ users: AdminUser[] }>('/admin/users'),
  adminAiUsage: () => req<AiUsageReport>('/admin/ai-usage'),
  adminFeedback: () => req<{ enabled: boolean; feedback: FeedbackRow[] }>('/admin/feedback'),
  adminFeatureFeedback: (id: string, featured: boolean) =>
    req<{ ok: true }>('/admin/feedback', {
      method: 'PATCH',
      body: JSON.stringify({ id, featured }),
    }),
  adminErrors: () => req<{ enabled: boolean; errors: ClientErrorRow[] }>('/admin/errors'),
  adminPatchUser: (
    id: string,
    patch: { role?: 'student' | 'admin'; status?: 'active' | 'locked' }
  ) =>
    req<{ ok: true }>('/admin/users', { method: 'PATCH', body: JSON.stringify({ id, ...patch }) }),
  adminResetPassword: (id: string, password: string) =>
    req<{ ok: true }>('/admin/users', { method: 'POST', body: JSON.stringify({ id, password }) }),
  adminDeleteUser: (id: string) =>
    req<{ ok: true }>('/admin/users', { method: 'DELETE', body: JSON.stringify({ id }) }),
}
