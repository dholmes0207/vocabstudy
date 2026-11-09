/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Pinyin from './Pinyin'
import { earQuiz } from '@/lib/pinyin'
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

  it('drills tone changes in speech, explaining the rule after each answer', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Luyện biến điệu/ }))
    expect(screen.getByText('Khi nói, từ này đọc là gì?')).toBeInTheDocument()
    for (let i = 0; i < 10; i++) {
      const card = screen.getByText('Khi nói, từ này đọc là gì?').parentElement!
      fireEvent.click(within(card).getAllByRole('button')[0])
      if (i === 0) expect(screen.getByText(/thanh/, { selector: 'b' })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ }))
    }
    expect(screen.getByText('Xong bài kiểm tra pinyin!')).toBeInTheDocument()
    expect(useStudy.getState().progress.zh?.stats.xp).toBeGreaterThanOrEqual(5)
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

  it('plays a word by ear and shows its characters only after the answer', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Nghe chọn thanh/ }))
    const card = screen.getByText('Nghe rồi chọn thanh đúng').parentElement!
    expect(within(card).getByRole('button', { name: 'Nghe lại' })).toBeInTheDocument()
    expect(within(card).queryByText(/\p{Script=Han}{2}/u)).not.toBeInTheDocument()
    const options = within(card)
      .getAllByRole('button')
      .filter((b) => b.textContent && b.getAttribute('aria-label') !== 'Nghe lại')
    expect(options).toHaveLength(4)
    fireEvent.click(options[0])
    expect(within(card).getByText(/^\p{Script=Han}{2}$/u)).toBeInTheDocument()
  })

  it('lays out the 20 tone pairs, with a pack word in each', () => {
    renderPage()
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('button')).toHaveLength(20)
    expect(within(table).getByRole('button', { name: /thanh 3 \+ 3/ })).toHaveTextContent(
      'đọc 2 + 3'
    )
  })

  it('names the tone pairs heard wrong at the end of a listening round', () => {
    // A fixed Math.random makes the page's round the same as this one.
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const round = earQuiz(pack.words, 10)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Nghe chọn thanh/ }))
    for (const q of round) {
      if (q.kind !== 'ear') throw new Error('kind')
      const card = screen.getByText('Nghe rồi chọn thanh đúng').parentElement!
      fireEvent.click(within(card).getByRole('button', { name: q.options[(q.answer + 1) % 4] }))
      fireEvent.click(screen.getByRole('button', { name: /Câu tiếp|Xem kết quả|Tiếp/ }))
    }
    expect(screen.getByText(/Cặp thanh cần nghe lại: .*\(sai 1\/1\)/)).toBeInTheDocument()
  })
})
