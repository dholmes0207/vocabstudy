/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Grammar from './Grammar'
import { useSettings } from '@/store/settingsStore'
import { useGrammar } from '@/store/grammarStore'

// "Ngữ pháp căn bản" (docs/design/grammar.md) against the real shipped pack.

const pack = JSON.parse(readFileSync('public/data/grammar/en.json', 'utf8'))

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en' })
  useGrammar.setState({ progress: {} })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => pack }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/grammar/:unitId" element={<Grammar />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Grammar', () => {
  it('lists every lesson with its level', async () => {
    renderAt('/grammar')
    expect(await screen.findByText('The verb to be: am / is / are')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(pack.units.length)
  })

  it('teaches before it tests: rule, pattern, examples and mistakes', async () => {
    renderAt('/grammar/to-be')
    expect(await screen.findByText('Common mistakes')).toBeInTheDocument()
    expect(screen.getByText('I am 20 years old.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Practise \(9\)/ })).toBeInTheDocument()
  })

  it('explains a wrong answer and shows the right one', async () => {
    // No shuffling: the round starts with "My parents ___ teachers." (answer: are).
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    renderAt('/grammar/to-be')
    fireEvent.click(await screen.findByRole('button', { name: /Practise/ }))
    expect(screen.getByText('My parents ___ teachers.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'am' }))
    expect(await screen.findByText(/Parents là số nhiều/)).toBeInTheDocument()
    expect(screen.getByText('My parents are teachers.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/ })).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
