/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Pinyin from './Pinyin'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'

// "Pinyin & thanh điệu" (docs/design/chinese.md) with the real Chinese pack.

const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8'))

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <Pinyin />
    </MemoryRouter>
  )

describe('Pinyin', () => {
  it('shows the four tones and the neutral one', () => {
    renderPage()
    for (const s of ['Thanh 1', 'Thanh 2', 'Thanh 3', 'Thanh 4', 'Thanh nhẹ'])
      expect(screen.getAllByText(new RegExp(s)).length).toBeGreaterThan(0)
  })

  it('explains an initial with a word from the pack', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /^zh\s*中 zhōng$/ }))
    expect(screen.getByText(/uốn lưỡi/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /中国 — Trung Quốc/ })).toBeInTheDocument()
  })

  it('runs the quick check to the end and gives XP', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.42)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra nhanh/ }))
    for (let i = 0; i < 10; i++) {
      const card = screen.getByText(/thanh mấy|đọc là gì/).parentElement!
      fireEvent.click(within(card).getAllByRole('button')[0])
      fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ }))
    }
    expect(screen.getByText('Xong bài kiểm tra pinyin!')).toBeInTheDocument()
    expect(useStudy.getState().progress.zh?.stats.xp).toBeGreaterThanOrEqual(5)
  })
})
