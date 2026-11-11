/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { ApiError } from '@/lib/api'

const adminRetention = vi.fn()
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return { ...actual, api: { ...actual.api, adminRetention: () => adminRetention() } }
})

const { RetentionPanel } = await import('./RetentionPanel')
const { useSettings } = await import('@/store/settingsStore')

beforeEach(() => useSettings.setState({ uiLang: 'vi' }))

afterEach(() => {
  cleanup()
  adminRetention.mockReset()
})

const none = { eligible: 0, returned: 0 }

describe('RetentionPanel', () => {
  it('shows the return rates with the counts behind them, week by week', async () => {
    adminRetention.mockResolvedValue({
      today: 20390,
      learners: 12,
      activeToday: 3,
      active7: 7,
      nextDay: { eligible: 10, returned: 4 },
      firstWeek: { eligible: 8, returned: 5 },
      cohorts: [
        { week: 20388, learners: 2, nextDay: { eligible: 1, returned: 1 }, firstWeek: none },
        { week: 20381, learners: 4, nextDay: { eligible: 4, returned: 1 }, firstWeek: none },
      ],
    })
    render(<RetentionPanel />)
    expect(await screen.findByText('40%')).toBeInTheDocument()
    expect(screen.getByText('(4/10)')).toBeInTheDocument()
    expect(screen.getByText('63%')).toBeInTheDocument()
    expect(screen.getByText('3 / 7')).toBeInTheDocument()
    // Monday 20/10/2025 – Sunday 26/10/2025.
    expect(screen.getByText('20/10 – 26/10')).toBeInTheDocument()
    // A week with nobody eligible yet shows a dash, not 0%.
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })

  it('says why when the figures cannot be read', async () => {
    adminRetention.mockRejectedValue(new ApiError(502, 'Supabase trả về 500 khi đọc tiến độ.'))
    render(<RetentionPanel />)
    expect(await screen.findByText(/Supabase trả về 500/)).toBeInTheDocument()
  })
})
