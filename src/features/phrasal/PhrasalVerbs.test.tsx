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
vi.mock('@/lib/phrasalVerbs', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/phrasalVerbs')>()
  const [up, , off] = real.PARTICLES
  return {
    ...real,
    phrasalRound: () => [
      { particle: up, item: up.verbs[0], options: ['out', 'up', 'down', 'back'] },
      { particle: off, item: off.verbs[1], options: ['on', 'off', 'away', 'down'] },
    ],
  }
})

const { default: PhrasalVerbs } = await import('./PhrasalVerbs')
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
      <PhrasalVerbs />
    </MemoryRouter>
  )

describe('Phrasal verbs', () => {
  it('teaches each particle, then fills the gap and explains it', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Practise "up"' })).toBeInTheDocument()
    expect(screen.getByText('give up')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Mixed round/ }))

    // Don't give ＿ now → up (right).
    fireEvent.click(screen.getByRole('button', { name: 'up' }))
    expect(screen.getByText('Right!')).toBeInTheDocument()
    expect(screen.getByText('give up')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))

    // Turn ＿ your phones before the exam → off; pick on (wrong).
    fireEvent.click(screen.getByRole('button', { name: 'on' }))
    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(screen.getByText(/switched off, stopped, cancelled/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^See results/ }))
    expect(screen.getByText('1 of 2 right')).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.phrasal).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(7)
  })

  it('is for the English pack only', () => {
    useSettings.setState({ currentLang: 'zh' })
    renderPage()
    expect(screen.queryByRole('button', { name: /Mixed round/ })).toBeNull()
  })
})
