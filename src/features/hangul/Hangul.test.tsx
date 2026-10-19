/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Hangul from './Hangul'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'

// "Bảng chữ cái Hangul" (docs/design/hangul.md) with the real Korean pack.

const pack = JSON.parse(readFileSync('public/data/ko.json', 'utf8'))

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi', currentLang: 'ko', soundEnabled: false })
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
      <Hangul />
    </MemoryRouter>
  )

describe('Hangul', () => {
  it('shows a letter with its sound and a word from the pack', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /ㄱ\s*c \/ g/ }))
    expect(screen.getByText(/기역/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /가방 — cái túi/ })).toBeInTheDocument()
  })

  it('builds a block from the letters picked', () => {
    renderPage()
    const vowel = screen.getByRole('radiogroup', { name: 'Nguyên âm' })
    fireEvent.click(within(vowel).getByRole('radio', { name: 'ㅗ' }))
    // Starts as 한 (ㅎ + ㅏ + ㄴ); with ㅗ it is 혼, read "hôn".
    expect(screen.getByRole('button', { name: 'Nghe 혼' })).toHaveTextContent('"hôn"')
  })

  it('runs the quick check to the end and gives XP', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.42)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra nhanh/ }))
    for (let i = 0; i < 10; i++) {
      const prompt = screen.getByText(/đọc là gì/).parentElement!
      fireEvent.click(within(prompt).getAllByRole('button')[0])
      fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ }))
    }
    expect(screen.getByText('Xong bài kiểm tra Hangul!')).toBeInTheDocument()
    expect(useStudy.getState().progress.ko?.stats.xp).toBeGreaterThanOrEqual(5)
  })

  it('explains the sound changes with pack words, written and as said', () => {
    renderPage()
    expect(screen.getByText('Biến âm khi đọc liền')).toBeInTheDocument()
    expect(screen.getByText('[으막]')).toBeInTheDocument()
    expect(screen.getByText('ư-mác')).toBeInTheDocument()
  })
})
