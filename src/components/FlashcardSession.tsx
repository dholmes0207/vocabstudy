import { useCallback, useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { Word } from '@/types'
import Flashcard from './Flashcard'
import { useSettings } from '@/store/settingsStore'
import { useProvideContext } from '@/store/contextStore'
import { pronounce, wordAudio } from '@/lib/audio'

interface Props {
  words: Word[]
  ttsLang: string
  /** Called once per card with the learner's self-assessment. */
  onAnswer: (word: Word, correct: boolean) => void
  /** Rendered when all cards are done. */
  renderComplete: (correct: number, total: number) => React.ReactNode
}

export default function FlashcardSession({ words, ttsLang, onAnswer, renderComplete }: Props) {
  const autoSpeak = useSettings((s) => s.autoSpeak)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const done = index >= words.length
  const current = words[index]

  // Let the floating AI assistant know which word is on screen.
  useProvideContext(
    current ? `Đang học từ "${current.word}"` : 'Đang học từ vựng',
    current
      ? { word: current.word, meaning: current.meaning, ipa: current.ipa, pos: current.pos, exampleEn: current.exampleEn }
      : undefined,
  )

  // Auto-pronounce each new word when it appears (if enabled).
  useEffect(() => {
    if (!done && autoSpeak && current)
      pronounce({ audioSrc: wordAudio(current.id), text: current.word, lang: ttsLang, rate: useSettings.getState().ttsRate })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done])

  const answer = useCallback(
    (isCorrect: boolean) => {
      if (done || !current) return
      onAnswer(current, isCorrect)
      if (isCorrect) setCorrect((c) => c + 1)
      setFlipped(false)
      setIndex((i) => i + 1)
    },
    [current, done, onAnswer],
  )

  // Global keyboard shortcuts. We skip events whose target is an interactive
  // control so a focused button/input handles its own keys (no double-fire).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return
      const el = e.target as HTMLElement | null
      // Never hijack real typing.
      if (el && el.closest('input, textarea, select')) return
      if (e.code === 'Space') {
        // If a button/card is focused, let it handle Space natively (no double-fire).
        if (el && el.closest('button, a, [role="button"]')) return
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && (e.key === '1' || e.key.toLowerCase() === 'j')) {
        // Rating keys are inert on native controls, so they can't double-fire.
        answer(false)
      } else if (flipped && (e.key === '2' || e.key.toLowerCase() === 'k')) {
        answer(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped, done, answer])

  if (done) return <>{renderComplete(correct, words.length)}</>

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(index / words.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {index + 1}/{words.length}
        </span>
      </div>

      <Flashcard word={current} ttsLang={ttsLang} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      {/* Rating */}
      <div className="mt-6 min-h-[3.5rem]">
        {flipped ? (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <button onClick={() => answer(false)} className="btn h-14 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300">
              <X className="h-5 w-5" /> Chưa nhớ
              <kbd className="ml-1 hidden rounded bg-black/10 px-1.5 text-xs sm:inline">1</kbd>
            </button>
            <button onClick={() => answer(true)} className="btn h-14 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="h-5 w-5" /> Đã nhớ
              <kbd className="ml-1 hidden rounded bg-black/10 px-1.5 text-xs sm:inline">2</kbd>
            </button>
          </div>
        ) : (
          <button onClick={() => setFlipped(true)} className="btn-primary h-14 w-full">
            Lật thẻ xem nghĩa
            <kbd className="ml-1 hidden rounded bg-white/20 px-1.5 text-xs sm:inline">Space</kbd>
          </button>
        )}
      </div>
    </div>
  )
}
