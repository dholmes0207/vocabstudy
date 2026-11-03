/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Topics from './Topics'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { newCard } from '@/lib/srs'

// "Học theo chủ đề" (docs/design/topics.md) with the real pack and decks:
// every deck can be learned, and reviewed once some of its words are known.

const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack
const topics = JSON.parse(readFileSync('public/data/topics/en.json', 'utf8'))
const work = topics.topics.find((t: { id: string }) => t.id === 'work')

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => topics }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const renderTopics = () =>
  render(
    <MemoryRouter>
      <Topics />
    </MemoryRouter>
  )

describe('Topics', () => {
  it('lists every deck; review waits until a word of the deck is known', async () => {
    renderTopics()
    await screen.findAllByRole('button', { name: /Learn/ })
    expect(screen.getAllByRole('listitem')).toHaveLength(topics.topics.length)
    for (const b of screen.getAllByRole('button', { name: /Review/ })) expect(b).toBeDisabled()
  })

  it('reviews only the words of the deck you have met', async () => {
    const met = work.wordIds.slice(0, 3) as number[]
    useStudy.setState({
      progress: {
        en: {
          cards: Object.fromEntries(met.map((id) => [id, newCard(id)])),
        } as never,
      },
    })
    renderTopics()
    const card = (await screen.findByText('At work')).closest('li')!
    const review = within(card).getByRole('button', { name: 'Review (3)' })
    expect(review).toBeEnabled()
    fireEvent.click(review)
    // Three questions: one per word met, none from the rest of the deck. (Which
    // word shows on screen depends on the random question type, so not checked.)
    expect(await screen.findByText('1/3')).toBeInTheDocument()
    // The review takes the whole page: no deck grid or page header around it.
    expect(screen.queryByRole('heading', { name: /Learn by topic/ })).not.toBeInTheDocument()
  })
})
