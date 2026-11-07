/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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

const { listening } = validateIeltsBank(
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
})
