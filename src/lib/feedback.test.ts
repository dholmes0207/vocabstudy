import { describe, expect, it } from 'vitest'
import { FEEDBACK_MAX, checkFeedback } from './feedback'

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
