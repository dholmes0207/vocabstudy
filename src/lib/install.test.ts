import { describe, expect, it } from 'vitest'
import { isIos, shouldOfferInstall } from './install'

const DAY = 24 * 60 * 60 * 1000

describe('shouldOfferInstall', () => {
  it('never inside the installed app', () => {
    expect(shouldOfferInstall({ standalone: true, dismissedAt: null, now: 0 })).toBe(false)
  })

  it('waits a month after "not now"', () => {
    const now = 100 * DAY
    expect(shouldOfferInstall({ standalone: false, dismissedAt: now - 5 * DAY, now })).toBe(false)
    expect(shouldOfferInstall({ standalone: false, dismissedAt: now - 31 * DAY, now })).toBe(true)
    expect(shouldOfferInstall({ standalone: false, dismissedAt: null, now })).toBe(true)
  })

  it('recognises iOS devices', () => {
    expect(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(true)
    expect(isIos('Mozilla/5.0 (Linux; Android 14)')).toBe(false)
  })
})
