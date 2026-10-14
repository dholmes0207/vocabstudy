/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The self-service account actions (docs/design/account.md) against a fake
// Supabase client: what is sent, and what the learner is told when it fails.

const { auth, from, deleteAccountApi } = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe() {} } } })),
    signInWithOAuth: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
  deleteAccountApi: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: { auth, from },
  supabaseConfigured: true,
  getAccessToken: async () => 'token',
}))

vi.mock('@/lib/api', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/api')>()
  return { ...real, api: { ...real.api, deleteAccount: deleteAccountApi } }
})

import { ApiError } from '@/lib/api'
import { PENDING_CONSENT_KEY, savePendingConsent } from '@/lib/authProviders'
import { useAuth } from './authStore'
import { useSettings } from './settingsStore'

const learner = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'lan@example.com',
  name: 'Lan',
  role: 'student' as const,
  status: 'active' as const,
}

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  useAuth.setState({ user: learner })
  auth.signOut.mockResolvedValue({ error: null })
})
afterEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

/** `from('profiles').select().eq().single()` answering with this row. */
function profileRow(row: Record<string, string>) {
  const q = { select: () => q, eq: () => q, single: async () => ({ data: row, error: null }) }
  return q
}

describe('Continue with Google', () => {
  it('remembers the consent, then leaves for Google with a way back to the app', async () => {
    auth.signInWithOAuth.mockResolvedValue({ error: null })
    await useAuth.getState().signInWithGoogle('2026-10-14')
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    })
    expect(JSON.parse(sessionStorage.getItem(PENDING_CONSENT_KEY)!)).toMatchObject({
      version: '2026-10-14',
      method: 'google',
    })
  })

  it('forgets the consent if Google sign-in cannot start', async () => {
    auth.signInWithOAuth.mockResolvedValue({ error: { message: 'provider is not enabled' } })
    await expect(useAuth.getState().signInWithGoogle('2026-10-14')).rejects.toThrow(
      /Couldn't open Google sign-in/
    )
    expect(sessionStorage.getItem(PENDING_CONSENT_KEY)).toBeNull()
  })

  it('back from Google: records consent first, then explains the waitlist', async () => {
    savePendingConsent(sessionStorage, '2026-10-14')
    const user = {
      id: learner.id,
      email: learner.email,
      identities: [{ provider: 'google' }],
      user_metadata: {},
    }
    auth.getSession.mockResolvedValue({ data: { session: { user } } })
    auth.updateUser.mockResolvedValue({ error: null })
    from.mockReturnValue(profileRow({ name: 'Lan', role: 'student', status: 'pending' }))
    useAuth.setState({ user: null, notice: null })

    await useAuth.getState().bootstrap()

    expect(auth.updateUser).toHaveBeenCalledWith({
      data: {
        consent_version: '2026-10-14',
        consented_at: expect.any(String),
        consent_method: 'google',
      },
    })
    expect(auth.updateUser.mock.invocationCallOrder[0]).toBeLessThan(
      auth.signOut.mock.invocationCallOrder[0]
    )
    expect(useAuth.getState().user).toBeNull()
    expect(useAuth.getState().notice).toMatch(/beta waitlist/)
  })

  it('signs an approved Google account in and knows it has no password', async () => {
    const user = { id: learner.id, email: learner.email, identities: [{ provider: 'google' }] }
    auth.getSession.mockResolvedValue({ data: { session: { user } } })
    from.mockReturnValue(profileRow({ name: 'Lan', role: 'student', status: 'active' }))
    useAuth.setState({ user: null, notice: null })

    await useAuth.getState().bootstrap()

    expect(auth.updateUser).not.toHaveBeenCalled()
    expect(useAuth.getState().user).toMatchObject({ email: learner.email, hasPassword: false })
    expect(useAuth.getState().notice).toBeNull()
  })
})

