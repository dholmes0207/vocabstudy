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

// "Chữ Hán qua âm Hán Việt" (docs/design/han-viet-table.md) with the real packs.

vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: () => {},
  stopPronounce: () => {},
  textAudio: () => '',
  wordAudio: () => '',
}))
const { default: HanVietTable } = await import('./HanVietTable')
const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

beforeEach(() => useSettings.setState({ uiLang: 'vi', currentLang: 'zh' }))
afterEach(cleanup)

// The zh table lists hundreds of characters, and every Testing Library query
// walks the whole page (a label query took 3 s), so the full table is checked
// with a plain selector and the queries wait until the search has narrowed it.
describe('HanVietTable', () => {
  it('lists shared characters with their reading, and finds one typed without marks', () => {
    useData.setState({ pack: pack('zh'), status: 'ready' })
    const { container } = render(<HanVietTable />)
    expect(container.querySelector('button[aria-label="Nghe 学"]')).not.toBeNull()

    fireEvent.change(container.querySelector('input[type="search"]')!, {
      target: { value: 'hoc' },
    })
    expect(screen.getByRole('button', { name: 'Nghe 学' })).toBeInTheDocument()
    expect(screen.getByText('学校')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nghe 生')).not.toBeInTheDocument()
  })

  it('works for Korean syllable blocks too', () => {
    useSettings.setState({ currentLang: 'ko' })
    useData.setState({ pack: pack('ko'), status: 'ready' })
    render(<HanVietTable />)
    expect(screen.getByText(/Gốc Hán qua âm Hán Việt/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('runs a guessing round: clues from known words, four meanings, XP at the end', () => {
    useData.setState({ pack: pack('zh'), status: 'ready' })
    useStudy.setState({ progress: {} })
    render(<HanVietTable />, { wrapper: MemoryRouter })
    fireEvent.click(screen.getByText(/Đoán nghĩa nhờ Hán Việt/))
    for (let i = 0; i < 10; i++) {
      expect(screen.getAllByText(/như trong/).length).toBeGreaterThan(0)
      const options = screen
        .getAllByRole('button')
        .filter((b) => b.className.includes('rounded-xl border-2'))
      expect(options).toHaveLength(4)
      fireEvent.click(options[0])
      fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ }))
    }
    expect(screen.getByText('Xong một lượt!')).toBeInTheDocument()
    expect(useStudy.getState().progress.zh?.stats.xp).toBeGreaterThanOrEqual(5)
  })
})
