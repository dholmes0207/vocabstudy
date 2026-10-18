import { describe, expect, it } from 'vitest'
import { DEVICES, deviceOf, keyboardGuide } from './keyboardHelp'

describe('deviceOf', () => {
  it.each([
    [
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36',
      0,
      'android',
    ],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15', 5, 'ios'],
    // iPadOS asks for the desktop site and reports a Mac — with a touch screen.
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 5, 'ios'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 0, 'mac'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130', 0, 'windows'],
    ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130', 0, 'linux'],
  ] as const)('%s → %s', (ua, touch, device) => {
    expect(deviceOf(ua, touch)).toBe(device)
  })
})

describe('keyboardGuide', () => {
  it('has nothing for English: the keyboard everyone has types it', () => {
    expect(keyboardGuide('en')).toBeNull()
  })

  it.each(['ko', 'zh'])('%s has steps for every device', (code) => {
    const guide = keyboardGuide(code)!
    for (const { id } of DEVICES) expect(guide.steps[id].length, id).toBeGreaterThan(0)
  })
})
