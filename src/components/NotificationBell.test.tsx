/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import NotificationBell from './NotificationBell'
import { useSettings } from '@/store/settingsStore'
import { ENTERED_KEY } from '@/lib/entry'
import { READ_KEY, RELEASES_SHOWN } from '@/lib/notifications'

// The header bell that replaced the policy card (docs/design/notifications.md).

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ uiLang: 'en' })
})
afterEach(cleanup)

function renderBell() {
  render(
    <MemoryRouter>
      <NotificationBell />
    </MemoryRouter>
  )
}

/** The releases load after the first render; wait until the bell counts them. */
const loaded = () =>
  screen.findByRole('button', { name: `Notifications — ${RELEASES_SHOWN + 1} new` })

describe('NotificationBell', () => {
  it('shows a count for someone who used the app before, and opens to the list', async () => {
    localStorage.setItem(ENTERED_KEY, '1')
    renderBell()
    const bell = await loaded()
    fireEvent.click(bell)
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Privacy policy and Terms of use updated/ })
    ).toBeInTheDocument()
  })

  it('reveals the details on tap and counts the item as read', async () => {
    localStorage.setItem(ENTERED_KEY, '1')
    renderBell()
    await loaded()
    const before = Number(
      /(\d+) new/.exec(screen.getByRole('button', { name: /new/ }).getAttribute('aria-label')!)![1]
    )
    fireEvent.click(screen.getByRole('button', { name: /Notifications/ }))
    fireEvent.click(screen.getByRole('button', { name: /Privacy policy and Terms of use updated/ }))
    expect(screen.getByText(/Personal Data Protection Law/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacy')
    const label = screen.getAllByRole('button')[0].getAttribute('aria-label')!
    const after = /(\d+) new/.exec(label)?.[1]
    expect(after === undefined ? 0 : Number(after)).toBe(before - 1)
  })

  it('marks everything read in one go', async () => {
    localStorage.setItem(ENTERED_KEY, '1')
    renderBell()
    await loaded()
    fireEvent.click(screen.getByRole('button', { name: /Notifications/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }))
    expect(screen.getAllByRole('button')[0]).toHaveAccessibleName('Notifications')
  })

  it('gives a newcomer a quiet bell, and remembers that, releases included', async () => {
    renderBell()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(READ_KEY)!)).toHaveLength(RELEASES_SHOWN + 1)
    )
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })
})
