/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { SLOW_RATE, TWISTERS } from '@/lib/tongueTwisters'

const played: { text: string; rate?: number }[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string; rate?: number }) => played.push(o),
  stopPronounce: () => {},
  textAudio: () => '',
}))
// The real recorder needs a microphone; this one records at a tap.
vi.mock('@/features/ielts/AnswerRecorder', () => ({
  default: ({ onRecorded }: { onRecorded?: () => void }) => (
    <button type="button" onClick={onRecorded}>
      Record
    </button>
  ),
}))

const { default: TongueTwisters } = await import('./TongueTwisters')
const packs = {
  en: JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack,
  zh: JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack,
}

beforeEach(() => {
  played.length = 0
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

const renderFor = (code: 'en' | 'zh' | 'ko') => {
  useSettings.setState({ uiLang: 'en', currentLang: code, soundEnabled: false })
  if (code !== 'ko') useData.setState({ pack: packs[code], status: 'ready' })
  return render(
    <MemoryRouter>
      <TongueTwisters />
    </MemoryRouter>
  )
}

describe('Tongue twisters', () => {
  it('plays slowly or at speed, and gives XP once per twister recorded', () => {
    renderFor('zh')
    const first = TWISTERS.zh[0]
    const card = screen.getByText(first.text).closest('li')!
    fireEvent.click(within(card).getByRole('button', { name: /Slowly/ }))
    expect(played.at(-1)).toMatchObject({ text: first.text, rate: SLOW_RATE })
    fireEvent.click(within(card).getByRole('button', { name: /At speed/ }))
    expect(played.at(-1)).toMatchObject({ text: first.text, rate: 1 })
    expect(within(card).getByText(first.reading!)).toBeInTheDocument()

    fireEvent.click(within(card).getByRole('button', { name: 'Record' }))
    fireEvent.click(within(card).getByRole('button', { name: 'Record' }))
    expect(screen.getByText(/1 of 5 practised/)).toBeInTheDocument()
    expect(useActivity.getState().counts.zh?.twister).toBe(1)
    expect(useStudy.getState().progress.zh?.stats.xp).toBe(2)
  })

  it('has English twisters too, and is closed to other packs', () => {
    renderFor('en')
    expect(screen.getByText(TWISTERS.en[0].text)).toBeInTheDocument()
    cleanup()
    renderFor('ko')
    expect(screen.queryByText(TWISTERS.en[0].text)).toBeNull()
  })
})
