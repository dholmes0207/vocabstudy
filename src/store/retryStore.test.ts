import { beforeEach, describe, expect, it } from 'vitest'
import { RETRY_MAX, useRetry } from './retryStore'

beforeEach(() => useRetry.setState({ part5: [] }))

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
})
