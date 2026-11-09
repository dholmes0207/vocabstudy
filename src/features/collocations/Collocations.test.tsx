/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'

vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: () => {},
  stopPronounce: () => {},
  textAudio: () => '',
}))
vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
vi.mock('@/lib/collocations', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/collocations')>()
  const by = (vi: string) => real.COLLOCATIONS.find((x) => x.vi === vi)!
  return {
    ...real,
    collocationRound: () => [
      { item: by('bật đèn'), options: ['open', 'turn on', 'start'], answer: 1 },
      { item: by('uống thuốc'), options: ['take', 'drink', 'eat'], answer: 0 },
    ],
  }
})

const { default: Collocations } = await import('./Collocations')
const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

const renderPage = () =>
  render(
    <MemoryRouter>
      <Collocations />
    </MemoryRouter>
  )

describe('Collocations', () => {
  it('lists each phrase beside the word-for-word slip, then runs a round', () => {
    renderPage()
    expect(screen.getByText('✓ turn on the light')).toBeInTheDocument()
    expect(screen.getByText('open the light')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Try 10 questions/ }))

    // 'bật đèn': the literal "open" is a trap.
    expect(screen.getByText('bật đèn')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'open' }))
    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(screen.getByText(/open chỉ dùng cho cửa/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))

    fireEvent.click(screen.getByRole('button', { name: 'take' }))
    expect(screen.getByText('Right!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^See results/ }))
    expect(screen.getByText('1 of 2 right')).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.collocations).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(7)
  })

  it('is for the English pack only', () => {
    useSettings.setState({ currentLang: 'zh' })
    renderPage()
    expect(screen.queryByRole('button', { name: /Try 10 questions/ })).toBeNull()
  })
})
