import { describe, expect, it } from 'vitest'
import type { Word } from '@/types'
import { foldText, matchesQuery } from './search'

const word = (over: Partial<Word>): Word => ({
  id: 1,
  word: 'hello',
  ipa: '',
  viRead: 'he-LÂU',
  pos: 'expr.',
  posCategory: 'other',
  meaning: 'xin chào',
  exampleEn: '',
  exampleVi: '',
  ...over,
})

describe('foldText', () => {
  it('drops Vietnamese accents and pinyin tone marks', () => {
    expect(foldText('Xin chào')).toBe('xin chao')
    expect(foldText('Đường phố')).toBe('duong pho')
    expect(foldText('nǐ hǎo')).toBe('ni hao')
    expect(foldText("nǚ'ér")).toBe("nu'er")
  })
})

describe('matchesQuery', () => {
  const nihao = word({ word: '你好', viRead: 'nǐ hǎo' })

  it('finds a meaning typed without accents', () => {
    expect(matchesQuery(word({}), 'xin chao')).toBe(true)
    expect(matchesQuery(word({}), 'Xin Chào')).toBe(true)
  })

  it('finds a Chinese word by its pinyin, with or without tones and spaces', () => {
    expect(matchesQuery(nihao, 'nǐ hǎo')).toBe(true)
    expect(matchesQuery(nihao, 'ni hao')).toBe(true)
    expect(matchesQuery(nihao, 'nihao')).toBe(true)
    expect(matchesQuery(nihao, '你好')).toBe(true)
    expect(matchesQuery(nihao, 'xie')).toBe(false)
  })

  it('finds a Chinese word by its Hán Việt reading', () => {
    const friend = word({ word: '朋友', viRead: 'péngyou', meaning: 'bạn bè', hanViet: 'bằng hữu' })
    expect(matchesQuery(friend, 'bang huu')).toBe(true)
    expect(matchesQuery(friend, 'bằng hữu')).toBe(true)
  })

  it('does not search the respelling of an English word', () => {
    expect(matchesQuery(word({}), 'lau')).toBe(false)
    expect(matchesQuery(word({}), 'hel')).toBe(true)
  })
})
