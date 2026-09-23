/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { PosCategory, Word } from '@/types'
import MySentence from './MySentence'
import { useNotes } from '@/store/notesStore'
import { useAuth } from '@/store/authStore'
import { useContextStore } from '@/store/contextStore'

// "Câu của bạn" only works if the sentence really uses the word — otherwise it
// is a note, not practice. And the AI check must only be offered to someone
// who can actually use the assistant.

const go: Word = {
  id: 432,
  word: 'go',
  ipa: '',
  viRead: '',
  pos: 'v.',
  posCategory: 'verb' as PosCategory,
  meaning: 'đi',
  exampleEn: 'We go to the beach every summer.',
  exampleVi: '',
}

const saved = () => useNotes.getState().sentences.en?.[go.id]?.text

beforeEach(() => {
  useNotes.setState({ sentences: {} })
  useAuth.setState({ user: null })
  useContextStore.setState({ pendingAsk: null, assistantOpen: false })
})
afterEach(cleanup)

function type(text: string) {
  const box = screen.getByRole('textbox')
  fireEvent.change(box, { target: { value: text } })
  fireEvent.keyDown(box, { key: 'Enter' })
}

describe('MySentence', () => {
  it('saves a sentence that uses the word — in any form', () => {
    render(<MySentence word={go} lang="en" />)
    type('I went to Da Lat last year.')
    expect(saved()).toBe('I went to Da Lat last year.')
    expect(screen.getByText(/Câu của bạn/)).toBeInTheDocument()
  })

  it('refuses a sentence without the word, and says why', () => {
    render(<MySentence word={go} lang="en" />)
    type('I like coffee.')
    expect(saved()).toBeUndefined()
    expect(screen.getByText(/chưa có từ “go”/)).toBeInTheDocument()
  })

  it('clearing a saved sentence deletes it', () => {
    useNotes.getState().setSentence('en', go.id, 'Let us go home.')
    render(<MySentence word={go} lang="en" />)
    fireEvent.click(screen.getByRole('button', { name: /Sửa/ }))
    type('')
    expect(saved()).toBeUndefined()
  })

  it('offers the AI check only to a logged-in learner, and hands it the sentence', () => {
    useNotes.getState().setSentence('en', go.id, 'I go to work by bus.')
    const { unmount } = render(<MySentence word={go} lang="en" />)
    expect(screen.queryByRole('button', { name: /Nhờ AI/ })).not.toBeInTheDocument()
    unmount()

    useAuth.setState({ user: { id: 'u1', email: 'a@b.c', name: 'A', role: 'student' } as never })
    render(<MySentence word={go} lang="en" />)
    fireEvent.click(screen.getByRole('button', { name: /Nhờ AI/ }))
    const { pendingAsk, assistantOpen } = useContextStore.getState()
    expect(assistantOpen).toBe(true)
    expect(pendingAsk).toContain('I go to work by bus.')
    expect(pendingAsk).toContain('"go"')
  })
})

describe('contextStore.ask', () => {
  it('hands the queued question over exactly once', () => {
    useContextStore.getState().ask('hello?')
    expect(useContextStore.getState().takeAsk()).toBe('hello?')
    expect(useContextStore.getState().takeAsk()).toBeNull()
  })
})
