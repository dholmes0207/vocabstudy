import { describe, expect, it } from 'vitest'
import { QUICK_WORDS, todayPlan } from './todayPlan'

const step = { id: 'en1-grammar', to: '/grammar' }

describe('todayPlan', () => {
  it('reviews first, while words are due', () => {
    expect(todayPlan({ due: 12, newLeft: 10, pathStep: step })).toEqual({
      kind: 'review',
      to: '/review',
      count: 12,
    })
  })

  it('then five new words, or what is left of today’s allowance', () => {
    expect(todayPlan({ due: 0, newLeft: 10, pathStep: step })).toMatchObject({
      kind: 'learn',
      count: QUICK_WORDS,
    })
    expect(todayPlan({ due: 0, newLeft: 2 })).toMatchObject({ kind: 'learn', count: 2 })
  })

  it('then a step of the level path', () => {
    expect(todayPlan({ due: 0, newLeft: 0, pathStep: step })).toEqual({
      kind: 'path',
      to: '/grammar',
      stepId: 'en1-grammar',
    })
  })

  it('and otherwise the day is done', () => {
    expect(todayPlan({ due: 0, newLeft: 0, pathStep: null })).toEqual({
      kind: 'done',
      to: '/practice',
    })
  })
})
