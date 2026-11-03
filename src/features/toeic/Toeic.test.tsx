/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { TOEIC_THEMES } from '@/lib/toeic'
import Toeic from './Toeic'
import Exam from '@/features/exam/Exam'

// "Luyện thi TOEIC" (docs/design/toeic.md) with the real English pack.

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack: en, status: 'ready' })
  useStudy.setState({ progress: {} })
})
afterEach(cleanup)

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/toeic" element={<Toeic />} />
        <Route path="/exam" element={<Exam />} />
      </Routes>
    </MemoryRouter>
  )

describe('TOEIC page', () => {
  it('lists every theme as a deck and the seven parts of the test', () => {
    renderAt('/toeic')
    const themes = screen.getByRole('heading', { name: 'Words by theme' }).parentElement!
    expect(within(themes).getAllByRole('button', { name: 'Learn' })).toHaveLength(
      TOEIC_THEMES.length
    )
    const parts = screen.getByRole('heading', { name: 'The seven parts' }).parentElement!
    expect(within(parts).getAllByRole('listitem')).toHaveLength(7)
    expect(within(parts).getByText(/Part 5 · Incomplete sentences/)).toBeInTheDocument()
  })

  it('starts a lesson on a theme', () => {
    renderAt('/toeic')
    fireEvent.click(screen.getAllByRole('button', { name: 'Learn' })[0])
    expect(screen.queryByRole('heading', { name: 'Words by theme' })).not.toBeInTheDocument()
  })

  it('opens the TOEIC tab of the roadmap from its link', () => {
    renderAt('/toeic')
    fireEvent.click(screen.getByRole('link', { name: /Roadmap & vocabulary check/ }))
    expect(screen.getByRole('tab', { name: 'TOEIC', selected: true })).toBeInTheDocument()
  })
})
