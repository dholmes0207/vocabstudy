import { beforeEach, describe, expect, it } from 'vitest'
import { RETRY_MAX, useRetry } from './retryStore'

beforeEach(() => useRetry.setState({ part5: [], kinds: {}, hsk: {} }))

describe('retry store', () => {
  it('keeps a missed question once, and lets it go when answered right', () => {
    const { answer } = useRetry.getState()
    answer('A ___ B.', false)
    answer('C ___ D.', false)
    answer('A ___ B.', false)
    expect(useRetry.getState().part5).toEqual(['C ___ D.', 'A ___ B.'])
    answer('C ___ D.', true)
    expect(useRetry.getState().part5).toEqual(['A ___ B.'])
  })

  it('keeps only the latest misses', () => {
    for (let i = 0; i < RETRY_MAX + 5; i++) useRetry.getState().answer(`S${i} ___.`, false)
    const list = useRetry.getState().part5
    expect(list).toHaveLength(RETRY_MAX)
    expect(list[0]).toBe('S5 ___.')
  })

  it('counts Part 5 answers by kind across rounds', () => {
    const { tally } = useRetry.getState()
    tally('prep', true)
    tally('prep', false)
    tally('form', true)
    expect(useRetry.getState().kinds).toEqual({ prep: [1, 2], form: [1, 1] })
  })

  it('counts HSK answers by level and kind', () => {
    const { tallyHsk } = useRetry.getState()
    tallyHsk('hsk1', 'judge', true)
    tallyHsk('hsk1', 'judge', false)
    tallyHsk('hsk2', 'judge', true)
    expect(useRetry.getState().hsk).toEqual({ 'hsk1:judge': [1, 2], 'hsk2:judge': [1, 1] })
  })
})
