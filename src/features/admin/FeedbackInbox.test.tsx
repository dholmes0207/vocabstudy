/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'

const { adminFeedback } = vi.hoisted(() => ({ adminFeedback: vi.fn() }))
vi.mock('@/lib/api', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/api')>()
  return { ...real, api: { ...real.api, adminFeedback } }
})

const { FeedbackInbox } = await import('./FeedbackInbox')

const row = (id: string, message: string) => ({
  id,
  message,
  created_at: '2026-11-26T10:00:00Z',
  name: '',
  rating: null,
  allow_quote: false,
  featured: false,
  page: '/review',
})

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  adminFeedback.mockResolvedValue({
    enabled: true,
    feedback: [
      row('1', '[Lỗi nội dung] en #42 "improve" (quiz:en-to-vi)\nWrong meaning'),
      row('2', 'Love the stories, please add more.'),
    ],
  })
})
afterEach(cleanup)

describe('FeedbackInbox', () => {
  it('shows content error reports on their own, marked as such', async () => {
    render(<FeedbackInbox />)
    expect(await screen.findByText(/Love the stories/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Content errors (1)' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Content errors (1)' }))
    expect(screen.queryByText(/Love the stories/)).toBeNull()
    expect(screen.getByText(/Wrong meaning/)).toBeInTheDocument()
    expect(screen.getByText('Content error')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Feedback (1)' }))
    expect(screen.queryByText(/Wrong meaning/)).toBeNull()
    expect(screen.getByText(/Love the stories/)).toBeInTheDocument()
  })
})
