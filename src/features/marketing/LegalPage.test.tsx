/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { Privacy, Terms } from './LegalPage'
import { useSettings } from '@/store/settingsStore'
import { POLICY_VERSION } from '@/lib/site'
import { LAST_UPDATED } from './legal'

beforeEach(() => useSettings.setState({ uiLang: 'vi' }))
afterEach(cleanup)

function renderDoc(doc: 'privacy' | 'terms') {
  render(<MemoryRouter>{doc === 'privacy' ? <Privacy /> : <Terms />}</MemoryRouter>)
}

describe('legal pages', () => {
  it('puts the sentence that introduces a list above the list', () => {
    renderDoc('privacy')
    const lead = screen.getByText(/Chúng tôi dùng một số nhà cung cấp hạ tầng/)
    const firstProvider = screen.getByText(/^Supabase/)
    expect(lead.compareDocumentPosition(firstProvider) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('cites the current Vietnamese law, not the replaced decree', () => {
    renderDoc('privacy')
    expect(screen.getByText(/Luật số 91\/2025\/QH15/)).toBeInTheDocument()
    expect(screen.queryByText(/13\/2023/)).not.toBeInTheDocument()
  })

  it('tells people which content is made by AI', () => {
    renderDoc('terms')
    expect(screen.getByText(/Luật số 134\/2025\/QH15/)).toHaveTextContent(/giọng đọc phát âm/)
  })
})

describe('dates', () => {
  it('never prints a date older than the version people agreed to', () => {
    expect(LAST_UPDATED >= POLICY_VERSION).toBe(true)
  })
})
