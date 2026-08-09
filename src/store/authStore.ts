import { create } from 'zustand'
import { supabase, supabaseConfigured } from '@/lib/supabase'

// Auth via Supabase Auth. The session is managed by supabase-js (stored +
// auto-refreshed); we mirror the current user + their profile (role/status).

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'student' | 'admin'
  status: 'active' | 'locked'
}

type Status = 'loading' | 'ready'

interface AuthState {
  user: AuthUser | null
  status: Status
  /** True after register when the project requires email confirmation. */
  needsEmailConfirm: boolean
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

async function loadProfile(userId: string, email: string): Promise<AuthUser | null> {
  if (!supabase) return null
  const { data } = await supabase.from('profiles').select('name, role, status').eq('id', userId).single()
  if (!data) return { id: userId, email, name: '', role: 'student', status: 'active' }
  return { id: userId, email, name: data.name ?? '', role: data.role, status: data.status }
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: 'loading',
  needsEmailConfirm: false,

  bootstrap: async () => {
    if (!supabaseConfigured || !supabase) {
      set({ status: 'ready', user: null })
      return
    }
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (session?.user) {
      const profile = await loadProfile(session.user.id, session.user.email ?? '')
      if (profile?.status === 'locked') {
        await supabase.auth.signOut()
        set({ user: null, status: 'ready' })
      } else {
        set({ user: profile, status: 'ready' })
      }
    } else {
      set({ user: null, status: 'ready' })
    }
    // Keep in sync with future auth changes (token refresh, other tabs).
    supabase.auth.onAuthStateChange(async (_event, s) => {
      if (s?.user) {
        set({ user: await loadProfile(s.user.id, s.user.email ?? '') })
      } else if (get().user) {
        set({ user: null })
      }
    })
  },

  login: async (email, password) => {
    if (!supabase) throw new Error('Chưa cấu hình Supabase.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(mapAuthError(error.message))
    const profile = await loadProfile(data.user.id, data.user.email ?? '')
    if (profile?.status === 'locked') {
      await supabase.auth.signOut()
      throw new Error('Tài khoản đã bị khoá. Liên hệ quản trị viên.')
    }
    set({ user: profile })
  },

  register: async (email, password, name) => {
    if (!supabase) throw new Error('Chưa cấu hình Supabase.')
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: name ?? '' } } })
    if (error) throw new Error(mapAuthError(error.message))
    if (data.session?.user) {
      set({ user: await loadProfile(data.session.user.id, data.session.user.email ?? ''), needsEmailConfirm: false })
    } else {
      // Email confirmation required by the project settings.
      set({ needsEmailConfirm: true })
    }
  },

  logout: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null })
  },
}))

export const isAdmin = (u: AuthUser | null): boolean => u?.role === 'admin'

function mapAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'Email hoặc mật khẩu không đúng.'
  if (m.includes('already registered') || m.includes('already exists')) return 'Email đã được đăng ký.'
  if (m.includes('password')) return 'Mật khẩu chưa hợp lệ (tối thiểu 6 ký tự).'
  if (m.includes('email')) return 'Email không hợp lệ.'
  return msg
}
