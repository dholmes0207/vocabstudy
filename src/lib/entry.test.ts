import { describe, expect, it } from 'vitest'
import { ENTERED_KEY, hasUsedApp, hashToPath, isAuthCallback, markEntered } from './entry'

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

describe('isAuthCallback', () => {
  it('recognises Supabase confirmation, recovery and error redirects', () => {
    expect(isAuthCallback('#access_token=abc&type=signup')).toBe(true)
    expect(isAuthCallback('#error=access_denied&error_code=otp_expired&error_description=x')).toBe(
      true
    )
    expect(isAuthCallback('', '?code=123')).toBe(true)
  })

  it('ignores ordinary section links and queries', () => {
    expect(isAuthCallback('#features')).toBe(false)
    expect(isAuthCallback('')).toBe(false)
    expect(isAuthCallback('', '?quick=1')).toBe(false)
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
