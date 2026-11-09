/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { EMAIL_TASKS } from '@/lib/toeicWriting'

vi.mock('@/lib/confetti', () => ({ celebrate: () => {} }))
const { default: ToeicWriting } = await import('./ToeicWriting')

beforeEach(() => {
  useSettings.setState({ uiLang: 'en', currentLang: 'en', soundEnabled: false })
  useStudy.setState({ progress: {} })
  useActivity.setState({ counts: {} })
})
afterEach(cleanup)

const renderPage = () =>
  render(
    <MemoryRouter>
      <ToeicWriting />
    </MemoryRouter>
  )

describe('TOEIC Writing email', () => {
  it('ticks the checklist as the reply grows, then shows the model', () => {
    renderPage()
    const task = EMAIL_TASKS[0]
    fireEvent.click(screen.getAllByRole('button', { name: /Write a reply/ })[0])
    expect(screen.getByText(/In your email, ask TWO questions/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '50 more words to go' })).toBeDisabled()
    expect(screen.queryByText(/Model reply/)).toBeNull()
    fireEvent.change(screen.getByLabelText('Your reply'), { target: { value: task.model } })
    expect(screen.getByText(/Opens with a greeting/).closest('li')).toHaveClass('bg-emerald-50')
    expect(screen.getByText(/Asks at least 2 questions/).closest('li')).toHaveClass('bg-emerald-50')
    fireEvent.click(screen.getByRole('button', { name: 'Send the reply' }))
    expect(screen.getByRole('status')).toHaveTextContent('Nicely done!')
    expect(screen.getByText(/Model reply/)).toBeInTheDocument()
    expect(useActivity.getState().counts.en?.['toeic-writing']).toBe(1)
    expect(useStudy.getState().progress.en?.stats.xp).toBe(10)
  })

  it('shows the model on request, and is for the English pack only', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /Write a reply/ })[1])
    fireEvent.click(screen.getByRole('button', { name: /See the model reply/ }))
    expect(screen.getByText(/Model reply/)).toBeInTheDocument()
    cleanup()
    useSettings.setState({ currentLang: 'zh' })
    renderPage()
    expect(screen.queryByRole('button', { name: /Write a reply/ })).toBeNull()
  })
})
