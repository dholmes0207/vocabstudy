/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { LanguagePack } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useNoTypingStore } from '@/store/noTypingStore'

// Dictation for someone with no pinyin keyboard yet (docs/design/typing-help.md):
// the sentence is built from tiles instead of typed.

vi.mock('@/lib/audio', () => ({
  pronounce: () => {},
  stopPronounce: () => {},
  exampleAudio: () => '',
}))

const { DictationRound } = await import('./Dictation')

const pack = { meta: { ttsLang: 'zh-CN' }, words: [] } as unknown as LanguagePack
const items = [{ key: 'g1', text: '我是学生。', vi: 'Tôi là học sinh.', read: 'Wǒ shì xuésheng.' }]

beforeEach(() => {
  useSettings.setState({ uiLang: 'vi', currentLang: 'zh', soundEnabled: false })
  useData.setState({ pack, status: 'ready' })
  useStudy.setState({ progress: {} })
  useNoTypingStore.setState({ langs: {} })
})
afterEach(cleanup)

const tile = (text: string) =>
  screen.getAllByRole('button', { name: text }).find((b) => !b.hasAttribute('disabled'))!

describe('Dictation without typing', () => {
  it('switches from the text box to tiles, and scores the taps', () => {
    render(<DictationRound items={items} onExit={() => {}} />)
    expect(screen.getByRole('textbox', { name: 'Câu bạn nghe được' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Làm không cần gõ/ }))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    fireEvent.click(tile('是')) // wrong: 我 comes first
    for (const c of ['我', '是', '学', '生。']) fireEvent.click(tile(c))

    // One slip in four tiles still counts as caught.
    expect(screen.getByText(/Nghe rất tốt/)).toHaveTextContent('(88%)')
    expect(screen.getByText('Wǒ shì xuésheng.')).toBeInTheDocument()
  })

  it('keeps the text box for English', () => {
    useSettings.setState({ currentLang: 'en' })
    useNoTypingStore.setState({ langs: { en: true } })
    render(<DictationRound items={[{ ...items[0], text: 'I am a student.' }]} onExit={() => {}} />)
    expect(screen.getByRole('textbox', { name: 'Câu bạn nghe được' })).toBeInTheDocument()
  })
})
