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

vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: () => {},
  stopPronounce: () => {},
  textAudio: () => '',
  wordAudio: () => '',
  exampleAudio: () => '',
}))

const { default: Dashboard } = await import('./Dashboard')
const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

beforeEach(() => useStudy.setState({ progress: {} }))
afterEach(cleanup)

const renderFor = (code: string) => {
  useSettings.setState({ uiLang: 'en', currentLang: code })
  useData.setState({ pack: pack(code), status: 'ready' })
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )
}

describe('Dashboard', () => {
  it('links the English pack to TOEIC practice, not HSK', () => {
    renderFor('en')
    expect(screen.getByRole('link', { name: /TOEIC practice/ })).toHaveAttribute('href', '/toeic')
    expect(screen.queryByRole('link', { name: /HSK practice/ })).not.toBeInTheDocument()
    expect(screen.getByText("Today's challenge")).toBeInTheDocument()
  })

  it('links the Chinese pack to HSK practice', () => {
    renderFor('zh')
    expect(screen.getByRole('link', { name: /HSK practice/ })).toHaveAttribute('href', '/hsk')
    expect(screen.queryByRole('link', { name: /TOEIC practice/ })).not.toBeInTheDocument()
  })
})
