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

// "Lượng từ" (docs/design/measure-words.md) with the real Chinese pack.

vi.mock('@/lib/audio', () => ({ pronounce: () => {}, stopPronounce: () => {} }))
vi.mock('@/lib/measureWords', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/measureWords')>()
  const book = real.MEASURE_ITEMS.find((i) => i.noun === '书')!
  return {
    ...real,
    measureQuiz: () => [{ item: book, options: ['个', '本', '杯', '只'], answer: 1 }],
  }
})

const { default: MeasureWords } = await import('./MeasureWords')
const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
})
afterEach(cleanup)

describe('Measure words', () => {
  it('lists the measure words next to their Vietnamese classifiers', () => {
    render(<MeasureWords />, { wrapper: MemoryRouter })
    expect(screen.getByText('“quyển”')).toBeInTheDocument()
    expect(screen.getByText('“con”')).toBeInTheDocument()
  })

  it('asks for the measure word, then shows the phrase with pinyin and adds XP', () => {
    render(<MeasureWords />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByRole('button', { name: /Luyện 10 câu/ }))
    expect(screen.getByText('一 ___ 书')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '个 gè' }))
    expect(screen.getByText('Chưa đúng.')).toBeInTheDocument()
    expect(screen.getByText('一本书')).toBeInTheDocument()
    expect(screen.getByText('yì běn shū')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Xem kết quả/ }))
    expect(screen.getByText('Đúng 0/1 câu')).toBeInTheDocument()
    expect(useStudy.getState().progress.zh?.stats).toBeDefined()
  })
})
