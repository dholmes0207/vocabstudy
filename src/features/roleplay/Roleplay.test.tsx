/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { ListenOptions } from '@/lib/speech'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { validateRoleplay } from '@/lib/roleplay'

// The recognizer and the voice are replaced so the test decides what was heard
// and when a line finishes playing.

const sessions: ListenOptions[] = []
vi.mock('@/lib/speech', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/speech')>()),
  isRecognitionSupported: () => true,
  listenOnce: (o: ListenOptions) => {
    sessions.push(o)
    return { stop: () => {}, abort: () => {} }
  },
}))
const spoken: { text: string; onEnd?: () => void }[] = []
vi.mock('@/lib/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/audio')>()),
  pronounce: (o: { text: string; onEnd?: () => void }) => spoken.push(o),
  stopPronounce: () => {},
  textAudio: () => '',
}))
vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))

const { default: RoleplayRound } = await import('./RoleplayRound')
const scene = validateRoleplay(
  JSON.parse(readFileSync('public/data/roleplay/en.json', 'utf8'))
).scenes.find((s) => s.id === 'coffee')!

beforeEach(() => {
  vi.useFakeTimers()
  sessions.length = 0
  spoken.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

/** Let the line being read finish, then the short gap. */
function finishSpeaking() {
  act(() => spoken[spoken.length - 1].onEnd?.())
  act(() => vi.advanceTimersByTime(500))
}

describe('Role-play', () => {
  it('reads their lines, scores mine, and gives stars at the end', () => {
    render(
      <MemoryRouter>
        <RoleplayRound
          scene={scene}
          pack="en"
          challenge={false}
          onAgain={() => {}}
          onExit={() => {}}
        />
      </MemoryRouter>
    )
    for (let i = 0; i < scene.lines.length; i++) {
      const line = scene.lines[i]
      if (line.who === 'them') {
        expect(spoken[spoken.length - 1].text).toBe(line.text)
        finishSpeaking()
        continue
      }
      expect(screen.getByText(`“${line.vi}”`)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Speak/ }))
      act(() => sessions[sessions.length - 1].onResult([line.text]))
      expect(screen.getByRole('status')).toHaveTextContent('Great! 100%')
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    }
    expect(screen.getByLabelText('3 stars')).toBeInTheDocument()
    expect(screen.getByText(/Average 100% · \+12 XP/)).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.roleplay).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(12)
  })

  it('hides my line in challenge mode until it is scored, and marks missed words', () => {
    render(
      <MemoryRouter>
        <RoleplayRound scene={scene} pack="en" challenge onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    finishSpeaking()
    const mine = scene.lines[1]
    expect(screen.queryByText(mine.text)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Speak/ }))
    act(() => sessions[0].onResult(['can I have a coffee']))
    expect(screen.getByRole('status')).toHaveTextContent(/^Good: \d+%$/)
    // The word not heard is marked; the rest of the line now shows.
    expect(screen.getAllByText(/latte/).some((el) => el.tagName === 'MARK')).toBe(true)
    expect(screen.getByRole('button', { name: /Say it again/ })).toBeInTheDocument()
  })
})
