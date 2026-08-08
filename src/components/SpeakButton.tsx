import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isTTSSupported } from '@/lib/tts'
import { pronounce } from '@/lib/audio'
import { useSettings } from '@/store/settingsStore'

interface Props {
  text: string
  lang: string
  /** Pre-rendered audio URL to prefer over Web Speech. */
  audioSrc?: string
  /** Visual size of the button. */
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const speechSupported = isTTSSupported()

const sizeMap = {
  sm: 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-10 w-10 [&_svg]:h-5 [&_svg]:w-5',
  lg: 'h-14 w-14 [&_svg]:h-7 [&_svg]:w-7',
}

export default function SpeakButton({ text, lang, audioSrc, size = 'md', label, className = '' }: Props) {
  const rate = useSettings((s) => s.ttsRate)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => setSpeaking(false), [text])

  // A pre-rendered file can play even when the browser has no speech synthesis.
  const canPlay = speechSupported || !!audioSrc

  if (!canPlay) {
    return (
      <span
        title="Trình duyệt không hỗ trợ phát âm"
        className={`inline-flex items-center justify-center rounded-full text-slate-300 dark:text-slate-600 ${sizeMap[size]} ${className}`}
      >
        <VolumeX />
      </span>
    )
  }

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation()
    pronounce({
      audioSrc,
      text,
      lang,
      rate,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    })
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={label ?? `Phát âm "${text}"`}
      className={`inline-flex items-center justify-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100 active:scale-90 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900 ${
        speaking ? 'animate-pulse ring-2 ring-brand-400' : ''
      } ${sizeMap[size]} ${className}`}
    >
      <Volume2 />
    </button>
  )
}
