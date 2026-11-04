/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useMissedWord } from './useMissedWord'

beforeEach(() => {
  useSettings.setState({ currentLang: 'en' })
  useStudy.setState({ progress: {} })
  useStudy.getState().recordAnswer('en', 7, true)
})

describe('useMissedWord', () => {
  it('sends a missed word of the schedule back for an early review', () => {
    const before = useStudy.getState().progress.en.cards[7]
    const { result } = renderHook(() => useMissedWord())
    result.current(7)
    const after = useStudy.getState().progress.en.cards[7]
    expect(after.box).toBeLessThan(before.box)
  })

  it('leaves words never studied alone', () => {
    const { result } = renderHook(() => useMissedWord())
    result.current(8)
    result.current(undefined)
    expect(Object.keys(useStudy.getState().progress.en.cards)).toEqual(['7'])
  })
})
