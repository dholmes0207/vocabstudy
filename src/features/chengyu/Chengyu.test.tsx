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
vi.mock('@/lib/chengyu', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/chengyu')>()
  const by = (zh: string) => real.CHENGYU.find((x) => x.zh === zh)!
  const doubt = by('半信半疑')
  const hare = by('守株待兔')
  return {
    ...real,
    chengyuRound: () => [
      {
        kind: 'meaning',
        item: doubt,
        options: [doubt.meaning, by('一心一意').meaning, by('人山人海').meaning, hare.meaning],
        answer: 0,
      },
      {
        kind: 'missing',
        item: hare,
        at: 3,
        options: [
          { ch: '兔', hv: 'thố' },
          { ch: '牛', hv: 'ngưu' },
          { ch: '蛇', hv: 'xà' },
          { ch: '蛙', hv: 'oa' },
        ],
        answer: 0,
      },
    ],
  }
})

const { default: Chengyu } = await import('./Chengyu')
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
      <Chengyu />
    </MemoryRouter>
  )

describe('Chinese idioms', () => {
  it('lists idioms with their Hán Việt reading, then runs a round', () => {
    renderPage()
    expect(screen.getByText('bán tín bán nghi')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Try 10 questions/ }))

    // What does 半信半疑 mean? Pick the right one.
    expect(screen.getByText('What does this idiom mean?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /half believing/ }))
    expect(screen.getByText('Right!')).toBeInTheDocument()
    expect(screen.getByText('听了他的话，我半信半疑。')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))

    // 守株待＿: the gap hides the character and its Hán Việt syllable.
    expect(screen.getByText('守株待＿')).toBeInTheDocument()
    expect(screen.getByText('thủ chu đãi ＿')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '牛 · ngưu' }))
    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(screen.getByText('thủ chu đãi thố')).toBeInTheDocument()
    expect(screen.getByText(/A farmer saw a hare/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^See results/ }))
    expect(screen.getByText('1 of 2 right')).toBeInTheDocument()
    expect(useActivity.getState().counts.zh?.chengyu).toBe(1)
    expect(useStudy.getState().progress.zh?.stats.xp).toBe(7)
  })

  it('is for the Chinese pack only', () => {
    useSettings.setState({ currentLang: 'en' })
    renderPage()
    expect(screen.queryByRole('button', { name: /Try 10 questions/ })).toBeNull()
  })
})
