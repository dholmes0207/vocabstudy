/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import Testimonials from './Testimonials'
import { parseTestimonials } from '@/lib/testimonials'
import { useSettings } from '@/store/settingsStore'

// Real, approved quotes only — and nothing at all until there are some.

beforeEach(() => useSettings.setState({ uiLang: 'en' }))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('parseTestimonials', () => {
  it('keeps well-formed, named quotes only', () => {
    expect(
      parseTestimonials({
        testimonials: [
          { name: 'Lan', message: 'Dễ học!', rating: 5 },
          { name: '', message: 'no name' },
          { message: 'missing name' },
        ],
      })
    ).toEqual([{ name: 'Lan', message: 'Dễ học!', rating: 5 }])
    expect(parseTestimonials(null)).toEqual([])
  })
})

describe('Testimonials', () => {
  it('shows real quotes when there are some', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ testimonials: [{ name: 'Lan', message: 'Dễ học!', rating: 5 }] }),
      }))
    )
    render(<Testimonials />)
    expect(await screen.findByText('Dễ học!')).toBeInTheDocument()
    expect(screen.getByLabelText('5 out of 5 stars')).toBeInTheDocument()
  })

  it('renders nothing when there are none or the request fails', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('offline')
    })
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<Testimonials />)
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
})
