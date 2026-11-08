import { bankLoader, checker, text } from './practiceBank'

// "Nhập vai hội thoại" (docs/design/roleplay.md): everyday scenes (a café, a
// taxi, a job interview…) where the learner plays one side. The other person's
// lines are read aloud; the learner says their own and speech recognition
// checks it. Content in public/data/roleplay/<pack>.json.

export type Pair = [vi: string, en: string]

export interface RoleLine {
  who: 'them' | 'you'
  /** The voice that reads it: a woman's or a man's. */
  voice: 'W' | 'M'
  text: string
  vi: string
  /** How it reads (Chinese pinyin). */
  read?: string
}

export interface RoleScene {
  id: string
  emoji: string
  title: Pair
  setting: Pair
  /** Who the learner talks to. */
  them: Pair
  /** A label for scenes that train an exam, e.g. "TOEIC" for the workplace. */
  tag?: string
  lines: RoleLine[]
}

export interface RoleplayBank {
  version: string
  scenes: readonly RoleScene[]
}

const check = checker('Role-play')

export function validateRoleplay(raw: unknown): RoleplayBank {
  const bank = raw as Partial<RoleplayBank> | null
  check(!!bank && Array.isArray(bank.scenes) && bank.scenes.length > 0, '"scenes" is missing')
  const ids = new Set<string>()
  const pair = (v: unknown) => Array.isArray(v) && v.length === 2 && v.every(text)
  for (const s of bank!.scenes!) {
    check(text(s?.id) && !ids.has(s.id), `scene id "${s?.id}" is empty or repeated`)
    ids.add(s.id)
    check(
      text(s.emoji) && pair(s.title) && pair(s.setting) && pair(s.them),
      `"${s.id}" is incomplete`
    )
    check(s.tag === undefined || text(s.tag), `"${s.id}" has an empty tag`)
    check(
      Array.isArray(s.lines) &&
        s.lines.length >= 4 &&
        s.lines.every(
          (l) =>
            (l?.who === 'them' || l?.who === 'you') &&
            (l.voice === 'W' || l.voice === 'M') &&
            text(l.text) &&
            text(l.vi) &&
            (l.read === undefined || text(l.read))
        ),
      `"${s.id}" needs four lines, each with who, voice, text and meaning`
    )
    check(
      s.lines.filter((l) => l.who === 'you').length >= 2,
      `"${s.id}" needs at least two lines for the learner`
    )
  }
  return { version: bank!.version ?? '0', scenes: bank!.scenes! }
}

/** The packs with role-play scenes, and the voice their lines are read in. */
export const ROLEPLAY_PACKS = {
  en: { load: bankLoader('data/roleplay/en.json', validateRoleplay), speech: 'en-US' },
  zh: { load: bankLoader('data/roleplay/zh.json', validateRoleplay), speech: 'zh-CN' },
} as const

export type RoleplayPack = keyof typeof ROLEPLAY_PACKS

export const isRoleplayPack = (code: string): code is RoleplayPack => code in ROLEPLAY_PACKS

/** Stars for a scene from the learner's line scores (0–100 each): 3 at 85+, 2 at 60+, else 1. */
export function sceneStars(scores: readonly number[]): 1 | 2 | 3 {
  if (!scores.length) return 1
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return avg >= 85 ? 3 : avg >= 60 ? 2 : 1
}

/** XP for a finished scene: 4 per star. */
export const sceneXp = (stars: number): number => stars * 4
