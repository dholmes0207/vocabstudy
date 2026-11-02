import { useEffect, useMemo } from 'react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { prefetchAudio, pronounce, textAudio, wordAudio } from '@/lib/audio'

/**
 * The clip for a text on a pack's own page: a pack word has its recorded word
 * clip, anything else the clip recorded for that screen
 * (scripts/audio-texts/screens.json).
 */
function usePackClip(): (text: string) => string {
  const words = useData((s) => s.pack?.words)
  const ids = useMemo(() => new Map((words ?? []).map((w) => [w.word, w.id])), [words])
  return (text: string) => {
    const id = ids.get(text)
    return id === undefined ? textAudio(text) : wordAudio(id)
  }
}

/**
 * Read a text aloud on a pack's own page (Hangul, Pinyin, Hán Việt, numbers)
 * from its clip, and with the browser's voice only when none exists yet.
 */
export function usePackSay(): (text: string) => void {
  const clip = usePackClip()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'en-US')
  const rate = useSettings((s) => s.ttsRate)
  return (text: string) => pronounce({ audioSrc: clip(text), text, lang, rate })
}

/** Warm the clips usePackSay will play for these texts, so a tap sounds at once. */
export function usePrefetchPackSay(texts: readonly (string | null | undefined)[]): void {
  const clip = usePackClip()
  // Callers build the list inline; the joined texts are what has to change.
  const key = texts.filter(Boolean).join('\n')
  useEffect(() => {
    prefetchAudio(key ? key.split('\n').map(clip) : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the clip follows the pack, as the key does
  }, [key])
}
