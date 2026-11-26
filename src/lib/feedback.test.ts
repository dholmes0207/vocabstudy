import { describe, expect, it } from 'vitest'
import { FEEDBACK_MAX, checkFeedback, contentReportPrefix, isContentReport } from './feedback'

describe('checkFeedback', () => {
  it('accepts a real message and tidies it', () => {
    const r = checkFeedback({
      message: '  App rất dễ dùng, mình học mỗi tối.  ',
      name: '  Lan   Anh ',
      rating: 5,
      allowQuote: true,
      page: '/home?x=1',
    })
    expect(r).toEqual({
      ok: true,
      value: {
        message: 'App rất dễ dùng, mình học mỗi tối.',
        name: 'Lan Anh',
        rating: 5,
        allowQuote: true,
        page: '/home',
      },
    })
  })

  it('asks for a little more, or a little less', () => {
    expect(checkFeedback({ message: 'hay' }).ok).toBe(false)
    expect(checkFeedback({ message: 'a'.repeat(FEEDBACK_MAX + 1) }).ok).toBe(false)
  })

  it('never quotes someone without a name, and ignores a bad rating', () => {
    const r = checkFeedback({ message: 'Mười ký tự trở lên', allowQuote: true, rating: 9 })
    expect(r.ok && r.value).toMatchObject({ allowQuote: false, rating: null, name: '' })
  })
})

describe('contentReportPrefix', () => {
  it('names the pack, the word and the screen, in one searchable line', () => {
    expect(contentReportPrefix({ pack: 'en', wordId: 42, word: 'improve', where: 'quiz' })).toBe(
      '[Lỗi nội dung] en #42 "improve" (quiz)'
    )
  })

  it('keeps a long or oddly spaced word on one short line, and passes the server check', () => {
    const line = contentReportPrefix({
      pack: 'zh',
      wordId: 7,
      word: '  一 \n 二 ' + 'x'.repeat(100),
      where: 'flashcard',
    })
    expect(line).not.toContain('\n')
    expect(line.length).toBeLessThan(120)
    expect(checkFeedback({ message: `${line}\nSai nghĩa` }).ok).toBe(true)
  })
})

describe('isContentReport', () => {
  it('tells content reports from ordinary feedback', () => {
    const line = contentReportPrefix({ pack: 'en', wordId: 1, word: 'a', where: 'quiz' })
    expect(isContentReport(`${line}\nwrong`)).toBe(true)
    expect(isContentReport('Great app! [Lỗi nội dung] is just quoted here')).toBe(false)
  })
})
