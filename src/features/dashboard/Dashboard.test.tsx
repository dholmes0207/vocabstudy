/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen, within } from '@testing-library/react'
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

  it('opens on one card for today, with the one thing to do now', () => {
    // Past the first steps: a word learned yesterday, not due yet.
    const first = pack('en').words[0]
    useStudy.getState().recordAnswer('en', first.id, true)
    renderFor('en')
    const today = screen.getByRole('region', { name: 'Learn 5 new words' })
    expect(within(today).getByRole('link', { name: /Start/ })).toHaveAttribute(
      'href',
      '/learn?quick=1'
    )
  })

  it('leaves a newcomer one main button: the first steps', () => {
    renderFor('en')
    expect(screen.queryByRole('region', { name: /new words/ })).toBeNull()
  })

  it('asks for reviews first once words are due', () => {
    const first = pack('en').words[0]
    useStudy.getState().recordAnswer('en', first.id, false)
    renderFor('en')
    const today = screen.getByRole('region', { name: 'Review 1 word due' })
    expect(within(today).getByRole('link', { name: /Review now/ })).toHaveAttribute(
      'href',
      '/review'
    )
  })
})
