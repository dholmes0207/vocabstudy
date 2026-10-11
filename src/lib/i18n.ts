import { useCallback } from 'react'
import { useSettings } from '@/store/settingsStore'
import type { UiLang } from '@/types'

// Two-language interface (docs/design/i18n.md). Strings live next to the code
// that shows them as a Vietnamese/English pair — `t('Cài đặt', 'Settings')` —
// so a screen reads naturally in both and nothing hides behind opaque keys.
// English is the default; the learner can switch from the header or Settings.
// Word meanings and examples are learning content and stay Vietnamese.

export type { UiLang }

/** Pick one of a pair for a given language (pure — for libs and tests). */
export function pick(lang: UiLang, vi: string, en: string): string {
  return lang === 'vi' ? vi : en
}

/** The pair for the current interface language, outside React (handlers, libs). */
export function tx(vi: string, en: string): string {
  return pick(useSettings.getState().uiLang, vi, en)
}

/** `t(vi, en)` for components; re-renders when the language changes. */
export function useT(): (vi: string, en: string) => string {
  const lang = useSettings((s) => s.uiLang)
  return useCallback((vi: string, en: string) => pick(lang, vi, en), [lang])
}

export function useUiLang(): UiLang {
  return useSettings((s) => s.uiLang)
}
