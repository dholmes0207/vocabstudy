import {
  DEVICE_KEY,
  buildPing,
  newDeviceId,
  pingAllowed,
  pingKey,
  shouldSend,
  type UsagePing,
} from './usagePing'

// The browser side of the anonymous usage signal (docs/design/usage-metrics.md,
// tasks 1.1 and 1.2 in docs/PLAN.md). Nothing is sent until the learner agrees:
// they are asked once, after a finished session, and can change their mind in
// Settings. A browser with Global Privacy Control is never asked and never sends.
// Every key lives outside the `vocab.` prefix, so a backup file does not carry
// the choice or the device id to another device.

/** 'yes' or 'no' once the learner has answered; missing = not asked yet. */
export const CONSENT_KEY = 'vs-usage-consent'
/** Key of the last signal sent (usagePing.pingKey), so a day is sent once. */
export const SENT_KEY = 'vs-usage-sent'

export interface KeyValue {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type Consent = 'yes' | 'no' | null

export function readConsent(kv: KeyValue): Consent {
  const v = kv.getItem(CONSENT_KEY)
  return v === 'yes' || v === 'no' ? v : null
}

export function saveConsent(kv: KeyValue, yes: boolean): void {
  kv.setItem(CONSENT_KEY, yes ? 'yes' : 'no')
}

/** Ask only someone who has not answered, and never a browser that opted out of tracking. */
export function shouldAsk(consent: Consent, gpc: boolean | undefined): boolean {
  return consent === null && gpc !== true
}

/** This device's random id, made the first time it is needed. */
export function deviceId(kv: KeyValue, random: (b: Uint8Array) => Uint8Array): string {
  const known = kv.getItem(DEVICE_KEY)
  if (known) return known
  const id = newDeviceId(random)
  kv.setItem(DEVICE_KEY, id)
  return id
}

/** What the app knows about today, read from the stores by the caller. */
export interface TodayFacts {
  day: number
  pack: string
  /** Answers given today and new words learned today (exact; bucketed before sending). */
  answers: number
  newWords: number
  /** Words this device has started in this pack, ever. */
  wordsStarted: number
  signedIn: boolean
  installed: boolean
}

/**
 * The signal to send now, or null: not agreed, Global Privacy Control on, no
 * learning today, or the same as the last one sent. Records it as sent.
 */
export function nextPing(
  kv: KeyValue,
  facts: TodayFacts,
  gpc: boolean | undefined,
  random: (b: Uint8Array) => Uint8Array
): UsagePing | null {
  if (!pingAllowed(readConsent(kv) === 'yes', gpc)) return null
  const ping = buildPing({
    device: deviceId(kv, random),
    day: facts.day,
    pack: facts.pack,
    answers: facts.answers,
    newWords: facts.newWords,
    firstLesson: facts.wordsStarted >= 5,
    signedIn: facts.signedIn,
    installed: facts.installed,
  })
  if (!ping || !shouldSend(ping, kv.getItem(SENT_KEY))) return null
  kv.setItem(SENT_KEY, pingKey(ping))
  return ping
}

/** Fire and forget; the server answers 204 whatever happens. */
export function postPing(ping: UsagePing): void {
  const body = JSON.stringify(ping)
  const queued = navigator.sendBeacon?.('/api/ping', new Blob([body], { type: 'application/json' }))
  if (!queued)
    void fetch('/api/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
}
