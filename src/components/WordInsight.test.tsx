/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import WordInsight from './WordInsight'
import { useSettings } from '@/store/settingsStore'
import type { Word } from '@/types'

beforeEach(() => useSettings.setState({ uiLang: 'vi' }))
afterEach(cleanup)

const coffee: Word = {
  id: 49,
  word: '咖啡',
  ipa: '',
  viRead: 'kāfēi',
  pos: 'n.',
  posCategory: 'noun',
  meaning: 'cà phê',
  exampleEn: '我\u200b喜欢\u200b喝\u200b咖啡。',
  exampleVi: 'Tôi thích uống cà phê.',
  exampleRead: 'Wǒ xǐhuan hē kāfēi.',
}

describe('WordInsight', () => {
  it('shows the pinyin line under a Chinese example', () => {
    render(<WordInsight word={coffee} ttsLang="zh-CN" />)
    expect(screen.getByText('Wǒ xǐhuan hē kāfēi.')).toBeInTheDocument()
    expect(screen.getByText('Tôi thích uống cà phê.')).toBeInTheDocument()
  })

  it('shows no reading line for an example without one', () => {
    render(<WordInsight word={{ ...coffee, exampleRead: undefined }} ttsLang="zh-CN" />)
    expect(screen.queryByText('Wǒ xǐhuan hē kāfēi.')).toBeNull()
  })
})
