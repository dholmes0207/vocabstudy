/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// The AI cap fails open on purpose, so "silently not counting" is a state an
// admin has to be able to SEE. These are the states they can land in.

const adminAiUsage = vi.fn()
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return { ...actual, api: { ...actual.api, adminAiUsage: () => adminAiUsage() } }
})

const { AiQuotaPanel } = await import('./AdminPage')

afterEach(() => {
  cleanup()
  adminAiUsage.mockReset()
})

const report = (over: Record<string, unknown> = {}) => ({
  limit: 30,
  day: '2026-09-10',
  reachable: true,
  today: { users: 3, requests: 12 },
  ...over,
})

describe('AiQuotaPanel', () => {
  it('confirms the cap is counting, with the numbers that prove it', async () => {
    adminAiUsage.mockResolvedValue(report())
    render(<AiQuotaPanel />)
    expect(await screen.findByText(/đang đếm/i)).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('says plainly that nobody is being capped when the counter is unreachable', async () => {
    adminAiUsage.mockResolvedValue(
      report({
        reachable: false,
        today: { users: 0, requests: 0 },
        error: 'API chưa thấy bảng ai_usage.',
      })
    )
    render(<AiQuotaPanel />)
    expect(await screen.findByText(/không đếm được/i)).toBeInTheDocument()
    expect(screen.getByText(/đang không có tác dụng/i)).toBeInTheDocument()
    // The admin needs the actual reason, not just a red badge.
    expect(screen.getByText(/ai_usage/)).toBeInTheDocument()
  })

  it('distinguishes "turned off on purpose" from "broken"', async () => {
    adminAiUsage.mockResolvedValue(report({ limit: 0 }))
    render(<AiQuotaPanel />)
    expect(await screen.findByText(/đã tắt hạn mức/i)).toBeInTheDocument()
    expect(screen.getByText(/không giới hạn/i)).toBeInTheDocument()
    expect(screen.queryByText(/không đếm được/i)).not.toBeInTheDocument()
  })

  it('does not let a quiet day read as proof the counter works', async () => {
    adminAiUsage.mockResolvedValue(report({ today: { users: 0, requests: 0 } }))
    render(<AiQuotaPanel />)
    expect(await screen.findByText(/hỏi thử một câu/i)).toBeInTheDocument()
  })

  it('surfaces a failed request instead of showing a blank card', async () => {
    adminAiUsage.mockRejectedValue(new Error('mạng hỏng'))
    render(<AiQuotaPanel />)
    await waitFor(() =>
      expect(screen.getByText(/không đọc được tình trạng hạn mức/i)).toBeInTheDocument()
    )
  })
})
