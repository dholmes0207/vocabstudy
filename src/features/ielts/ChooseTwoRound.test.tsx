/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { validateIeltsBank } from '@/lib/ielts'

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: ChooseTwoRound } = await import('./ChooseTwoRound')

const { reading } = validateIeltsBank(JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8')))

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useIelts.setState({ chooseTwo: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

describe('IELTS choose TWO', () => {
  it('keeps two letters at most, scores a mark per right one and records the best', () => {
    const passage = reading.find((r) => r.id === 'coral-reefs')!
    const { options, answers } = passage.chooseTwo
    const wrong = [0, 1, 2, 3, 4].filter((i) => !answers.includes(i))
    render(
      <MemoryRouter>
        <ChooseTwoRound passage={passage} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    const option = (i: number) => screen.getByRole('button', { name: new RegExp(options[i]) })
    expect(screen.getByRole('button', { name: /Pick 2 more/ })).toBeDisabled()
    // Three picks: the first one drops out.
    fireEvent.click(option(wrong[0]))
    fireEvent.click(option(answers[0]))
    fireEvent.click(option(wrong[1]))
    expect(option(wrong[0])).toHaveAttribute('aria-pressed', 'false')
    expect(option(answers[0])).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 of 2 marks')
    expect(useIelts.getState().chooseTwo['coral-reefs']).toEqual({ best: 1, total: 2 })
    expect(useActivity.getState().counts.en?.['ielts-reading']).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(3)
  })
})
