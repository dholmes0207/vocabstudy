// Screens whose content is written for one language pack only
// (docs/design/languages.md). Everything else — learn, review, games, the
// dictionary — works with any pack. The menus, the practice hub and the bottom
// bar all read this list, and the layout shows a friendly note instead of an
// error when a link to one of these screens is opened with another pack.

const ONLY: Record<string, readonly string[]> = {
  '/grammar': ['en', 'ko', 'zh'],
  '/topics': ['en', 'ko', 'zh'],
  '/reading': ['en', 'ko', 'zh'],
  '/phrases': ['en'],
  '/sounds': ['en'],
  '/hangul': ['ko'],
  '/pinyin': ['zh'],
  '/measure-words': ['zh'],
  // HSK 1 and TOPIK I (lib/exams.ts).
  '/exam': ['ko', 'zh'],
}

/** The screen a path belongs to: "/reading/lans-morning" → "/reading". */
export function screenOf(path: string): string | null {
  const root = '/' + (path.split('/')[1] ?? '')
  return root in ONLY ? root : null
}

/** The packs a screen is written for; null when it works with every pack. */
export function packsFor(path: string): readonly string[] | null {
  const screen = screenOf(path)
  return screen ? ONLY[screen] : null
}

export function availableIn(path: string, code: string): boolean {
  const packs = packsFor(path)
  return !packs || packs.includes(code)
}
