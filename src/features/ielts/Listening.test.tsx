/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { validateIeltsBank } from '@/lib/ielts'

const heard: { text: string; onEnd?: () => void }[] = []
vi.mock('@/lib/audio', () => ({
  pronounce: (o: { text: string; onEnd?: () => void }) => heard.push(o),
  stopPronounce: () => {},
  prefetchAudio: () => {},
  textAudio: () => '',
}))
vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: ListeningRound } = await import('./ListeningRound')
const { default: ListeningChoiceRound } = await import('./ListeningChoiceRound')

const { listening, listeningChoice } = validateIeltsBank(
  JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8'))
)

beforeEach(() => {
  heard.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

describe('IELTS listening', () => {
  it('plays the call line by line, then checks the form and shows the transcript', () => {
    const set = listening[0]
    render(
      <MemoryRouter>
        <ListeningRound set={set} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(heard[0].text).toBe(set.lines[0].text)
    expect(
      screen.getByRole('button', { name: `Playing 1/${set.lines.length}` })
    ).toBeInTheDocument()

    // All right but the last blank.
    set.form.fields.forEach((f, i) =>
      fireEvent.change(screen.getByLabelText(`${i + 1}. ${f.label}`), {
        target: { value: i === set.form.fields.length - 1 ? 'nope' : f.answer.toUpperCase() },
      })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    const n = set.form.fields.length
    expect(screen.getByRole('status')).toHaveTextContent(`${n - 1} of ${n} right`)
    expect(screen.getByText(`Answer: ${set.form.fields[n - 1].answer}`)).toBeInTheDocument()
    expect(screen.getByText(set.lines[0].text)).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.['ielts-listening']).toBe(1)
  })

  it('labels a Part 4 lecture as note completion', () => {
    const set = listening.find((l) => l.part === 4)!
    render(
      <MemoryRouter>
        <ListeningRound set={set} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByText(/Part 4 · Note completion/)).toBeInTheDocument()
    expect(screen.getByText(set.form.title)).toBeInTheDocument()
  })

  it('runs a Part 3 discussion: plays it, takes A/B/C answers, explains each and shows who said what', () => {
    const set = listeningChoice.find((c) => c.part === 3)!
    render(
      <MemoryRouter>
        <ListeningChoiceRound set={set} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(heard[0].text).toBe(set.lines[0].text)
    // Each line follows the one before when it ends.
    heard[0].onEnd?.()
    expect(screen.getByRole('button', { name: /Answer all/ })).toBeDisabled()

    // Right on all but the first question.
    set.questions.forEach((q, i) => {
      const group = screen.getByRole('group', { name: `${i + 1}. ${q.q}` })
      const pick = i === 0 ? (q.answer + 1) % q.options.length : q.answer
      fireEvent.click(within(group).getByRole('button', { name: new RegExp(q.options[pick]) }))
    })
    fireEvent.click(screen.getByRole('button', { name: /^Check/ }))
    const n = set.questions.length
    expect(screen.getByRole('status')).toHaveTextContent(
      `${n - 1} of ${n} right · +${(n - 1) * 2} XP`
    )
    expect(screen.getByText(set.questions[0].why)).toBeInTheDocument()
    expect(screen.getByText(set.lines[0].text)).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.['ielts-listening']).toBe(1)
  })
})
