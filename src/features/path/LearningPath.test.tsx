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
import { useGrammar } from '@/store/grammarStore'
import { useReading } from '@/store/readingStore'
import { useActivity } from '@/store/activityStore'
import { usePath } from '@/store/pathStore'
import { usePlacement } from '@/store/placementStore'
import { newCard } from '@/lib/srs'
import { LEVEL_XP } from '@/lib/learningPath'

const confetti = vi.fn()
vi.mock('@/lib/confetti', () => ({ celebrate: (p: number) => confetti(p) }))

const { default: LearningPath } = await import('./LearningPath')
const { default: PathCard } = await import('./PathCard')

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  confetti.mockClear()
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack: en, status: 'ready' })
  useStudy.setState({ progress: {} })
  useGrammar.setState({ progress: {} })
  useReading.setState({ progress: {} })
  useActivity.setState({ counts: {} })
  usePath.setState({ celebrated: {} })
  usePlacement.setState({ results: {} })
})
afterEach(cleanup)

const renderPage = () =>
  render(
    <MemoryRouter>
      <LearningPath />
    </MemoryRouter>
  )

/** Cards for the first `n` words of the pack. */
function learnFirst(n: number) {
  const cards = Object.fromEntries(en.words.slice(0, n).map((w) => [w.id, newCard(w.id, 1)]))
  useStudy.setState({
    progress: {
      en: {
        cards,
        stats: {
          streak: 1,
          lastStudyDay: 1,
          totalReviews: n,
          totalCorrect: n,
          xp: 0,
          newByDay: {},
          reviewsByDay: {},
        },
      },
    } as never,
  })
}

describe('Level path', () => {
  it('starts a new learner on level 1, with its first step one tap away and the rest locked', () => {
    renderPage()
    expect(screen.getByText('Warm-up', { selector: 'p *, p' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue\s*Words 1–150/ })).toHaveAttribute(
      'href',
      '/learn'
    )
    expect(screen.getAllByText(/^Opens when level \d reaches 80%$/)).toHaveLength(5)
  })

  it('counts what was done anywhere in the app, and opens the next level at 80%', () => {
    learnFirst(150)
    useGrammar.setState({
      progress: Object.fromEntries(
        ['to-be', 'present-simple', 'pronouns', 'articles'].map((id) => [
          id,
          { best: 100, attempts: 1, lastDay: 1 },
        ])
      ),
    })
    renderPage()
    // Words and grammar done, stories not: 2 of 3 steps, below the mark.
    expect(screen.getByText('67% of this level done', { exact: false })).toBeInTheDocument()
    expect(screen.getAllByText(/^Opens when level/)).toHaveLength(5)
    cleanup()

    useReading.setState({ progress: { 'lans-morning': { best: 100, reads: 1 } } })
    renderPage()
    expect(screen.getAllByText(/^Opens when level/)).toHaveLength(4)
  })

  it('celebrates a level once: confetti, a banner and its XP', () => {
    learnFirst(150)
    useGrammar.setState({
      progress: Object.fromEntries(
        ['to-be', 'present-simple', 'pronouns', 'articles'].map((id) => [
          id,
          { best: 90, attempts: 1, lastDay: 1 },
        ])
      ),
    })
    useReading.setState({
      progress: {
        'lans-morning': { best: 100, reads: 1 },
        'at-the-market': { best: 100, reads: 1 },
      },
    })
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent(
      `Level up! You cleared level 1 · +${LEVEL_XP} XP`
    )
    expect(confetti).toHaveBeenCalledTimes(1)
    expect(useStudy.getState().progress.en.stats.xp).toBe(LEVEL_XP)
    expect(usePath.getState().celebrated.en).toBe(1)
    // Level 2 is the one to work on now.
    expect(screen.getByRole('link', { name: /Continue\s*Words 151–500/ })).toBeInTheDocument()
    cleanup()

    renderPage()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(confetti).toHaveBeenCalledTimes(1)
    expect(useStudy.getState().progress.en.stats.xp).toBe(LEVEL_XP)
  })

  it('opens the levels a placement result skipped to', () => {
    usePlacement.setState({
      results: { en: { start: 600, day: 1, asked: 20, correct: 18 } as never },
    })
    renderPage()
    // Levels 1–3 open: the words before the placement start count as known.
    expect(screen.getAllByText(/^Opens when level/)).toHaveLength(3)
    expect(screen.getByText('150/150 words')).toBeInTheDocument()
  })

  it('shows the steps of another level on tap', () => {
    renderPage()
    expect(screen.queryByText('Dictation')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Level 2: Basic tenses/ }))
    expect(screen.getByText('Dictation')).toBeInTheDocument()
  })

  it('has a way in from the home screen, for English only', () => {
    render(
      <MemoryRouter>
        <PathCard />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /Level path · Level 1\/6/ })).toHaveAttribute(
      'href',
      '/path'
    )
    cleanup()
    useSettings.setState({ currentLang: 'ko' })
    const { container } = render(
      <MemoryRouter>
        <PathCard />
      </MemoryRouter>
    )
    expect(container).toBeEmptyDOMElement()
  })
})
