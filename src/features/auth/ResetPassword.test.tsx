/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Landing from the "forgot password" email (docs/design/account.md).

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }))
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession } },
  supabaseConfigured: true,
  getAccessToken: async () => null,
}))

import ResetPassword from './ResetPassword'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'

const updatePassword = vi.fn()

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  useAuth.setState({ updatePassword })
  window.history.replaceState(null, '', '/reset-password')
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderPage() {
  render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  )
}

describe('ResetPassword', () => {
  it('sets the new password when the link opened a session', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    updatePassword.mockResolvedValue(undefined)
    renderPage()
    fireEvent.change(await screen.findByLabelText('New password'), {
      target: { value: 'secret12' },
    })
    fireEvent.change(screen.getByLabelText('Repeat the new password'), {
      target: { value: 'secret12' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }))
    expect(await screen.findByText('Your password has been changed.')).toBeInTheDocument()
    expect(updatePassword).toHaveBeenCalledWith('secret12')
  })

  it('refuses two different passwords before calling the server', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    renderPage()
    fireEvent.change(await screen.findByLabelText('New password'), {
      target: { value: 'secret12' },
    })
    fireEvent.change(screen.getByLabelText('Repeat the new password'), {
      target: { value: 'secret13' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('do not match')
    expect(updatePassword).not.toHaveBeenCalled()
  })

  it('offers a fresh link when this one has expired', async () => {
    getSession.mockResolvedValue({ data: { session: null } })
    renderPage()
    expect(await screen.findByText(/expired or has already been used/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Send a new link' })).toHaveAttribute(
      'href',
      '/login?forgot=1'
    )
  })

  it('reads an error fragment without waiting for Supabase', () => {
    window.history.replaceState(
      null,
      '',
      '/reset-password#error=access_denied&error_code=otp_expired&error_description=expired'
    )
    renderPage()
    expect(screen.getByText(/expired or has already been used/)).toBeInTheDocument()
    expect(getSession).not.toHaveBeenCalled()
  })
})
