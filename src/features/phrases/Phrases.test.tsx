/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Phrases from './Phrases'
import { useSettings } from '@/store/settingsStore'
import { usePhrases } from '@/store/phrasesStore'

// The phrase screens read the real pack, so a broken JSON file or a renamed
// field shows up here, not on the learner's phone.

const packs: Record<string, string> = {
  en: readFileSync('public/data/phrases/en.json', 'utf8'),
  ko: readFileSync('public/data/phrases/ko.json', 'utf8'),
}

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  usePhrases.setState({ progress: {} })
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (url: string) => new Response(packs[url.match(/(\w+)\.json$/)![1]], { status: 200 })
    )
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function at(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/phrases" element={<Phrases />} />
        <Route path="/phrases/:topicId" element={<Phrases />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Everyday phrases', () => {
  it('lists every situation with its progress', async () => {
    at('/phrases')
    expect(await screen.findByText('Greetings & introductions')).toBeInTheDocument()
    expect(screen.getByText('Ordering food & drinks')).toBeInTheDocument()
    expect(screen.getByText(/100 phrases learned/)).toHaveTextContent('0/100 phrases learned')
  })

  it('shows a situation in Vietnamese too, with meanings always in Vietnamese', async () => {
    useSettings.setState({ uiLang: 'vi' })
    at('/phrases/understanding')
    expect(await screen.findByText('Khi chưa nghe rõ')).toBeInTheDocument()
    expect(screen.getByText('Sorry, could you say that again?')).toBeInTheDocument()
    expect(screen.getByText('Xin lỗi, bạn nói lại được không?')).toBeInTheDocument()
  })

  it('records an answer when a practice question is answered', async () => {
    at('/phrases/greetings')
    fireEvent.click((await screen.findAllByRole('button', { name: /Practise/ }))[0])
    // Answer whatever comes first: a choice question or a word-tile question.
    const options = document.querySelectorAll('main .grid.gap-2 button, .grid.gap-2 button')
    if (options.length) {
      fireEvent.click(options[0])
    } else {
      for (let i = 0; i < 40 && !screen.queryByText(/Next|See results/); i++) {
        const tile = document.querySelector('.flex.flex-wrap.gap-2 > button:not([disabled])')
        if (tile) fireEvent.click(tile)
      }
    }
    expect(await screen.findByRole('button', { name: /Next|See results/ })).toBeInTheDocument()
    expect(Object.keys(usePhrases.getState().progress)).toHaveLength(1)
  })

  it('has Korean phrases for the Korean pack', async () => {
    useSettings.setState({ uiLang: 'vi', currentLang: 'ko' })
    at('/phrases/food')
    expect(await screen.findByText('Gọi món & đồ uống')).toBeInTheDocument()
    expect(screen.getByText('이거 주세요.')).toBeInTheDocument()
    expect(screen.getByText('Cho mình món này.')).toBeInTheDocument()
  })

  it('says so when the situation does not exist', async () => {
    at('/phrases/nope')
    expect(await screen.findByText('Topic not found')).toBeInTheDocument()
  })
})
