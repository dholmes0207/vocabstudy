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
vi.mock('@/lib/hanVietTraps', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/hanVietTraps')>()
  const by = (zh: string) => real.HAN_VIET_TRAPS.find((x) => x.zh === zh)!
  const [dajia, pianyi, gaosu] = ['大家', '便宜', '告诉'].map(by)
  return {
    ...real,
    trapRound: () => [
      {
        item: dajia,
        options: [dajia.meaning, dajia.trap, pianyi.meaning, gaosu.meaning],
        answer: 0,
        trapAt: 1,
      },
      {
        item: pianyi,
        options: [dajia.meaning, pianyi.trap, pianyi.meaning, gaosu.meaning],
        answer: 2,
        trapAt: 1,
      },
    ],
  }
})

const { default: HanVietTraps } = await import('./HanVietTraps')
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
      <HanVietTraps />
    </MemoryRouter>
  )

describe('Hán Việt traps', () => {
  it('shows the trap crossed out beside the real meaning, then a round with the trap as an option', () => {
    renderPage()
    expect(screen.getByText('a rich tycoon')).toHaveClass('line-through')
    expect(screen.getByText('→ everyone')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Try 10 questions/ }))

    // 大家: pick "everyone" (right).
    fireEvent.click(screen.getByRole('button', { name: 'everyone' }))
    expect(screen.getByText('Right, you dodged the trap!')).toBeInTheDocument()
    expect(screen.getByText('大家好！')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))

    // 便宜: pick the trap.
    fireEvent.click(screen.getByRole('button', { name: 'comfortable, well-equipped' }))
    expect(screen.getByText('Caught by the trap!')).toBeInTheDocument()
    expect(screen.getByText(/reads "tiện nghi" in Hán Việt/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^See results/ }))
    expect(screen.getByText('1 of 2 right')).toBeInTheDocument()
    expect(useActivity.getState().counts.zh?.['hanviet-traps']).toBe(1)
    expect(useStudy.getState().progress.zh?.stats.xp).toBe(7)
  })

  it('is for the Chinese pack only', () => {
    useSettings.setState({ currentLang: 'en' })
    renderPage()
    expect(screen.queryByRole('button', { name: /Try 10 questions/ })).toBeNull()
  })
})
