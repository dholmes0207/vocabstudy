import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack, Word } from '@/types'
import {
  familiesOf,
  foldVi,
  hanVietQuiz,
  hanVietTable,
  hanVietUnits,
  searchHanViet,
} from './hanVietFamily'

const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

const words = (code: string) => pack(code).words
const find = (code: string, w: string) => words(code).find((x) => x.word === w)!
const summary = (code: string, w: string) =>
  familiesOf(find(code, w), words(code)).map((f) => [f.char, f.hv, f.others.map((o) => o.word)])

describe('hanVietUnits', () => {
  it('pairs each character or syllable block with its Hán Việt syllable', () => {
    expect(hanVietUnits({ word: '学生', hanViet: 'học sinh' })).toEqual([
      { char: '学', hv: 'học' },
      { char: '生', hv: 'sinh' },
    ])
    expect(hanVietUnits({ word: '학교', hanViet: 'Học Hiệu' })).toEqual([
      { char: '학', hv: 'học' },
      { char: '교', hv: 'hiệu' },
    ])
  })

  it('gives up when the readings do not line up', () => {
    expect(hanVietUnits({ word: '一点儿', hanViet: 'nhất điểm' })).toBeNull()
    expect(hanVietUnits({ word: 'apple', hanViet: undefined })).toBeNull()
    expect(hanVietUnits({ word: '공부하다', hanViet: 'công phu' })).toBeNull()
  })
})

describe('familiesOf', () => {
  it('finds the Chinese words that share a character, read the same way', () => {
    expect(summary('zh', '学生')).toEqual([
      ['学', 'học', ['学校', '学习', '同学', '数学']],
      ['生', 'sinh', ['医生', '先生', '生病', '生日', '生气']],
    ])
  })

  it('works for Korean Sino words, each word listed once', () => {
    const fams = summary('ko', '생일')
    expect(fams.map((f) => f[0])).toEqual(['생', '일'])
    const ilWords = fams[1][2] as string[]
    expect(new Set(ilWords).size).toBe(ilWords.length)
    expect(ilWords).toContain('일요일')
  })

  it('returns nothing for a word without a family', () => {
    expect(familiesOf(find('en', 'apple'), words('en'))).toEqual([])
  })
})

describe('hanVietTable', () => {
  const zhWords = (JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as { words: Word[] })
    .words

  it('lists characters shared by at least two words, most-used first', () => {
    const table = hanVietTable(zhWords)
    expect(table.length).toBeGreaterThan(20)
    for (let i = 1; i < table.length; i++)
      expect(table[i - 1].words.length).toBeGreaterThanOrEqual(table[i].words.length)
    const hoc = table.find((e) => e.char === '学')!
    expect(hoc.hv).toBe('học')
    expect(hoc.words.map((w) => w.word)).toEqual(
      expect.arrayContaining(['学生', '学校', '学习', '同学'])
    )
  })

  it('finds an entry by character, by Hán Việt with or without marks, or by a word', () => {
    const table = hanVietTable(zhWords)
    expect(searchHanViet(table, '学').map((e) => e.char)).toContain('学')
    expect(searchHanViet(table, 'hoc').map((e) => e.char)).toContain('学')
    expect(searchHanViet(table, 'HỌC').map((e) => e.char)).toContain('学')
    expect(searchHanViet(table, '学校').map((e) => e.char)).toContain('学')
    expect(searchHanViet(table, '')).toHaveLength(table.length)
    expect(foldVi('Đông')).toBe('dong')
  })
})

describe('hanVietQuiz', () => {
  const zhWords = (JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as { words: Word[] })
    .words

  it('asks about words whose characters can be reasoned from other words', () => {
    const qs = hanVietQuiz(zhWords, 10)
    expect(qs).toHaveLength(10)
    for (const q of qs) {
      expect([...q.word.word].length).toBeGreaterThanOrEqual(2)
      expect(q.clues.length).toBeGreaterThan(0)
      for (const c of q.clues) {
        expect(c.via.id).not.toBe(q.word.id)
        expect(c.via.word).toContain(c.char)
      }
      expect(new Set(q.options).size).toBe(4)
      expect(q.options[q.answer]).toBe(q.word.meaning)
    }
  })
})
