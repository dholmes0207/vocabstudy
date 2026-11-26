/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack, SRSCard } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { statsOf, useStudy } from '@/store/studyStore'
import { MAINTENANCE_PER_DAY, MASTERED_BOX, newCard } from '@/lib/srs'
import { today } from '@/lib/date'
import { SESSION_CAP } from '@/lib/reviewSession'

vi.mock('@/lib/audio', () => ({
  pronounce: () => {},
  stopPronounce: () => {},
  prefetchAudio: () => {},
  wordAudio: () => '',
  exampleAudio: () => '',
}))

const { default: Review } = await import('./Review')
const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

/** `n` words learned a while ago and due today. */
function dueCards(n: number): Record<number, SRSCard> {
  const day = today()
  return Object.fromEntries(
    en.words
      .slice(0, n)
      .map((w) => [
        w.id,
        { ...newCard(w.id, day - 20), box: 2, lastReviewedDay: day - 10, dueDay: day - 1 },
      ])
  )
}

beforeEach(() => {
  useSettings.setState({
    uiLang: 'en',
    currentLang: 'en',
    soundEnabled: false,
    reviewStyle: 'recall',
    dailyReviewLimit: 0,
  })
  useData.setState({ pack: en, status: 'ready' })
})
afterEach(cleanup)

const show = (n: number, path = '/review') => {
  useStudy.setState({ progress: { en: { cards: dueCards(n), stats: statsOf({}, 'en') } } })
  render(
    <MemoryRouter initialEntries={[path]}>
      <Review />
    </MemoryRouter>
  )
}

/** `n` mastered words whose maintenance review is due, after `from` others. */
function masteredDue(from: number, n: number): Record<number, SRSCard> {
  const day = today()
  return Object.fromEntries(
    en.words.slice(from, from + n).map((w) => [
      w.id,
      {
        ...newCard(w.id, day - 300),
        box: MASTERED_BOX,
        lastReviewedDay: day - 61,
        dueDay: day - 1,
      },
    ])
  )
}

describe('Review', () => {
  it('takes an ordinary day whole', () => {
    show(20)
    expect(screen.getByText(/20 words due/)).toBeInTheDocument()
  })

  it('splits a big pile: the most overdue first, the rest for later', () => {
    show(80)
    expect(
      screen.getByText(
        new RegExp(`the ${SESSION_CAP} most overdue words first, ${80 - SESSION_CAP} more`)
      )
    ).toBeInTheDocument()
  })

  it('keeps the learner’s own limit and the comeback limit', () => {
    show(80, '/review?limit=20')
    expect(screen.getByText(/the 20 most overdue words first, 60 more/)).toBeInTheDocument()
  })

  it('adds the day’s few mastered words at the end, but not to a short comeback session', () => {
    const cards = { ...dueCards(3), ...masteredDue(100, 8) }
    useStudy.setState({ progress: { en: { cards, stats: statsOf({}, 'en') } } })
    const { unmount } = render(
      <MemoryRouter initialEntries={['/review']}>
        <Review />
      </MemoryRouter>
    )
    expect(screen.getByText(new RegExp(`${3 + MAINTENANCE_PER_DAY} words due`))).toBeInTheDocument()
    unmount()
    render(
      <MemoryRouter initialEntries={['/review?limit=20']}>
        <Review />
      </MemoryRouter>
    )
    expect(screen.getByText(/3 words due/)).toBeInTheDocument()
  })
})
