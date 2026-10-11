/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Layout from './Layout'
import { useData } from '@/store/dataStore'
import { useAuth } from '@/store/authStore'

// The bug this guards: the whole chrome — header, avatar, the menu with
// sign-in / settings / stats — sat inside the data gate, so nothing could be
// tapped until the ~2 MB word pack had downloaded. Only the screen may wait.

beforeEach(() => {
  // A pack that never arrives (a very slow phone connection).
  useData.setState({
    manifest: null,
    pack: null,
    status: 'loading',
    ensureManifest: async () => {},
    loadLanguage: async () => {},
  })
  useAuth.setState({ user: null, status: 'loading' })
})
afterEach(cleanup)

function renderShell() {
  render(
    <MemoryRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<p>màn hình chính</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('Layout while the word pack is still loading', () => {
  it('already offers sign-in, settings and stats from the menu', () => {
    renderShell()
    expect(screen.queryByText('màn hình chính')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Menu/ }))
    expect(screen.getByRole('menuitem', { name: /Đăng nhập/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Cài đặt/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Thống kê/ })).toBeInTheDocument()
  })

  it("shows a returning learner's avatar before the session check finishes", () => {
    useAuth.setState({
      user: { id: 'u1', email: 'lan@hoc.vn', name: 'Lan', role: 'student', status: 'active' },
      status: 'loading',
    })
    renderShell()
    expect(screen.getByRole('button', { name: /Tài khoản/ })).toHaveTextContent('L')
  })
})
