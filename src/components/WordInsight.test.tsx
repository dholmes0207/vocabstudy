/** @vitest-environment jsdom */
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import WordInsight from './WordInsight'
import { readFileSync } from 'node:fs'
import { useSettings } from '@/store/settingsStore'
import { useData } from '@/store/dataStore'
import type { LanguagePack, Word } from '@/types'
import { splitPack } from '@/lib/packDetails'

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

const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

describe('Hán Việt on a word card', () => {
  it('shows the HSK 1 badge and the words sharing each character', () => {
    const zh = pack('zh')
    useSettings.setState({ currentLang: 'zh' })
    useData.setState({ pack: zh })
    render(<WordInsight word={zh.words.find((w) => w.word === '学生')!} ttsLang="zh-CN" />)
    expect(screen.getByText('HSK 1')).toBeInTheDocument()
    expect(screen.getByText('Cùng chữ Hán Việt')).toBeInTheDocument()
    for (const w of ['学校', '学习', '同学', '医生', '先生'])
      expect(screen.getByText(w)).toBeInTheDocument()
  })

  it('works for Korean too, without an exam badge (TOPIK I has no list)', () => {
    const ko = pack('ko')
    useSettings.setState({ currentLang: 'ko' })
    useData.setState({ pack: ko })
    render(<WordInsight word={ko.words.find((w) => w.word === '학생')!} ttsLang="ko-KR" />)
    expect(screen.getByText('학교')).toBeInTheDocument()
    expect(screen.queryByText(/TOPIK/)).toBeNull()
  })

  it('adds nothing to an English word', () => {
    const en = pack('en')
    useSettings.setState({ currentLang: 'en' })
    useData.setState({ pack: en })
    render(<WordInsight word={en.words[0]} ttsLang="en-US" />)
    expect(screen.queryByText('Cùng chữ Hán Việt')).toBeNull()
  })
})

describe('details shipped apart from the pack', () => {
  it('shows collocations and the tip once the details file has arrived', () => {
    const { core, details } = splitPack(pack('en'))
    const the = core.words.find((w) => w.word === 'the')!
    useSettings.setState({ currentLang: 'en' })
    useData.setState({ pack: core, details: null })
    render(<WordInsight word={the} ttsLang="en-US" />)
    expect(screen.queryByText('in the morning')).toBeNull()

    act(() => useData.setState({ details }))
    expect(screen.getByText('in the morning')).toBeInTheDocument()
    expect(screen.getByText(details[the.id].tip!)).toBeInTheDocument()
  })
})
