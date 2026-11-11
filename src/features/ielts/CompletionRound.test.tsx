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
const { default: CompletionRound } = await import('./CompletionRound')

const { reading } = validateIeltsBank(JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8')))

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useIelts.setState({ completion: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

describe('IELTS sentence completion', () => {
  it('takes a typed answer per gap, holds the two-word limit and records the best', () => {
    const passage = reading.find((r) => r.id === 'coral-reefs')!
    render(
      <MemoryRouter>
        <CompletionRound passage={passage} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    const gap = (i: number) => screen.getByRole('textbox', { name: `Gap in sentence ${i}` })
    expect(screen.getByRole('button', { name: /Fill all 4 gaps/ })).toBeDisabled()
    fireEvent.change(gap(1), { target: { value: 'Quarter' } })
    // Right idea, but three words: over the limit, so it is marked wrong.
    fireEvent.change(gap(2), { target: { value: 'the open sea' } })
    expect(screen.getByText(/Over two words/)).toBeInTheDocument()
    fireEvent.change(gap(3), { target: { value: 'waves.' } })
    fireEvent.change(gap(4), { target: { value: 'fish' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByRole('status')).toHaveTextContent('2 of 4 right')
    expect(screen.getByText('Answer: open sea')).toBeInTheDocument()
    expect(screen.getByText('Answer: algae')).toBeInTheDocument()
    expect(useIelts.getState().completion['coral-reefs']).toEqual({ best: 2, total: 4 })
    expect(useActivity.getState().counts.en?.['ielts-reading']).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(6)
  })
})
