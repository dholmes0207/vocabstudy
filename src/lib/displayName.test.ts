import { describe, expect, it } from 'vitest'
import { DISPLAY_NAME_MAX, cleanDisplayName } from './displayName'

describe('cleanDisplayName', () => {
  it('tidies spaces and keeps Vietnamese as it is', () => {
    expect(cleanDisplayName('  Võ   Danh ')).toBe('Võ Danh')
    expect(cleanDisplayName('Nguyễn Thị Ánh')).toBe('Nguyễn Thị Ánh')
  })

  it('drops control characters', () => {
    expect(cleanDisplayName('Lan\u0000\nAnh')).toBe('Lan Anh')
  })

  it('allows clearing the name', () => {
    expect(cleanDisplayName('   ')).toBe('')
  })

  it('refuses what is not a short piece of text', () => {
    expect(cleanDisplayName('a'.repeat(DISPLAY_NAME_MAX + 1))).toBeNull()
    expect(cleanDisplayName(42)).toBeNull()
    expect(cleanDisplayName(undefined)).toBeNull()
  })
})
