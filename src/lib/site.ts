/** Where learners reach a person — footer, legal pages, error messages. */
export const CONTACT_EMAIL = 'contact@vocastudy.app'

/**
 * Date of the current privacy policy and terms (ISO day). Bump it only for a
 * change people must hear about: it is shown on both pages, recorded with each
 * sign-up's consent, and a new value re-shows the in-app notice
 * (lib/policyNotice.ts). Wording fixes keep the old date.
 */
export const POLICY_VERSION = '2026-10-14'

/** A ready-to-send feedback email (subject filled in, nothing else collected). */
export function feedbackHref(lang: 'vi' | 'en'): string {
  const subject = lang === 'vi' ? 'Góp ý cho VocaStudy' : 'VocaStudy feedback'
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}
