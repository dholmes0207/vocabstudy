import { describe, expect, it } from 'vitest'
import { ENTERED_KEY } from './entry'
import { POLICY_SEEN_KEY, markPolicySeen, policyNoticeDue } from './policyNotice'

function store(init: Record<string, string> = {}) {
  const data = new Map(Object.entries(init))
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  }
}

describe('policyNoticeDue', () => {
  it('tells someone who used the app under an older policy', () => {
    expect(policyNoticeDue(store({ [ENTERED_KEY]: '1' }), '2026-10-14')).toBe(true)
    expect(
      policyNoticeDue(store({ [ENTERED_KEY]: '1', [POLICY_SEEN_KEY]: '2026-01-01' }), '2026-10-14')
    ).toBe(true)
  })

  it('stays quiet for a newcomer and after it has been seen', () => {
    expect(policyNoticeDue(store(), '2026-10-14')).toBe(false)
    const s = store({ [ENTERED_KEY]: '1' })
    markPolicySeen(s, '2026-10-14')
    expect(policyNoticeDue(s, '2026-10-14')).toBe(false)
  })

  it('comes back when the policy changes again', () => {
    const s = store({ [ENTERED_KEY]: '1' })
    markPolicySeen(s, '2026-10-14')
    expect(policyNoticeDue(s, '2027-03-01')).toBe(true)
  })
})
