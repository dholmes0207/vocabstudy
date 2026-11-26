/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useVisited } from '@/store/visitedStore'
import { useActivity } from '@/store/activityStore'
import { GROUPS, GROUP_OF, PRACTICE } from './entries'
import Practice from './Practice'

afterEach(cleanup)

const renderFor = (code: string) => {
  useSettings.setState({ uiLang: 'en', currentLang: code })
  useVisited.setState({ seen: PRACTICE.map((e) => e.to) })
  useActivity.setState({ counts: {} })
  render(
    <MemoryRouter>
      <Practice />
    </MemoryRouter>
  )
}

describe('Practice hub', () => {
  it('describes a shared page with the current pack’s own examples', () => {
    renderFor('en')
    const confusables = screen.getByRole('link', { name: /Easily confused words/ })
    expect(confusables).toHaveTextContent('make/do')
    expect(confusables).not.toHaveTextContent('在/再')
    expect(screen.getByRole('link', { name: /Collocations/ })).not.toHaveTextContent('吃药')
  })

  it('shows Chinese examples to the Chinese pack', () => {
    renderFor('zh')
    const confusables = screen.getByRole('link', { name: /Easily confused words/ })
    expect(confusables).toHaveTextContent('在/再')
    expect(confusables).not.toHaveTextContent('make/do')
    expect(screen.getByRole('link', { name: /Tongue twisters/ })).not.toHaveTextContent('seashells')
    expect(screen.getByRole('link', { name: /HSKK speaking/ })).toHaveTextContent('Intermediate')
  })

  it('puts every entry in a group, and shows the groups in order', () => {
    for (const e of PRACTICE) expect(GROUP_OF[e.to], e.to).toBeDefined()
    renderFor('en')
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    const order = GROUPS.map((g) => g.titleEn).filter((title) => headings.includes(title))
    expect(headings).toEqual(order)
    expect(headings).toContain('Exam practice')
    expect(headings).toContain('Games')
  })

  it('marks screens not opened yet as new, and counts finished sessions', () => {
    renderFor('en')
    cleanup()
    useVisited.setState({ seen: PRACTICE.map((e) => e.to).filter((p) => p !== '/idioms') })
    useActivity.setState({ counts: { en: { dictation: 3 } } })
    render(
      <MemoryRouter>
        <Practice />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /Dictation/ })).toHaveTextContent('3 done')
    // The only screen not tried yet is today's suggestion, on top.
    expect(screen.getByRole('heading', { name: 'Suggested for you today' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /English idioms/ })).toHaveTextContent('New')
    expect(screen.getAllByRole('link', { name: /English idioms/ })).toHaveLength(1)
  })

  it('marks no screen as new to a newcomer, for whom everything is', () => {
    renderFor('en')
    cleanup()
    useVisited.setState({ seen: ['/dictation'] })
    render(
      <MemoryRouter>
        <Practice />
      </MemoryRouter>
    )
    expect(screen.queryByText('New')).toBeNull()
  })

  it('has no suggestion once everything has been tried', () => {
    renderFor('en')
    expect(screen.queryByRole('heading', { name: 'Suggested for you today' })).toBeNull()
  })
})
