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
import { useSavedWords } from '@/store/savedWordsStore'
import { usePlacement } from '@/store/placementStore'
import { KNOWN_BOX } from '@/lib/srs'
import { buildDecks } from '@/lib/decks'

// "Lưu để học" on the Learn page (docs/design/saved-words.md).

vi.mock('@/lib/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/audio')>()),
  pronounce: () => {},
  stopPronounce: () => {},
  prefetchAudio: () => {},
}))

const { default: Learn, TestOutResult } = await import('./Learn')

const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack
const byWord = (w: string) => pack.words.find((x) => x.word === w)!

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  useSavedWords.setState({ saved: {} })
  usePlacement.setState({ results: {} })
})
afterEach(cleanup)

const renderLearn = () =>
  render(
    <MemoryRouter>
      <Learn />
    </MemoryRouter>
  )

describe('words saved while reading', () => {
  it('waits on the Learn page and starts a lesson with exactly those words', () => {
    const [a, b] = [byWord('umbrella'), byWord('drink')]
    useSavedWords.setState({ saved: { en: [a.id, b.id] } })
    renderLearn()
    const card = screen.getByRole('region', { name: 'Words you saved (2)' })
    expect(card).toHaveTextContent('umbrella')
    expect(card).toHaveTextContent('drink')

    fireEvent.click(screen.getByRole('button', { name: /Learn 2 saved words/ }))
    expect(screen.queryByRole('region', { name: /Words you saved/ })).not.toBeInTheDocument()
    expect(screen.getAllByText('umbrella').length).toBeGreaterThan(0)
  })

  it('drops a saved word once it is in the review schedule, and hides an empty card', () => {
    const a = byWord('umbrella')
    useSavedWords.setState({ saved: { en: [a.id] } })
    useStudy.getState().recordAnswer('en', a.id, true)
    renderLearn()
    expect(screen.queryByRole('region', { name: /Words you saved/ })).not.toBeInTheDocument()
    expect(useSavedWords.getState().saved.en).toEqual([])
  })
})

describe('quick lesson (?quick=1)', () => {
  const renderQuick = () =>
    render(
      <MemoryRouter initialEntries={['/learn?quick=1']}>
        <Learn />
      </MemoryRouter>
    )

  it('opens straight on the first of five new words, no extra tap', () => {
    renderQuick()
    expect(screen.getByText('1/5')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Placement check' })).not.toBeInTheDocument()
  })

  it('shows the Learn page when no new words are left today', () => {
    const { dailyNewLimit } = useSettings.getState()
    useSettings.setState({ dailyNewLimit: 0 })
    try {
      renderQuick()
      expect(
        screen.getByRole('heading', { name: 'Already know some English?' })
      ).toBeInTheDocument()
    } finally {
      useSettings.setState({ dailyNewLimit })
    }
  })
})

describe('placement check on the Learn page', () => {
  it('is offered to a new learner', () => {
    renderLearn()
    expect(screen.getByRole('heading', { name: 'Already know some English?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Placement check' })).toHaveAttribute(
      'href',
      '/placement'
    )
  })

  it('starts new words at the placement point, and says so', () => {
    usePlacement.setState({ results: { en: { start: 400, day: 1, asked: 30, correct: 27 } } })
    renderLearn()
    expect(screen.queryByRole('heading', { name: /Already know some/ })).not.toBeInTheDocument()
    expect(screen.getByText(/new words start at word 401/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Learn \d+ words$/ }))
    expect(screen.getAllByText(pack.words[400].word).length).toBeGreaterThan(0)
  })
})

describe('"I already know this word" on a meet card', () => {
  it('skips the word, schedules a check, and moves to the next card', () => {
    renderLearn()
    fireEvent.click(screen.getByRole('button', { name: /^Learn \d+ words$/ }))
    const [first, second] = pack.words
    expect(screen.getAllByText(first.word).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /I already know this word/ }))
    expect(useStudy.getState().progress.en.cards[first.id]).toMatchObject({ box: KNOWN_BOX })
    expect(screen.getAllByText(second.word).length).toBeGreaterThan(0)
    expect(useStudy.getState().newIntroducedToday('en')).toBe(0)
  })

  it('says so at the end when every word was already known', () => {
    const a = byWord('umbrella')
    useSavedWords.setState({ saved: { en: [a.id] } })
    renderLearn()
    fireEvent.click(screen.getByRole('button', { name: /Learn 1 saved word/ }))
    fireEvent.click(screen.getByRole('button', { name: /I already know this word/ }))
    expect(screen.getByText(/You skipped 1 word you already know/)).toBeInTheDocument()
  })

  it('is not offered for a word already in the review schedule', () => {
    // A deck replay also shows started words; the first deck holds pack.words[0..19].
    useStudy.getState().recordAnswer('en', pack.words[0].id, true)
    renderLearn()
    fireEvent.click(screen.getAllByRole('button', { name: /Set 1/ })[0])
    expect(
      screen.queryByRole('button', { name: /I already know this word/ })
    ).not.toBeInTheDocument()
  })
})

describe('"Try saying it" on a meet card', () => {
  it('opens the pronunciation trainer for that word only when asked, outside the SRS', () => {
    renderLearn()
    fireEvent.click(screen.getByRole('button', { name: /^Learn \d+ words$/ }))
    const first = pack.words[0]
    expect(screen.queryByRole('button', { name: `Say "${first.word}"` })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Try saying it/ }))
    expect(screen.getByRole('button', { name: `Say "${first.word}"` })).toBeInTheDocument()
    expect(useStudy.getState().progress.en).toBeUndefined()

    // The next word starts closed again.
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))
    expect(screen.getByRole('button', { name: /Try saying it/ })).toBeInTheDocument()
  })
})

describe('test out of the next set', () => {
  it('is offered once placement is settled, on the set the next new word comes from', () => {
    usePlacement.setState({ results: { en: { start: 40, day: 1, asked: 15, correct: 12 } } })
    renderLearn()
    expect(screen.getByRole('heading', { name: 'Already know set 3?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Check set 3' }))
    expect(screen.getByText('Test out of set 3')).toBeInTheDocument()
  })

  it('is not offered to a newcomer, who gets the placement check instead', () => {
    renderLearn()
    expect(screen.queryByRole('heading', { name: /Already know set/ })).not.toBeInTheDocument()
  })

  const deck = buildDecks(pack.words, {})[2]
  const renderResult = (correct: number) =>
    render(
      <MemoryRouter>
        <TestOutResult
          deck={deck}
          fresh={deck.words}
          correct={correct}
          total={8}
          onLearn={() => {}}
          onBack={() => {}}
        />
      </MemoryRouter>
    )

  it('skips every new word of the set on a pass, to be checked later', () => {
    renderResult(7)
    expect(screen.getByText('You tested out of set 3!')).toBeInTheDocument()
    const cards = useStudy.getState().progress.en.cards
    expect(deck.words.every((w) => cards[w.id]?.box === KNOWN_BOX)).toBe(true)
  })

  it('changes nothing and offers the lesson on a miss', () => {
    renderResult(6)
    expect(screen.getByRole('button', { name: 'Learn set 3' })).toBeInTheDocument()
    expect(useStudy.getState().progress.en).toBeUndefined()
  })
})
