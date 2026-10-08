import { describe, expect, it } from 'vitest'
import { JOURNEY, journeyState } from './journey'

describe('journey', () => {
  it('has a mission for each day of the first week', () => {
    expect(JOURNEY).toHaveLength(7)
    for (const m of JOURNEY) expect(m.to.startsWith('/')).toBe(true)
  })

  it('stays hidden before the first study day', () => {
    expect(journeyState({}, 100)).toBeNull()
    expect(journeyState({ 99: 0 }, 100)).toBeNull()
  })

  it("points at today's mission until it is done", () => {
    expect(journeyState({ 98: 5, 99: 3 }, 100)).toEqual({
      done: 2,
      studiedToday: false,
      current: 2,
      finished: false,
    })
    expect(journeyState({ 98: 5, 99: 3, 100: 4 }, 100)).toMatchObject({
      done: 3,
      studiedToday: true,
      current: 2,
    })
  })

  it('celebrates on the day the week is finished, then steps aside', () => {
    const week = Object.fromEntries([94, 95, 96, 97, 98, 99, 100].map((d) => [d, 5]))
    expect(journeyState(week, 100)).toMatchObject({ finished: true, current: 6, done: 7 })
    expect(journeyState(week, 101)).toBeNull()
    expect(journeyState({ ...week, 101: 2 }, 101)).toBeNull()
  })
})
