/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import SessionChanges from './SessionChanges'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { snapshotPhases } from '@/lib/sessionDelta'
import { today } from '@/lib/date'

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi', currentLang: 'en' })
  useStudy.setState({ progress: {} })
})
afterEach(cleanup)

describe('end-of-session changes', () => {
  it('shows what the session did to its words', () => {
    const before = snapshotPhases([1, 2], {})
    useStudy.getState().recordAnswer('en', 1, true) // new → learning
    useStudy.getState().recordAnswer('en', 2, false) // new → learning (relearn from box 0)
    render(<SessionChanges before={before} />)
    expect(screen.getByRole('list', { name: 'Thay đổi' })).toHaveTextContent('+2 từ vào lịch ôn')
  })

  it('counts a forgotten word as one to relearn', () => {
    useStudy.getState().markKnown('en', 5) // review stage
    const before = snapshotPhases([5], useStudy.getState().progress.en.cards)
    const card = useStudy.getState().progress.en.cards[5]
    useStudy.setState({
      progress: {
        en: {
          ...useStudy.getState().progress.en,
          cards: { 5: { ...card, dueDay: today() } },
        },
      },
    })
    useStudy.getState().recordAnswer('en', 5, false)
    render(<SessionChanges before={before} />)
    expect(screen.getByText(/1 từ cần học lại/)).toBeInTheDocument()
  })

  it('stays out of the way when nothing changed', () => {
    const { container } = render(<SessionChanges before={snapshotPhases([9], {})} />)
    expect(container).toBeEmptyDOMElement()
  })
})
