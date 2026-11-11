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

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: EssayPractice } = await import('./EssayPractice')
const { default: WritingDrillRound } = await import('./WritingDrillRound')

const { writing } = validateIeltsBank(JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8')))

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

const paragraph = (n: number, link: string) =>
  `${link}, ` + Array.from({ length: n }, (_, i) => `word${i}`).join(' ') + '.'

describe('IELTS writing', () => {
  it('ticks the checklist as the essay grows, then takes it in', () => {
    const prompt = writing.prompts[0]
    const type = writing.types.find((w) => w.id === prompt.type)!
    render(
      <MemoryRouter>
        <EssayPractice prompt={prompt} type={type} onExit={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: '250 more words to go' })).toBeDisabled()
    const essay = [
      paragraph(64, 'Firstly'),
      paragraph(64, 'However'),
      paragraph(64, 'Moreover'),
      paragraph(64, 'In conclusion'),
    ].join('\n\n')
    fireEvent.change(screen.getByLabelText('Your essay'), { target: { value: essay } })
    expect(screen.getByText(/At least 250 words \(\d+\)/).closest('li')).toHaveClass(
      'bg-emerald-50'
    )
    expect(
      screen.getByText('4 paragraphs: intro, 2 body, conclusion (4)').closest('li')
    ).toHaveClass('bg-emerald-50')
    expect(screen.queryByText(/Band 7 model answer/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Hand it in' }))
    expect(screen.getByRole('status')).toHaveTextContent('All four boxes ticked!')
    // Handing in opens the model answer, its linking words marked.
    expect(screen.getByText(/Band 7 model answer/)).toBeInTheDocument()
    expect(screen.getAllByText('However')[0].tagName).toBe('MARK')
    expect(useActivity.getState().counts.en?.['ielts-writing']).toBe(1)
    // The draft stays on the device.
    expect(localStorage.getItem(`vocab.ielts.draft.${prompt.id}`)).toBe(essay)
  })

  it('shows the model answer on request before writing', () => {
    const prompt = writing.prompts[1]
    const type = writing.types.find((w) => w.id === prompt.type)!
    render(
      <MemoryRouter>
        <EssayPractice prompt={prompt} type={type} onExit={() => {}} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /See the model answer/ }))
    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('Conclusion')).toBeInTheDocument()
  })

  it('flags spoken forms to replace', () => {
    const prompt = writing.prompts[0]
    const type = writing.types.find((w) => w.id === prompt.type)!
    render(
      <MemoryRouter>
        <EssayPractice prompt={prompt} type={type} onExit={() => {}} />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByLabelText('Your essay'), {
      target: { value: "Kids wanna play. It's fun." },
    })
    expect(screen.getByText(/kids, wanna, it's/)).toBeInTheDocument()
  })

  it('runs a drill round with an explanation after each answer', () => {
    const drills = writing.drills.slice(0, 2)
    render(
      <MemoryRouter>
        <WritingDrillRound drills={drills} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    for (const d of drills) {
      fireEvent.click(screen.getByRole('button', { name: d.options[d.answer] }))
      expect(screen.getByRole('status')).toHaveTextContent(d.why)
      fireEvent.click(screen.getByRole('button', { name: /^(Next|See results)/ }))
    }
    expect(screen.getByText('2 of 2 right')).toBeInTheDocument()
    expect(useStudy.getState().progress.en?.stats.xp).toBe(4)
  })
})
