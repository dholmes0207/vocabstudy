/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { validateIeltsBank } from '@/lib/ielts'

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: Task1Round } = await import('./Task1Round')

const { writing } = validateIeltsBank(JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8')))

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

describe('IELTS Writing Task 1', () => {
  it('draws the chart, takes the overview, then the report gaps, and scores both', () => {
    const chart = writing.task1.find((c) => c.kind === 'bar')!
    render(
      <MemoryRouter>
        <Task1Round chart={chart} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByRole('img', { name: chart.title[1] })).toBeInTheDocument()
    // The figures are there for screen readers too.
    expect(screen.getByRole('table')).toHaveTextContent(chart.series[0].name)

    const wrong = (chart.overview.answer + 1) % chart.overview.options.length
    fireEvent.click(screen.getByRole('button', { name: chart.overview.options[wrong] }))
    expect(screen.getByText(chart.overview.why[chart.overview.answer])).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Step 2/ }))

    const box = screen.getByRole('list', { name: 'Word box' })
    chart.report.answers.forEach((a) =>
      fireEvent.click(within(box).getByRole('button', { name: chart.report.box[a] }))
    )
    fireEvent.click(screen.getByRole('button', { name: /^Check/ }))
    const n = chart.report.answers.length
    expect(screen.getByRole('status')).toHaveTextContent(`${n} of ${n + 1} right · +${n * 2} XP`)
    expect(screen.getByText(chart.report.why[0])).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.['ielts-writing']).toBe(1)
  })
})
