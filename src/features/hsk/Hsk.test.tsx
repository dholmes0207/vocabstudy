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
import { useExam } from '@/store/examStore'

const spoken: string[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string }) => spoken.push(o.text),
  stopPronounce: () => {},
  exampleAudio: () => '',
  wordAudio: () => '',
}))

const { default: Hsk } = await import('./Hsk')
const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  spoken.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack: zh, status: 'ready' })
  useStudy.setState({ progress: {} })
  useExam.setState({ records: {} })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <Hsk />
    </MemoryRouter>
  )

/** Answer whatever is on screen: an option, or the first tile that fits, then go on. */
function answerAll(until: () => boolean) {
  for (let i = 0; i < 400 && !until(); i++) {
    const choice = screen
      .queryAllByRole('button')
      .find((b) => !b.hasAttribute('disabled') && b.className.includes('rounded-xl border-2'))
    if (choice) fireEvent.click(choice)
    else {
      // Build tiles: tap each pool tile until one is placed.
      for (const tile of screen.queryAllByRole('button').filter((b) => b.closest('[lang="zh"]')))
        fireEvent.click(tile)
    }
    const next = screen.queryByRole('button', { name: /^(Next|See results)/ })
    if (next) fireEvent.click(next)
  }
}

describe('HSK practice page', () => {
  it('switches level and offers every question type', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: 'HSK 1', selected: true })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'HSK 3' }))
    expect(screen.getByText(/HSK 3 words mastered/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Practise 10 questions' })).toHaveLength(6)
  })

  it('plays the recorded example of a listening question as it appears', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 10 questions' })[1])
    vi.advanceTimersByTime(300)
    expect(spoken).toHaveLength(1)
    expect(zh.words.some((w) => w.exampleEn === spoken[0])).toBe(true)
  })

  it('says a word for right-or-wrong, shows a picture, then what the picture was', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 10 questions' })[0])
    vi.advanceTimersByTime(300)
    const word = zh.words.find((w) => w.word === spoken[0])!
    expect(word.emoji).toBeTruthy()
    const picture = screen.getByRole('img', { name: 'Picture' }).textContent
    fireEvent.click(screen.getByRole('button', { name: '✓ Right' }))
    expect(screen.getByText(picture === word.emoji ? 'Right!' : 'Not quite.')).toBeInTheDocument()
    expect(screen.getByText(/^You heard/)).toHaveTextContent(word.meaning)
    if (picture !== word.emoji) expect(screen.getByText(/^The picture is/)).toBeInTheDocument()
  })

  it('shows a word with its pinyin and a picture to read, and says the word once answered', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 10 questions' })[2])
    vi.advanceTimersByTime(300)
    expect(spoken).toHaveLength(0)
    expect(screen.getByText('Is the picture this word?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '✗ Wrong' }))
    const word = zh.words.find((w) => w.word === spoken[0])!
    expect(screen.getByText(/^The word/)).toHaveTextContent(word.meaning)
  })

  it('opens the HSK 1 mini test with right-or-wrong pictures: 10 listening, 10 reading', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Take the mini test' }))
    expect(screen.getByRole('img', { name: 'Picture' })).toBeInTheDocument()
    answerAll(() => !!screen.queryByText(/^Estimate: about \d+\/200/))
    expect(screen.getByText(/^Listening: \d+\/10/)).toBeInTheDocument()
    expect(screen.getByText(/^Reading: \d+\/10/)).toBeInTheDocument()
    expect(useExam.getState().records['hsk1-mini']?.total).toBe(20)
  })

  it('runs the HSK 3 mini test through its three parts and gives a score out of 300', () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: 'HSK 3' }))
    fireEvent.click(screen.getByRole('button', { name: 'Take the mini test' }))
    answerAll(() => !!screen.queryByText(/^Estimate: about \d+\/300/))
    expect(screen.getByText(/^Estimate: about \d+\/300 \(pass from 180\)/)).toBeInTheDocument()
    expect(screen.getByText(/^Writing: \d+\/10/)).toBeInTheDocument()
    expect(useExam.getState().records['hsk3-mini']?.total).toBe(30)
  })
})
