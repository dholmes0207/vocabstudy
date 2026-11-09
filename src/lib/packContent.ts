// Screens whose content is written for one language pack only
// (docs/design/languages.md). Everything else — learn, review, games, the
// dictionary — works with any pack. The menus, the practice hub and the bottom
// bar all read this list, and the layout shows a friendly note instead of an
// error when a link to one of these screens is opened with another pack.

const ONLY: Record<string, readonly string[]> = {
  '/grammar': ['en', 'ko', 'zh'],
  '/topics': ['en', 'ko', 'zh'],
  '/reading': ['en', 'ko', 'zh'],
  '/phrases': ['en', 'ko', 'zh'],
  '/sounds': ['en', 'ko', 'zh'],
  '/hangul': ['ko'],
  '/pinyin': ['zh'],
  '/measure-words': ['zh', 'ko'],
  // Chinese characters that sound or look alike, English words one
  // Vietnamese word covers (lib/confusables.ts).
  '/confusables': ['zh', 'en'],
  // Four-character idioms through their Hán Việt sounds (lib/chengyu.ts).
  '/chengyu': ['zh'],
  // Chinese internet words of Douyin and Weibo (lib/netSlang.ts).
  '/slang': ['zh'],
  // Chinese words whose Hán Việt reading misleads (lib/hanVietTraps.ts).
  '/han-viet-traps': ['zh'],
  '/numbers': ['zh', 'ko'],
  // Words whose units line up with a Hán Việt reading (lib/hanVietFamily).
  '/han-viet': ['zh', 'ko'],
  // Components of Chinese characters, by their Sino-Vietnamese names (lib/radicals.ts).
  '/radicals': ['zh'],
  // The levels to climb, words to certificates (lib/learningPath.ts).
  '/path': ['en', 'zh', 'ko'],
  // HSK 1–2, TOPIK I, Cambridge A2 Key and B1 Preliminary (lib/exams.ts).
  '/exam': ['en', 'ko', 'zh'],
  // Workplace English for the TOEIC Listening & Reading test (lib/toeic.ts).
  '/toeic': ['en'],
  // Three tasks of the TOEIC Speaking test (lib/toeicSpeaking.ts).
  '/toeic-speaking': ['en'],
  // Academic reading and the other IELTS skills (lib/ielts.ts).
  '/ielts': ['en'],
  // English and Chinese sentence shapes as coloured role blocks (lib/patterns.ts).
  '/patterns': ['en', 'zh'],
  // English phrasal verbs by their particle (lib/phrasalVerbs.ts).
  '/phrasal-verbs': ['en'],
  // Everyday English idioms with their Vietnamese twins (lib/idiomsEn.ts).
  '/idioms': ['en'],
  // Everyday scenes where the learner plays one side, out loud (lib/roleplay.ts).
  '/roleplay': ['en', 'zh'],
  // HSK 1–3 question types from the Chinese pack's examples (lib/hskPractice.ts).
  '/hsk': ['zh'],
  // The HSKK Elementary speaking test (lib/hskk.ts).
  '/hskk': ['zh'],
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
