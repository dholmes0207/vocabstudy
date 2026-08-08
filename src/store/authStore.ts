import { create } from 'zustand'
import { api, ApiError, type ApiUser } from '@/lib/api'

// Auth state. The session itself lives in an HttpOnly cookie (not readable by
// JS); we mirror the current user in memory and bootstrap it via /auth/me.

type Status = 'loading' | 'ready'

interface AuthState {
  user: ApiUser | null
  status: Status
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (u: ApiUser | null) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  bootstrap: async () => {
    try {
      const { user } = await api.me()
      set({ user, status: 'ready' })
    } catch {
      set({ user: null, status: 'ready' })
    }
  },
  login: async (email, password) => {
    const { user } = await api.login(email, password)
    set({ user })
  },
  register: async (email, password, name) => {
    const { user } = await api.register(email, password, name)
    set({ user })
  },
  logout: async () => {
    try {
      await api.logout()
    } catch (e) {
      if (!(e instanceof ApiError)) throw e
    }
    set({ user: null })
  },
  setUser: (user) => set({ user }),
}))

export const isAdmin = (u: ApiUser | null): boolean => u?.role === 'admin'
