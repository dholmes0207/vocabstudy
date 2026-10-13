/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { DeleteAccountRow } from './AccountSection'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'

// Settings → Danger zone → Delete account (docs/design/account.md).

const learner = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'lan@example.com',
  name: 'Lan',
  role: 'student' as const,
  status: 'active' as const,
}
const deleteAccount = vi.fn()
const onNotice = vi.fn()

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  useAuth.setState({ user: learner, deleteAccount })
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderRow() {
  render(
    <MemoryRouter>
      <DeleteAccountRow onNotice={onNotice} />
    </MemoryRouter>
  )
}

describe('DeleteAccountRow', () => {
  it('asks for the password, then deletes and reports back', async () => {
    deleteAccount.mockResolvedValue(undefined)
    renderRow()
    fireEvent.click(screen.getByRole('button', { name: /Delete/ }))
    const confirm = screen.getByRole('button', { name: /Delete permanently/ })
    expect(confirm).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    fireEvent.click(confirm)
    await vi.waitFor(() => expect(onNotice).toHaveBeenCalled())
    expect(deleteAccount).toHaveBeenCalledWith('secret1')
    expect(onNotice.mock.calls[0][0]).toMatch(/have been deleted/)
  })

  it('shows why it failed and keeps the form open', async () => {
    deleteAccount.mockRejectedValue(new Error('Wrong password.'))
    renderRow()
    fireEvent.click(screen.getByRole('button', { name: /Delete/ }))
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: /Delete permanently/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong password.')
    expect(onNotice).not.toHaveBeenCalled()
  })

  it('offers no delete button to an admin', () => {
    useAuth.setState({ user: { ...learner, role: 'admin' } })
    renderRow()
    expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument()
    expect(screen.getByText(/hand the admin role to someone else/)).toBeInTheDocument()
  })
})
