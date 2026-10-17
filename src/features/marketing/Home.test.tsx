/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import MarketingLayout from './MarketingLayout'
import Home from './Home'
import { ENTERED_KEY } from '@/lib/entry'
import { useSettings } from '@/store/settingsStore'

// "/" (Home.tsx): the site opens on its introduction for everyone — the owner's
// call on 2026-10-18 — while sign-in links still continue into the app.

function Where() {
  const { pathname, hash } = useLocation()
  return <p>app at {pathname + hash}</p>
}

function renderAt(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/home" element={<Where />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ uiLang: 'en' })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('', { status: 404 }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('opening vocastudy.app', () => {
  it('shows the introduction with "Start free" to a newcomer', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Speak a new language/)
    expect(screen.getAllByRole('link', { name: 'Start free' })[0]).toHaveAttribute('href', '/home')
  })

  it('shows the introduction, not the app, on a device that has studied here', () => {
    localStorage.setItem(ENTERED_KEY, '1')
    renderAt('/')
    expect(screen.queryByText(/app at/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Speak a new language/)
    expect(screen.getAllByRole('link', { name: /Continue learning/ })[0]).toHaveAttribute(
      'href',
      '/home'
    )
  })

  it('still sends a sign-in link from an email into the app, fragment and all', () => {
    renderAt('/#access_token=abc&type=signup')
    expect(screen.getByText('app at /home#access_token=abc&type=signup')).toBeInTheDocument()
  })
})
