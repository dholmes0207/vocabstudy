/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import About from './About'
import { useSettings } from '@/store/settingsStore'

const manifest = JSON.parse(readFileSync('public/data/index.json', 'utf8')) as {
  languages: { code: string; beta?: boolean }[]
}

beforeEach(() => useSettings.setState({ uiLang: 'vi' }))
afterEach(cleanup)

describe('About page', () => {
  it('presents VocaStudy as a place for many languages, listing every one it ships', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    )
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    for (const { code } of manifest.languages) expect(hrefs, code).toContain(`/home?lang=${code}`)
    expect(screen.getAllByText('beta')).toHaveLength(
      manifest.languages.filter((l) => l.beta).length
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('học nhiều ngoại ngữ')
    expect(screen.getByRole('link', { name: /Gợi ý một ngôn ngữ/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/)
    )
  })
})
