/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { INFO_SETS, OPINIONS, SURVEYS } from '@/lib/toeicSpeaking'

const said: string[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string }) => said.push(o.text),
  stopPronounce: () => {},
  textAudio: () => '',
}))
vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))

const { default: ToeicSpeaking } = await import('./ToeicSpeaking')
const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  said.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <ToeicSpeaking />
    </MemoryRouter>
  )

describe('TOEIC Speaking', () => {
  it('runs a survey: reads each question out, times it, offers a sample', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /^Start/ })[1])
    const set = SURVEYS.find((s) => screen.queryByText(s.intro))!
    expect(set).toBeTruthy()
    set.questions.forEach((x, i) => {
      expect(screen.getByText(x.q)).toBeInTheDocument()
      expect(said.at(-1)).toBe(x.q)
      expect(screen.getByText(new RegExp(`${x.seconds} seconds`))).toBeInTheDocument()
      if (i === 0) {
        fireEvent.click(screen.getByRole('button', { name: /See a sample answer/ }))
        expect(screen.getByText('Sample answer')).toBeInTheDocument()
        expect(screen.getByText(x.sample.key).tagName).toBe('MARK')
      }
      fireEvent.click(screen.getByRole('button', { name: /^(Next question|Finish)/ }))
    })
    expect(screen.getByText('Well spoken!')).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.['toeic-speaking']).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(10)
  })

  it('reads aloud: the text is shown but not read out first', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /^Start/ })[0])
    expect(screen.getByText(/45 seconds/)).toBeInTheDocument()
    expect(said).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Hear it read' }))
    expect(said).toHaveLength(1)
  })

  it('answers a caller from a schedule kept on screen', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /^Start/ })[2])
    const set = INFO_SETS.find((s) => screen.queryByText(s.title))!
    expect(set).toBeTruthy()
    expect(screen.getByText(set.lines[0])).toBeInTheDocument()
    expect(screen.getByText(set.intro)).toBeInTheDocument()
    expect(said.at(-1)).toBe(set.questions[0].q)
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    // The schedule stays while the next question is asked.
    expect(screen.getByText(set.lines[0])).toBeInTheDocument()
    expect(said.at(-1)).toBe(set.questions[1].q)
  })

  it('gives an opinion in 60 seconds', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /^Start/ })[3])
    expect(screen.getByText(/60 seconds/)).toBeInTheDocument()
    expect(OPINIONS.some((o) => said.at(-1) === o.prompt)).toBe(true)
  })

  it('is for the English pack only', () => {
    useSettings.setState({ currentLang: 'zh' })
    renderPage()
    expect(screen.queryByRole('button', { name: /^Start/ })).toBeNull()
  })
})
