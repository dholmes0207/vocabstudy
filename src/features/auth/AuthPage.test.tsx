/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

const { fetchAuthSettings } = vi.hoisted(() => ({ fetchAuthSettings: vi.fn() }))
vi.mock('@/lib/supabase', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/supabase')>()),
  fetchAuthSettings,
}))

import AuthPage from './AuthPage'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'
import { POLICY_VERSION } from '@/lib/site'

// "Forgot password?" and the beta-waitlist wording (docs/design/account.md).

const requestPasswordReset = vi.fn()
const register = vi.fn()
const signInWithGoogle = vi.fn()

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  fetchAuthSettings.mockResolvedValue({ external: { email: true, google: false } })
  useAuth.setState({
    user: null,
    requestPasswordReset,
    register,
    signInWithGoogle,
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
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: '  Lan  ' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'lan@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    const form = screen.getByRole('button', { name: /Join the waitlist/ }).closest('form')!

    fireEvent.submit(form)
    expect(await screen.findByRole('alert')).toHaveTextContent(/accept the Terms of use/)
    expect(register).not.toHaveBeenCalled()

    fireEvent.click(consent)
    fireEvent.submit(form)
    expect(await screen.findByText(/You're on the beta waitlist/)).toBeInTheDocument()
    expect(register).toHaveBeenCalledWith('lan@example.com', 'secret1', 'Lan', POLICY_VERSION)
  })

  it('asks for a display name before anything else at sign-up', async () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'lan@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.submit(screen.getByRole('button', { name: /Join the waitlist/ }).closest('form')!)
    expect(await screen.findByRole('alert')).toHaveTextContent(/enter a display name/)
    expect(register).not.toHaveBeenCalled()
  })

  it('opens the terms and policy in a new tab so the form is not lost', () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(screen.getByRole('link', { name: 'Terms of use' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacy')
  })

  it('offers Google only once it is switched on in Supabase', async () => {
    renderAt()
    await vi.waitFor(() => expect(fetchAuthSettings).toHaveBeenCalled())
    expect(screen.queryByRole('button', { name: /Continue with Google/ })).not.toBeInTheDocument()
  })

  it('continues with Google, stating what that agrees to', async () => {
    fetchAuthSettings.mockResolvedValue({ external: { email: true, google: true } })
    signInWithGoogle.mockReturnValue(new Promise(() => {}))
    renderAt()
    const google = await screen.findByRole('button', { name: /Continue with Google/ })
    expect(screen.getByText(/By continuing with Google you agree to the/)).toBeInTheDocument()
    fireEvent.click(google)
    expect(signInWithGoogle).toHaveBeenCalledWith(POLICY_VERSION)
    expect(google).toBeDisabled()
  })

  it('presents sign-up as joining the beta waitlist', () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(screen.getByText(/sign up to join the waitlist/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Join the waitlist/ })).toBeInTheDocument()
  })
})
