import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { tokenize } from './games'
import { findWordInSentence } from './wordForms'

// The Chinese beta pack (docs/design/chinese.md), built by scripts/build_zh_pack.py.

interface W {
  id: number
  word: string
  ipa: string
  viRead: string
  posCategory: string
  meaning: string
  exampleEn: string
  exampleVi: string
  hanViet?: string
  exampleRead?: string
}
const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as {
  meta: { code: string; count: number; ttsLang: string; readingLabel?: string[] }
  words: W[]
}
const manifest = JSON.parse(readFileSync('public/data/index.json', 'utf8')) as {
  languages: { code: string; count: number; file: string; beta?: boolean }[]
}
const HAN = /\p{Script=Han}/u
const PINYIN = /^[a-zA-ZüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈŌÓǑÒ' ]+$/

/**
 * The HSK 1 vocabulary (2012 syllabus): 150 entries, two of which list a second
 * form — 哪（哪儿）and 那（那儿）— hence 152 headwords. The landing page says the
 * pack covers all of it, and this list is what keeps that true.
 */
const HSK1 = `爱 八 爸爸 杯子 北京 本 不 不客气 菜 茶 吃 出租车 打电话 大 的 点 电脑 电视 电影 东西
都 读 对不起 多 多少 儿子 二 饭店 飞机 分钟 高兴 个 工作 狗 汉语 好 号 喝 和 很 后面 回 会 几 家
叫 今天 九 开 看 看见 块 来 老师 了 冷 里 六 吗 妈妈 买 猫 没关系 没有 米饭 名字 明天 哪 哪儿 那
那儿 呢 能 你 年 女儿 朋友 漂亮 苹果 七 前面 钱 请 去 热 人 认识 三 商店 上 上午 少 谁 什么 十 时候
是 书 水 水果 睡觉 说 四 岁 他 她 太 天气 听 同学 喂 我 我们 五 喜欢 下 下午 下雨 先生 现在 想 小
小姐 些 写 谢谢 星期 学生 学习 学校 一 一点儿 衣服 医生 医院 椅子 有 月 再见 在 怎么 怎么样 这
这儿 中国 中午 住 桌子 字 昨天 坐 做`.split(/\s+/)

describe('Chinese pack', () => {
  it('covers the whole HSK 1 vocabulary', () => {
    expect(HSK1).toHaveLength(152)
    const heads = new Set(pack.words.map((w) => w.word))
    expect(HSK1.filter((w) => !heads.has(w))).toEqual([])
  })

  it('is listed in the manifest as a beta, with pinyin as its reading', () => {
    const entry = manifest.languages.find((l) => l.code === 'zh')
    expect(entry).toMatchObject({ file: 'zh.json', count: pack.words.length, beta: true })
    expect(pack.meta).toMatchObject({ code: 'zh', count: pack.words.length, ttsLang: 'zh-CN' })
    expect(pack.meta.readingLabel).toEqual(['pinyin', 'pinyin'])
  })

  it('numbers its words 1..n, each headword and each meaning once', () => {
    expect(pack.words.map((w) => w.id)).toEqual(pack.words.map((_, i) => i + 1))
    expect(new Set(pack.words.map((w) => w.word)).size).toBe(pack.words.length)
    expect(new Set(pack.words.map((w) => w.meaning)).size).toBe(pack.words.length)
  })

  it('gives every word Chinese characters, pinyin, a meaning and a translated example', () => {
    for (const w of pack.words) {
      expect(w.word, String(w.id)).toMatch(HAN)
      expect(w.viRead, w.word).toMatch(PINYIN)
      expect(w.ipa, w.word).toBe('')
      expect(w.meaning.trim() && w.exampleVi.trim(), w.word).toBeTruthy()
    }
  })

  it('marks word breaks in each example with invisible spaces, never visible ones', () => {
    for (const w of pack.words) {
      expect(w.exampleEn, w.word).toContain('\u200b')
      expect(w.exampleEn, w.word).not.toMatch(/ /)
      const n = tokenize(w.exampleEn).length
      expect(n, w.exampleEn).toBeGreaterThanOrEqual(2)
      expect(n, w.exampleEn).toBeLessThanOrEqual(10)
    }
  })

  it('finds each word in its own example, so the card can underline it', () => {
    // A break inside a word (between 喜 and 欢 of 喜欢, say) would hide it from the search.
    for (const w of pack.words)
      expect(findWordInSentence(w.word, w.exampleEn, w.posCategory as never), w.word).not.toBeNull()
  })

  it('gives most words their Hán Việt reading, one syllable per character', () => {
    const withHv = pack.words.filter((w) => w.hanViet)
    expect(withHv.length / pack.words.length).toBeGreaterThan(0.85)
    for (const w of withHv) {
      expect(w.hanViet!.split(' '), w.word).toHaveLength([...w.word].length)
      expect(w.hanViet, w.word).toMatch(/^[\p{L} ]+$/u)
      expect(w.hanViet, w.word).not.toMatch(HAN)
    }
  })

  it('gives every example a pinyin line that contains the word, read as the pack reads it', () => {
    const flat = (r: string) => r.toLowerCase().replace(/[^\p{L}]/gu, '')
    for (const w of pack.words) {
      expect(w.exampleRead, w.word).toBeTruthy()
      expect(w.exampleRead, w.word).toMatch(/^[“"]?[A-ZĀÁǍÀĒÉĚÈŌÓǑÒ]/u)
      expect(w.exampleRead, w.word).not.toMatch(HAN)
      // 一 and 不 change tone with the next character (一个 yí gè), so they are not compared.
      if (w.word !== '一' && w.word !== '不')
        expect(flat(w.exampleRead!), w.word).toContain(flat(w.viRead))
    }
  })
})
