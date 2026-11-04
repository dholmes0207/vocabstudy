/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { dialogueRound } from '@/lib/hskDialogues'
import { mulberry32 } from '@/lib/sky'

const spoken: { src: string; onEnd?: () => void }[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { audioSrc: string; onEnd?: () => void }) =>
    spoken.push({ src: o.audioSrc, onEnd: o.onEnd }),
  stopPronounce: () => {},
  textAudio: (text: string, gender?: string) => `${gender ?? 'any'}:${text}`,
}))

const { default: HskDialogueRound } = await import('./HskDialogueRound')

beforeEach(() => {
  vi.useFakeTimers()
  spoken.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'zh', soundEnabled: false })
  useStudy.setState({ progress: {} })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('HSK dialogue round', () => {
  it('reads each line in its speaker’s voice, then the question, and shows the transcript once answered', () => {
    const dialogues = dialogueRound(2, mulberry32(4))
    render(
      <MemoryRouter>
        <HskDialogueRound
          title="HSK 3"
          dialogues={dialogues}
          onAgain={() => {}}
          onExit={() => {}}
        />
      </MemoryRouter>
    )
    const d = dialogues[0]
    act(() => void vi.advanceTimersByTime(300))
    for (let i = 0; i < d.lines.length; i++) {
      act(() => spoken[spoken.length - 1].onEnd?.())
      act(() => void vi.advanceTimersByTime(500))
    }
    const voice = { W: 'female', M: 'male' }
    expect(spoken.map((s) => s.src)).toEqual([
      ...d.lines.map((l) => `${voice[l.speaker]}:${l.zh}`),
      `any:${d.q}`,
    ])
    expect(screen.queryByText(d.lines[0].vi)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: new RegExp(d.options[d.answer]) }))
    expect(screen.getByText('Right!')).toBeInTheDocument()
    expect(screen.getByText(d.lines[0].vi)).toBeInTheDocument()
    expect(screen.getByText(d.qVi)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })
})
