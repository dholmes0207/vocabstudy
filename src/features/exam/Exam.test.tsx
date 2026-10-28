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
import { useExam } from '@/store/examStore'
import { useSavedWords } from '@/store/savedWordsStore'
import { useGrammar } from '@/store/grammarStore'
import { examFor, examWords } from '@/lib/exams'

// "Lộ trình luyện thi" (docs/design/exam-track.md) on the real Chinese pack.

vi.mock('@/lib/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/audio')>()),
  pronounce: () => {},
  stopPronounce: () => {},
  prefetchAudio: () => {},
}))

const { default: Exam, MockComplete } = await import('./Exam')

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const zh = json('public/data/zh.json') as LanguagePack
const hsk = examFor('zh')!
const grammarUnits = json('public/data/grammar/zh.json').units as { id: string }[]

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack: zh, status: 'ready' })
  useStudy.setState({ progress: {} })
  useExam.setState({ records: {} })
  useSavedWords.setState({ saved: {} })
  useGrammar.setState({ progress: {} })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({ ok: true, json: async () => json(`public${url}`) }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const renderExam = () =>
  render(
    <MemoryRouter>
      <Exam />
    </MemoryRouter>
  )

describe('HSK 1 roadmap', () => {
  it('states the exam facts with their caveat and sources', () => {
    renderExam()
    expect(screen.getByRole('heading', { name: /HSK 1 roadmap/ })).toBeInTheDocument()
    expect(screen.getByText('40 questions: 20 listening, 20 reading.')).toBeInTheDocument()
    expect(screen.getByText(/moving to a new standard \(HSK 3\.0\)/)).toBeInTheDocument()
    for (const s of hsk.sources)
      expect(screen.getByRole('link', { name: new RegExp(s.label) })).toHaveAttribute('href', s.url)
  })

  it('counts the 152 HSK 1 words and learns the next ones in a normal lesson', () => {
    const first = examWords(hsk, zh.words)[0]
    useStudy.getState().recordAnswer('zh', first.id, true)
    renderExam()
    expect(
      screen.getByText(/HSK 1 list \(152 entries\): 1 learned, 0 mastered/)
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Learn the next 10 words' }))
    expect(screen.getAllByText(examWords(hsk, zh.words)[1].word).length).toBeGreaterThan(0)
  })

  it('shows grammar progress from the pack once it loads', async () => {
    useGrammar.setState({ progress: { [grammarUnits[0].id]: { best: 90 } as never } })
    renderExam()
    expect(
      await screen.findByText(`80% or more in 1 of ${grammarUnits.length} lessons.`)
    ).toBeInTheDocument()
  })

  it('starts the vocabulary check without touching the review schedule', () => {
    renderExam()
    fireEvent.click(screen.getByRole('button', { name: 'Take the check' }))
    expect(screen.getByText('HSK 1 vocabulary check')).toBeInTheDocument()
    expect(useStudy.getState().progress.zh).toBeUndefined()
  })

  it('renders nothing for a pack without an exam', () => {
    useSettings.setState({ currentLang: 'ja' })
    const { container } = renderExam()
    expect(container).toBeEmptyDOMElement()
  })
})

describe('English roadmaps', () => {
  it('offers A2 Key and B1 Preliminary, with Cambridge facts and the pack stage as word list', () => {
    useSettings.setState({ currentLang: 'en' })
    useData.setState({ pack: json('public/data/en.json') as LanguagePack, status: 'ready' })
    renderExam()
    expect(screen.getByRole('tab', { name: 'A2 Key', selected: true })).toBeInTheDocument()
    expect(
      screen.getByText(/Reading and Writing: 1 hour, 7 parts, 32 questions/)
    ).toBeInTheDocument()
    expect(screen.getByText(/1,000 core A1–A2 words in the pack/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open/ })).toHaveAttribute('href', '/sounds')
    fireEvent.click(screen.getByRole('tab', { name: 'B1 Preliminary' }))
    expect(screen.getByText(/Reading: 45 minutes, 6 parts, 32 questions/)).toBeInTheDocument()
    expect(screen.getByText(/3,440 B1 words in the pack/)).toBeInTheDocument()
  })
})

describe('after the vocabulary check', () => {
  it('records the score once and saves missed new words to learn', () => {
    const [a, b] = examWords(hsk, zh.words)
    useStudy.getState().recordAnswer('zh', b.id, true) // b is already in the schedule
    const { rerender } = render(
      <MemoryRouter>
        <MockComplete exam={hsk} correct={18} total={20} wrong={[a, b]} onBack={() => {}} />
      </MemoryRouter>
    )
    rerender(
      <MemoryRouter>
        <MockComplete exam={hsk} correct={18} total={20} wrong={[a, b]} onBack={() => {}} />
      </MemoryRouter>
    )
    expect(useExam.getState().records.hsk1).toMatchObject({ best: 18, total: 20, tries: 1 })

    fireEvent.click(screen.getByRole('button', { name: /Save the missed word to learn/ }))
    expect(useSavedWords.getState().saved.zh).toEqual([a.id])
    expect(screen.getByRole('link', { name: /Saved — learn it now/ })).toHaveAttribute(
      'href',
      '/learn'
    )
  })
})

describe('HSK 2 roadmap', () => {
  it('switches level with the tabs, with its own facts and word list', () => {
    renderExam()
    expect(screen.getByRole('tab', { name: 'HSK 1', selected: true })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'HSK 2' }))
    expect(screen.getByRole('heading', { name: /HSK 2 roadmap/ })).toBeInTheDocument()
    expect(screen.getByText(/60 questions: 35 listening/)).toBeInTheDocument()
    expect(screen.getByText('Sources (checked 19 Oct 2026):')).toBeInTheDocument()
    expect(screen.getByText(/The HSK 2 list \(147 entries\)/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /complete-hsk-vocabulary/ })).toHaveAttribute(
      'href',
      'https://github.com/drkameleon/complete-hsk-vocabulary'
    )
  })
})
