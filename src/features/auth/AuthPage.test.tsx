/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import AuthPage from './AuthPage'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'
import { POLICY_VERSION } from '@/lib/site'

// "Forgot password?" and the beta-waitlist wording (docs/design/account.md).

const requestPasswordReset = vi.fn()
const register = vi.fn()

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  useAuth.setState({
    user: null,
    requestPasswordReset,
    register,
    needsEmailConfirm: false,
    pendingApproval: true,
  })
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

  it('signs up only after the consent box is ticked by hand, and records which version', async () => {
    register.mockResolvedValue(undefined)
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    const consent = screen.getByRole('checkbox')
    expect(consent).not.toBeChecked()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'lan@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    const form = screen.getByRole('button', { name: /Join the waitlist/ }).closest('form')!

    fireEvent.submit(form)
    expect(await screen.findByRole('alert')).toHaveTextContent(/accept the Terms of use/)
    expect(register).not.toHaveBeenCalled()

    fireEvent.click(consent)
    fireEvent.submit(form)
    expect(await screen.findByText(/You're on the beta waitlist/)).toBeInTheDocument()
    expect(register).toHaveBeenCalledWith('lan@example.com', 'secret1', '', POLICY_VERSION)
  })

  it('opens the terms and policy in a new tab so the form is not lost', () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(screen.getByRole('link', { name: 'Terms of use' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacy')
  })

  it('presents sign-up as joining the beta waitlist', () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(screen.getByText(/sign up to join the waitlist/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Join the waitlist/ })).toBeInTheDocument()
  })
})
