import { describe, expect, it } from 'vitest'
import {
  CONSENT_KEY,
  SENT_KEY,
  deviceId,
  nextPing,
  readConsent,
  saveConsent,
  shouldAsk,
  type TodayFacts,
} from './usageClient'
import { DEVICE_KEY } from './usagePing'

function memory(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init))
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    m,
  }
}
const random = (b: Uint8Array) => b.map((_, i) => i * 7 + 3)
const facts = (over: Partial<TodayFacts> = {}): TodayFacts => ({
  day: 20500,
  pack: 'en',
  answers: 12,
  newWords: 5,
  wordsStarted: 5,
  signedIn: false,
  installed: false,
  ...over,
})

describe('consent', () => {
  it('is unknown until answered, then remembered', () => {
    const kv = memory()
    expect(readConsent(kv)).toBeNull()
    saveConsent(kv, true)
    expect(readConsent(kv)).toBe('yes')
    saveConsent(kv, false)
    expect(readConsent(kv)).toBe('no')
    expect(readConsent(memory({ [CONSENT_KEY]: 'maybe' }))).toBeNull()
  })

  it('asks once, and never a browser with Global Privacy Control', () => {
    expect(shouldAsk(null, undefined)).toBe(true)
    expect(shouldAsk(null, true)).toBe(false)
    expect(shouldAsk('yes', undefined)).toBe(false)
    expect(shouldAsk('no', false)).toBe(false)
  })

  it('keeps every key outside the vocab. prefix, so backups do not carry them', () => {
    for (const key of [CONSENT_KEY, SENT_KEY, DEVICE_KEY])
      expect(key.startsWith('vocab.')).toBe(false)
  })
})

describe('deviceId', () => {
  it('is made once and then reused', () => {
    const kv = memory()
    const id = deviceId(kv, random)
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(deviceId(kv, () => new Uint8Array(16))).toBe(id)
  })
})

describe('nextPing', () => {
  it('sends nothing without a yes, or with Global Privacy Control', () => {
    expect(nextPing(memory(), facts(), undefined, random)).toBeNull()
    expect(nextPing(memory({ [CONSENT_KEY]: 'no' }), facts(), undefined, random)).toBeNull()
    expect(nextPing(memory({ [CONSENT_KEY]: 'yes' }), facts(), true, random)).toBeNull()
  })

  it('sends a bucketed signal once a day, and again only when the day says more', () => {
    const kv = memory({ [CONSENT_KEY]: 'yes' })
    const first = nextPing(kv, facts(), undefined, random)
    expect(first).toMatchObject({ day: 20500, pack: 'en', answers: 2, newWords: 2 })
    expect(first?.firstLesson).toBe(true)
    expect(nextPing(kv, facts(), undefined, random)).toBeNull()
    expect(nextPing(kv, facts({ answers: 40 }), undefined, random)).toMatchObject({ answers: 3 })
    expect(nextPing(kv, facts({ day: 20501 }), undefined, random)).not.toBeNull()
  })

  it('sends nothing for a day without learning, and marks the first lesson only after five words', () => {
    const kv = memory({ [CONSENT_KEY]: 'yes' })
    expect(nextPing(kv, facts({ answers: 0, newWords: 0 }), undefined, random)).toBeNull()
    expect(nextPing(kv, facts({ wordsStarted: 4 }), undefined, random)?.firstLesson).toBe(false)
  })
})
