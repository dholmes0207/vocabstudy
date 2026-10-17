/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useLangParam } from './useLangParam'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'

const languages = [{ code: 'en' }, { code: 'ko' }, { code: 'zh' }]

function Probe() {
  useLangParam()
  const { search } = useLocation()
  return <p>search={search}</p>
}

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Probe />
    </MemoryRouter>
  )

beforeEach(() => {
  useSettings.setState({ currentLang: 'en' })
  useData.setState({ manifest: { languages } as never })
})
afterEach(cleanup)

describe('useLangParam', () => {
  it('opens the app on the language in the link, then drops the parameter', () => {
    renderAt('/home?lang=zh&tab=1')
    expect(useSettings.getState().currentLang).toBe('zh')
    expect(screen.getByText('search=?tab=1')).toBeInTheDocument()
  })

  it('ignores a language the app does not have', () => {
    renderAt('/home?lang=fr')
    expect(useSettings.getState().currentLang).toBe('en')
    expect(screen.getByText('search=')).toBeInTheDocument()
  })

  it('waits for the language list before deciding', () => {
    useData.setState({ manifest: null })
    renderAt('/home?lang=ko')
    expect(useSettings.getState().currentLang).toBe('en')
    expect(screen.getByText('search=?lang=ko')).toBeInTheDocument()
  })
})
