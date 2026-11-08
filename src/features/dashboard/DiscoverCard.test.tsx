/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useVisited } from '@/store/visitedStore'
import { PRACTICE } from '@/features/practice/entries'
import { availableIn } from '@/lib/packContent'
import DiscoverCard from './DiscoverCard'

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en' })
  useVisited.setState({ seen: [] })
})
afterEach(cleanup)

const show = () =>
  render(
    <MemoryRouter>
      <DiscoverCard />
    </MemoryRouter>
  )

describe('DiscoverCard', () => {
  it('links to a practice screen of this pack that has not been opened', () => {
    show()
    const link = screen.getByRole('link', { name: /Try something new today/ })
    const to = link.getAttribute('href')!
    expect(availableIn(to, 'en')).toBe(true)
    expect(PRACTICE.some((e) => e.to === to)).toBe(true)
  })

  it('leaves once every screen has been opened', () => {
    useVisited.setState({ seen: PRACTICE.map((e) => e.to) })
    const { container } = show()
    expect(container).toBeEmptyDOMElement()
  })

  it('remembers a visit only once', () => {
    useVisited.getState().visit('/roleplay')
    useVisited.getState().visit('/roleplay')
    expect(useVisited.getState().seen).toEqual(['/roleplay'])
  })
})
