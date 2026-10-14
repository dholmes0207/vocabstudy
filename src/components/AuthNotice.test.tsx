/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import AuthNotice from './AuthNotice'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'

// Shown when a sign-in that finished away from the sign-in page was turned
// back (docs/design/google-login.md).

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi' })
  useAuth.setState({ user: null, notice: 'pending' })
})
afterEach(cleanup)

describe('AuthNotice', () => {
  it('speaks the language the interface is in now, not the one at sign-in', () => {
    render(<AuthNotice />)
    expect(screen.getByRole('status')).toHaveTextContent('danh sách chờ bản beta')
    act(() => useSettings.setState({ uiLang: 'en' }))
    expect(screen.getByRole('status')).toHaveTextContent('beta waitlist')
  })

  it('can be closed, and is gone when nothing was turned away', () => {
    render(<AuthNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Đóng thông báo' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(useAuth.getState().notice).toBeNull()
  })
})
