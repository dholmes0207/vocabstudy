import { useCallback, useEffect, useState } from 'react'
import { Check, LogOut, X } from 'lucide-react'
import type { Word } from '@/types'
import Flashcard from './Flashcard'
import { useSettings } from '@/store/settingsStore'
import { useProvideContext } from '@/store/contextStore'
import { useImmersive } from '@/store/uiStore'
import { exampleAudio, prefetchAudio, pronounce, wordAudio } from '@/lib/audio'
import { useT } from '@/lib/i18n'

interface Props {
  words: Word[]
  ttsLang: string
  /** Called once per card with the learner's self-assessment. */
  onAnswer: (word: Word, correct: boolean) => void
  /** Rendered when all cards are done. */
  renderComplete: (correct: number, total: number) => React.ReactNode
  /** Optional "end early" handler. Answers already given are kept (recorded per card). */
  onExit?: () => void
}

export default function FlashcardSession({
  words,
  ttsLang,
  onAnswer,
  renderComplete,
  onExit,
}: Props) {
  useImmersive()
  const autoSpeak = useSettings((s) => s.autoSpeak)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const t = useT()
  const done = index >= words.length
  const current = words[index]

  // Let the floating AI assistant know which word is on screen.
  useProvideContext(
    current ? `Đang học từ "${current.word}"` : 'Đang học từ vựng',
    current
      ? {
          word: current.word,
          meaning: current.meaning,
          ipa: current.ipa,
          pos: current.pos,
          exampleEn: current.exampleEn,
        }
      : undefined
  )

  // Auto-pronounce each new word when it appears (if enabled).
  useEffect(() => {
    if (!done && autoSpeak && current)
      pronounce({
        audioSrc: wordAudio(current.id),
        text: current.word,
        lang: ttsLang,
        rate: useSettings.getState().ttsRate,
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done])

  // Pull the upcoming clips into cache while the learner is still reading this
  // card, so the speaker button responds instantly on the next one.
  useEffect(() => {
    const upcoming = words.slice(index, index + 3)
    prefetchAudio(upcoming.flatMap((w) => [wordAudio(w.id), exampleAudio(w.id, w.exampleEn)]))
  }, [words, index])

  const answer = useCallback(
    (isCorrect: boolean) => {
      if (done || !current) return
      onAnswer(current, isCorrect)
      if (isCorrect) setCorrect((c) => c + 1)
      setFlipped(false)
      setIndex((i) => i + 1)
    },
    [current, done, onAnswer]
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
        {onExit && (
          <button
            onClick={onExit}
            className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500"
            aria-label={t('Kết thúc phiên học', 'End session')}
            title={t('Kết thúc phiên (tiến độ đã lưu)', 'End session (progress is saved)')}
          >
            <LogOut className="h-4 w-4" /> {t('Thoát', 'Exit')}
          </button>
        )}
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

      <Flashcard
        word={current}
        ttsLang={ttsLang}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      {/* Rating */}
      <div className="session-actions min-h-[3.5rem]">
        {flipped ? (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <button
              onClick={() => answer(false)}
              className="btn h-14 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
            >
              <X className="h-5 w-5" /> {t('Chưa nhớ', "Didn't know")}
              <kbd className="ml-1 hidden rounded bg-black/10 px-1.5 text-xs sm:inline">1</kbd>
            </button>
            <button
              onClick={() => answer(true)}
              className="btn h-14 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
            >
              <Check className="h-5 w-5" /> {t('Đã nhớ', 'Knew it')}
              <kbd className="ml-1 hidden rounded bg-black/10 px-1.5 text-xs sm:inline">2</kbd>
            </button>
          </div>
        ) : (
          <button onClick={() => setFlipped(true)} className="btn-primary h-14 w-full">
            {t('Lật thẻ xem nghĩa', 'Flip to see the meaning')}
            <kbd className="ml-1 hidden rounded bg-white/20 px-1.5 text-xs sm:inline">Space</kbd>
          </button>
        )}
      </div>
    </div>
  )
}
