/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { StudyStats } from '@/types'
import { useSettings } from '@/store/settingsStore'
import { statsOf } from '@/store/studyStore'

vi.mock('@/lib/audio', () => ({ textAudio: () => '', pronounce: () => {} }))

const { WelcomeBack } = await import('./Motivation')

beforeEach(() => useSettings.setState({ uiLang: 'en', currentLang: 'en' }))
afterEach(cleanup)

const stats = (lastStudyDay: number, shields = 0): StudyStats => ({
  ...statsOf({}, 'en'),
  streak: 12,
  lastStudyDay,
  shields,
})
const show = (s: StudyStats, due: number) =>
  render(
    <MemoryRouter>
      <WelcomeBack stats={s} day={100} due={due} />
    </MemoryRouter>
  )

describe('WelcomeBack', () => {
  it('after a long break with a big pile, reviews a gentle 20 and promises a shield', () => {
    show(stats(90), 140)
    expect(screen.getByRole('link', { name: /Review just 20/ })).toHaveAttribute(
      'href',
      '/review?limit=20'
    )
    expect(screen.getByText(/140 words are waiting/)).toHaveTextContent('streak shield')
  })

  it('does not promise a shield the learner already holds', () => {
    show(stats(90, 1), 140)
    expect(screen.getByText(/140 words are waiting/)).not.toHaveTextContent('shield')
  })

  it('after a short break, keeps the usual quick session', () => {
    show(stats(96), 140)
    expect(screen.getByRole('link', { name: /Quick 2-minute session/ })).toHaveAttribute(
      'href',
      '/review'
    )
    expect(screen.queryByText(/streak shield/)).toBeNull()
  })
})
