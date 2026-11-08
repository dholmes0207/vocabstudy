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
vi.mock('@/lib/netSlang', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/netSlang')>()
  const by = (zh: string) => real.SLANG.find((x) => x.zh === zh)!
  const [juan, ping, ba, kong] = ['内卷', '躺平', '学霸', '社恐'].map(by)
  return {
    ...real,
    slangRound: () => [
      {
        kind: 'meaning',
        item: juan,
        options: [juan.meaning, ping.meaning, ba.meaning, kong.meaning],
        answer: 0,
      },
      { kind: 'word', item: ba, options: [juan, ping, ba, kong], answer: 2 },
    ],
  }
})

const { default: NetSlang } = await import('./NetSlang')
const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

const renderPage = () =>
  render(
    <MemoryRouter>
      <NetSlang />
    </MemoryRouter>
  )

describe('Internet slang', () => {
  it('lists words with their Hán Việt sound, then asks both ways', () => {
    renderPage()
    expect(screen.getByText('nội quyển')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Try 10 questions/ }))

    // What does 内卷 mean?
    expect(screen.getByText('What does this word mean?')).toBeInTheDocument()
    expect(screen.getByText('nèijuǎn · nội quyển')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /rat race/ }))
    expect(screen.getByText('Right!')).toBeInTheDocument()
    expect(screen.getByText('我们班太内卷了，大家晚上都学到十二点。')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))

    // Which word means "a top student"? Pick 躺平 (wrong).
    expect(screen.getByText('a top student')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '躺平' }))
    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^See results/ }))
    expect(screen.getByText('1 of 2 right')).toBeInTheDocument()
    expect(useActivity.getState().counts.zh?.slang).toBe(1)
    expect(useStudy.getState().progress.zh?.stats.xp).toBe(7)
  })

  it('is for the Chinese pack only', () => {
    useSettings.setState({ currentLang: 'en' })
    renderPage()
    expect(screen.queryByRole('button', { name: /Try 10 questions/ })).toBeNull()
  })
})
