import { create } from 'zustand'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { accountBlockMessage } from '@/lib/authz'
import { readCachedUser, writeCachedUser, type CachedUser } from '@/lib/authCache'
import { tx } from '@/lib/i18n'
import { useSettings } from '@/store/settingsStore'

// Auth via Supabase Auth. The session is managed by supabase-js (stored +
// auto-refreshed); we mirror the current user + their profile (role/status).
//
// Two things keep the header snappy (docs/design/registration-approval.md):
// the last confirmed user is cached on the device and shown immediately, and
// the check against Supabase can never leave the app stuck in "loading".

export type AuthUser = CachedUser

type Status = 'loading' | 'ready'

interface AuthState {
  user: AuthUser | null
  status: Status
  /** True after register when the project requires email confirmation. */
  needsEmailConfirm: boolean
  /** True after register when the new account waits for an admin's approval. */
  pendingApproval: boolean
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

/** How long the start-up session check may take before the app stops waiting on it. */
const BOOT_TIMEOUT_MS = 8000

async function loadProfile(userId: string, email: string): Promise<AuthUser | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('name, role, status')
    .eq('id', userId)
    .single()
  // A failed lookup must not quietly turn into "a student": callers keep what
  // they had instead (see onAuthStateChange / bootstrap).
  if (error && error.code !== 'PGRST116') return null
  if (!data) return { id: userId, email, name: '', role: 'student', status: 'active' }
  return {
    id: userId,
    email,
    name: data.name ?? '',
    role: data.role === 'admin' ? 'admin' : 'student',
    status: data.status === 'locked' || data.status === 'pending' ? data.status : 'active',
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | 'timeout'> {
  return Promise.race([p, new Promise<'timeout'>((r) => setTimeout(() => r('timeout'), ms))])
}

let subscribed = false

export const useAuth = create<AuthState>((set, get) => {
  /** Set the signed-in user and remember it for the next visit. */
  const setUser = (user: AuthUser | null) => {
    writeCachedUser(user)
    set({ user })
  }

  /** A profile that may not use the app yet is signed out on the spot. */
  const admit = async (profile: AuthUser | null): Promise<string | null> => {
    const blocked = accountBlockMessage(profile?.status, useSettings.getState().uiLang)
    if (blocked) {
      await supabase?.auth.signOut()
      setUser(null)
      return blocked
    }
    if (profile) setUser(profile)
    return null
  }

  return {
    user: readCachedUser(),
    status: 'loading',
    needsEmailConfirm: false,
    pendingApproval: false,

    bootstrap: async () => {
      if (!supabaseConfigured || !supabase) {
        setUser(null)
        set({ status: 'ready' })
        return
      }
      const client = supabase
      try {
        const res = await withTimeout(client.auth.getSession(), BOOT_TIMEOUT_MS)
        if (res !== 'timeout') {
          const session = res.data.session
          if (session?.user) {
            await admit(await loadProfile(session.user.id, session.user.email ?? ''))
          } else {
            setUser(null)
          }
        }
        // On a timeout keep whatever the cache said; the listener below
        // corrects it as soon as Supabase answers.
      } catch {
        // Network trouble: keep the cached user, the app still works offline.
      } finally {
        set({ status: 'ready' })
      }

      if (subscribed) return
      subscribed = true
      // Keep in sync with future auth changes (token refresh, other tabs).
      // The callback must not await another Supabase call directly: supabase-js
      // runs it while holding its auth lock, and a nested call waits for that
      // same lock — every later request (sync, login) then hangs forever.
      client.auth.onAuthStateChange((event, s) => {
        if (!s?.user) {
          if (event === 'SIGNED_OUT' || get().user) setUser(null)
          return
        }
        const { id, email } = s.user
        setTimeout(async () => {
          const profile = await loadProfile(id, email ?? '')
          // By now the session may be gone (a pending sign-up is signed out
          // straight away); an anonymous lookup finds no row and must not be
          // mistaken for a fresh student account.
          const { data } = await client.auth.getSession()
          if (data.session?.user.id !== id) return
          if (profile) await admit(profile)
        }, 0)
      })
    },

    login: async (email, password) => {
      if (!supabase) throw new Error(tx('Chưa cấu hình Supabase.', 'Supabase is not configured.'))
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(mapAuthError(error.message))
      const profile = await loadProfile(data.user.id, data.user.email ?? '')
      if (!profile) {
        await supabase.auth.signOut()
        throw new Error(
          tx(
            'Chưa kiểm tra được tài khoản. Thử lại sau giây lát nhé.',
            "Couldn't verify the account. Please try again in a moment."
          )
        )
      }
      const blocked = await admit(profile)
      if (blocked) throw new Error(blocked)
    },

    register: async (email, password, name) => {
      if (!supabase) throw new Error(tx('Chưa cấu hình Supabase.', 'Supabase is not configured.'))
      set({ needsEmailConfirm: false, pendingApproval: false })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name ?? '' } },
      })
      if (error) throw new Error(mapAuthError(error.message))
      if (data.session?.user) {
        const profile = await loadProfile(data.session.user.id, data.session.user.email ?? '')
        if (profile?.status === 'pending') {
          await admit(profile)
          set({ pendingApproval: true })
        } else if (profile) {
          await admit(profile)
        }
      } else {
        // Email confirmation required by the project settings.
        set({ needsEmailConfirm: true })
      }
    },

    logout: async () => {
      if (supabase) await supabase.auth.signOut()
      setUser(null)
    },
  }
})

export const isAdmin = (u: AuthUser | null): boolean => u?.role === 'admin'

function mapAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login'))
    return tx('Email hoặc mật khẩu không đúng.', 'Wrong email or password.')
  if (m.includes('email not confirmed'))
    return tx(
      'Email chưa được xác nhận — mở hộp thư để xác nhận nhé.',
      'Your email is not confirmed yet — check your inbox.'
    )
  if (m.includes('already registered') || m.includes('already exists'))
    return tx('Email đã được đăng ký.', 'This email is already registered.')
  if (m.includes('password'))
    return tx(
      'Mật khẩu chưa hợp lệ (tối thiểu 6 ký tự).',
      'Invalid password (at least 6 characters).'
    )
  if (m.includes('email')) return tx('Email không hợp lệ.', 'Invalid email address.')
  return msg
}
