/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'

// "Chữ Hán qua âm Hán Việt" (docs/design/han-viet-table.md) with the real packs.

vi.mock('@/lib/audio', () => ({ pronounce: () => {}, stopPronounce: () => {} }))
const { default: HanVietTable } = await import('./HanVietTable')
const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

beforeEach(() => useSettings.setState({ uiLang: 'vi', currentLang: 'zh' }))
afterEach(cleanup)

describe('HanVietTable', () => {
  it('lists shared characters with their reading, and finds one typed without marks', () => {
    useData.setState({ pack: pack('zh'), status: 'ready' })
    render(<HanVietTable />)
    expect(screen.getByRole('button', { name: 'Nghe 学' })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm chữ' }), {
      target: { value: 'hoc' },
    })
    expect(screen.getByRole('button', { name: 'Nghe 学' })).toBeInTheDocument()
    expect(screen.getByText('学校')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nghe 生' })).not.toBeInTheDocument()
  })

  it('works for Korean syllable blocks too', () => {
    useSettings.setState({ currentLang: 'ko' })
    useData.setState({ pack: pack('ko'), status: 'ready' })
    render(<HanVietTable />)
    expect(screen.getByText(/Gốc Hán qua âm Hán Việt/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
  })
})
