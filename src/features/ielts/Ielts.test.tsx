/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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
  useIelts.setState({ reading: {}, headings: {} })
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

  it('matches a heading to each paragraph, frees a heading taken twice, and explains', async () => {
    render(
      <MemoryRouter>
        <Ielts />
      </MemoryRouter>
    )
    fireEvent.click(await screen.findByRole('button', { name: /Matching headings/ }))
    const id = screen.getByText(/Matching headings ·/).textContent!
    const p = bank.reading.find((r) => id.includes(r.title[1]))!
    const group = (i: number) =>
      screen.getByRole('group', { name: `Heading for paragraph ${String.fromCharCode(65 + i)}` })
    const roman = ['i', 'ii', 'iii', 'iv', 'v']
    const check = screen.getByRole('button', { name: /Pick a heading for all 3 paragraphs/ })
    expect(check).toBeDisabled()

    // Paragraph A takes B's heading: B is left empty again.
    const [a, b, c] = p.headings.answers
    fireEvent.click(within(group(1)).getByRole('button', { name: roman[b] }))
    fireEvent.click(within(group(0)).getByRole('button', { name: roman[b] }))
    expect(within(group(1)).getByRole('button', { name: roman[b] })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    // Now A right, B and C right too.
    fireEvent.click(within(group(0)).getByRole('button', { name: roman[a] }))
    fireEvent.click(within(group(1)).getByRole('button', { name: roman[b] }))
    fireEvent.click(within(group(2)).getByRole('button', { name: roman[c] }))
    fireEvent.click(screen.getByRole('button', { name: /^Check/ }))
    expect(screen.getByRole('status')).toHaveTextContent('3 of 3 right · +9 XP')
    expect(screen.getByText(p.headings.why[0])).toBeInTheDocument()
    expect(useIelts.getState().headings[p.id]).toEqual({ best: 3, total: 3 })
    expect(useActivity.getState().counts.en?.['ielts-reading']).toBe(1)
    expect(useStudy.getState().progress.en.stats.xp).toBe(9)
  })
})
