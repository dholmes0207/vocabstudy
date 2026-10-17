/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { GrammarExample } from '@/lib/grammar'
import type { ListenOptions } from '@/lib/speech'
import { useSettings } from '@/store/settingsStore'

// "Nói thành tiếng" in a grammar lesson (docs/design/grammar.md). The browser's
// recognizer is replaced so the test decides what it "heard".

let supported = true
const sessions: ListenOptions[] = []
const abort = vi.fn()
vi.mock('@/lib/speech', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/speech')>()),
  isRecognitionSupported: () => supported,
  listenOnce: (o: ListenOptions) => {
    sessions.push(o)
    return { stop: () => o.onError('no-speech'), abort }
  },
}))
vi.mock('@/lib/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/audio')>()),
  pronounce: () => {},
  stopPronounce: () => {},
}))

const { default: SpeakAloud, SPEAK_COUNT } = await import('./SpeakAloud')

const unit = JSON.parse(readFileSync('public/data/grammar/en.json', 'utf8')).units[0] as {
  examples: GrammarExample[]
}

beforeEach(() => {
  supported = true
  sessions.length = 0
  abort.mockClear()
  useSettings.setState({ uiLang: 'en' })
})
afterEach(cleanup)

const renderIt = () =>
  render(
    <MemoryRouter>
      <SpeakAloud examples={unit.examples} lang="en-US" />
    </MemoryRouter>
  )

describe('saying grammar examples aloud', () => {
  it('offers the first few examples, each with a mic', () => {
    renderIt()
    expect(screen.getAllByRole('button', { name: 'Say this one' })).toHaveLength(SPEAK_COUNT)
  })

  it('listens in the pack’s language and scores what was heard', () => {
    renderIt()
    fireEvent.click(screen.getAllByRole('button', { name: 'Say this one' })[0])
    expect(sessions[0].lang).toBe('en-US')
    expect(screen.getByText('Listening… read it aloud.')).toBeInTheDocument()

    act(() => sessions[0].onResult([unit.examples[0].en.toLowerCase()]))
    expect(screen.getByText(/Great — 100%/)).toBeInTheDocument()
    expect(screen.getByText(/1 of 3 said well/)).toBeInTheDocument()
  })

  it('marks the words that did not come through', () => {
    renderIt()
    // "I am a student." heard without "a".
    fireEvent.click(screen.getAllByRole('button', { name: 'Say this one' })[0])
    act(() => sessions[0].onResult(['I am student']))
    const marked = document.querySelectorAll('mark')
    expect([...marked].map((m) => m.textContent)).toEqual(['a'])
    expect(screen.getByText(/Heard:/)).toHaveTextContent('I am student')
  })

  it('keeps one microphone open at a time', () => {
    renderIt()
    const mics = screen.getAllByRole('button', { name: 'Say this one' })
    fireEvent.click(mics[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Say this one' })[0]) // now row 2
    expect(abort).toHaveBeenCalled()
    expect(screen.getAllByText('Listening… read it aloud.')).toHaveLength(1)
  })

  it('explains a failure in plain words', () => {
    renderIt()
    fireEvent.click(screen.getAllByRole('button', { name: 'Say this one' })[0])
    act(() => sessions[0].onError('not-allowed'))
    expect(screen.getByText(/Microphone access is blocked/)).toBeInTheDocument()
  })

  it('still lets you hear and read along where speech cannot be scored', () => {
    supported = false
    renderIt()
    expect(screen.getByText(/cannot score speech yet/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Say this one' })).not.toBeInTheDocument()
  })
})
