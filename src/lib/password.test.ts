import { describe, expect, it } from 'vitest'
import { passwordProblem } from './password'

const en = (_vi: string, english: string) => english

describe('passwordProblem', () => {
  it('asks for at least 6 characters', () => {
    expect(passwordProblem('12345', '12345', en)).toContain('at least 6')
  })

  it('asks for the two entries to match', () => {
    expect(passwordProblem('secret1', 'secret2', en)).toContain('do not match')
  })

  it('accepts a long enough, repeated password', () => {
    expect(passwordProblem('secret1', 'secret1', en)).toBeNull()
  })
})
