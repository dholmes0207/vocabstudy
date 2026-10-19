/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useGrammar } from '@/store/grammarStore'
import { today } from '@/lib/date'
import GrammarReviewCard from './GrammarReviewCard'

// "Ôn ngữ pháp" on Home (docs/design/grammar.md) with the real Chinese lessons.

const pack = JSON.parse(readFileSync('public/data/grammar/zh.json', 'utf8'))

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi', currentLang: 'zh' })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => pack }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const renderCard = () => render(<GrammarReviewCard />, { wrapper: MemoryRouter })

describe('GrammarReviewCard', () => {
  it('lists the lessons due for review, linking to each', async () => {
    const d = today()
    useGrammar.setState({
      progress: {
        'zh-shi': { best: 90, attempts: 1, lastDay: d - 3, step: 0, due: d - 1 },
        'zh-de': { best: 90, attempts: 1, lastDay: d, step: 0, due: d + 3 },
      },
    })
    renderCard()
    expect(await screen.findByText(/1 bài đến hạn ôn/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /是/ })).toHaveAttribute('href', '/grammar/zh-shi')
    expect(screen.queryByRole('link', { name: /的/ })).not.toBeInTheDocument()
  })

  it('stays hidden when nothing is due', async () => {
    useGrammar.setState({ progress: {} })
    const { container } = renderCard()
    await new Promise((r) => setTimeout(r, 0))
    expect(container).toBeEmptyDOMElement()
  })
})
