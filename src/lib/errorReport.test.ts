import { describe, expect, it } from 'vitest'
import { buildReport, isNoise, sanitizeReport, scrub, signature } from './errorReport'

describe('scrub', () => {
  it('removes emails, tokens, keys, query strings and long numbers', () => {
    const dirty =
      'lan@example.com failed at https://vocastudy.app/phrases?id=7#x with eyJhbGciOi.eyJzdWIi.c2lnbmF0 sb_publishable_AbC123 order 12345678'
    const clean = scrub(dirty)
    expect(clean).not.toMatch(/lan@example\.com|id=7|eyJhbGciOi|AbC123|12345678/)
    expect(clean).toContain('https://vocastudy.app/phrases')
    expect(clean).toContain('<email>')
  })
})

describe('isNoise', () => {
  it('ignores what is not ours to fix', () => {
    expect(isNoise('Script error.')).toBe(true)
    expect(isNoise('ResizeObserver loop completed with undelivered notifications.')).toBe(true)
    expect(isNoise('TypeError: x', 'at chrome-extension://abc/content.js:1:1')).toBe(true)
    expect(isNoise('TypeError: Cannot read properties of undefined')).toBe(false)
  })
})

describe('buildReport', () => {
  it('keeps only the path, the build and a trimmed, scrubbed message', () => {
    const err = new TypeError('cannot read "x" of undefined for lan@example.com')
    const r = buildReport(err, 'render', '/phrases/food?x=1#y', 'abc1234')!
    expect(r).toMatchObject({ path: '/phrases/food', release: 'abc1234', kind: 'render' })
    expect(r.message).toBe('TypeError: cannot read "x" of undefined for <email>')
  })

  it('sends nothing for noise', () => {
    expect(
      buildReport(new Error('ResizeObserver loop limit exceeded'), 'error', '/', 'x')
    ).toBeNull()
  })

  it('copes with things thrown that are not errors', () => {
    expect(buildReport('plain string', 'rejection', '/home', 'x')?.message).toBe('plain string')
  })
})

describe('sanitizeReport', () => {
  it('accepts a well-formed report and re-scrubs it', () => {
    const r = sanitizeReport({
      message: 'Error: boom lan@example.com',
      stack: 'at f (https://vocastudy.app/assets/a.js?v=1:2:3)',
      path: '/home?q=1',
      release: 'abc',
      kind: 'error',
    })
    expect(r).toEqual({
      message: 'Error: boom <email>',
      stack: 'at f (https://vocastudy.app/assets/a.js:2:3)',
      path: '/home',
      release: 'abc',
      kind: 'error',
    })
  })

  it('refuses anything else', () => {
    expect(sanitizeReport(null)).toBeNull()
    expect(sanitizeReport({ message: 'x', kind: 'other' })).toBeNull()
    expect(sanitizeReport({ message: '  ', kind: 'error' })).toBeNull()
  })
})

describe('signature', () => {
  const base = {
    stack: 'TypeError: x\n    at f (a.js:1:2)',
    path: '/a',
    release: 'r',
    kind: 'error' as const,
  }

  it('groups the same bug on different pages', () => {
    expect(signature({ ...base, message: 'TypeError: x' })).toBe(
      signature({ ...base, message: 'TypeError: x', path: '/b' })
    )
  })

  it('tells different bugs apart', () => {
    expect(signature({ ...base, message: 'TypeError: x' })).not.toBe(
      signature({ ...base, message: 'TypeError: y' })
    )
  })
})
