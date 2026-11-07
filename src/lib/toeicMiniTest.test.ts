import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { miniTestPlan, sectionOf } from './toeicMiniTest'
import { validateToeicBank } from './toeicBank'

const en = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as LanguagePack
const bank = validateToeicBank(JSON.parse(readFileSync('public/data/toeic/en.json', 'utf8')))

describe('TOEIC mini test plan', () => {
  it('always has 13 listening and 13 reading questions, whichever texts it picks', () => {
    for (let i = 0; i < 40; i++) {
      const steps = miniTestPlan(bank, en.words)
      const count = (section: string) =>
        steps
          .filter((s) => sectionOf(s.part) === section)
          .reduce((n, s) => n + s.questions.length, 0)
      expect(count('listening')).toBe(13)
      expect(count('reading')).toBe(13)
    }
  })
})
