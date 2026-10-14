/** Where learners reach a person — footer, legal pages, error messages. */
export const CONTACT_EMAIL = 'contact@vocastudy.app'

/**
 * Date of the current privacy policy and terms (ISO day). Bump it only for a
 * change people must hear about: it is shown on both pages, recorded with each
 * sign-up's consent, and a new value re-shows the in-app notice
 * (lib/policyNotice.ts). Wording fixes keep the old date.
 *
 * The privacy policy (section 9) promises more for one kind of change: if it
 * alters what personal data is collected or how it is processed, people must
 * confirm it in the app BEFORE it applies to them. The notice today only
 * informs — such a change needs it to ask for agreement (and to record it, as
 * sign-up does with consent_version) before shipping.
 */
export const POLICY_VERSION = '2026-10-14'

/** A ready-to-send feedback email (subject filled in, nothing else collected). */
export function feedbackHref(lang: 'vi' | 'en'): string {
  const subject = lang === 'vi' ? 'Góp ý cho VocaStudy' : 'VocaStudy feedback'
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}
