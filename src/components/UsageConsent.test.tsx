/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { CONSENT_KEY, SENT_KEY } from '@/lib/usageClient'
import { UsageConsentCard } from './UsageConsent'

const beacon = vi.fn(() => true)

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ uiLang: 'vi', currentLang: 'en' })
  useStudy.setState({ progress: {} })
  Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true })
  beacon.mockClear()
})
afterEach(cleanup)

const show = () =>
  render(
    <MemoryRouter>
      <UsageConsentCard />
    </MemoryRouter>
  )

describe('the anonymous usage question', () => {
  it('asks once; a yes is remembered and today’s signal goes out', () => {
    useStudy.getState().recordAnswer('en', 1, true)
    show()
    expect(screen.getByText('Giúp VocaStudy tốt hơn?')).toBeInTheDocument()
    expect(beacon).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Đồng ý' }))
    expect(localStorage.getItem(CONSENT_KEY)).toBe('yes')
    expect(beacon).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(SENT_KEY)).not.toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Cảm ơn bạn!')
    cleanup()
    show()
    expect(screen.queryByText('Giúp VocaStudy tốt hơn?')).not.toBeInTheDocument()
  })

  it('sends nothing after a no, and does not ask again', () => {
    useStudy.getState().recordAnswer('en', 1, true)
    show()
    fireEvent.click(screen.getByRole('button', { name: 'Không, cảm ơn' }))
    expect(localStorage.getItem(CONSENT_KEY)).toBe('no')
    expect(beacon).not.toHaveBeenCalled()
    cleanup()
    show()
    expect(screen.queryByText('Giúp VocaStudy tốt hơn?')).not.toBeInTheDocument()
  })
})
