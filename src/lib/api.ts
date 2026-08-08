// Typed client for the backend API. Cookies (HttpOnly auth) ride along via
// credentials: 'include'. Throws ApiError with a friendly message on failure.

export interface ApiUser {
  id: number
  email: string
  name: string
  role: 'student' | 'admin'
  status: 'active' | 'locked'
  createdAt: string
  lastLoginAt: string | null
}

export interface ServerProvider {
  id: number
  label: string
  model: string
  isActive: boolean
}

/** Admin view of a provider (includes the key). */
export interface AdminProvider extends ServerProvider {
  apiKey: string
  baseUrl: string
  createdAt: string
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
      ...options,
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
  // Auth
  register: (email: string, password: string, name?: string) =>
    req<{ user: ApiUser }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    req<{ user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => req<{ ok: true }>('/auth/logout', { method: 'POST' }),
  me: () => req<{ user: ApiUser }>('/auth/me'),

  // Progress sync
  getProgress: (lang: string) => req<{ data: unknown | null; updatedAt: string | null }>(`/progress/${lang}`),
  putProgress: (lang: string, data: unknown) =>
    req<{ updatedAt: string }>(`/progress/${lang}`, { method: 'PUT', body: JSON.stringify({ data }) }),

  // AI (server proxy — key stays server-side)
  aiProviders: () => req<{ configured: boolean; providers: ServerProvider[] }>('/ai/providers'),
  aiChat: (payload: { history: { role: 'user' | 'assistant'; content: string }[]; level?: number; context?: string; providerId?: number }) =>
    req<{ reply: string; remaining: number }>('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),

  // Admin — users
  adminUsers: () => req<{ users: ApiUser[] }>('/admin/users'),
  adminPatchUser: (id: number, patch: { role?: 'student' | 'admin'; status?: 'active' | 'locked' }) =>
    req<{ user: ApiUser }>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  adminResetPassword: (id: number, password: string) =>
    req<{ ok: true }>(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }),
  adminDeleteUser: (id: number) => req<{ ok: true }>(`/admin/users/${id}`, { method: 'DELETE' }),

  // Admin — AI providers
  adminProviders: () => req<{ providers: AdminProvider[] }>('/admin/ai-providers'),
  adminAddProvider: (p: { label: string; model: string; apiKey: string; baseUrl: string }) =>
    req<{ id: number }>('/admin/ai-providers', { method: 'POST', body: JSON.stringify(p) }),
  adminPatchProvider: (id: number, patch: Partial<{ label: string; model: string; apiKey: string; baseUrl: string; isActive: boolean }>) =>
    req<{ ok: true }>(`/admin/ai-providers/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  adminDeleteProvider: (id: number) => req<{ ok: true }>(`/admin/ai-providers/${id}`, { method: 'DELETE' }),
}
