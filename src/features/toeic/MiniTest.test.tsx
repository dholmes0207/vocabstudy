/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useExam } from '@/store/examStore'
import { miniTestPlan, MINI_TEST_ID } from '@/lib/toeicMiniTest'

vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: () => {},
  stopPronounce: () => {},
  textAudio: (text: string) => `/t/${text}`,
}))

const { default: MiniTest } = await import('./MiniTest')
const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useExam.setState({ records: {} })
})
afterEach(cleanup)

describe('TOEIC mini test', () => {
  it('splits 26 questions 13/13 across the seven parts', () => {
    const plan = miniTestPlan(en.words)
    expect(plan.map((s) => s.part)).toEqual([1, 2, 3, 4, 5, 6, 7])
    const count = (parts: number[]) =>
      plan.filter((s) => parts.includes(s.part)).reduce((n, s) => n + s.questions.length, 0)
    expect(count([1, 2, 3, 4])).toBe(13)
    expect(count([5, 6, 7])).toBe(13)
  })

  it('runs every part in turn, then shows a range for each section and records the score', () => {
    render(
      <MemoryRouter>
        <MiniTest words={en.words} onExit={() => {}} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    for (let i = 0; i < 80 && !screen.queryByText('Mini test results'); i++) {
      const option = screen
        .queryAllByRole('button')
        .find((b) => !b.hasAttribute('disabled') && /^\([A-D]\)/.test(b.textContent ?? ''))
      if (option) fireEvent.click(option)
      const next = screen.queryByRole('button', { name: /^(Next|See results)$/ })
      if (next) fireEvent.click(next)
    }
    expect(screen.getByText('Mini test results')).toBeInTheDocument()
    expect(screen.getAllByText(/^About \d+–\d+ points/)).toHaveLength(2)
    expect(screen.getByText(/Listening: \d+\/13 right/)).toBeInTheDocument()
    expect(useExam.getState().records[MINI_TEST_ID]?.total).toBe(26)
    expect(useStudy.getState().progress.en?.stats.xp).toBeGreaterThanOrEqual(5)
  })
})
