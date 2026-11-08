// "Hôm nay thử gì mới?" (docs/design/discover.md): one practice screen a day
// for the home screen, picked from those this device has not opened yet, so
// the learner keeps finding new ways to practise. Pure.

/** The practice screen a path belongs to: "/games/blitz?x" → "/games/blitz". */
export const practiceRoot = (path: string): string => path.split(/[?#]/)[0].replace(/\/+$/, '')

/**
 * Today's suggestion among `paths` (in hub order): a different untried one each
 * day while any are left, otherwise null.
 */
export function pickDiscovery(
  paths: readonly string[],
  seen: readonly string[],
  day: number
): string | null {
  const fresh = paths.filter((p) => !seen.includes(p))
  if (!fresh.length) return null
  return fresh[((day % fresh.length) + fresh.length) % fresh.length]
}
