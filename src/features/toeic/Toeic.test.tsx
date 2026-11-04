/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { TOEIC_THEMES } from '@/lib/toeic'
import { familySlots, WORD_FAMILIES } from '@/lib/wordFamilies'
import Toeic from './Toeic'
import Exam from '@/features/exam/Exam'

// "Luyện thi TOEIC" (docs/design/toeic.md) with the real English pack.

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useData.setState({ pack: en, status: 'ready' })
  useStudy.setState({ progress: {} })
})
afterEach(cleanup)

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/toeic" element={<Toeic />} />
        <Route path="/exam" element={<Exam />} />
      </Routes>
    </MemoryRouter>
  )

describe('TOEIC page', () => {
  it('lists every theme as a deck and the seven parts of the test', () => {
    renderAt('/toeic')
    const themes = screen.getByRole('heading', { name: 'Words by theme' }).parentElement!
    expect(within(themes).getAllByRole('button', { name: 'Learn' })).toHaveLength(
      TOEIC_THEMES.length
    )
    const parts = screen.getByRole('heading', { name: 'The seven parts' }).parentElement!
    expect(within(parts).getAllByRole('listitem')).toHaveLength(7)
    expect(within(parts).getByText(/Part 5 · Incomplete sentences/)).toBeInTheDocument()
  })

  it('starts a lesson on a theme', () => {
    renderAt('/toeic')
    fireEvent.click(screen.getAllByRole('button', { name: 'Learn' })[0])
    expect(screen.queryByRole('heading', { name: 'Words by theme' })).not.toBeInTheDocument()
  })

  it('opens the TOEIC tab of the roadmap from its link', () => {
    renderAt('/toeic')
    fireEvent.click(screen.getByRole('link', { name: /Roadmap & vocabulary check/ }))
    expect(screen.getByRole('tab', { name: 'TOEIC', selected: true })).toBeInTheDocument()
  })

  it('runs a Part 5 round with an explanation after each answer, then the kinds that went wrong', () => {
    renderAt('/toeic')
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

  it('runs the word-ending drill: a word, four parts of speech, then the rule', () => {
    renderAt('/toeic')
    fireEvent.click(screen.getByRole('button', { name: /Ending tip/ }))
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText('What part of speech is this word?')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Noun' }))
      expect(screen.getByText(/The ending -\w+ usually marks/)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /^(Next|See results)$/ }))
    }
    expect(screen.getByText(/of 10 right/)).toBeInTheDocument()
  })

  it('runs word families: each form into its slot, one slip marks the family', () => {
    renderAt('/toeic')
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
})
