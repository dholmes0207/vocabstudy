/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { shuffleSet } from '@/lib/toeicReading'
import { validateToeicBank } from '@/lib/toeicBank'
import ReadingRound from './ReadingRound'

const READING_SETS = validateToeicBank(
  JSON.parse(readFileSync('public/data/toeic/en.json', 'utf8'))
).reading

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
})
afterEach(cleanup)

const renderSet = (id: string) => {
  const { set, questions } = shuffleSet(READING_SETS.find((s) => s.id === id)!)
  render(
    <MemoryRouter>
      <ReadingRound set={set} questions={questions} onAgain={() => {}} onExit={() => {}} />
    </MemoryRouter>
  )
  return questions
}

describe('Part 6 and 7 rounds', () => {
  it('fills a Part 6 gap in the text once it is answered', () => {
    const questions = renderSet('p6-parking')
    expect(screen.getByText('(1) ______')).toBeInTheDocument()
    const right = questions[0].options[questions[0].answer]
    const option = screen
      .getAllByRole('button')
      .find((b) => /^\([A-D]\)/.test(b.textContent ?? '') && b.textContent!.slice(3) === right)!
    fireEvent.click(option)
    expect(screen.queryByText('(1) ______')).not.toBeInTheDocument()
    expect(screen.getByText(/closed for repairs: đóng cửa/)).toBeInTheDocument()
  })

  it('shows both texts of a double set, and the score once every question is answered', () => {
    const questions = renderSet('p7-rooms')
    expect(screen.getByText('1. Room schedule')).toBeInTheDocument()
    expect(screen.getByText('2. Email')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'See results' })).not.toBeInTheDocument()
    questions.forEach((q) => {
      const right = q.options[q.answer]
      const buttons = screen.getAllByRole('button').filter((b) => b.textContent?.endsWith(right))
      fireEvent.click(buttons[buttons.length - 1])
    })
    fireEvent.click(screen.getByRole('button', { name: 'See results' }))
    expect(screen.getByText('3 of 3 right')).toBeInTheDocument()
  })
})
