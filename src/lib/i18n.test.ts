import { describe, expect, it } from 'vitest'
import { pick, tx } from './i18n'
import { useSettings } from '@/store/settingsStore'

describe('i18n', () => {
  it('picks the pair member for a language', () => {
    expect(pick('vi', 'Cài đặt', 'Settings')).toBe('Cài đặt')
    expect(pick('en', 'Cài đặt', 'Settings')).toBe('Settings')
  })

  it('defaults to English and follows the setting', () => {
    expect(useSettings.getState().uiLang).toBe('en')
    expect(tx('Học', 'Learn')).toBe('Learn')
    useSettings.getState().setUiLang('vi')
    expect(tx('Học', 'Learn')).toBe('Học')
    useSettings.getState().setUiLang('en')
  })
})
