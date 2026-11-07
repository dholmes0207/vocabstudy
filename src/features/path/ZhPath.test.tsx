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
import { useRetry } from '@/store/retryStore'
import { usePath } from '@/store/pathStore'

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: LearningPath } = await import('./LearningPath')

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack: zh, status: 'ready' })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
  useRetry.setState({ hsk: {} })
  usePath.setState({ celebrated: {}, passed: {} })
})
afterEach(cleanup)

const renderPage = () =>
  render(
    <MemoryRouter>
      <LearningPath />
    </MemoryRouter>
  )

describe('Chinese level path', () => {
  it('starts with pinyin and tones, with HSK 1 to 3 ahead', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /Continue\s*Pinyin & tones/ })).toHaveAttribute(
      'href',
      '/pinyin'
    )
    for (const n of [2, 3, 4])
      expect(
        screen.getByRole('button', { name: new RegExp(`Level ${n}: HSK ${n - 1}`) })
      ).toBeInTheDocument()
  })

  it('counts pinyin rounds and HSK drill answers from the other pages', () => {
    useActivity.setState({ counts: { zh: { pinyin: 3 } } })
    useRetry.setState({
      hsk: { 'hsk1:listen': [10, 25], 'hsk1:fill': [5, 20], 'hsk2:fill': [1, 1] },
    })
    renderPage()
    // Pinyin done: the next step to do is the words.
    expect(
      screen.getByRole('link', { name: /Continue\s*Your first 60 HSK 1 words/ })
    ).toBeInTheDocument()
    expect(screen.getByText('3/3 sessions')).toBeInTheDocument()
  })
})
