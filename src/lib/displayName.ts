// The name shown in the account menu and on the Admin page. Shared by the
// browser and the /api/account Function so both accept exactly the same thing.

export const DISPLAY_NAME_MAX = 50

/**
 * A display name made safe to store — whitespace collapsed, control characters
 * dropped — or null when it is not text or too long. Empty is allowed: the app
 * then shows "Learner".
 */
export function cleanDisplayName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  // Control characters (newlines, tabs, NUL…) become spaces, then spaces collapse.
  const visible = [...raw]
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0
      return code < 0x20 || code === 0x7f ? ' ' : ch
    })
    .join('')
  const name = visible.replace(/\s+/g, ' ').trim()
  return [...name].length <= DISPLAY_NAME_MAX ? name : null
}
