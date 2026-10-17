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

// "Lưu để học" on the Learn page (docs/design/saved-words.md).

vi.mock('@/lib/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/audio')>()),
  pronounce: () => {},
  stopPronounce: () => {},
  prefetchAudio: () => {},
}))

const { default: Learn } = await import('./Learn')

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