describe('register', () => {
  it('stores which version of the terms and policy the person accepted, and when', async () => {
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null })
    await useAuth.getState().register('lan@example.com', 'secret1', 'Lan', '2026-10-14')
    const { options } = auth.signUp.mock.calls[0][0]
    expect(options.data).toMatchObject({ name: 'Lan', consent_version: '2026-10-14' })
    expect(Number.isNaN(Date.parse(options.data.consented_at))).toBe(false)
    expect(useAuth.getState().needsEmailConfirm).toBe(true)
  })
})

describe('requestPasswordReset', () => {
  it('asks Supabase for a link back to the reset page', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null })
    await useAuth.getState().requestPasswordReset('lan@example.com')
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('lan@example.com', {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  })

  it('asks the learner to wait when they request too often', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      error: { message: 'For security purposes, you can only request this after 42 seconds.' },
    })
    await expect(useAuth.getState().requestPasswordReset('lan@example.com')).rejects.toThrow(
      /wait a minute/
    )
  })

  it('points to a human when the email cannot be sent', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: { message: 'Error sending email' } })
    await expect(useAuth.getState().requestPasswordReset('lan@example.com')).rejects.toThrow(
      /contact@vocastudy\.app/
    )
  })
})

describe('updatePassword', () => {
  it('lets a Google-only account add a password', async () => {
    useAuth.setState({ user: { ...learner, hasPassword: false } })
    auth.updateUser.mockResolvedValue({ error: null })
    await useAuth.getState().updatePassword('secret12')
    expect(useAuth.getState().user?.hasPassword).toBe(true)
  })

  it('explains a reused password', async () => {
    auth.updateUser.mockResolvedValue({
      error: { message: 'New password should be different from the old password.' },
    })
    await expect(useAuth.getState().updatePassword('secret1')).rejects.toThrow(/different/)
  })
})

describe('deleteAccount', () => {
  it('re-checks the password, deletes on the server, then signs out here', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null })
    deleteAccountApi.mockResolvedValue({ ok: true })
    await useAuth.getState().deleteAccount('secret1')
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'lan@example.com',
      password: 'secret1',
    })
    expect(deleteAccountApi).toHaveBeenCalledOnce()
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(useAuth.getState().user).toBeNull()
  })

  it('deletes nothing when the password is wrong', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    await expect(useAuth.getState().deleteAccount('nope')).rejects.toThrow('Wrong password.')
    expect(deleteAccountApi).not.toHaveBeenCalled()
    expect(useAuth.getState().user).toEqual(learner)
  })

  it('keeps the learner signed in when the server refuses', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null })
    deleteAccountApi.mockRejectedValue(new ApiError(502, 'Xoá tài khoản thất bại.'))
    await expect(useAuth.getState().deleteAccount('secret1')).rejects.toThrow(
      /couldn't delete the account/
    )
    expect(auth.signOut).not.toHaveBeenCalled()
    expect(useAuth.getState().user).toEqual(learner)
  })

  it('asks a Google-only account for its email instead of a password', async () => {
    useAuth.setState({ user: { ...learner, hasPassword: false } })
    deleteAccountApi.mockResolvedValue({ ok: true })
    await expect(useAuth.getState().deleteAccount('someone@else.com')).rejects.toThrow(
      /does not match/
    )
    expect(deleteAccountApi).not.toHaveBeenCalled()
    await useAuth.getState().deleteAccount(' LAN@example.com ')
    expect(auth.signInWithPassword).not.toHaveBeenCalled()
    expect(deleteAccountApi).toHaveBeenCalledOnce()
  })

  it('never lets an admin delete their own account', async () => {
    useAuth.setState({ user: { ...learner, role: 'admin' } })
    await expect(useAuth.getState().deleteAccount('secret1')).rejects.toThrow(/admin/)
    expect(auth.signInWithPassword).not.toHaveBeenCalled()
    expect(deleteAccountApi).not.toHaveBeenCalled()
  })
})
