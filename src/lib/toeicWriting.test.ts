import { describe, expect, it } from 'vitest'
import {
  EMAIL_MIN_WORDS,
  EMAIL_TASKS,
  PICTURE_ROUND,
  PICTURE_TASKS,
  checkEmail,
  checkSentence,
  pictureRound,
} from './toeicWriting'
import { mulberry32 } from './sky'

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

describe('TOEIC Writing pictures', () => {
  it('gives every picture two words whose base form is listed, and a model that uses both', () => {
    expect(PICTURE_TASKS.length).toBeGreaterThanOrEqual(10)
    expect(new Set(PICTURE_TASKS.map((p) => p.id)).size).toBe(PICTURE_TASKS.length)
    for (const p of PICTURE_TASKS) {
      expect(p.forms[0], p.id).toContain(p.words[0])
      expect(p.forms[1], p.id).toContain(p.words[1])
      expect(checkSentence(p, p.model), p.id).toEqual({
        used: [true, true],
        shaped: true,
        long: true,
      })
    }
  })

  it('checks a sentence: both words in any form, one sentence, long enough', () => {
    const chef = PICTURE_TASKS.find((p) => p.id === 'chef')!
    expect(checkSentence(chef, 'The chefs prepared dinner for us.').used).toEqual([true, true])
    expect(checkSentence(chef, 'chef prepare').shaped).toBe(false)
    expect(checkSentence(chef, 'chef prepare').long).toBe(false)
    expect(checkSentence(chef, 'The chef cooks. He prepares food.').shaped).toBe(false)
    expect(pictureRound(mulberry32(2))).toHaveLength(PICTURE_ROUND)
  })
})
