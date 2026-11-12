// Anonymous usage signal (docs/design/usage-metrics.md). On each day a device
// is used for learning, the app sends one small signal to its own server: a
// random device id, the day, the language pack, rough counts and three flags.
// No IP address, email, account id or learning content is ever stored.
//
// The pure parts (bucketing, the payload, the shape check, when to send) are
// shared by the browser and the Pages Function so both apply the same rules.

/** Language packs a signal may name. */
export const PING_PACKS = ['en', 'zh', 'ko'] as const
export type PingPack = (typeof PING_PACKS)[number]

/**
 * Lower edges of the count buckets. A count is sent as the index of the last
 * edge it reaches, so exact numbers never leave the device.
 */
export const ANSWER_EDGES = [0, 1, 10, 30, 100] as const
export const NEW_WORD_EDGES = [0, 1, 5, 10, 20] as const

/** Where the random device id lives. Outside the `vocab.` prefix on purpose:
 * it must not travel inside a backup file (src/lib/backup.ts) to another device. */
export const DEVICE_KEY = 'vs-device-id'

export interface UsagePing {
  /** Random id made on this device; not tied to an account. */
  device: string
  /** Local calendar day, as an epoch day (src/lib/date.ts). */
  day: number
  pack: PingPack
  /** Bucket index of the answers given today (ANSWER_EDGES). */
  answers: number
  /** Bucket index of the new words learned today (NEW_WORD_EDGES). */
  newWords: number
  /** The device has finished its first group of five words, ever. */
  firstLesson: boolean
  signedIn: boolean
  /** Running as an installed app (standalone display). */
  installed: boolean
}

export interface PingInput {
  device: string
  day: number
  pack: string
  answers: number
  newWords: number
  firstLesson: boolean
  signedIn: boolean
  installed: boolean
}

/** Index of the last edge `n` reaches; negative or unknown counts are 0. */
export function bucket(n: number, edges: readonly number[]): number {
  if (!Number.isFinite(n) || n <= 0) return 0
  let i = 0
  for (let k = 0; k < edges.length; k++) if (n >= edges[k]) i = k
  return i
}

const DEVICE_RE = /^[A-Za-z0-9_-]{16,40}$/

/** A new random device id: 22 URL-safe characters (128 bits). */
export function newDeviceId(random: (bytes: Uint8Array) => Uint8Array): string {
  const bytes = random(new Uint8Array(16))
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** The signal for today, or null when there is nothing worth sending. */
export function buildPing(input: PingInput): UsagePing | null {
  if (!DEVICE_RE.test(input.device)) return null
  if (!(PING_PACKS as readonly string[]).includes(input.pack)) return null
  const answers = bucket(input.answers, ANSWER_EDGES)
  const newWords = bucket(input.newWords, NEW_WORD_EDGES)
  // A day counts as "used for learning" only once something was answered or learned.
  if (answers === 0 && newWords === 0) return null
  return {
    device: input.device,
    day: Math.floor(input.day),
    pack: input.pack as PingPack,
    answers,
    newWords,
    firstLesson: !!input.firstLesson,
    signedIn: !!input.signedIn,
    installed: !!input.installed,
  }
}

/** A short key for a signal: the same key means the server already has it. */
export function pingKey(p: UsagePing): string {
  return [p.day, p.pack, p.answers, p.newWords, +p.firstLesson, +p.signedIn, +p.installed].join(':')
}

/**
 * Send only when the signal says more than the last one sent: a new day, or
 * higher buckets or a newly set flag on the same day. The server keeps the
 * highest values per device and day, so a resend never lowers anything.
 */
export function shouldSend(p: UsagePing, lastKey: string | null): boolean {
  return pingKey(p) !== lastKey
}

/**
 * The learner said no, or the browser asks sites not to share data
 * (Global Privacy Control): nothing is sent.
 */
export function pingAllowed(enabled: boolean, globalPrivacyControl: boolean | undefined): boolean {
  return enabled && globalPrivacyControl !== true
}

const isFlag = (v: unknown): v is boolean => typeof v === 'boolean'
const isIndex = (v: unknown, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max

/**
 * The server's shape check: a well-formed signal for a day close to the
 * server's own (time zones put a learner up to a day either side), or null.
 */
export function sanitizePing(raw: unknown, serverDay: number): UsagePing | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r.device !== 'string' || !DEVICE_RE.test(r.device)) return null
  if (typeof r.day !== 'number' || !Number.isInteger(r.day)) return null
  if (Math.abs(r.day - serverDay) > 1) return null
  if (typeof r.pack !== 'string' || !(PING_PACKS as readonly string[]).includes(r.pack)) return null
  if (!isIndex(r.answers, ANSWER_EDGES.length - 1)) return null
  if (!isIndex(r.newWords, NEW_WORD_EDGES.length - 1)) return null
  if (!isFlag(r.firstLesson) || !isFlag(r.signedIn) || !isFlag(r.installed)) return null
  if (r.answers === 0 && r.newWords === 0) return null
  return {
    device: r.device,
    day: r.day,
    pack: r.pack as PingPack,
    answers: r.answers,
    newWords: r.newWords,
    firstLesson: r.firstLesson,
    signedIn: r.signedIn,
    installed: r.installed,
  }
}
