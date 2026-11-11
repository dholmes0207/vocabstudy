import { useEffect, useRef, useState } from 'react'
import type { VoiceGender } from '@/types'
import { useSettings } from '@/store/settingsStore'
import { prefetchAudio, pronounce, stopPronounce, textAudio } from '@/lib/audio'

// Plays a recorded conversation line by line (IELTS listening): a woman's and
// a man's voice, a short gap between lines, the line playing exposed so the
// page can show "Playing 3/10". Stops on unmount.

const GAP_MS = 500
const VOICE: Record<'W' | 'M', VoiceGender> = { W: 'female', M: 'male' }

export interface SpokenLine {
  speaker: 'W' | 'M'
  text: string
}

export function useLinesPlayer(lines: readonly SpokenLine[]) {
  const rate = useSettings((s) => s.ttsRate)
  const [line, setLine] = useState<number | null>(null)
  const [plays, setPlays] = useState(0)
  const run = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  const stop = () => {
    run.current++
    window.clearTimeout(timer.current)
    stopPronounce()
    setLine(null)
  }
  const play = () => {
    stop()
    setPlays((n) => n + 1)
    const id = run.current
    const step = (i: number) => {
      if (id !== run.current) return
      if (i >= lines.length) return setLine(null)
      setLine(i)
      const { text, speaker } = lines[i]
      pronounce({
        audioSrc: textAudio(text, VOICE[speaker]),
        text,
        lang: 'en-US',
        rate,
        onEnd: () => {
          if (id !== run.current) return
          timer.current = window.setTimeout(() => step(i + 1), GAP_MS)
        },
      })
    }
    step(0)
  }
  useEffect(() => prefetchAudio(lines.map((l) => textAudio(l.text, VOICE[l.speaker]))), [lines])
  useEffect(
    () => () => {
      run.current++
      window.clearTimeout(timer.current)
      stopPronounce()
    },
    []
  )
  return { line, plays, play, stop }
}
