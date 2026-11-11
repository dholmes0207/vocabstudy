/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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
import { TEST_XP, type LevelQuestion } from '@/lib/levelTest'
import { QUEST_XP } from '@/lib/pathQuest'

const confetti = vi.fn()
vi.mock('@/lib/confetti', () => ({ celebrate: (p: number) => confetti(p) }))

// The questions of the last level test built, so a test knows the right answers.
let built: LevelQuestion[] = []
vi.mock('@/lib/levelTest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/levelTest')>()
  return {
    ...actual,
    buildLevelTest: (...args: Parameters<typeof actual.buildLevelTest>) =>
      (built = actual.buildLevelTest(...args)),
  }
})

const { default: LearningPath } = await import('./LearningPath')
const { default: PathCard } = await import('./PathCard')

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack
const grammarPack = JSON.parse(readFileSync('public/data/grammar/en.json', 'utf8'))

beforeEach(() => {
  confetti.mockClear()
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack: en, status: 'ready' })
  useStudy.setState({ progress: {} })
  useGrammar.setState({ progress: {} })
  useReading.setState({ progress: {} })
  useActivity.setState({ counts: {} })
  usePath.setState({ celebrated: {}, passed: {}, quests: {} })
  usePlacement.setState({ results: {} })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

/** Plays the level challenge on screen, answering wrong `misses` times first. */
async function playChallenge(misses: number) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => grammarPack }))
  )
  fireEvent.click(screen.getByRole('button', { name: /Level challenge: 12 questions/ }))
  fireEvent.click(await screen.findByRole('button', { name: /^Start/ }))
  for (let i = 0; i < built.length; i++) {
    const q = built[i]
    const card = screen.getByText(q.prompt).closest('.card') as HTMLElement
    const pick = i < misses ? (q.answer + 1) % q.options.length : q.answer
    fireEvent.click(within(card).getByRole('button', { name: q.options[pick] }))
    const next = screen.getByRole('button', { name: /^(Next|See the result)/ })
    const last = /See the result/.test(next.textContent ?? '')
    fireEvent.click(next)
    if (last) return
  }
}

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

  it('opens the next level after a won challenge, with a trophy and its XP', async () => {
    renderPage()
    await playChallenge(2)
    expect(await screen.findByText('You beat level 1!')).toBeInTheDocument()
    expect(usePath.getState().passed.en).toEqual([1])
    expect(useStudy.getState().progress.en?.stats.xp).toBe(TEST_XP)
    fireEvent.click(screen.getByRole('button', { name: 'Back to the path' }))
    expect(screen.getByText(/Beaten/)).toBeInTheDocument()
    expect(screen.getAllByText(/^Opens when level/)).toHaveLength(4)
  })

  it('ends the challenge at the third mistake, opening nothing', async () => {
    renderPage()
    await playChallenge(3)
    expect(await screen.findByText('Out of hearts!')).toBeInTheDocument()
    expect(usePath.getState().passed.en ?? []).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Back to the path' }))
    expect(screen.getAllByText(/^Opens when level/)).toHaveLength(5)
  })

  it('has a way in from the home screen, only for packs with a path', () => {
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
    // A pack with no path yet (none of the shipped ones: en, zh, ko all have one).
    useSettings.setState({ currentLang: 'fr' })
    const { container } = render(
      <MemoryRouter>
        <PathCard />
      </MemoryRouter>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('sets a daily quest on the step in progress and pays it once that step moves', () => {
    renderPage()
    const quest = screen.getByRole('region', { name: 'Today’s quest' })
    expect(quest).toHaveTextContent('Words 1–150')
    expect(quest).toHaveTextContent(`+${QUEST_XP} XP`)
    expect(usePath.getState().quests.en).toMatchObject({ base: 0, claimed: false })
    expect(within(quest).queryByRole('button', { name: /Claim/ })).toBeNull()

    act(() => learnFirst(3))
    fireEvent.click(within(quest).getByRole('button', { name: /Claim/ }))
    expect(useStudy.getState().progress.en.stats.xp).toBe(QUEST_XP)
    expect(confetti).toHaveBeenCalledWith(1)
    expect(quest).toHaveTextContent('Reward claimed')
    expect(within(quest).queryByRole('button', { name: /Claim/ })).toBeNull()
    expect(usePath.getState().quests.en.claimed).toBe(true)
  })

  it('tells the home card about the quest', () => {
    render(
      <MemoryRouter>
        <PathCard />
      </MemoryRouter>
    )
    expect(screen.getByText('🎯 Today’s quest is waiting')).toBeInTheDocument()
    act(() => learnFirst(3))
    expect(screen.getByText('🎁 Quest done, claim it')).toBeInTheDocument()
  })
})
