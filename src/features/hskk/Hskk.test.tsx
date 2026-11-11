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
import { useActivity } from '@/store/activityStore'
import { HSKK_ANSWER, HSKK_MID_PICTURES, HSKK_REPEAT } from '@/lib/hskk'

const said: string[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string }) => said.push(o.text),
  stopPronounce: () => {},
  textAudio: () => '',
}))
vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
vi.mock('@/lib/hskk', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/hskk')>()
  return {
    ...real,
    hskkRound: (part: 1 | 2 | 3, _rand: unknown, level: 'elementary' | 'intermediate') =>
      real.HSKK_LEVELS[level].parts[part].slice(0, 2),
  }
})

const { default: Hskk } = await import('./Hskk')
const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

beforeEach(() => {
  said.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

const renderPage = () =>
  render(
    <MemoryRouter>
      <Hskk />
    </MemoryRouter>
  )

describe('HSKK speaking', () => {
  it('Part 1: reads each sentence aloud and hides it until asked', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /^Practise/ })[0])
    const first = HSKK_REPEAT[0]
    expect(said.at(-1)).toBe(first.zh)
    expect(screen.queryByText(first.zh)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Show the text/ }))
    expect(screen.getByText(first.pinyin)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    expect(said.at(-1)).toBe(HSKK_REPEAT[1].zh)
    expect(screen.queryByText(HSKK_REPEAT[1].zh)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Finish/ }))
    expect(screen.getByText('Well spoken!')).toBeInTheDocument()
    expect(useActivity.getState().counts.zh?.hskk).toBe(1)
    expect(useStudy.getState().progress.zh?.stats.xp).toBe(10)
  })

  it('Part 2: offers a sample answer that can be heard', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /^Practise/ })[1])
    const q = HSKK_ANSWER[0]
    fireEvent.click(screen.getByRole('button', { name: /See a sample answer/ }))
    expect(screen.getByText(q.sample!.zh)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hear the sample answer' }))
    expect(said.at(-1)).toBe(q.sample!.zh)
  })

  it('Intermediate Part 2: shows the picture and the question, with a sample talk', () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: /Intermediate/ }))
    expect(screen.getByText(/Part 2 · Talk about a picture/)).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /^Practise/ })[1])
    const pic = HSKK_MID_PICTURES[0]
    expect(screen.getByText(pic.shows!)).toBeInTheDocument()
    expect(screen.getByText(pic.zh)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Show the text/ })).toBeNull()
    expect(said.at(-1)).toBe(pic.zh)
    fireEvent.click(screen.getByRole('button', { name: /See a sample answer/ }))
    expect(screen.getByText(pic.sample!.zh)).toBeInTheDocument()
  })

  it('is for the Chinese pack only', () => {
    useSettings.setState({ currentLang: 'en' })
    renderPage()
    expect(screen.queryByRole('button', { name: /^Practise/ })).toBeNull()
  })
})
