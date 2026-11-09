/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { validateIeltsBank } from '@/lib/ielts'

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: MatchingRound } = await import('./MatchingRound')

const { reading } = validateIeltsBank(JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8')))

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useIelts.setState({ matching: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

describe('IELTS matching information', () => {
  it('takes a paragraph letter per statement, checks them all and records the best', () => {
    const passage = reading.find((r) => r.passage.length === 5)!
    render(
      <MemoryRouter>
        <MatchingRound passage={passage} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /Pick a paragraph/ })).toBeDisabled()
    passage.matching.forEach((m, i) => {
      const group = screen.getByRole('group', { name: `Paragraph for statement ${i + 1}` })
      // The last one is answered wrongly on purpose.
      const pick = i === passage.matching.length - 1 ? (m.para + 1) % 5 : m.para
      fireEvent.click(within(group).getByRole('button', { name: String.fromCharCode(65 + pick) }))
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    const n = passage.matching.length
    expect(screen.getByRole('status')).toHaveTextContent(`${n - 1} of ${n} right`)
    expect(
      screen.getByText(`Answer: ${String.fromCharCode(65 + passage.matching[n - 1].para)}`)
    ).toBeInTheDocument()
    expect(useIelts.getState().matching[passage.id]).toEqual({ best: n - 1, total: n })
    expect(useActivity.getState().counts.en?.['ielts-reading']).toBe(1)
  })
})
