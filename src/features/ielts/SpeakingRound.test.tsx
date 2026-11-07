/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { PART2_PREP, validateIeltsBank } from '@/lib/ielts'

const asked: string[] = []
vi.mock('@/lib/audio', () => ({
  pronounce: (o: { text: string }) => asked.push(o.text),
  stopPronounce: () => {},
  textAudio: () => '',
}))
vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: SpeakingRound } = await import('./SpeakingRound')

const { speaking } = validateIeltsBank(
  JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8'))
)

beforeEach(() => {
  asked.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const renderTask = (task: Parameters<typeof SpeakingRound>[0]['task']) =>
  render(
    <MemoryRouter>
      <SpeakingRound task={task} onAgain={() => {}} onExit={() => {}} />
    </MemoryRouter>
  )

describe('IELTS speaking', () => {
  it('Part 1: reads each question aloud, then counts the session', () => {
    const topic = speaking.part1[0]
    renderTask({ part: 1, topic })
    for (const q of topic.questions) {
      expect(screen.getByText(q)).toBeInTheDocument()
      expect(asked.at(-1)).toBe(q)
      fireEvent.click(screen.getByRole('button', { name: /^(Next question|Finish)/ }))
    }
    expect(screen.getByText('Well spoken!')).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.['ielts-speaking']).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(10)
  })

  it('Part 2: a minute to prepare runs out into the talk, then Part 3', () => {
    vi.useFakeTimers()
    const card = speaking.part2[0]
    renderTask({ part: 2, card })
    expect(screen.getByText(card.cue)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Start the minute to prepare/ }))
    expect(screen.getByText('1:00')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(PART2_PREP * 1000))
    expect(screen.getByText(/Keep going until the two minutes are up/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /On to Part 3/ }))
    expect(screen.getByText(card.part3[0])).toBeInTheDocument()
    expect(asked.at(-1)).toBe(card.part3[0])
  })
})
