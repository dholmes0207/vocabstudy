/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack, Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useGames } from '@/store/gamesStore'

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: BlitzGame } = await import('./BlitzGame')

const words: Word[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  word: `word${i + 1}`,
  ipa: '',
  viRead: '',
  pos: 'n.',
  posCategory: 'noun',
  meaning: `nghĩa ${i + 1}`,
  exampleEn: '',
  exampleVi: '',
}))

beforeEach(() => {
  vi.useFakeTimers()
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({
    pack: { meta: { ttsLang: 'en-US' }, words } as unknown as LanguagePack,
    status: 'ready',
  })
  useStudy.setState({ progress: {} })
  useGames.setState({ bestBlitz: null, plays: 0 })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

/** The right button for the card on screen. */
function rightAnswer(): RegExp {
  const word = screen.getByRole('group', { name: 'Current card' }).querySelector('p')!.textContent!
  const meaning = screen
    .getByRole('group', { name: 'Current card' })
    .querySelector('p:last-child')!.textContent!
  return meaning === `nghĩa ${word.replace('word', '')}` ? /^Right$/ : /^Wrong$/
}
const wrongAnswer = () => (rightAnswer().source.includes('Right') ? /^Wrong$/ : /^Right$/)

describe('True or false?', () => {
  it('scores right answers, builds a ×2 combo, takes time for a miss, and keeps the record', () => {
    render(
      <MemoryRouter>
        <BlitzGame />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Go!' }))
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: rightAnswer() }))
    // Five at ×1, the sixth at ×2.
    expect(screen.getByTitle('Score')).toHaveTextContent('70')
    expect(screen.getByText(/6 in a row · ×2/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: wrongAnswer() }))
    act(() => vi.advanceTimersByTime(200))
    expect(screen.getByTitle('Time')).toHaveTextContent('57s')

    act(() => vi.advanceTimersByTime(60_000))
    expect(screen.getByText('70 points!')).toBeInTheDocument()
    expect(screen.getByText('6 right · 1 wrong')).toBeInTheDocument()
    expect(screen.getByText(/New personal record/)).toBeInTheDocument()
    expect(useGames.getState().bestBlitz).toBe(70)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(2)
  })
})
