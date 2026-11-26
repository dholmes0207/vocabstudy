/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// The in-app feedback form (docs/design/feedback.md).

const { sendFeedback } = vi.hoisted(() => ({ sendFeedback: vi.fn() }))
vi.mock('@/lib/api', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/api')>()
  return { ...real, api: { ...real.api, sendFeedback } }
})

import FeedbackDialog from './FeedbackDialog'
import { openFeedback, reportContent, useFeedbackDialog } from '@/store/feedbackStore'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'
import { ApiError } from '@/lib/api'

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  useAuth.setState({ user: null })
  act(() => openFeedback())
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  useFeedbackDialog.setState({ open: false })
})

function renderForm() {
  render(
    <MemoryRouter>
      <FeedbackDialog />
    </MemoryRouter>
  )
}

describe('FeedbackDialog', () => {
  it('sends a rated message and says thank you', async () => {
    sendFeedback.mockResolvedValue({ ok: true })
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: '4 stars' }))
    fireEvent.change(screen.getByLabelText('Your feedback'), {
      target: { value: 'The phrases section is great.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('Thank you for your feedback!')).toBeInTheDocument()
    expect(sendFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'The phrases section is great.',
        rating: 4,
        allowQuote: false,
      })
    )
  })

  it('only allows quoting once a name is given, and never pre-ticks it', () => {
    renderForm()
    const quote = screen.getByRole('checkbox')
    expect(quote).toBeDisabled()
    expect(quote).not.toBeChecked()
    fireEvent.change(screen.getByLabelText('Your name (optional)'), { target: { value: 'Lan' } })
    expect(quote).toBeEnabled()
    expect(quote).not.toBeChecked()
  })

  it('asks for a longer message before sending', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText('Your feedback'), { target: { value: 'ok' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 10 characters/)
    expect(sendFeedback).not.toHaveBeenCalled()
  })

  it('offers email when the form cannot be stored yet', async () => {
    sendFeedback.mockRejectedValue(new ApiError(503, 'not_ready'))
    renderForm()
    fireEvent.change(screen.getByLabelText('Your feedback'), {
      target: { value: 'Something worth saying here.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(
      await screen.findByRole('link', { name: /Email contact@vocastudy\.app/ })
    ).toBeInTheDocument()
  })

  it('reports a content error about one word, without rating or quoting', async () => {
    sendFeedback.mockResolvedValue({ ok: true })
    act(() => reportContent({ pack: 'en', wordId: 42, word: 'improve', where: 'quiz:en-to-vi' }))
    renderForm()
    expect(screen.getByRole('heading', { name: 'Report a content error' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '4 stars' })).toBeNull()
    expect(screen.queryByLabelText(/Your name/)).toBeNull()
    // Saying what is wrong is required, in more than a letter.
    fireEvent.change(screen.getByLabelText('What is wrong?'), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(screen.getByText('Please say what is wrong.')).toBeInTheDocument()
    expect(sendFeedback).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('What is wrong?'), {
      target: { value: 'The meaning should be "cải thiện".' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('We will check this word and fix it.')).toBeInTheDocument()
    expect(sendFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          '[Lỗi nội dung] en #42 "improve" (quiz:en-to-vi)\nThe meaning should be "cải thiện".',
        rating: null,
        allowQuote: false,
      })
    )
  })
})
