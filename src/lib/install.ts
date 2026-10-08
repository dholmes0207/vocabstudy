// When to suggest installing the app to the home screen. An icon on the phone
// is the cheapest way back into a daily habit — but asking again right after a
// "no" is nagging, so a dismissal holds for a month.

export const INSTALL_DISMISS_KEY = 'vocab.installDismissedAt'
const MONTH_MS = 30 * 24 * 60 * 60 * 1000

export function shouldOfferInstall(opts: {
  /** Already running as an installed app. */
  standalone: boolean
  /** When the learner last said "not now" (ms epoch), if ever. */
  dismissedAt: number | null
  now: number
}): boolean {
  if (opts.standalone) return false
  if (opts.dismissedAt !== null && opts.now - opts.dismissedAt < MONTH_MS) return false
  return true
}

/** iPhone/iPad Safari has no install prompt; we show the manual steps instead. */
export function isIos(userAgent: string): boolean {
  return /iphone|ipad|ipod/i.test(userAgent)
}
