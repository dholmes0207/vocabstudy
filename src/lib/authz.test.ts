import { describe, expect, it } from 'vitest'
import { accessDecision, accountBlockMessage, adminDecision, isUuid } from './authz'

// Two server-side holes this closes:
//
// 1. `requireUser` treated "couldn't reach Supabase" and "user isn't locked" as
//    the same answer, because getProfile() returned null for both. A REST
//    hiccup therefore let a locked account straight back in.
// 2. Admin endpoints pasted the caller-supplied id into a PostgREST query
//    string unescaped.

describe('isUuid', () => {
  it('accepts a canonical uuid in either case', () => {
    expect(isUuid('3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe(true)
    expect(isUuid('3F2504E0-4F89-11D3-9A0C-0305E82C3301')).toBe(true)
  })

  it('rejects anything that is not a uuid', () => {
    expect(isUuid('')).toBe(false)
    expect(isUuid('abc')).toBe(false)
    expect(isUuid(null)).toBe(false)
    expect(isUuid(undefined)).toBe(false)
    expect(isUuid(42)).toBe(false)
    expect(isUuid({})).toBe(false)
  })

  it('rejects a uuid carrying extra PostgREST query syntax', () => {
    expect(isUuid('3f2504e0-4f89-11d3-9a0c-0305e82c3301&role=eq.admin')).toBe(false)
    expect(isUuid('3f2504e0-4f89-11d3-9a0c-0305e82c3301,or=(id.not.is.null)')).toBe(false)
    expect(isUuid('*')).toBe(false)
    expect(isUuid('3f2504e0-4f89-11d3-9a0c-0305e82c3301 ')).toBe(false)
  })
})

describe('accessDecision — any signed-in user', () => {
  it('refuses when the profile lookup itself failed (fail closed, retryable)', () => {
    const d = accessDecision({ ok: false })
    expect(d.allow).toBe(false)
    if (!d.allow) expect(d.status).toBe(503)
  })

  it('locks out an account marked locked', () => {
    const d = accessDecision({ ok: true, profile: { role: 'student', status: 'locked' } })
    expect(d.allow).toBe(false)
    if (!d.allow) expect(d.status).toBe(403)
  })

  it('keeps a new sign-up out until an admin approves it', () => {
    const d = accessDecision({ ok: true, profile: { role: 'student', status: 'pending' } })
    expect(d.allow).toBe(false)
    if (!d.allow) {
      expect(d.status).toBe(403)
      expect(d.error).toContain('chờ quản trị viên duyệt')
    }
  })

  it('lets an active student through', () => {
    const d = accessDecision({ ok: true, profile: { role: 'student', status: 'active' } })
    expect(d).toEqual({ allow: true, role: 'student' })
  })

  it('treats a signed-in user with no profile row as an ordinary student', () => {
    // The row is created by a trigger; a missing row must not lock a real
    // learner out of the app they just signed up for.
    expect(accessDecision({ ok: true, profile: null })).toEqual({ allow: true, role: 'student' })
  })

  it('recognises an admin', () => {
    const d = accessDecision({ ok: true, profile: { role: 'admin', status: 'active' } })
    expect(d).toEqual({ allow: true, role: 'admin' })
  })
})

describe('adminDecision — admin-only endpoints', () => {
  it('refuses when the lookup failed rather than assuming the worst is fine', () => {
    const d = adminDecision({ ok: false })
    expect(d.allow).toBe(false)
    if (!d.allow) expect(d.status).toBe(503)
  })

  it('refuses a student', () => {
    const d = adminDecision({ ok: true, profile: { role: 'student', status: 'active' } })
    expect(d.allow).toBe(false)
    if (!d.allow) expect(d.status).toBe(403)
  })

  it('refuses a user with no profile row', () => {
    const d = adminDecision({ ok: true, profile: null })
    expect(d.allow).toBe(false)
    if (!d.allow) expect(d.status).toBe(403)
  })

  it('refuses a locked admin', () => {
    const d = adminDecision({ ok: true, profile: { role: 'admin', status: 'locked' } })
    expect(d.allow).toBe(false)
    if (!d.allow) expect(d.status).toBe(403)
  })

  it('allows an active admin', () => {
    expect(adminDecision({ ok: true, profile: { role: 'admin', status: 'active' } })).toEqual({
      allow: true,
      role: 'admin',
    })
  })
})

describe('accountBlockMessage', () => {
  it('explains pending and locked accounts, and lets active ones pass', () => {
    expect(accountBlockMessage('pending')).toContain('chờ quản trị viên duyệt')
    expect(accountBlockMessage('locked')).toContain('khoá')
    expect(accountBlockMessage('active')).toBeNull()
    expect(accountBlockMessage(undefined)).toBeNull()
  })
})
