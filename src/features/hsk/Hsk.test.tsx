/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useExam } from '@/store/examStore'
import { useRetry } from '@/store/retryStore'

const spoken: string[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string }) => spoken.push(o.text),
  stopPronounce: () => {},
  exampleAudio: () => '',
  wordAudio: () => '',
  textAudio: () => '',
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
  useRetry.setState({ hsk: {} })
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
    expect(screen.getAllByRole('button', { name: 'Practise 10 questions' })).toHaveLength(8)
    // HSK 2 and 3 add their dialogues, five a round.
    expect(screen.getByRole('button', { name: 'Practise 5 questions' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'HSK 1' }))
    expect(screen.queryByRole('button', { name: 'Practise 5 questions' })).not.toBeInTheDocument()
    // HSK 2 also has its picture dialogues.
    fireEvent.click(screen.getByRole('tab', { name: 'HSK 2' }))
    expect(screen.getAllByRole('button', { name: 'Practise 5 questions' })).toHaveLength(2)
    // …and its sentence matching, the same drill as the HSK 1 questions and answers.
    expect(screen.getByText(/Question and answer/)).toBeInTheDocument()
  })

  it('plays the recorded example of a listening question as it appears', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 10 questions' })[2])
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
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 10 questions' })[3])
    vi.advanceTimersByTime(300)
    expect(spoken).toHaveLength(0)
    expect(screen.getByText('Is the picture this word?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '✗ Wrong' }))
    const word = zh.words.find((w) => w.word === spoken[0])!
    expect(screen.getByText(/^The word/)).toHaveTextContent(word.meaning)
  })

  it('plays a sentence and offers three pictures, one of the word it is about', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 10 questions' })[1])
    vi.advanceTimersByTime(300)
    const word = zh.words.find((w) => w.exampleEn === spoken[0])!
    expect(screen.getByText('Hear the sentence, then pick its picture.')).toBeInTheDocument()
    const pictures = screen.getAllByRole('img', { name: /^Picture \d$/ })
    expect(pictures).toHaveLength(3)
    fireEvent.click(pictures.find((p) => p.textContent === word.emoji)!)
    expect(screen.getByText('Right!')).toBeInTheDocument()
  })

  it('shows a sentence with its pinyin to read, three pictures, and says it once answered', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 10 questions' })[5])
    vi.advanceTimersByTime(300)
    expect(spoken).toHaveLength(0)
    expect(screen.getByText('Read the sentence, then pick its picture.')).toBeInTheDocument()
    const pictures = screen.getAllByRole('img', { name: /^Picture \d$/ })
    expect(pictures).toHaveLength(3)
    fireEvent.click(pictures[0])
    const word = zh.words.find((w) => w.exampleEn === spoken[0])!
    expect(word.emoji).toBeTruthy()
  })

  it('plays an HSK 2 dialogue, offers five pictures, then shows its transcript', () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: 'HSK 2' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 5 questions' })[0])
    expect(screen.getByText('Hear the dialogue, then pick its picture.')).toBeInTheDocument()
    const pictures = screen.getAllByRole('img', { name: /^Picture [A-E]$/ })
    expect(pictures).toHaveLength(5)
    fireEvent.click(pictures[0])
    expect(screen.getByText(/^(Right!|Not quite\.)$/)).toBeInTheDocument()
    expect(screen.getAllByText(/^(Woman|Man):$/).length).toBeGreaterThanOrEqual(2)
  })

  it('runs the HSK 2 mini test: 10 listening with both kinds of dialogue, 10 reading', () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: 'HSK 2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Take the mini test' }))
    answerAll(() => !!screen.queryByText(/^Estimate: about \d+\/200/))
    expect(screen.getByText(/^Listening: \d+\/10/)).toBeInTheDocument()
    expect(useExam.getState().records['hsk2-mini']?.total).toBe(20)
  })

  it('asks an HSK 1 question with four answers, then reads both and shows their Vietnamese', () => {
    renderPage()
    const card = screen.getByText(/Question and answer/).closest('li')!
    fireEvent.click(within(card).getByRole('button'))
    expect(screen.getByText('Read the question and pick its answer.')).toBeInTheDocument()
    const options = screen.getAllByRole('button').filter((b) => b.getAttribute('lang') === 'zh')
    expect(options).toHaveLength(4)
    fireEvent.click(options[0])
    expect(screen.getByText(/^(Right!|Not quite\.)$/)).toBeInTheDocument()
    expect(spoken).toHaveLength(1)
  })

  it('counts answers by kind and names the weakest kind of the level', () => {
    renderPage()
    expect(screen.queryByText(/Your weakest kind/)).not.toBeInTheDocument()
    cleanup()
    useRetry.setState({ hsk: { 'hsk1:judge': [9, 10], 'hsk1:fill': [2, 6], 'hsk2:fill': [0, 9] } })
    renderPage()
    expect(screen.getByText(/^Your weakest kind in HSK 1: Fill the gap/)).toHaveTextContent(
      '(2 of 6 right)'
    )
    // A round's answers are counted under its level and kind.
    useRetry.setState({ hsk: {} })
    fireEvent.click(screen.getAllByRole('button', { name: 'Practise 10 questions' })[0])
    const option = screen
      .getAllByRole('button')
      .find((b) => /Right|Wrong/.test(b.textContent ?? ''))!
    fireEvent.click(option)
    expect(useRetry.getState().hsk['hsk1:judge']?.[1]).toBe(1)
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
