import { useState } from 'react'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { today } from '@/lib/date'
import { nextPing, postPing, readConsent, saveConsent, type Consent } from '@/lib/usageClient'

// The anonymous usage signal in the app (docs/design/usage-metrics.md): the
// learner's choice and the sender. Nothing leaves the device before a yes.
// The one-time question is components/UsageConsent.tsx; the switch is in Settings.

export function gpc(): boolean | undefined {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
}

function installed(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return (
    Boolean(nav.standalone) || Boolean(window.matchMedia?.('(display-mode: standalone)').matches)
  )
}

const random = (b: Uint8Array) => crypto.getRandomValues(b)

/** Send today's signal if the learner agreed and the day says something new. */
export function sendUsageToday(): void {
  try {
    const code = useSettings.getState().currentLang
    const lang = useStudy.getState().progress[code]
    const day = today()
    const ping = nextPing(
      localStorage,
      {
        day,
        pack: code,
        answers: lang?.stats.reviewsByDay[day] ?? 0,
        newWords: lang?.stats.newByDay[day] ?? 0,
        wordsStarted: lang ? Object.keys(lang.cards).length : 0,
        signedIn: useAuth.getState().user !== null,
        installed: installed(),
      },
      gpc(),
      random
    )
    if (ping) postPing(ping)
  } catch {
    // Blocked storage or no network: a missed signal only makes a day look quieter.
  }
}

export function useConsent(): [Consent, (yes: boolean) => void] {
  const [consent, setConsent] = useState<Consent>(() => {
    try {
      return readConsent(localStorage)
    } catch {
      return 'no'
    }
  })
  const choose = (yes: boolean) => {
    try {
      saveConsent(localStorage, yes)
    } catch {
      // Not remembered: asked again next time, nothing sent meanwhile.
    }
    setConsent(yes ? 'yes' : 'no')
    if (yes) sendUsageToday()
  }
  return [consent, choose]
}

/** The Settings switch: the same choice, changeable any time. */
export function useUsageConsent(): [boolean, (yes: boolean) => void, boolean] {
  const [consent, choose] = useConsent()
  return [consent === 'yes', choose, gpc() === true]
}
