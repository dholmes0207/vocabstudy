import { describe, expect, it } from 'vitest'
import { dictationScore } from './dictation'
import {
  acceptsPinyin,
  diffPinyin,
  isPinyinAnswer,
  matchesPinyin,
  plainPinyin,
} from './pinyinInput'

const READ = 'Lǐ xiǎojiě, nǐ hǎo!'
const status = (read: string, typed: string) =>
  diffPinyin(read, typed).map((p) => `${p.status}:${p.text}`)

describe('plainPinyin', () => {
  it('drops tones, numbers and spacing; ü and v read as u', () => {
    expect(plainPinyin('Nǐ hǎo')).toBe('nihao')
    expect(plainPinyin('ni3 hao3')).toBe('nihao')
    expect(plainPinyin('lǜ')).toBe(plainPinyin('lv'))
    expect(plainPinyin("Xī'ān")).toBe('xian')
  })
})

describe('isPinyinAnswer', () => {
  it('tells pinyin from characters', () => {
    expect(isPinyinAnswer('ni hao')).toBe(true)
    expect(isPinyinAnswer('nǐ hǎo')).toBe(true)
    expect(isPinyinAnswer('你好')).toBe(false)
    expect(isPinyinAnswer('  ')).toBe(false)
  })
  it('only for Chinese', () => {
    expect(acceptsPinyin('zh')).toBe(true)
    expect(acceptsPinyin('ko')).toBe(false)
  })
})

describe('diffPinyin', () => {
  it('matches word by word, with or without spaces and tones', () => {
    const all = ['ok:Lǐ', 'ok:xiǎojiě', 'ok:nǐ', 'ok:hǎo']
    expect(status(READ, 'li xiaojie ni hao')).toEqual(all)
    expect(status(READ, 'lixiaojienihao')).toEqual(all)
    expect(status(READ, 'Li3 xiao3jie3, ni3 hao3')).toEqual(all)
    expect(dictationScore(diffPinyin(READ, 'lixiaojienihao'))).toBe(1)
  })

  it('marks a missed word and the letters that fit nothing', () => {
    expect(status(READ, 'li ni hao')).toEqual(['ok:Lǐ', 'missing:xiǎojiě', 'ok:nǐ', 'ok:hǎo'])
    expect(status(READ, 'li xiaojia ni hao')).toEqual([
      'ok:Lǐ',
      'extra:xiaojia',
      'missing:xiǎojiě',
      'ok:nǐ',
      'ok:hǎo',
    ])
  })

  it('scores nothing typed as nothing heard', () => {
    expect(dictationScore(diffPinyin(READ, ''))).toBe(0)
  })
})

describe('matchesPinyin', () => {
  it('accepts the word in plain letters', () => {
    expect(matchesPinyin('xiexie', 'xièxie')).toBe(true)
    expect(matchesPinyin('xie xie', 'xièxie')).toBe(true)
    expect(matchesPinyin('bu keqi', 'bú kèqi')).toBe(true)
    expect(matchesPinyin('xie', 'xièxie')).toBe(false)
    expect(matchesPinyin('', 'xièxie')).toBe(false)
  })
})
