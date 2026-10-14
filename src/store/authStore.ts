import { create } from 'zustand'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { accountBlockMessage } from '@/lib/authz'
import { readCachedUser, writeCachedUser, type CachedUser } from '@/lib/authCache'
import { tx } from '@/lib/i18n'
import { ApiError, api } from '@/lib/api'
import { CONTACT_EMAIL } from '@/lib/site'
import { cleanDisplayName } from '@/lib/displayName'
import { hasPasswordLogin, savePendingConsent, takePendingConsent } from '@/lib/authProviders'
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
  /**
   * Why a sign-in that finished away from the sign-in page was turned back —
   * a new Google account on the waitlist, say. Shown by AuthNotice, worded in
   * whatever language the interface is in by then. Cleared as soon as anyone
   * signs in successfully, so it never follows a different account around.
   */
  notice: 'pending' | 'locked' | null
  clearNotice: () => void
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  /**
   * Create an account. `consentVersion` is the POLICY_VERSION the person ticked
   * "I agree" to; it is stored with the account as proof of consent.
   */
  register: (
    email: string,
    password: string,
    name?: string,
    consentVersion?: string
  ) => Promise<void>
  logout: () => Promise<void>
  /**
   * Leave for Google's sign-in page. Tapping the button is the consent to
   * `consentVersion`; it is recorded when Google sends the person back.
   */
  signInWithGoogle: (consentVersion: string) => Promise<void>
  /** Email a password-reset link. Says nothing about whether the address exists. */
  requestPasswordReset: (email: string) => Promise<void>
  /** Change the name shown in the account menu and on the Admin page. */
  updateDisplayName: (name: string) => Promise<void>
  /** Set a new password for the signed-in (or recovering) user. */
  updatePassword: (password: string) => Promise<void>
  /**
   * Erase the account and its synced data. `confirmation` is the password, or
   * — for an account that only signs in with Google — the account's email.
   */
  deleteAccount: (confirmation: string) => Promise<void>
}

/** How long the start-up session check may take before the app stops waiting on it. */
const BOOT_TIMEOUT_MS = 8000

async function loadProfile(user: User): Promise<AuthUser | null> {
  if (!supabase) return null
  const userId = user.id
  const email = user.email ?? ''
  const hasPassword = hasPasswordLogin(user)
  const { data, error } = await supabase
    .from('profiles')
    .select('name, role, status')
    .eq('id', userId)
    .single()
  // A failed lookup must not quietly turn into "a student": callers keep what
  // they had instead (see onAuthStateChange / bootstrap).
  if (error && error.code !== 'PGRST116') return null
  if (!data) return { id: userId, email, name: '', role: 'student', status: 'active', hasPassword }
  return {
    id: userId,
    email,
    name: data.name ?? '',
    role: data.role === 'admin' ? 'admin' : 'student',
    status: data.status === 'locked' || data.status === 'pending' ? data.status : 'active',
    hasPassword,
  }
}

/**
 * Back from Google: store the consent given by the tap (docs/design/google-login.md)
 * before anything else — a new account is about to be signed out again if it
 * lands on the waitlist. Only for a Google sign-in, and only if this version
 * is not on record yet.
 */
