/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { statsOf, useStudy } from '@/store/studyStore'
import { useExam } from '@/store/examStore'
import { useRetry } from '@/store/retryStore'
import { validateToeicBank } from '@/lib/toeicBank'
import { TOEIC_THEMES } from '@/lib/toeic'
import { familySlots, WORD_FAMILIES } from '@/lib/wordFamilies'
import { newCard } from '@/lib/srs'
import Toeic from './Toeic'
import Exam from '@/features/exam/Exam'

// "Luyện thi TOEIC" (docs/design/toeic.md) with the real English pack.

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack
const toeic = JSON.parse(readFileSync('public/data/toeic/en.json', 'utf8'))
const PART5_BANK = validateToeicBank(toeic).part5

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack: en, status: 'ready' })
  useStudy.setState({ progress: {} })
  useRetry.setState({ part5: [], kinds: {}, parts: {} })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => toeic }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

/** Renders the page, then waits for the practice bank so its buttons work. */
async function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/toeic" element={<Toeic />} />
        <Route path="/exam" element={<Exam />} />
      </Routes>
    </MemoryRouter>
  )
  if (path.startsWith('/toeic'))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Take the mini test' })).toBeEnabled()
    )
}

describe('TOEIC page', () => {
  it('lists every theme as a deck and the seven parts of the test', async () => {
    await renderAt('/toeic')
    const themes = screen.getByRole('heading', { name: 'Words by theme' }).parentElement!
    expect(within(themes).getAllByRole('button', { name: 'Learn' })).toHaveLength(
      TOEIC_THEMES.length
    )
    const parts = screen.getByRole('heading', { name: 'The seven parts' }).parentElement!
    expect(within(parts).getAllByRole('listitem')).toHaveLength(7)
    expect(within(parts).getByText(/Part 5 · Incomplete sentences/)).toBeInTheDocument()
  })

  it('starts a lesson on a theme', async () => {
    await renderAt('/toeic')
    fireEvent.click(screen.getAllByRole('button', { name: 'Learn' })[0])
    expect(screen.queryByRole('heading', { name: 'Words by theme' })).not.toBeInTheDocument()
  })

  it('opens the TOEIC tab of the roadmap from its link', async () => {
    await renderAt('/toeic')
    fireEvent.click(screen.getByRole('link', { name: /Roadmap & vocabulary check/ }))
    expect(screen.getByRole('tab', { name: 'TOEIC', selected: true })).toBeInTheDocument()
  })

  it('runs a Part 5 round with an explanation after each answer, then the kinds that went wrong', async () => {
    await renderAt('/toeic')
    fireEvent.click(screen.getByRole('button', { name: /Practise Part 5/ }))
    for (let i = 0; i < 10; i++) {
      const options = screen
        .getAllByRole('button')
        .filter((b) => /^\([ABCD]\)/.test(b.textContent ?? ''))
      expect(options).toHaveLength(4)
      fireEvent.click(options[0])
      expect(screen.getByText(/^(Right!|Not quite\.)/)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /^(Next|See results)$/ }))
    }
    expect(screen.getByText('Part 5 round done!')).toBeInTheDocument()
    expect(screen.getByText(/of 10 right/)).toBeInTheDocument()
    expect(useStudy.getState().progress.en?.stats.xp).toBeGreaterThanOrEqual(5)
    fireEvent.click(screen.getByRole('button', { name: 'Leave the game' }))
    expect(screen.getByRole('heading', { name: 'The seven parts' })).toBeInTheDocument()
  })

  it('runs the word-ending drill: a word, four parts of speech, then the rule', async () => {
    await renderAt('/toeic')
    fireEvent.click(screen.getByRole('button', { name: /Ending tip/ }))
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText('What part of speech is this word?')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Noun' }))
      expect(screen.getByText(/The ending -\w+ usually marks/)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /^(Next|See results)$/ }))
    }
    expect(screen.getByText(/of 10 right/)).toBeInTheDocument()
  })

  it('runs word families: each form into its slot, one slip marks the family', async () => {
    await renderAt('/toeic')
    fireEvent.click(screen.getByRole('button', { name: /Word families/ }))
    const card = () => screen.getByText(/^(Pick the|The whole family)/).parentElement!
    for (let i = 0; i < 6; i++) {
      const tiles = () =>
        within(card())
          .queryAllByRole('button')
          .filter((b) => b.getAttribute('lang') === 'en' && !b.hasAttribute('disabled'))
      const forms = tiles().map((b) => b.textContent)
      const slots = familySlots(
        WORD_FAMILIES.find((f) => familySlots(f).every((s) => forms.includes(s.en)))!
      )
      for (let k = 0; k < slots.length; k++) {
        // One wrong tap on the first family.
        if (i === 0 && k === 0) fireEvent.click(tiles().find((b) => b.textContent !== slots[0].en)!)
        fireEvent.click(tiles().find((b) => b.textContent === slots[k].en)!)
      }
      expect(
        screen.getByText(i === 0 ? 'Done, with 1 slip.' : 'Right first time!')
      ).toBeInTheDocument()
      expect(screen.getAllByText(slots[0].vi).length).toBeGreaterThan(0)
      fireEvent.click(screen.getByRole('button', { name: /^(Next family|See results)$/ }))
    }
    expect(screen.getByText('5 of 6 families without a slip')).toBeInTheDocument()
  })

  it('sends a word of the schedule missed in the endings drill back for an early review', async () => {
    // Every word started, two boxes in; nothing else changes the cards here.
    const cards = Object.fromEntries(
      en.words.map((w) => [w.id, { ...newCard(w.id), box: 2, lastReviewedDay: 0, dueDay: 99999 }])
    )
    useStudy.setState({ progress: { en: { cards, stats: statsOf({}, 'en') } as never } })
    await renderAt('/toeic')
    fireEvent.click(screen.getByRole('button', { name: /Ending tip/ }))
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Noun' }))
      fireEvent.click(screen.getByRole('button', { name: /^(Next|See results)$/ }))
    }
    const right = Number(/(\d+) of 10 right/.exec(document.body.textContent!)![1])
    const after = Object.values(useStudy.getState().progress.en!.cards)
    expect(after.filter((c) => c.box < 2)).toHaveLength(10 - right)
  })

  it('shows the best mini test result once there is one', async () => {
    useExam.setState({ records: {} })
    await renderAt('/toeic')
    expect(screen.queryByText(/Your best/)).not.toBeInTheDocument()
    cleanup()
    useExam.setState({ records: { 'toeic-mini': { best: 19, total: 26, day: 1, tries: 2 } } })
    await renderAt('/toeic')
    expect(screen.getByText(/Your best: 19\/26\./)).toBeInTheDocument()
  })

  it('keeps the Part 5 questions missed, offers them again, and lets go of those answered right', async () => {
    const missed = PART5_BANK.slice(0, 2)
    useRetry.setState({ part5: missed.map((q) => q.sentence) })
    await renderAt('/toeic')
    fireEvent.click(screen.getByRole('button', { name: 'Try again: 2 missed questions' }))
    for (let i = 0; i < 2; i++) {
      // The question on screen: the one whose sentence pieces around the gap are shown.
      const body = document.body.textContent!
      const q = missed.find((m) => m.sentence.split('___').every((piece) => body.includes(piece)))!
      const right = q.options[q.answer]
      const option = screen
        .getAllByRole('button')
        .find(
          (b) => /^\([ABCD]\)/.test(b.textContent ?? '') && b.textContent!.slice(3).trim() === right
        )!
      fireEvent.click(option)
      expect(screen.getByText(/^Right!/)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /^(Next|See results)$/ }))
    }
    expect(useRetry.getState().part5).toEqual([])
  })

  it('names the weakest kind of Part 5 question once enough answers are in', async () => {
    useRetry.setState({ part5: [], kinds: { prep: [2, 6], form: [6, 7] } })
    await renderAt('/toeic')
    expect(screen.getByText('Your weakest kind: Prepositions (2 of 6 right).')).toBeInTheDocument()
  })

  it('counts answers by part, shows them on each part, and names the weakest part', async () => {
    await renderAt('/toeic')
    fireEvent.click(screen.getByRole('button', { name: /Practise Part 5/ }))
    const options = screen
      .getAllByRole('button')
      .filter((b) => /^\([ABCD]\)/.test(b.textContent ?? ''))
    fireEvent.click(options[0])
    expect(useRetry.getState().parts[5]?.[1]).toBe(1)
    cleanup()
    useRetry.setState({ parts: { 3: [2, 9], 5: [8, 10] } })
    await renderAt('/toeic')
    expect(screen.getByText(/^Your weakest part: Part 3 \(2 of 9 right\)/)).toBeInTheDocument()
    expect(screen.getByText('You have answered 10, 8 right.')).toBeInTheDocument()
  })
})
