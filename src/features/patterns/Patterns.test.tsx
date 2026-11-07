/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { validatePatterns, type PatternItem } from '@/lib/patterns'

vi.mock('@/lib/audio', () => ({ pronounce: () => {}, textAudio: () => '' }))
vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: PatternRound } = await import('./PatternRound')

const { patterns } = validatePatterns(
  JSON.parse(readFileSync('public/data/patterns/en.json', 'utf8'))
)

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

/** Taps the pool blocks in sentence order (by text), first an out-of-order one if asked. */
function build(item: PatternItem, slip: boolean) {
  const pool = () =>
    screen
      .getAllByRole('button')
      .filter((b) => !b.hasAttribute('disabled') && b.getAttribute('lang') === 'en')
  if (slip) {
    const wrong = item.sentence.chunks[item.sentence.chunks.length - 1][0]
    fireEvent.click(pool().find((b) => b.textContent === wrong)!)
  }
  for (const [text] of item.sentence.chunks)
    fireEvent.click(pool().find((b) => b.textContent === text)!)
}

describe('building sentence patterns', () => {
  it('fills the frame block by block and counts clean sentences', () => {
    const items: PatternItem[] = [
      { pattern: patterns[0], sentence: patterns[0].sentences[0] },
      { pattern: patterns[1], sentence: patterns[1].sentences[0] },
    ]
    render(
      <MemoryRouter>
        <PatternRound items={items} onAgain={() => {}} onExit={() => {}} />
      </MemoryRouter>
    )
    const frame = screen.getByRole('list', { name: 'Sentence frame' })
    expect(within(frame).getByText('Subject')).toBeInTheDocument()
    build(items[0], false)
    expect(screen.getByRole('status')).toHaveTextContent('Right first time!')
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))
    build(items[1], true)
    expect(screen.getByRole('status')).toHaveTextContent('Done!')
    fireEvent.click(screen.getByRole('button', { name: /^See results/ }))
    expect(screen.getByText('1 of 2 built without a slip')).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.patterns).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(3)
  })
})
