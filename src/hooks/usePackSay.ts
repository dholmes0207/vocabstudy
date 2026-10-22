import { useMemo } from 'react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { pronounce, textAudio, wordAudio } from '@/lib/audio'

/**
 * Read a text aloud on a pack's own page (Hangul, Pinyin, Hán Việt, numbers):
 * a pack word plays its recorded word clip, anything else the clip recorded
 * for that screen (scripts/audio-texts/screens.json), and the browser's voice
 * only when neither exists yet.
 */
export function usePackSay(): (text: string) => void {
  const words = useData((s) => s.pack?.words)
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'en-US')
  const rate = useSettings((s) => s.ttsRate)
  const ids = useMemo(() => new Map((words ?? []).map((w) => [w.word, w.id])), [words])
  return (text: string) => {
    const id = ids.get(text)
    pronounce({ audioSrc: id === undefined ? textAudio(text) : wordAudio(id), text, lang, rate })
  }
}
