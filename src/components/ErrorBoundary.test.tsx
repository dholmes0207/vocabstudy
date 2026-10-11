/** @vitest-environment jsdom */
import { useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import ErrorBoundary from './ErrorBoundary'
import { useSettings } from '@/store/settingsStore'

// Without a boundary, one throw anywhere under <Routes> unmounts the whole tree
// and the learner is left staring at a blank white page with no way back.

function Boom({ explode = true }: { explode?: boolean }) {
  if (explode) throw new Error('nổ rồi')
  return <p>nội dung ổn</p>
}

let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  // React logs the caught error; keep the test output readable.
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  useSettings.setState({ uiLang: 'vi' })
})
afterEach(() => {
  // Vitest runs without globals, so Testing Library's automatic cleanup never
  // registers — unmount by hand or renders pile up across tests.
  cleanup()
  consoleError.mockRestore()
})

describe('ErrorBoundary', () => {
  it('renders its children while nothing is wrong', () => {
    render(
      <ErrorBoundary>
        <p>nội dung ổn</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('nội dung ổn')).toBeInTheDocument()
  })

  it('shows a Vietnamese fallback instead of a blank page when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/có lỗi/i)).toBeInTheDocument()
  })

  it('offers a way out — a retry control the learner can actually press', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument()
  })

  it('recovers when retry is pressed and the child no longer throws', async () => {
    function Flaky() {
      const [explode, setExplode] = useState(true)
      return (
        <>
          <button onClick={() => setExplode(false)}>sửa lỗi</button>
          <ErrorBoundary>
            <Boom explode={explode} />
          </ErrorBoundary>
        </>
      )
    }
    render(<Flaky />)
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'sửa lỗi' }))
    await userEvent.click(screen.getByRole('button', { name: /thử lại/i }))

    expect(screen.getByText('nội dung ổn')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('reports the error rather than swallowing it', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
  })
})

describe('ErrorBoundary in English', () => {
  it('speaks the interface language', () => {
    useSettings.setState({ uiLang: 'en' })
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