async function recordGoogleConsent(client: SupabaseClient, user: User): Promise<void> {
  const pending = takePendingConsent(sessionStorage)
  if (!pending) return
  const viaGoogle = user.identities?.some((i) => i.provider === 'google') ?? false
  if (!viaGoogle || user.user_metadata?.consent_version === pending.version) return
  await client.auth
    .updateUser({
      data: {
        consent_version: pending.version,
        consented_at: pending.at,
        consent_method: pending.method,
      },
    })
    .catch(() => undefined)
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
    if (profile) {
      setUser(profile)
      // Whoever was turned away before, this account is in.
      set({ notice: null })
    }
    return null
  }

  return {
    user: readCachedUser(),
    status: 'loading',
    needsEmailConfirm: false,
    pendingApproval: false,
    notice: null,
    clearNotice: () => set({ notice: null }),

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
            await recordGoogleConsent(client, session.user)
            const profile = await loadProfile(session.user)
            if (await admit(profile)) set({ notice: blockedStatus(profile) })
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
        const user = s.user
        const { id } = user
        setTimeout(async () => {
          await recordGoogleConsent(client, user)
          const profile = await loadProfile(user)
          // By now the session may be gone (a pending sign-up is signed out
          // straight away); an anonymous lookup finds no row and must not be
          // mistaken for a fresh student account.
          const { data } = await client.auth.getSession()
          if (data.session?.user.id !== id) return
          if (!profile) return
          if (await admit(profile)) set({ notice: blockedStatus(profile) })
        }, 0)
      })
    },

    login: async (email, password) => {
      if (!supabase) throw new Error(tx('Chưa cấu hình Supabase.', 'Supabase is not configured.'))
      set({ notice: null })
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(mapAuthError(error.message))
      const profile = await loadProfile(data.user)
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

    register: async (email, password, name, consentVersion) => {
      if (!supabase) throw new Error(tx('Chưa cấu hình Supabase.', 'Supabase is not configured.'))
      set({ needsEmailConfirm: false, pendingApproval: false })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // The confirmation link opens the app, not the landing page. Supabase
        // honours it only if it is in Auth → URL Configuration → Redirect URLs;
        // otherwise it falls back to the Site URL and "/" forwards it anyway.
        options: {
          data: {
            name: name ?? '',
            // Proof of consent (Personal Data Protection Law 2025): which
            // version of the terms and policy, and when. Kept in the auth
            // user's metadata; the profile trigger only reads `name`.
            ...(consentVersion
              ? { consent_version: consentVersion, consented_at: new Date().toISOString() }
              : {}),
          },
          emailRedirectTo: `${window.location.origin}/home`,
        },
      })
      if (error) throw new Error(mapAuthError(error.message))
      if (data.session?.user) {
        const profile = await loadProfile(data.session.user)
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

    signInWithGoogle: async (consentVersion) => {
      if (!supabase) throw new Error(tx('Chưa cấu hình Supabase.', 'Supabase is not configured.'))
      set({ notice: null })
      savePendingConsent(sessionStorage, consentVersion)
      // Google sends the person back to the app; if this address is not in
      // Supabase's Redirect URLs it falls back to the Site URL, and "/"
      // forwards the fragment to /home anyway.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/home` },
      })
      if (error) {
        takePendingConsent(sessionStorage)
        throw new Error(
          tx(
            'Chưa mở được đăng nhập Google. Thử lại sau giây lát nhé.',
            "Couldn't open Google sign-in. Please try again in a moment."
          )
        )
      }
    },

    requestPasswordReset: async (email) => {
      if (!supabase) throw new Error(tx('Chưa cấu hình Supabase.', 'Supabase is not configured.'))
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (!error) return
      if (/rate limit|security purposes|too many/i.test(error.message))
        throw new Error(
          tx(
            'Bạn vừa yêu cầu rồi — đợi một phút rồi thử lại nhé.',
            'You just asked for one — wait a minute and try again.'
          )
        )
      throw new Error(
        tx(
          `Chưa gửi được email lúc này. Thử lại sau, hoặc viết cho ${CONTACT_EMAIL} để được giúp.`,
          `We couldn't send the email right now. Try again later, or write to ${CONTACT_EMAIL} for help.`
        )
      )
    },

    updateDisplayName: async (raw) => {
      const user = get().user
      if (!user) throw new Error(tx('Bạn chưa đăng nhập.', 'You are not signed in.'))
      const name = cleanDisplayName(raw)
      if (name === null)
        throw new Error(
          tx('Tên hiển thị tối đa 50 ký tự.', 'The display name can be at most 50 characters.')
        )
      // Profiles have no user-facing UPDATE policy (no one may change their
      // own role), so the name goes through the /api/account Function.
      const failure = await api.updateDisplayName(name).then(
        () => null,
        (e: unknown) => e
      )
      if (failure) {
        const offline = failure instanceof ApiError && failure.status === 0
        throw new Error(
          offline
            ? failure.message
            : tx(
                'Chưa đổi được tên. Thử lại sau giây lát nhé.',
                "Couldn't change the name. Please try again in a moment."
              )
        )
      }
      const current = get().user
      if (current?.id === user.id) setUser({ ...current, name })
    },

    updatePassword: async (password) => {
      if (!supabase) throw new Error(tx('Chưa cấu hình Supabase.', 'Supabase is not configured.'))
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw new Error(mapAuthError(error.message))
      // A Google-only account can now also sign in with email + password.
      const user = get().user
      if (user && user.hasPassword === false) setUser({ ...user, hasPassword: true })
    },

    deleteAccount: async (confirmation) => {
      const client = supabase
      const user = get().user
      if (!client || !user) throw new Error(tx('Bạn chưa đăng nhập.', 'You are not signed in.'))
      if (user.role === 'admin') throw new Error(ADMIN_CANNOT_DELETE())
      if (user.hasPassword === false) {
        // A Google-only account has no password to re-check; typing the
        // account's email is the deliberate step instead.
        if (confirmation.trim().toLowerCase() !== user.email.toLowerCase())
          throw new Error(
            tx('Email chưa khớp với tài khoản này.', 'That email does not match this account.')
          )
      } else {
        // Re-check the password: an unlocked phone in someone else's hands
        // must not be enough to erase an account.
        const { error } = await client.auth.signInWithPassword({
          email: user.email,
          password: confirmation,
        })
        if (error)
          throw new Error(
            /invalid login/i.test(error.message)
              ? tx('Mật khẩu không đúng.', 'Wrong password.')
              : mapAuthError(error.message)
          )
      }
      const failure = await api.deleteAccount().then(
        () => null,
        (e: unknown) => e
      )
      if (failure) {
        // A network failure already says "check your connection"; anything the
        // server says is in one language only, so replace it.
        const offline = failure instanceof ApiError && failure.status === 0
        throw new Error(
          offline
            ? failure.message
            : tx(
                `Chưa xoá được tài khoản. Thử lại sau, hoặc viết cho ${CONTACT_EMAIL}.`,
                `We couldn't delete the account. Try again later, or write to ${CONTACT_EMAIL}.`
              )
        )
      }
      // The server copy is gone, so only the local session is left to drop.
      await client.auth.signOut({ scope: 'local' })
      setUser(null)
    },
  }
})

