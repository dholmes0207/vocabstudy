import { describe, expect, it } from 'vitest'
import { EMAIL_MIN_WORDS, EMAIL_TASKS, checkEmail } from './toeicWriting'

describe('TOEIC Writing emails', () => {
  it('gives every task a model reply that passes its own checklist', () => {
    expect(EMAIL_TASKS.length).toBeGreaterThanOrEqual(3)
    expect(new Set(EMAIL_TASKS.map((t) => t.id)).size).toBe(EMAIL_TASKS.length)
    for (const t of EMAIL_TASKS) {
      expect(t.directions, t.id).toMatch(/^Respond to the email/)
      const c = checkEmail(t.model)
      expect(c.greeting, t.id).toBe(true)
      expect(c.closing, t.id).toBe(true)
      expect(c.questions, t.id).toBeGreaterThanOrEqual(t.questions)
      expect(c.words, t.id).toBeGreaterThanOrEqual(EMAIL_MIN_WORDS)
    }
  })

  it('finds the greeting, the sign-off and the questions of a reply', () => {
    expect(checkEmail('Dear Ms. Lee,\nCan I come? Is it free?\nBest regards,\nAn')).toEqual({
      greeting: true,
      closing: true,
      questions: 2,
      words: 12,
    })
    expect(checkEmail('I want to come.')).toMatchObject({ greeting: false, closing: false })
  })
})
