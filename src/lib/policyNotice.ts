import { hasUsedApp } from './entry'
import { POLICY_VERSION } from './site'

// "We updated our privacy policy and terms" — the in-app notice that the policy
// itself promises for important changes (docs/design/landing.md). Shown once
// per POLICY_VERSION, and only to people who used the app under an older one:
// a newcomer has just been shown the current version.

export const POLICY_SEEN_KEY = 'vocab.policy.seen'

/** Should this device be told that the policy changed? */
export function policyNoticeDue(
  storage: Pick<Storage, 'getItem'>,
  version: string = POLICY_VERSION
): boolean {
  try {
    if (storage.getItem(POLICY_SEEN_KEY) === version) return false
    return hasUsedApp(storage)
  } catch {
    return false
  }
}

export function markPolicySeen(
  storage: Pick<Storage, 'setItem'>,
  version: string = POLICY_VERSION
): void {
  try {
    storage.setItem(POLICY_SEEN_KEY, version)
  } catch {
    // private mode: the notice may show again next visit, which is harmless
  }
}
