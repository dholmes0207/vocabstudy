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

// Korean counters on the "Lượng từ" page (docs/design/measure-words.md).

vi.mock('@/lib/audio', () => ({ pronounce: () => {}, stopPronounce: () => {} }))
vi.mock('@/lib/koCounters', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/koCounters')>()
  const book = real.COUNTER_ITEMS.find((i) => i.noun === '책')!
  return {
    ...real,
    koCounterQuiz: () => [{ item: book, n: 2, options: ['개', '권', '잔', '명'], answer: 1 }],
  }
})

const { default: MeasureWords } = await import('./MeasureWords')
const pack = JSON.parse(readFileSync('public/data/ko.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi', currentLang: 'ko', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
})
afterEach(cleanup)

describe('Korean counters', () => {
  it('shows the counters next to Vietnamese classifiers on the Korean pack', () => {
    render(<MeasureWords />, { wrapper: MemoryRouter })
    expect(screen.getByText('단위 명사')).toBeInTheDocument()
    expect(screen.getByText('“quyển”')).toBeInTheDocument()
  })

  it('asks "책 두 ___" without giving the counter away, then shows the phrase', () => {
    render(<MeasureWords />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByRole('button', { name: /Luyện 10 câu/ }))
    expect(screen.getByText('책 두 ___')).toBeInTheDocument()
    expect(screen.queryByText('hai quyển sách')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '권' }))
    expect(screen.getByText('Đúng rồi!')).toBeInTheDocument()
    expect(screen.getByText('책 두 권')).toBeInTheDocument()
    expect(screen.getByText('hai quyển sách')).toBeInTheDocument()
  })
})
