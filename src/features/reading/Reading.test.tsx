/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useReading } from '@/store/readingStore'

// "Đọc truyện ngắn" (docs/design/reading.md) with the real stories and pack.
// The voice is mocked so the test decides when each sentence finishes.

const spoken: { text: string; onEnd?: () => void }[] = []
vi.mock('@/lib/audio', () => ({
  pronounce: (o: { text: string; onEnd?: () => void }) => spoken.push(o),
  stopPronounce: () => {},
  wordAudio: (id: number) => `/audio/en/${id}.mp3`,
}))

const { default: Reading } = await import('./Reading')

const stories = JSON.parse(readFileSync('public/data/reading/en.json', 'utf8'))
const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack
const lan = stories.stories.find((s: { id: string }) => s.id === 'lans-morning')

beforeEach(() => {
  spoken.length = 0
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useReading.setState({ progress: {} })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => stories }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderStory() {
  render(
    <MemoryRouter initialEntries={['/reading/lans-morning']}>
      <Routes>
        <Route path="/reading/:storyId" element={<Reading />} />
      </Routes>
    </MemoryRouter>
  )
}

const currentLine = () => document.querySelector('[aria-current="true"]')?.textContent ?? null

describe('Reading a story aloud', () => {
  it('reads sentence after sentence, lighting up the one being spoken', async () => {
    renderStory()
    fireEvent.click(await screen.findByRole('button', { name: 'Listen' }))
    expect(spoken.map((s) => s.text)).toEqual([lan.sentences[0].en])
    expect(currentLine()).toContain('wakes')

    spoken[0].onEnd?.()
    expect(await screen.findByRole('button', { name: 'Stop' })).toBeInTheDocument()
    expect(spoken[1].text).toBe(lan.sentences[1].en)
    expect(currentLine()).toContain('glass')
  })

  it('stops on Stop, and a late callback from the cancelled line does nothing', async () => {
    renderStory()
    fireEvent.click(await screen.findByRole('button', { name: 'Listen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(currentLine()).toBeNull()
    spoken[0].onEnd?.()
    expect(spoken).toHaveLength(1)
    expect(currentLine()).toBeNull()
  })

  it('opens the meaning of a tapped word', async () => {
    renderStory()
    fireEvent.click(await screen.findByRole('button', { name: 'drinks' }))
    expect(screen.getByRole('dialog', { name: 'drink' })).toHaveTextContent('uống')
  })
})
