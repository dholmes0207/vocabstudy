import { beforeEach, describe, expect, it } from 'vitest'
import { RECENT_ATTEMPTS, useExam } from './examStore'

beforeEach(() => useExam.setState({ records: {} }))

describe('exam store', () => {
  it('keeps the best score and the latest attempts, oldest first', () => {
    const { record } = useExam.getState()
    record('toeic-mini', 12, 26, 1)
    record('toeic-mini', 9, 26, 2)
    const r = useExam.getState().records['toeic-mini']
    expect(r).toMatchObject({ best: 12, total: 26, day: 2, tries: 2 })
    expect(r.recent).toEqual([
      { day: 1, correct: 12, total: 26 },
      { day: 2, correct: 9, total: 26 },
    ])
  })

  it('keeps only the last few attempts, and reads a record saved before they were kept', () => {
    useExam.setState({ records: { hsk1: { best: 15, total: 20, day: 0, tries: 3 } } })
    for (let i = 1; i <= RECENT_ATTEMPTS + 2; i++) useExam.getState().record('hsk1', i, 20, i)
    const r = useExam.getState().records.hsk1
    expect(r.recent).toHaveLength(RECENT_ATTEMPTS)
    expect(r.recent![0].correct).toBe(3)
    expect(r.best).toBe(15)
    expect(r.tries).toBe(3 + RECENT_ATTEMPTS + 2)
  })
})
