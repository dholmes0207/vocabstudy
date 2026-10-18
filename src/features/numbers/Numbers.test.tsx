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

// "Nghe số" (docs/design/numbers.md).

const spoken: string[] = []
vi.mock('@/lib/audio', () => ({
  pronounce: (o: { text: string }) => spoken.push(o.text),
  stopPronounce: () => {},
}))
vi.mock('@/lib/zhNumbers', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/zhNumbers')>()
  const item = real.itemFor('number', 14)
  const options = [
    item,
    real.itemFor('number', 41),
    real.itemFor('number', 40),
    real.itemFor('number', 4),
  ]
  return { ...real, numberQuiz: () => [{ item, options, answer: 0 }] }
})

const { default: Numbers } = await import('./Numbers')
const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

beforeEach(() => {
  vi.useFakeTimers()
  spoken.length = 0
  useSettings.setState({ uiLang: 'vi', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Numbers', () => {
  it('plays the number, then shows its characters and pinyin after the answer', () => {
    render(<Numbers />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByRole('button', { name: /Nghe 10 câu/ }))
    vi.advanceTimersByTime(300)
    expect(spoken).toEqual(['十四'])
    expect(screen.queryByText('十四')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '41' }))
    expect(screen.getByText('十四')).toBeInTheDocument()
    expect(screen.getByText('shí sì')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Xem kết quả/ }))
    expect(screen.getByText('Đúng 0/1 câu')).toBeInTheDocument()
  })
})
