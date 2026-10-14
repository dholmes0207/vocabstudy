/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import CompleteProfile from './CompleteProfile'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'

// The display-name step after a first Google sign-in (docs/design/google-login.md).

const finishOnboarding = vi.fn()

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  useAuth.setState({ onboarding: { userId: 'u1', name: 'Danh Vo' }, finishOnboarding })
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CompleteProfile', () => {
  it('stays hidden unless a new account is choosing its name', () => {
    useAuth.setState({ onboarding: null })
    render(<CompleteProfile />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('offers the name from Google and saves the one typed', async () => {
    finishOnboarding.mockResolvedValue(undefined)
    render(<CompleteProfile />)
    const input = screen.getByLabelText('Display name')
    expect(input).toHaveValue('Danh Vo')
    fireEvent.change(input, { target: { value: 'Võ Danh' } })
    fireEvent.click(screen.getByRole('button', { name: /Save and continue/ }))
    await vi.waitFor(() => expect(finishOnboarding).toHaveBeenCalledWith('Võ Danh'))
  })

  it('can keep the Google name as it is', async () => {
    finishOnboarding.mockResolvedValue(undefined)
    render(<CompleteProfile />)
    fireEvent.click(screen.getByRole('button', { name: 'Keep "Danh Vo"' }))
    await vi.waitFor(() => expect(finishOnboarding).toHaveBeenCalledWith(undefined))
  })

  it('shows why saving failed and lets the person try again', async () => {
    finishOnboarding.mockRejectedValue(new Error("Couldn't save the name."))
    render(<CompleteProfile />)
    fireEvent.click(screen.getByRole('button', { name: /Save and continue/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't save the name.")
    expect(screen.getByRole('button', { name: /Save and continue/ })).toBeEnabled()
  })
})
