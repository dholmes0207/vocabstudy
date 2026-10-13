/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import AuthPage from './AuthPage'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'

// "Forgot password?" and the beta-waitlist wording (docs/design/account.md).

const requestPasswordReset = vi.fn()

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  useAuth.setState({ user: null, requestPasswordReset })
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderAt(path = '/login') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthPage />
    </MemoryRouter>
  )
}

describe('AuthPage', () => {
  it('sends a reset link and answers the same whether or not the email exists', async () => {
    requestPasswordReset.mockResolvedValue(undefined)
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }))
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'lan@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /Send reset link/ }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'If lan@example.com has an account, a reset link is on its way.'
    )
    expect(requestPasswordReset).toHaveBeenCalledWith('lan@example.com')
  })

  it('opens straight on the reset form from a "send a new link" button', () => {
    renderAt('/login?forgot=1')
    expect(screen.getByRole('button', { name: /Send reset link/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '← Back to sign in' }))
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('presents sign-up as joining the beta waitlist', () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(screen.getByText(/sign up to join the waitlist/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Join the waitlist/ })).toBeInTheDocument()
  })
})
