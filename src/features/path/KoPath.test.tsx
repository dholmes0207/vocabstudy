/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { usePath } from '@/store/pathStore'

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: LearningPath } = await import('./LearningPath')

const ko = JSON.parse(readFileSync('public/data/ko.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'ko', soundEnabled: false })
  useData.setState({ pack: ko, status: 'ready' })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
  usePath.setState({ celebrated: {}, passed: {}, quests: {} })
})
afterEach(cleanup)

const renderPage = () =>
  render(
    <MemoryRouter>
      <LearningPath />
    </MemoryRouter>
  )

describe('Korean level path', () => {
  it('starts with Hangul and climbs to the past and future of TOPIK I', () => {
    renderPage()
    expect(screen.getByText(/the Hangul alphabet, then words/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue\s*The Hangul alphabet/ })).toHaveAttribute(
      'href',
      '/hangul'
    )
    expect(screen.getByRole('button', { name: /Level 2: Everyday sentences/ })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Level 3: Telling stories: past & future/ })
    ).toBeInTheDocument()
  })

  it('counts Hangul rounds from the Hangul page', () => {
    useActivity.setState({ counts: { ko: { hangul: 3 } } })
    renderPage()
    expect(screen.getByText('3/3 sessions')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue\s*Words 1–60/ })).toBeInTheDocument()
  })
})
