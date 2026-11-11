import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { HSK_LEVELS } from './hskPractice'
import { validateHskBank } from './hskBank'
import { hskMiniPlan, type HskMiniStep } from './hskMiniTest'

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack
const bank = validateHskBank(JSON.parse(readFileSync('public/data/hsk/zh.json', 'utf8')))

const size = (s: HskMiniStep) => ('dialogues' in s ? s.dialogues : s.questions).length
const count = (steps: HskMiniStep[], section: string) =>
  steps.filter((s) => s.section === section).reduce((n, s) => n + size(s), 0)

describe('HSK mini test plan', () => {
  it.each(HSK_LEVELS)('%s: 10 questions per section, writing only for HSK 3', (level) => {
    for (let i = 0; i < 10; i++) {
      const steps = hskMiniPlan(level, zh.words, bank)
      expect(count(steps, 'listen')).toBe(10)
      expect(count(steps, 'read')).toBe(10)
      expect(count(steps, 'write')).toBe(level === 'hsk3' ? 10 : 0)
    }
  })

  it('opens HSK 1–2 with pictures and keeps the sections in the order of the test', () => {
    for (const level of HSK_LEVELS) {
      const sections = hskMiniPlan(level, zh.words, bank).map((s) => s.section)
      expect(sections).toEqual(
        [...sections].sort((a, b) => 'lrw'.indexOf(a[0]) - 'lrw'.indexOf(b[0]))
      )
    }
    const hsk2 = hskMiniPlan('hsk2', zh.words, bank)
    expect(hsk2.some((s) => s.kind === 'talk' && s.dialogues.every((d) => d.pictures))).toBe(true)
  })
})
