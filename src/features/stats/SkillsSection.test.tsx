/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import SkillsSection from './SkillsSection'
import { useSettings } from '@/store/settingsStore'
import { useReading } from '@/store/readingStore'
import { useGrammar } from '@/store/grammarStore'
import { usePhrases } from '@/store/phrasesStore'

// "Ngoài từ vựng" on the stats page, against the real data files.

const files: Record<string, string> = {
  'reading/en.json': 'public/data/reading/en.json',
  'reading/ko.json': 'public/data/reading/ko.json',
  'grammar/en.json': 'public/data/grammar/en.json',
  'grammar/ko.json': 'public/data/grammar/ko.json',
  'phrases/en.json': 'public/data/phrases/en.json',
}

beforeEach(() => {
  useSettings.setState({ uiLang: 'en' })
  useReading.setState({
    progress: { 'lans-morning': { best: 100, reads: 1 }, 'ko-market': { best: 66, reads: 2 } },
  })
  useGrammar.setState({ progress: { 'to-be': { best: 90, attempts: 1, lastDay: 1 } } })
  usePhrases.setState({ progress: { 1: { right: 2, wrong: 0, lastDay: 1 } } })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const key = Object.keys(files).find((k) => url.endsWith(k))
      return key
        ? new Response(readFileSync(files[key], 'utf8'), { status: 200 })
        : new Response('', { status: 404 })
    })
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const renderFor = (code: string) =>
  render(
    <MemoryRouter>
      <SkillsSection code={code} />
    </MemoryRouter>
  )

const value = (label: string) =>
  screen.getByRole('progressbar', { name: label }).getAttribute('aria-valuenow') +
  '/' +
  screen.getByRole('progressbar', { name: label }).getAttribute('aria-valuemax')

describe('Beyond vocabulary', () => {
  it('counts stories, grammar lessons and phrases for English', async () => {
    renderFor('en')
    expect(
      await screen.findByRole('progressbar', { name: 'Grammar lessons passed' })
    ).toBeInTheDocument()
    await screen.findByRole('progressbar', { name: 'Phrases known' })
    await screen.findByRole('progressbar', { name: 'Stories read' })
    expect(value('Stories read')).toBe('1/14')
    expect(value('Grammar lessons passed')).toBe('1/12')
    expect(value('Phrases known')).toBe('1/100')
  })

  it('shows only the skills the Korean pack has, counted on its own files', async () => {
    const koStories = JSON.parse(readFileSync(files['reading/ko.json'], 'utf8')).stories.length
    const koUnits = JSON.parse(readFileSync(files['grammar/ko.json'], 'utf8')).units.length
    renderFor('ko')
    await screen.findByRole('progressbar', { name: 'Stories read' })
    await screen.findByRole('progressbar', { name: 'Grammar lessons passed' })
    expect(value('Stories read')).toBe(`1/${koStories}`)
    expect(value('Grammar lessons passed')).toBe(`0/${koUnits}`)
    // Korean has no phrase pack.
    expect(screen.queryByRole('progressbar', { name: 'Phrases known' })).toBeNull()
  })
})
