/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import AttemptTrail from './AttemptTrail'

beforeEach(() => useSettings.setState({ uiLang: 'en' }))
afterEach(cleanup)

const attempt = (correct: number) => ({ day: 0, correct, total: 26 })

describe('AttemptTrail', () => {
  it('shows nothing for a single attempt', () => {
    const { container } = render(<AttemptTrail attempts={[attempt(10)]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('labels the latest score and its change, and lists every attempt for screen readers', () => {
    render(<AttemptTrail attempts={[attempt(10), attempt(13), attempt(17)]} />)
    expect(screen.getByText('Latest: 17/26 (+4 since last time)')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows.map((r) => r.textContent)).toEqual([
      'Attempt 110/26',
      'Attempt 213/26',
      'Attempt 317/26',
    ])
  })
})
