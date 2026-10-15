/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import HanViet from './HanViet'
import { useSettings } from '@/store/settingsStore'
import type { Word } from '@/types'

afterEach(cleanup)

const word = (over: Partial<Word>): Word => ({
  id: 1,
  word: '学生',
  ipa: '',
  viRead: 'xuésheng',
  pos: 'n.',
  posCategory: 'noun',
  meaning: 'học sinh',
  exampleEn: '',
  exampleVi: '',
  ...over,
})

describe('HanViet', () => {
  it('shows the Sino-Vietnamese reading when the word has one', () => {
    useSettings.setState({ uiLang: 'vi' })
    render(<HanViet word={word({ hanViet: 'học sinh' })} />)
    expect(screen.getByText('học sinh')).toBeInTheDocument()
    expect(screen.getByText(/Hán Việt/)).toBeInTheDocument()
  })

  it('renders nothing for other words', () => {
    const { container } = render(<HanViet word={word({})} />)
    expect(container).toBeEmptyDOMElement()
  })
})
