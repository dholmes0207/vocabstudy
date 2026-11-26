/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useGrammar } from '@/store/grammarStore'
import NextOnPath from './NextOnPath'

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en' })
  useData.setState({ pack: en, status: 'ready' })
  useStudy.setState({ progress: {} })
  useGrammar.setState({ progress: {} })
})
afterEach(cleanup)

const show = () =>
  render(
    <MemoryRouter>
      <NextOnPath />
    </MemoryRouter>
  )

describe('NextOnPath', () => {
  it('points a beginner at the first practice step of level 1, not at more words', () => {
    show()
    const link = screen.getByRole('link', { name: /Next on your path/ })
    expect(link).toHaveAttribute('href', '/grammar')
    expect(link).toHaveTextContent('First grammar: to be, present simple')
    expect(link).toHaveTextContent('0/4 units')
  })

  it('shows nothing for a pack without a path', () => {
    useSettings.setState({ currentLang: 'fr' })
    show()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
