/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import SkyBackdrop from './SkyBackdrop'
import { useSettings } from '@/store/settingsStore'
import { useUi } from '@/store/uiStore'

// The sky is decoration: it must stay out of the accessibility tree, switch
// off completely when the learner says so, and calm down during a session.

beforeAll(() => {
  // jsdom has no canvas; the renderer then simply does nothing.
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext
})

afterEach(() => {
  cleanup()
  useSettings.setState({ skyEffects: 'auto', snow: true, cursorTrail: true })
  useUi.setState({ immersiveCount: 0 })
})

describe('SkyBackdrop', () => {
  it('is hidden from screen readers and draws behind and above the page', () => {
    const { container } = render(<SkyBackdrop />)
    const sky = container.querySelector('.sky')
    expect(sky).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.sky-canvas')).toBeInTheDocument()
    expect(container.querySelector('.sky-fx')).toHaveAttribute('aria-hidden', 'true')
  })

  it('"off" keeps only the still gradient — no canvas, no animation loop', () => {
    useSettings.setState({ skyEffects: 'off' })
    const { container } = render(<SkyBackdrop />)
    expect(container.querySelector('.sky')).toBeInTheDocument()
    expect(container.querySelector('canvas')).toBeNull()
  })

  it('no sparkle layer when the pointer trail is off', () => {
    useSettings.setState({ cursorTrail: false })
    const { container } = render(<SkyBackdrop />)
    expect(container.querySelector('.sky-canvas')).toBeInTheDocument()
    expect(container.querySelector('.sky-fx')).toBeNull()
  })

  it('goes calm while a study session is on screen', () => {
    useUi.setState({ immersiveCount: 1 })
    const { container } = render(<SkyBackdrop />)
    expect(container.querySelector('.sky')).toHaveClass('sky--calm')
  })
})
