/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'

vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: () => {},
  stopPronounce: () => {},
  textAudio: () => '',
}))
vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
vi.mock('@/lib/idiomsEn', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/idiomsEn')>()
  const by = (p: string) => real.IDIOMS.find((x) => x.phrase === p)!
  const [cake, ice, moon, pigs] = [
    'a piece of cake',
    'break the ice',
    'once in a blue moon',
    'when pigs fly',
  ].map(by)
  return {
    ...real,
    idiomRound: () => [
      {
        kind: 'meaning',
        item: cake,
        options: [cake.meaning, ice.meaning, moon.meaning, pigs.meaning],
        answer: 0,
      },
      { kind: 'missing', item: moon, options: ['ice', 'moon', 'cake', 'pigs'], answer: 1 },
    ],
  }
})

const { default: Idioms } = await import('./Idioms')
const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

const renderPage = () =>
  render(
    <MemoryRouter>
      <Idioms />
    </MemoryRouter>
  )

describe('English idioms', () => {
  it('shows what the words say and mean, then asks meaning and missing word', () => {
    renderPage()
    expect(screen.getByText('Word for word: một miếng bánh')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Try 10 questions/ }))

    expect(screen.getByText('What does this idiom mean?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'very easy' }))
    expect(screen.getByText('Right!')).toBeInTheDocument()
    expect(screen.getByText('The listening test was a piece of cake.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))

    // once in a blue ＿ → pick "pigs" (wrong).
    expect(screen.getByText('once in a blue ＿')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'pigs' }))
    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(screen.getAllByText('once in a blue moon').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /^See results/ }))
    expect(screen.getByText('1 of 2 right')).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.idioms).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(7)
  })

  it('is for the English pack only', () => {
    useSettings.setState({ currentLang: 'zh' })
    renderPage()
    expect(screen.queryByRole('button', { name: /Try 10 questions/ })).toBeNull()
  })
})
