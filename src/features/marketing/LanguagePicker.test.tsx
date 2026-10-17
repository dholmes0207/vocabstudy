/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import LanguagePicker from './LanguagePicker'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import type { DataManifest } from '@/types'

const manifest = JSON.parse(readFileSync('public/data/index.json', 'utf8')) as DataManifest

const renderPicker = () =>
  render(
    <MemoryRouter>
      <LanguagePicker />
    </MemoryRouter>
  )

beforeEach(() => useSettings.setState({ uiLang: 'vi' }))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  useData.setState({ manifest: null, status: 'idle', error: null })
})

describe('landing language picker', () => {
  it('offers every shipped language, with its word count, from the manifest', () => {
    useData.setState({ manifest })
    renderPicker()
    for (const l of manifest.languages) {
      const card = screen.getByRole('link', { name: new RegExp(l.nativeName) })
      expect(card).toHaveAttribute('href', `/home?lang=${l.code}`)
      expect(card).toHaveTextContent(`${l.count.toLocaleString('vi-VN')} từ`)
      expect(card).toHaveTextContent(l.beta ? 'beta' : /^(?!.*beta)/)
    }
    expect(screen.getByRole('link', { name: /Ngôn ngữ khác/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/)
    )
  })

  it('fetches the manifest itself on the landing page, without touching app state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(manifest)))
    )
    renderPicker()
    expect(await screen.findByRole('link', { name: /Tiếng Hàn/ })).toBeInTheDocument()
    expect(useData.getState().manifest).toBeNull()
  })

  it('stays hidden when the manifest cannot load, and the app is not put in an error state', async () => {
    const fetch = vi.fn(async () => new Response('', { status: 503 }))
    vi.stubGlobal('fetch', fetch)
    const { container } = renderPicker()
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
    expect(useData.getState().status).toBe('idle')
  })
})
