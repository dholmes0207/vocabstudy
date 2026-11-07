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
vi.mock('@/lib/confusables', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/confusables')>()
  const zai = real.CONFUSABLES.find((g) => g.id === 'zai')!
  return {
    ...real,
    confusableRound: () => [
      { group: zai, sentence: zai.sentences[0] },
      { group: zai, sentence: zai.sentences[1] },
    ],
  }
})

const { default: Confusables } = await import('./Confusables')
const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

describe('Look-alike characters', () => {
  it('teaches each group, then fills sentence gaps and explains with the rule', () => {
    render(
      <MemoryRouter>
        <Confusables />
      </MemoryRouter>
    )
    expect(screen.getAllByRole('button', { name: 'Practise this group' }).length).toBeGreaterThan(5)
    fireEvent.click(screen.getByRole('button', { name: /Mixed round/ }))

    // 我＿家吃饭。→ 在 (right); 请你＿说一遍。→ pick 在 (wrong).
    fireEvent.click(screen.getByRole('button', { name: '在 zài' }))
    expect(screen.getByText('Right!')).toBeInTheDocument()
    expect(screen.getByText('我在家吃饭。')).toBeInTheDocument()
    expect(screen.getByText('Wǒ zài jiā chī fàn.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))
    fireEvent.click(screen.getByRole('button', { name: '在 zài' }))
    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(screen.getByText(/再见 = see you again/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^See results/ }))
    expect(screen.getByText('1 of 2 right')).toBeInTheDocument()
    expect(useActivity.getState().counts.zh?.confusables).toBe(1)
    expect(useStudy.getState().progress.zh?.stats.xp).toBe(7)
  })

  it('is for the Chinese pack only', () => {
    useSettings.setState({ currentLang: 'en' })
    render(
      <MemoryRouter>
        <Confusables />
      </MemoryRouter>
    )
    expect(screen.queryByRole('button', { name: /Mixed round/ })).toBeNull()
  })
})
