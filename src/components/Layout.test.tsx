/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Layout from './Layout'
import { useData } from '@/store/dataStore'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'

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
  useSettings.setState({ uiLang: 'vi' })
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

  it('speaks English by default', () => {
    useSettings.setState({ uiLang: 'en' })
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: /Menu/ }))
    expect(screen.getByRole('menuitem', { name: /Sign in/ })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Review/ }).length).toBeGreaterThan(0)
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

describe('Layout for a Korean learner', () => {
  const ko = { code: 'ko', name: 'Korean', nativeName: 'Tiếng Hàn', flag: '🇰🇷' }
  const en = { code: 'en', name: 'English', nativeName: 'Tiếng Anh', flag: '🇬🇧' }
  beforeEach(() => {
    useSettings.setState({ uiLang: 'vi', currentLang: 'ko' })
    useData.setState({
      manifest: { languages: [en, ko] } as never,
      pack: { meta: { ...ko, ttsLang: 'ko-KR' }, words: [] } as never,
      status: 'ready',
      ensureManifest: async () => {},
      loadLanguage: async () => {},
    })
  })

  function renderAt(path: string) {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/home" element={<p>màn hình chính</p>} />
            <Route path="/grammar" element={<p>ngữ pháp tiếng Anh</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('swaps the English phrases tab for the Hangul alphabet', () => {
    renderAt('/home')
    expect(screen.getAllByRole('link', { name: /Hangul/ }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /Mẫu câu/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Ngữ pháp/ })).not.toBeInTheDocument()
    // The tagline names the language being learned.
    expect(screen.getByText('Học từ vựng tiếng Hàn mỗi ngày')).toBeInTheDocument()
    expect(document.title).toBe('VocaStudy · Học tiếng Hàn mỗi ngày')
  })

  it('explains an English-only screen instead of showing it, with a way to switch', () => {
    renderAt('/grammar')
    expect(screen.queryByText('ngữ pháp tiếng Anh')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /dành cho tiếng Anh/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Chuyển sang tiếng Anh/ }))
    expect(useSettings.getState().currentLang).toBe('en')
  })
})
