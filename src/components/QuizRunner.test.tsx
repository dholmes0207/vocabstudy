/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { PosCategory, QuizQuestion, Word } from '@/types'
import { PRAISE } from '@/lib/encourage'

vi.mock('@/lib/audio', () => ({
  pronounce: vi.fn(),
  prefetchAudio: vi.fn(),
  wordAudio: () => '',
  exampleAudio: () => '',
}))

const { default: QuizRunner } = await import('./QuizRunner')
const { useSettings } = await import('@/store/settingsStore')

// A quiz that only grades teaches nothing. These pin the two behaviours that
// make the runner a teacher: it explains a miss (including what the wrong pick
// actually was) and, in learning/review, brings the missed word back.

function word(id: number, en: string, vi: string): Word {
  return {
    id,
    word: en,
    ipa: '',
    viRead: '',
    pos: 'n.',
    posCategory: 'noun' as PosCategory,
    meaning: vi,
    exampleEn: `I like the ${en}.`,
    exampleVi: `Tôi thích ${vi}.`,
    tip: `Mẹo cho ${en}`,
  }
}

const apple = word(1, 'apple', 'quả táo')
const river = word(2, 'river', 'con sông')
const house = word(3, 'house', 'ngôi nhà')
const byId = new Map([apple, river, house].map((w) => [w.id, w] as const))

/** "What does <word> mean?" with fixed option order: [right, river, house]. */
const q = (w: Word): QuizQuestion => ({
  wordId: w.id,
  mode: 'en-to-vi',
  prompt: w.word,
  answer: w.meaning,
  options: [w, ...[river, house, apple].filter((o) => o.id !== w.id).slice(0, 2)].map((o) => ({
    text: o.meaning,
    correct: o.id === w.id,
    wordId: o.id,
  })),
})

beforeEach(() => useSettings.setState({ soundEnabled: false }))
afterEach(cleanup)

function setup(requeueWrong: boolean, questions = [q(apple), q(river), q(house)]) {
  const onAnswer = vi.fn()
  const done = vi.fn(() => <p>DONE</p>)
  render(
    <QuizRunner
      questions={questions}
      wordsById={byId}
      ttsLang="en-US"
      requeueWrong={requeueWrong}
      onAnswer={onAnswer}
      renderComplete={done}
    />
  )
  return { onAnswer, done }
}

const pick = (text: string) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(text) }))
const next = () =>
  fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ }))

describe('QuizRunner', () => {
  it('after a miss, says what the wrong pick really means and shows the right word', () => {
    setup(false)
    pick('con sông') // asked "apple", picked river's meaning
    expect(screen.getByText(/đó là nghĩa của từ/)).toHaveTextContent('river')
    expect(screen.getByText('Mẹo cho apple')).toBeInTheDocument()
  })

  it('after a right answer, puts the word back in its sentence', () => {
    setup(false)
    pick('quả táo')
    // The praise varies by question (lib/encourage); any of them means "right".
    expect(screen.getByText(new RegExp(`^✓ (${PRAISE.join('|')})$`))).toBeInTheDocument()
    expect(screen.getByText('Tôi thích quả táo.')).toBeInTheDocument()
  })

  it('with requeueWrong, a missed word comes back later in the session', () => {
    const { onAnswer } = setup(true)
    expect(screen.getByText('1/3')).toBeInTheDocument()
    pick('con sông')
    expect(screen.getByText(/quay lại sau vài câu/)).toBeInTheDocument()
    expect(screen.getByText('1/4')).toBeInTheDocument()

    next()
    pick('con sông') // river, right
    next()
    pick('ngôi nhà') // house, right
    next()
    expect(screen.getByRole('heading', { name: 'apple' })).toBeInTheDocument()
    expect(screen.getByText(/thử lại/)).toBeInTheDocument()
    pick('quả táo')
    // Every answer reaches the SRS, the retry included.
    expect(onAnswer.mock.calls).toEqual([
      [1, false],
      [2, true],
      [3, true],
      [1, true],
    ])
  })

  it('scores first attempts only, so a retried word still counts as missed', () => {
    const { done } = setup(true)
    pick('con sông')
    next()
    pick('con sông')
    next()
    pick('ngôi nhà')
    next()
    pick('quả táo')
    next()
    expect(screen.getByText('DONE')).toBeInTheDocument()
    expect(done).toHaveBeenLastCalledWith(2, 3, [1])
  })

  it('without requeueWrong (the quiz), a miss does not come back', () => {
    setup(false)
    pick('con sông')
    expect(screen.queryByText(/quay lại sau vài câu/)).not.toBeInTheDocument()
    expect(screen.getByText('1/3')).toBeInTheDocument()
  })

  it('a typed answer submitted with Enter stays on screen until a second Enter', () => {
    // Regression: focusing "Câu tiếp theo" on reveal let the submitting Enter's
    // keypress click it, so a wrong typed answer skipped its correction unseen.
    const fill: QuizQuestion = {
      wordId: 1,
      mode: 'fill',
      prompt: 'I like the _____.',
      hint: 'quả táo',
      answer: 'apple',
      surface: 'apple',
      options: [],
    }
    setup(true, [fill, q(river)])
    const box = screen.getByLabelText('Câu trả lời')
    fireEvent.change(box, { target: { value: 'aple' } })
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(screen.getByText(/Chưa đúng/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Câu tiếp theo/ })).not.toHaveFocus()
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(screen.getByRole('heading', { name: 'river' })).toBeInTheDocument()
  })

  it('gives up on a question after the maximum attempts, so the session always ends', () => {
    const { done } = setup(true, [q(apple)])
    for (let i = 0; i < 10 && !screen.queryByText('DONE'); i++) {
      pick('con sông')
      next()
    }
    expect(screen.getByText('DONE')).toBeInTheDocument()
    expect(done).toHaveBeenLastCalledWith(0, 1, [1])
  })
})
