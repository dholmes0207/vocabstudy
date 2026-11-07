/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { TFNG_LABEL, type IeltsBank } from '@/lib/ielts'

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: Ielts } = await import('./Ielts')

const bank = JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8')) as IeltsBank

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useIelts.setState({ reading: {} })
  useActivity.setState({ counts: {} })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => bank }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('IELTS practice', () => {
  it('shows the four skills and a passage list', async () => {
    render(
      <MemoryRouter>
        <Ielts />
      </MemoryRouter>
    )
    for (const skill of ['Listening', 'Reading', 'Writing', 'Speaking'])
      expect(screen.getByText(skill)).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /Farms on city rooftops/ })
    ).toBeInTheDocument()
  })

  it('runs a passage statement by statement, explains each, then records it', async () => {
    render(
      <MemoryRouter>
        <Ielts />
      </MemoryRouter>
    )
    fireEvent.click(await screen.findByRole('button', { name: /Farms on city rooftops/ }))
    const p = bank.reading.find((r) => r.id === 'city-farms')!
    for (let i = 0; i < p.questions.length; i++) {
      const statement = screen.getByText((_, el) =>
        p.questions.some((q) => el?.tagName === 'P' && el.textContent === q.statement)
      ).textContent
      const q = p.questions.find((x) => x.statement === statement)!
      fireEvent.click(screen.getByRole('button', { name: TFNG_LABEL[q.answer][1] }))
      expect(screen.getByRole('status')).toHaveTextContent(q.why)
      fireEvent.click(screen.getByRole('button', { name: /^(Next|See results)/ }))
    }
    expect(screen.getByText('5 of 5 right')).toBeInTheDocument()
    expect(useIelts.getState().reading['city-farms']).toEqual({ best: 5, total: 5 })
    expect(useActivity.getState().counts.en?.['ielts-reading']).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(15)
  })
})
