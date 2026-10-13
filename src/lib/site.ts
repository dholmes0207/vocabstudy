/** Where learners reach a person — footer, legal pages, error messages. */
export const CONTACT_EMAIL = 'contact@vocastudy.app'

/** A ready-to-send feedback email (subject filled in, nothing else collected). */
export function feedbackHref(lang: 'vi' | 'en'): string {
  const subject = lang === 'vi' ? 'Góp ý cho VocaStudy' : 'VocaStudy feedback'
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}
