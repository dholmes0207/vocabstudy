/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useChallenge } from '@/store/challengeStore'
import { challengeQuestions } from '@/lib/dailyChallenge'
import { today } from '@/lib/date'

vi.mock('@/lib/audio', () => ({
  pronounce: () => {},
  stopPronounce: () => {},
  prefetchAudio: () => {},
  wordAudio: () => '',
  exampleAudio: () => '',
}))

const { default: Challenge } = await import('./Challenge')
const { default: DailyChallenge } = await import('@/features/dashboard/DailyChallenge')
const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack: en, status: 'ready' })
  useStudy.setState({ progress: {} })
  useChallenge.setState({ records: {} })
})
afterEach(cleanup)

describe("Today's challenge", () => {
  it('asks the five questions of the day, then records the score and keeps the one study streak', () => {
    render(
      <MemoryRouter initialEntries={['/challenge']}>
        <Routes>
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/" element={<p>home</p>} />
        </Routes>
      </MemoryRouter>
    )
    for (const q of challengeQuestions(en.words, 'en', today())) {
      const option = screen
        .getAllByRole('button')
        .filter((b) => b.textContent?.includes(q.answer))
        .sort((a, b) => a.textContent!.length - b.textContent!.length)[0]
      fireEvent.click(option)
      fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ }))
    }
    expect(screen.getByText('Xong thử thách hôm nay!')).toBeInTheDocument()
    // The challenge's answers are study: they start the one study streak.
    expect(screen.getByText(/Chuỗi học: 1 ngày liên tiếp/)).toBeInTheDocument()
    expect(useStudy.getState().progress.en.stats.streak).toBe(1)
    expect(useChallenge.getState().records.en).toMatchObject({ day: today(), correct: 5 })
  })

  it('shows on the home page whether it is done today, with the study streak', () => {
    const { rerender } = render(
      <MemoryRouter>
        <DailyChallenge />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Làm ngay thử thách' })).toHaveAttribute(
      'href',
      '/challenge'
    )
    useStudy.getState().recordAnswer('en', en.words[0].id, true)
    useChallenge.getState().finish('en', today(), 4, 5)
    rerender(
      <MemoryRouter>
        <DailyChallenge />
      </MemoryRouter>
    )
    expect(screen.getByText(/Đã xong: đúng 4\/5. Chuỗi học 1 ngày/)).toBeInTheDocument()
  })
})
