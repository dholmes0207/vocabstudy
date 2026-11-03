/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { part2Round } from '@/lib/toeicPart2'

// Part 2 as on the test: the question and responses are heard, not read, until
// the learner answers. The voice is mocked so the test says when a clip ends.

const spoken: { text: string; onEnd?: () => void }[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string; onEnd?: () => void }) => spoken.push(o),
  stopPronounce: () => {},
  textAudio: (text: string) => `/t/${text}`,
}))

const { default: Part2Round } = await import('./Part2Round')

beforeEach(() => {
  vi.useFakeTimers()
  spoken.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Part 2 round', () => {
  it('reads the question then (A), (B), (C), and shows them only after the answer', () => {
    const questions = part2Round()
    const q = questions[0]
    render(
      <MemoryRouter>
        <Part2Round questions={questions} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    act(() => void vi.advanceTimersByTime(300))
    expect(spoken.map((s) => s.text)).toEqual([q.prompt])
    for (let i = 0; i < 3; i++) {
      act(() => spoken[spoken.length - 1].onEnd?.())
      act(() => void vi.advanceTimersByTime(600))
    }
    expect(spoken.map((s) => s.text)).toEqual([q.prompt, ...q.options])
    expect(screen.queryByText(q.prompt)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: `(${'ABC'[q.answer]})` }))
    expect(screen.getByText(q.prompt)).toBeInTheDocument()
    expect(screen.getByText(/^Right!/)).toBeInTheDocument()
    expect(screen.getByText(q.why)).toBeInTheDocument()
  })

  it('stops the old chain when the learner plays again', () => {
    const questions = part2Round()
    render(
      <MemoryRouter>
        <Part2Round questions={questions} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    act(() => void vi.advanceTimersByTime(300))
    const first = spoken[0]
    fireEvent.click(screen.getByRole('button', { name: 'Play again' }))
    act(() => first.onEnd?.())
    act(() => void vi.advanceTimersByTime(600))
    // Only the replay's question: the first chain's callback did nothing.
    expect(spoken.map((s) => s.text)).toEqual([questions[0].prompt, questions[0].prompt])
  })

  it('ends with the score and XP', () => {
    const questions = part2Round()
    render(
      <MemoryRouter>
        <Part2Round questions={questions} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    for (const q of questions) {
      fireEvent.click(screen.getByRole('button', { name: `(${'ABC'[q.answer]})` }))
      fireEvent.click(screen.getByRole('button', { name: /Next|See results/ }))
    }
    expect(screen.getByText('10 of 10 right')).toBeInTheDocument()
    expect(useStudy.getState().progress.en?.stats.xp).toBeGreaterThanOrEqual(25)
  })
})
