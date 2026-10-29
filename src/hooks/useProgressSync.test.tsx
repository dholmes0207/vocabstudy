/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LanguageProgress, SRSCard } from '@/types'

// useProgressSync against a fake Supabase client. supabase-js does not throw
// when a request fails: it resolves with { data: null, error }. A failed pull
// must therefore never look like "the server has nothing" — that used to push
// this device's few cards over the learner's whole server row.

const { from, pull, upsert } = vi.hoisted(() => {
  const pull = vi.fn()
  const upsert = vi.fn(async (_row: unknown) => ({ error: null }))
  const query = { select: () => query, eq: () => query, maybeSingle: () => pull() }
  const from = vi.fn(() => ({ ...query, upsert }))
  return { from, pull, upsert }
})

vi.mock('@/lib/supabase', () => ({ supabase: { from }, supabaseConfigured: true }))

import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useProgressSync } from './useProgressSync'

const USER = '11111111-1111-4111-8111-111111111111'

function card(id: number, lastReviewedDay = 99): SRSCard {
  return {
    id,
    box: 2,
    dueDay: 100,
    lastReviewedDay,
    correctCount: 1,
    wrongCount: 0,
    createdDay: 90,
  }
}

function progress(cards: SRSCard[]): LanguageProgress {
  return {
    cards: Object.fromEntries(cards.map((c) => [c.id, c])),
    stats: {
      streak: 0,
      lastStudyDay: null,
      totalReviews: 0,
      totalCorrect: 0,
      xp: 0,
      newByDay: {},
      reviewsByDay: {},
    },
  }
}

/** Let the pull (and any write-back) settle. */
async function settle() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve()
  })
}

/** A local change, then the 1.5 s push debounce. */
async function studyAndWait(cards: SRSCard[]) {
  act(() => useStudy.setState({ progress: { en: progress(cards) } }))
  await act(async () => {
    vi.advanceTimersByTime(2000)
  })
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  useSettings.setState({ currentLang: 'en' })
  useAuth.setState({
    user: { id: USER, email: 'lan@example.com', name: 'Lan', role: 'student', status: 'active' },
  })
  useStudy.setState({ progress: { en: progress([card(1), card(2)]) } })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('useProgressSync', () => {
  it('writes nothing when the pull fails, not even after later study', async () => {
    pull.mockResolvedValue({ data: null, error: { message: 'FetchError: network down' } })
    renderHook(() => useProgressSync())
    await settle()
    expect(upsert).not.toHaveBeenCalled()

    await studyAndWait([card(1), card(2), card(3)])
    expect(upsert).not.toHaveBeenCalled()
  })

  it('uploads local progress when the server has no row yet (first sign-in)', async () => {
    pull.mockResolvedValue({ data: null, error: null })
    renderHook(() => useProgressSync())
    await settle()
    expect(upsert).toHaveBeenCalledTimes(1)
    expect(upsert.mock.calls[0][0]).toMatchObject({ user_id: USER, lang_code: 'en' })
  })

  it('merges the server row into local, then pushes later study', async () => {
    pull.mockResolvedValue({ data: { data: progress([card(5)]) }, error: null })
    renderHook(() => useProgressSync())
    await settle()
    expect(Object.keys(useStudy.getState().progress.en.cards).sort()).toEqual(['1', '2', '5'])

    upsert.mockClear()
    await studyAndWait([card(1), card(2), card(5), card(6)])
    expect(upsert).toHaveBeenCalledTimes(1)
  })
})
