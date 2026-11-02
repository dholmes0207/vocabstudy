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

// "Bộ thủ" (docs/design/radicals.md) with the real Chinese pack.

const spoken: string[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string }) => spoken.push(o.text),
  stopPronounce: () => {},
  textAudio: () => '',
  wordAudio: () => '',
}))

const { default: Radicals } = await import('./Radicals')
const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

beforeEach(() => {
  spoken.length = 0
  useSettings.setState({ uiLang: 'vi', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack: zh, status: 'ready' })
  useStudy.setState({ progress: {} })
})
afterEach(cleanup)

describe('Radicals', () => {
  it('lists radicals by their Sino-Vietnamese name, and reads a member word aloud', () => {
    const { container } = render(<Radicals />, { wrapper: MemoryRouter })
    expect(screen.getByText('ba chấm thuỷ')).toBeInTheDocument()
    const wash = container.querySelector<HTMLButtonElement>('button[aria-label^="Nghe 洗"]')!
    fireEvent.click(wash)
    expect(spoken).toHaveLength(1)
    expect(spoken[0]).toContain('洗')
  })

  it('runs a round: a character, four radicals, XP at the end', () => {
    render(<Radicals />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByText(/Đoán bộ thủ/))
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText('Chữ này có bộ thủ nào?')).toBeInTheDocument()
      const options = screen
        .getAllByRole('button')
        .filter((b) => b.className.includes('rounded-xl border-2'))
      expect(options).toHaveLength(4)
      fireEvent.click(options[0])
      fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ }))
    }
    expect(screen.getByText('Xong một lượt!')).toBeInTheDocument()
    expect(spoken).toHaveLength(10)
    expect(useStudy.getState().progress.zh?.stats.xp).toBeGreaterThanOrEqual(5)
  })
})
