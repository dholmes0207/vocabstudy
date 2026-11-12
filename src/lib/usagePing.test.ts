import { describe, expect, it } from 'vitest'
import {
  ANSWER_EDGES,
  DEVICE_KEY,
  NEW_WORD_EDGES,
  bucket,
  buildPing,
  newDeviceId,
  pingAllowed,
  pingKey,
  sanitizePing,
  shouldSend,
  type PingInput,
} from './usagePing'

const DEVICE = 'abcdefghijklmnopqrstuv'
const input = (over: Partial<PingInput> = {}): PingInput => ({
  device: DEVICE,
  day: 20400,
  pack: 'en',
  answers: 12,
  newWords: 5,
  firstLesson: true,
  signedIn: false,
  installed: false,
  ...over,
})

describe('bucket', () => {
  it('sends a range, never the exact count', () => {
    expect(bucket(0, ANSWER_EDGES)).toBe(0)
    expect(bucket(1, ANSWER_EDGES)).toBe(1)
    expect(bucket(9, ANSWER_EDGES)).toBe(1)
    expect(bucket(10, ANSWER_EDGES)).toBe(2)
    expect(bucket(99, ANSWER_EDGES)).toBe(3)
    expect(bucket(5000, ANSWER_EDGES)).toBe(4)
    expect(bucket(4, NEW_WORD_EDGES)).toBe(1)
    expect(bucket(5, NEW_WORD_EDGES)).toBe(2)
  })

  it('treats negative and unknown counts as none', () => {
    expect(bucket(-3, ANSWER_EDGES)).toBe(0)
    expect(bucket(NaN, ANSWER_EDGES)).toBe(0)
    expect(bucket(Infinity, ANSWER_EDGES)).toBe(0)
  })
})

describe('newDeviceId', () => {
  it('makes 22 URL-safe characters from 16 random bytes', () => {
    const id = newDeviceId((b) => b.map((_, i) => i * 17 + 250))
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(buildPing(input({ device: id }))).not.toBeNull()
  })

  it('lives outside the vocab. prefix, so a backup file does not copy it', () => {
    expect(DEVICE_KEY.startsWith('vocab.')).toBe(false)
  })
})

describe('buildPing', () => {
  it('buckets the counts and keeps the flags', () => {
    expect(buildPing(input())).toEqual({
      device: DEVICE,
      day: 20400,
      pack: 'en',
      answers: 2,
      newWords: 2,
      firstLesson: true,
      signedIn: false,
      installed: false,
    })
  })

  it('sends nothing for a day with no learning, a bad id or an unknown pack', () => {
    expect(buildPing(input({ answers: 0, newWords: 0 }))).toBeNull()
    expect(buildPing(input({ device: 'short' }))).toBeNull()
    expect(buildPing(input({ device: 'has spaces in it, too long' }))).toBeNull()
    expect(buildPing(input({ pack: 'fr' }))).toBeNull()
  })
})

describe('shouldSend', () => {
  it('sends once per day, and again only when the day says more', () => {
    const first = buildPing(input())!
    expect(shouldSend(first, null)).toBe(true)
    expect(shouldSend(first, pingKey(first))).toBe(false)
    const more = buildPing(input({ answers: 40 }))!
    expect(shouldSend(more, pingKey(first))).toBe(true)
    const signedIn = buildPing(input({ signedIn: true }))!
    expect(shouldSend(signedIn, pingKey(first))).toBe(true)
    const nextDay = buildPing(input({ day: 20401 }))!
    expect(shouldSend(nextDay, pingKey(first))).toBe(true)
  })
})

describe('pingAllowed', () => {
  it('respects the setting and Global Privacy Control', () => {
    expect(pingAllowed(true, undefined)).toBe(true)
    expect(pingAllowed(true, false)).toBe(true)
    expect(pingAllowed(false, undefined)).toBe(false)
    expect(pingAllowed(true, true)).toBe(false)
  })
})

describe('sanitizePing', () => {
  const good = buildPing(input())!

  it('accepts a well-formed signal for today, yesterday or tomorrow', () => {
    expect(sanitizePing(good, 20400)).toEqual(good)
    expect(sanitizePing(good, 20401)).toEqual(good)
    expect(sanitizePing(good, 20399)).toEqual(good)
  })

  it('drops anything extra the client sends', () => {
    expect(sanitizePing({ ...good, email: 'a@b.c', ip: '1.2.3.4' }, 20400)).toEqual(good)
  })

  it('refuses a day far from the server’s, a bad shape or an empty day', () => {
    expect(sanitizePing(good, 20410)).toBeNull()
    expect(sanitizePing(null, 20400)).toBeNull()
    expect(sanitizePing('ping', 20400)).toBeNull()
    expect(sanitizePing({ ...good, device: 'x' }, 20400)).toBeNull()
    expect(sanitizePing({ ...good, day: 20400.5 }, 20400)).toBeNull()
    expect(sanitizePing({ ...good, pack: 'fr' }, 20400)).toBeNull()
    expect(sanitizePing({ ...good, answers: 5 }, 20400)).toBeNull()
    expect(sanitizePing({ ...good, newWords: -1 }, 20400)).toBeNull()
    expect(sanitizePing({ ...good, installed: 'yes' }, 20400)).toBeNull()
    expect(sanitizePing({ ...good, answers: 0, newWords: 0 }, 20400)).toBeNull()
  })
})
