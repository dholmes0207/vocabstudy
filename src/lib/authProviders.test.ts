import { describe, expect, it } from 'vitest'
import {
  PENDING_CONSENT_KEY,
  hasPasswordLogin,
  parseProviders,
  savePendingConsent,
  takePendingConsent,
} from './authProviders'

function store() {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  }
}

describe('parseProviders', () => {
  it('reads whether Google is switched on in Supabase', () => {
    expect(parseProviders({ external: { google: true, email: true } })).toEqual({ google: true })
    expect(parseProviders({ external: { google: false } })).toEqual({ google: false })
    expect(parseProviders(null)).toEqual({ google: false })
    expect(parseProviders('nope')).toEqual({ google: false })
  })
})

describe('hasPasswordLogin', () => {
  it('knows a Google-only account has no password', () => {
    expect(hasPasswordLogin({ identities: [{ provider: 'google' }] })).toBe(false)
    expect(hasPasswordLogin({ identities: [{ provider: 'google' }, { provider: 'email' }] })).toBe(
      true
    )
  })

  it('assumes a password when it cannot tell', () => {
    expect(hasPasswordLogin({})).toBe(true)
    expect(hasPasswordLogin({ identities: [] })).toBe(true)
  })
})

describe('pending consent', () => {
  const t0 = new Date('2026-10-14T10:00:00Z')

  it('carries the consent across the trip to Google, once', () => {
    const s = store()
    savePendingConsent(s, '2026-10-14', t0)
    const back = new Date(t0.getTime() + 60_000)
    expect(takePendingConsent(s, back)).toEqual({
      version: '2026-10-14',
      at: t0.toISOString(),
      method: 'google',
    })
    expect(takePendingConsent(s, back)).toBeNull()
  })

  it('ignores a stale or corrupt record, and clears it', () => {
    const s = store()
    savePendingConsent(s, '2026-10-14', t0)
    expect(takePendingConsent(s, new Date(t0.getTime() + 60 * 60_000))).toBeNull()
    s.setItem(PENDING_CONSENT_KEY, '{oops')
    expect(takePendingConsent(s, t0)).toBeNull()
    expect(s.getItem(PENDING_CONSENT_KEY)).toBeNull()
  })
})