export const isAdmin = (u: AuthUser | null): boolean => u?.role === 'admin'

/** The status that kept a profile out (only called once admit refused it). */
function blockedStatus(profile: AuthUser | null): 'pending' | 'locked' {
  return profile?.status === 'locked' ? 'locked' : 'pending'
}

/** Admins keep their account so there is always someone to let learners in. */
export const ADMIN_CANNOT_DELETE = () =>
  tx(
    'Tài khoản quản trị không tự xoá được — hãy chuyển quyền quản trị cho người khác trước.',
    'An admin account cannot delete itself — hand the admin role to someone else first.'
  )

function mapAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login'))
    return tx('Email hoặc mật khẩu không đúng.', 'Wrong email or password.')
  if (m.includes('email not confirmed'))
    return tx(
      'Email chưa được xác nhận — mở hộp thư để xác nhận nhé.',
      'Your email is not confirmed yet — check your inbox.'
    )
  if (m.includes('different from the old'))
    return tx(
      'Mật khẩu mới phải khác mật khẩu cũ.',
      'The new password must be different from the old one.'
    )
  if (m.includes('session missing') || m.includes('session not found'))
    return tx(
      'Phiên đã hết hạn — mở lại link trong email hoặc đăng nhập lại nhé.',
      'Your session has expired — open the email link again or sign in again.'
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
