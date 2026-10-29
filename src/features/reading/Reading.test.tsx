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
import { useStudy } from '@/store/studyStore'
import { useSavedWords } from '@/store/savedWordsStore'

// "Đọc truyện ngắn" (docs/design/reading.md) with the real stories and pack.
// The voice is mocked so the test decides when each sentence finishes.

const spoken: { text: string; onEnd?: () => void }[] = []
vi.mock('@/lib/audio', () => ({
  prefetchAudio: () => {},
  pronounce: (o: { text: string; onEnd?: () => void }) => spoken.push(o),
  stopPronounce: () => {},
  wordAudio: (id: number) => `/audio/en/${id}.mp3`,
  textAudio: () => '',
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
  useStudy.setState({ progress: {} })
  useSavedWords.setState({ saved: {} })
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

  it('saves a tapped word to learn later, and can take it back', async () => {
    renderStory()
    fireEvent.click(await screen.findByRole('button', { name: 'drinks' }))
    const drink = pack.words.find((w) => w.word === 'drink')!
    const save = screen.getByRole('button', { name: 'Save to learn' })
    expect(save).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(save)
    expect(useSavedWords.getState().saved.en).toEqual([drink.id])
    expect(screen.getByRole('button', { name: 'Saved to learn' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('link', { name: /Learn now/ })).toHaveAttribute('href', '/learn')

    fireEvent.click(screen.getByRole('button', { name: 'Saved to learn' }))
    expect(useSavedWords.getState().saved.en).toEqual([])
  })

  it('offers no save button for a word already in the review schedule', async () => {
    const drink = pack.words.find((w) => w.word === 'drink')!
    useStudy.getState().recordAnswer('en', drink.id, true)
    renderStory()
    fireEvent.click(await screen.findByRole('button', { name: 'drinks' }))
    expect(screen.getByRole('dialog', { name: 'drink' })).toHaveTextContent(
      'Already in your reviews'
    )
    expect(screen.queryByRole('button', { name: /Save to learn/ })).not.toBeInTheDocument()
  })
})

describe('reading help, one sentence at a time', () => {
  it("opens one sentence's meaning without the whole translation", async () => {
    renderStory()
    const buttons = await screen.findAllByRole('button', { name: "This sentence's meaning" })
    fireEvent.click(buttons[0])
    expect(screen.getByText(lan.sentences[0].vi)).toBeInTheDocument()
    expect(screen.queryByText(lan.sentences[1].vi)).not.toBeInTheDocument()
    fireEvent.click(buttons[0])
    expect(screen.queryByText(lan.sentences[0].vi)).not.toBeInTheDocument()
  })

  it('reads aloud more slowly when asked', async () => {
    renderStory()
    fireEvent.click(await screen.findByRole('button', { name: 'Slow' }))
    fireEvent.click(screen.getByRole('button', { name: 'Listen' }))
    const rate = useSettings.getState().ttsRate
    expect((spoken[0] as { rate?: number }).rate).toBeCloseTo(rate * 0.7)
  })

  it('offers the next story once the questions are done', async () => {
    renderStory()
    fireEvent.click(await screen.findByRole('button', { name: /Answer \d+ questions/ }))
    for (let i = 0; i < lan.questions.length; i++) {
      fireEvent.click(
        screen.getAllByRole('button').find((b) => b.textContent === lan.questions[i].options[0]) ??
          screen.getAllByRole('button')[2]
      )
      fireEvent.click(screen.getByRole('button', { name: /Next|See results/ }))
    }
    const next = stories.stories[stories.stories.indexOf(lan) + 1]
    expect(screen.getByRole('link', { name: /Next story/ })).toHaveAttribute(
      'href',
      `/reading/${next.id}`
    )
  })
})

describe('dictation of a whole story', () => {
  it('goes through the story sentence by sentence and marks what was caught', async () => {
    renderStory()
    fireEvent.click(await screen.findByRole('button', { name: 'Dictation' }))
    expect(screen.getByText(`1/${lan.sentences.length}`)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(lan.title[1]))).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: 'What you heard' }), {
      target: { value: lan.sentences[0].en },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText(/Great listening/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByText(`2/${lan.sentences.length}`)).toBeInTheDocument()
  })
})
