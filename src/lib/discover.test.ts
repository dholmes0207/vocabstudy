import { describe, expect, it } from 'vitest'
import { pickDiscovery, practiceRoot } from './discover'

describe('try something new', () => {
  const paths = ['/roleplay', '/games/blitz', '/patterns']

  it('suggests a screen not opened yet, a different one from one day to the next', () => {
    expect(pickDiscovery(paths, [], 0)).toBe('/roleplay')
    expect(pickDiscovery(paths, [], 1)).toBe('/games/blitz')
    expect(pickDiscovery(paths, ['/games/blitz'], 1)).toBe('/patterns')
  })

  it('suggests nothing once every screen has been opened', () => {
    expect(pickDiscovery(paths, paths, 5)).toBeNull()
  })

  it('reads the screen of a path without its query or trailing slash', () => {
    expect(practiceRoot('/patterns?lang=zh')).toBe('/patterns')
    expect(practiceRoot('/games/blitz/')).toBe('/games/blitz')
  })
})
