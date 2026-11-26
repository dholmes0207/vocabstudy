/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { EXAMS, RECHECK_DAYS, checkedDay } from '@/lib/exams'

const day = vi.hoisted(() => ({ value: 0 }))
vi.mock('@/lib/date', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/date')>()),
  today: () => day.value,
}))

const { ExamChecks } = await import('./ExamChecks')

beforeEach(() => useSettings.setState({ uiLang: 'en' }))
afterEach(cleanup)

const latest = Math.max(...EXAMS.map((e) => checkedDay(e)!))
const earliest = Math.min(...EXAMS.map((e) => checkedDay(e)!))

describe('ExamChecks', () => {
  it('says all is current within six months of the last checks', () => {
    day.value = earliest + 10
    render(<ExamChecks />)
    expect(screen.getByText(/All \d+ exams were checked/)).toBeInTheDocument()
  })

  it('lists the exams due for a fresh check, with their sources', () => {
    day.value = latest + RECHECK_DAYS
    render(<ExamChecks />)
    expect(screen.queryByText(/All \d+ exams were checked/)).toBeNull()
    expect(screen.getAllByText(/last checked/)).toHaveLength(EXAMS.length)
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(EXAMS.length)
  })
})
