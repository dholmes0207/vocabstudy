import { describe, expect, it } from 'vitest'
import { CONTACT_EMAIL, feedbackHref } from './site'

describe('feedbackHref', () => {
  it('opens an email to the team with the subject in the interface language', () => {
    expect(feedbackHref('en')).toBe(`mailto:${CONTACT_EMAIL}?subject=VocaStudy%20feedback`)
    expect(decodeURIComponent(feedbackHref('vi'))).toContain('Góp ý cho VocaStudy')
  })
})
