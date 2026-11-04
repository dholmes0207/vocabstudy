/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { TALK_SETS } from '@/lib/toeicTalks'
import { shuffleSet } from '@/lib/toeicReading'

const spoken: { text: string; onEnd?: () => void }[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string; onEnd?: () => void }) => spoken.push(o),
  stopPronounce: () => {},
  textAudio: (text: string) => `/t/${text}`,
}))

const { default: TalkRound } = await import('./TalkRound')

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

describe('Part 3 round', () => {
  it('reads the lines in turn and shows the transcript only once every question is answered', () => {
    const talk = TALK_SETS.find((s) => s.id === 'p3-printer')!
    const { set, questions } = shuffleSet(talk)
    render(
      <MemoryRouter>
        <TalkRound set={set} questions={questions} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Listen' }))
    expect(screen.getByRole('button', { name: /Stop · Woman \(1\/4\)/ })).toBeInTheDocument()
    for (let i = 1; i < talk.lines.length; i++) {
      act(() => spoken[spoken.length - 1].onEnd?.())
      act(() => void vi.advanceTimersByTime(500))
    }
    expect(spoken.map((s) => s.text)).toEqual(talk.lines.map((l) => l.text))
    expect(screen.queryByText(talk.lines[0].text)).not.toBeInTheDocument()

    questions.forEach((q) => {
      const right = q.options[q.answer]
      const option = screen
        .getAllByRole('button')
        .find((b) => /^\([A-D]\)/.test(b.textContent ?? '') && b.textContent!.slice(3) === right)!
      fireEvent.click(option)
    })
    expect(screen.getByText(talk.lines[0].text)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'See results' }))
    expect(screen.getByText('3 of 3 right')).toBeInTheDocument()
  })

  it('prints the graphic of a set with one, as a table beside the questions', () => {
    const talk = TALK_SETS.find((s) => s.id === 'p3-train-graphic')!
    const { set, questions } = shuffleSet(talk)
    render(
      <MemoryRouter>
        <TalkRound set={set} questions={questions} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    const table = screen.getByRole('table')
    expect(screen.getByText('Trains to Riverton')).toBeInTheDocument()
    expect(table.querySelectorAll('tbody tr')).toHaveLength(4)
    expect(screen.getByRole('columnheader', { name: 'Departs' })).toBeInTheDocument()
  })
})
