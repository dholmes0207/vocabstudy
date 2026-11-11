/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import Practice from './Practice'

afterEach(cleanup)

const renderFor = (code: string) => {
  useSettings.setState({ uiLang: 'en', currentLang: code })
  render(
    <MemoryRouter>
      <Practice />
    </MemoryRouter>
  )
}

describe('Practice hub', () => {
  it('describes a shared page with the current pack’s own examples', () => {
    renderFor('en')
    const confusables = screen.getByRole('link', { name: /Easily confused words/ })
    expect(confusables).toHaveTextContent('make/do')
    expect(confusables).not.toHaveTextContent('在/再')
    expect(screen.getByRole('link', { name: /Collocations/ })).not.toHaveTextContent('吃药')
  })

  it('shows Chinese examples to the Chinese pack', () => {
    renderFor('zh')
    const confusables = screen.getByRole('link', { name: /Easily confused words/ })
    expect(confusables).toHaveTextContent('在/再')
    expect(confusables).not.toHaveTextContent('make/do')
    expect(screen.getByRole('link', { name: /Tongue twisters/ })).not.toHaveTextContent('seashells')
    expect(screen.getByRole('link', { name: /HSKK speaking/ })).toHaveTextContent('Intermediate')
  })
})
