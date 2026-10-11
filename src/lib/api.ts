import { getAccessToken } from './supabase'

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
    throw new ApiError(0, 'Không kết nối được máy chủ. Kiểm tra mạng nhé.')
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
  }) =>
    req<{ reply: string; remaining?: number }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Admin (Function uses the Supabase service-role key to bypass RLS)
  adminUsers: () => req<{ users: AdminUser[] }>('/admin/users'),
  adminAiUsage: () => req<AiUsageReport>('/admin/ai-usage'),
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
