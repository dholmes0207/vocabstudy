import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import {
  CHALLENGE_SIZE,
  challengeQuestions,
  challengeWords,
  currentStreak,
  recordChallenge,
} from './dailyChallenge'

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack

describe('the daily challenge', () => {
  it('gives everyone the same five words on a day, and other words the next day', () => {
    const a = challengeWords(en.words, 'en', 20000).map((w) => w.id)
    const b = challengeWords(en.words, 'en', 20000).map((w) => w.id)
    expect(a).toEqual(b)
    expect(new Set(a).size).toBe(CHALLENGE_SIZE)
    expect(challengeWords(en.words, 'en', 20001).map((w) => w.id)).not.toEqual(a)
    expect(challengeWords(en.words, 'zh', 20000).map((w) => w.id)).not.toEqual(a)
  })

  it('asks the day words in reading, listening and recall questions', () => {
    const qs = challengeQuestions(en.words, 'en', 20000)
    expect(qs.map((q) => q.mode)).toEqual(['en-to-vi', 'listen', 'vi-to-en', 'en-to-vi', 'listen'])
  })

  it('counts the streak of days in a row, and keeps the better score of a day', () => {
    let rec = recordChallenge(undefined, 10, 3, 5)
    expect(rec.streak).toBe(1)
    rec = recordChallenge(rec, 11, 4, 5)
    expect(rec.streak).toBe(2)
    rec = recordChallenge(rec, 11, 2, 5)
    expect(rec).toMatchObject({ streak: 2, correct: 4, best: 4 })
    expect(currentStreak(rec, 12)).toBe(2)
    expect(currentStreak(rec, 13)).toBe(0)
    expect(recordChallenge(rec, 14, 5, 5)).toMatchObject({ streak: 1, best: 5 })
  })
})
