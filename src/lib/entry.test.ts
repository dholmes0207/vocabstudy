import { describe, expect, it } from 'vitest'
import { ENTERED_KEY, authCallbackPath, hasUsedApp, hashToPath, markEntered } from './entry'

function store(init: Record<string, string> = {}) {
  const data = new Map(Object.entries(init))
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  }
}

describe('hashToPath', () => {
  it('turns old hash routes into clean paths', () => {
    expect(hashToPath('#/phrases/food')).toBe('/phrases/food')
    expect(hashToPath('#/learn?quick=1')).toBe('/learn?quick=1')
    expect(hashToPath('#/')).toBe('/home')
  })

  it('leaves Supabase auth fragments and empty hashes alone', () => {
    expect(hashToPath('#access_token=abc&type=signup')).toBeNull()
    expect(hashToPath('')).toBeNull()
  })
})

describe('authCallbackPath', () => {
  it('sends Supabase confirmation and error redirects into the app', () => {
    expect(authCallbackPath('#access_token=abc&type=signup')).toBe('/home')
    expect(
      authCallbackPath('#error=access_denied&error_code=otp_expired&error_description=x')
    ).toBe('/home')
    expect(authCallbackPath('', '?code=123')).toBe('/home')
  })

  it('sends a password-reset link to the reset page', () => {
    expect(authCallbackPath('#access_token=abc&expires_in=3600&type=recovery')).toBe(
      '/reset-password'
    )
    expect(authCallbackPath('#access_token=abc&type=recoveryish')).toBe('/home')
  })

  it('ignores ordinary section links and queries', () => {
    expect(authCallbackPath('#features')).toBeNull()
    expect(authCallbackPath('')).toBeNull()
    expect(authCallbackPath('', '?quick=1')).toBeNull()
  })
})

describe('hasUsedApp', () => {
  it('is false for a brand-new visitor', () => {
    expect(hasUsedApp(store())).toBe(false)
  })

  it('remembers anyone who opened the app, signed in, or studied', () => {
    expect(hasUsedApp(store({ [ENTERED_KEY]: '1' }))).toBe(true)
    expect(hasUsedApp(store({ 'vocab.auth.user.v1': '{}' }))).toBe(true)
    const studied = JSON.stringify({
      state: { progress: { en: { cards: { 3: {} }, stats: { lastStudyDay: null } } } },
    })
    expect(hasUsedApp(store({ 'vocab.progress.v1': studied }))).toBe(true)
  })

  it('does not count an empty progress record or a corrupt one', () => {
    const empty = JSON.stringify({ state: { progress: { en: { cards: {}, stats: {} } } } })
    expect(hasUsedApp(store({ 'vocab.progress.v1': empty }))).toBe(false)
    expect(hasUsedApp(store({ 'vocab.progress.v1': '{oops' }))).toBe(false)
  })

  it('markEntered makes the next visit go straight to the app', () => {
    const s = store()
    markEntered(s)
    expect(hasUsedApp(s)).toBe(true)
  })
})
