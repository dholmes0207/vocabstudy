/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { usePlacement } from '@/store/placementStore'
import { placementBands } from '@/lib/placement'

// "Kiểm tra trình độ" (docs/design/placement.md) on the real Korean pack.

vi.mock('@/lib/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/audio')>()),
  pronounce: () => {},
}))

const { default: Placement } = await import('./Placement')

const pack = JSON.parse(readFileSync('public/data/ko.json', 'utf8')) as LanguagePack
const bands = placementBands(pack.words.length)

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'ko' })
  useData.setState({ pack, status: 'ready' })
  usePlacement.setState({ results: {} })
})
afterEach(cleanup)

function renderPlacement() {
  render(
    <MemoryRouter initialEntries={['/placement']}>
      <Routes>
        <Route path="/placement" element={<Placement />} />
        <Route path="/learn" element={<p>learn page</p>} />
      </Routes>
    </MemoryRouter>
  )
  fireEvent.click(screen.getByRole('button', { name: /Start the check/ }))
}

/** Answer the question on screen: right (pick the word's meaning) or "don't know". */
function answer(right: boolean) {
  if (!right) return fireEvent.click(screen.getByRole('button', { name: /I don’t know/ }))
  const prompt = screen.getByText('What does this word mean?').nextElementSibling!.firstChild!
  const word = pack.words.find((w) => w.word === prompt.textContent)!
  fireEvent.click(screen.getByRole('button', { name: word.meaning }))
}

describe('placement check', () => {
  it('stops at the first band with fewer than 4 of 5 right and starts Learn there', () => {
    renderPlacement()
    for (let i = 0; i < 10; i++) answer(true) // levels 1 and 2
    expect(screen.getByText(`Level 3/${bands.length}`)).toBeInTheDocument()
    for (const ok of [true, true, false, false, true]) answer(ok)

    const start = bands[2].start
    expect(
      screen.getByRole('heading', { name: `You know the first ${start} words quite well` })
    ).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(`^Learn will start at word ${start + 1}:`))
    ).toHaveTextContent(pack.words[start].word)
    expect(screen.getByText(/estimate from 15 questions \(13 right\)/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Start learning here/ }))
    expect(usePlacement.getState().results.ko).toMatchObject({ start, asked: 15, correct: 13 })
    expect(screen.getByText('learn page')).toBeInTheDocument()
  })

  it('keeps a beginner at the start, and "Learn from the start" clears an old result', () => {
    usePlacement.setState({ results: { ko: { start: 50, day: 1, asked: 15, correct: 13 } } })
    renderPlacement()
    for (let i = 0; i < 5; i++) answer(false)
    expect(
      screen.getByRole('heading', { name: 'Starting from the beginning suits you best' })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Learn from the start/ }))
    expect(usePlacement.getState().results.ko).toBeUndefined()
  })

  it('places a learner who knows every band past the whole pack', () => {
    renderPlacement()
    for (let i = 0; i < bands.length * 5; i++) answer(true)
    expect(
      screen.getByRole('heading', { name: 'You know nearly all of these words!' })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Start learning here/ }))
    expect(usePlacement.getState().results.ko?.start).toBe(pack.words.length)
  })
})
