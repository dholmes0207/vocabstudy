import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Play, Square, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import type { DialogueSpeaker, ShuffledDialogue } from '@/lib/hskDialogues'
import type { VoiceGender } from '@/types'
import { prefetchAudio, pronounce, stopPronounce, textAudio } from '@/lib/audio'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// HSK 2–3 listening, the dialogues (lib/hskDialogues.ts): the woman and the
// man each say a line in a woman's and a man's voice, then the question is
// read and three options are printed; or, for HSK 2 part two, five pictures. The transcript, with its Vietnamese, shows once
// the question is answered.

const GAP_MS = 500
const VOICE: Record<DialogueSpeaker, VoiceGender> = { W: 'female', M: 'male' }

/** What is heard, in order: each line, then the question (if any) in the learner's voice. */
const clips = (d: ShuffledDialogue) => [
  ...d.lines.map((l) => ({ text: l.zh, gender: VOICE[l.speaker] as VoiceGender | undefined })),
  ...(d.q ? [{ text: d.q, gender: undefined }] : []),
]

export default function HskDialogueRound({
  title,
  dialogues,
  onAgain,
  onExit,
  onDone,
  onAnswer,
}: {
  title: string
  dialogues: ShuffledDialogue[]
  onAgain: () => void
  onExit: () => void
  onDone?: (correct: number, total: number) => void
  /** Each answer as it is given, for the weak-spot count. */
  onAnswer?: (correct: boolean) => void
}) {
  const t = useT()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'zh-CN')
  const rate = useSettings((s) => s.ttsRate)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const run = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const d = dialogues[idx]
  const who: Record<DialogueSpeaker, string> = { W: t('Nữ', 'Woman'), M: t('Nam', 'Man') }

  const stop = () => {
    run.current++
    window.clearTimeout(timer.current)
    stopPronounce()
    setPlaying(false)
  }
  const play = (dl: ShuffledDialogue) => {
    stop()
    const id = run.current
    const all = clips(dl)
    setPlaying(true)
    const step = (i: number) => {
      if (id !== run.current) return
      if (i >= all.length) return setPlaying(false)
      pronounce({
        audioSrc: textAudio(all[i].text, all[i].gender),
        text: all[i].text,
        lang,
        rate,
        onEnd: () => {
          if (id !== run.current) return
          timer.current = window.setTimeout(() => step(i + 1), GAP_MS)
        },
      })
    }
    step(0)
  }

  useEffect(
    () =>
      prefetchAudio(dialogues.flatMap((dl) => clips(dl).map((c) => textAudio(c.text, c.gender)))),
    [dialogues]
  )
  useEffect(() => {
    if (!d) return
    const tm = window.setTimeout(() => play(d), 300)
    return () => window.clearTimeout(tm)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per dialogue
  }, [idx])
  useEffect(() => stop, [])

  if (xp !== null || !d)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="🗣️"
          title={t('Xong một lượt!', 'Round complete!')}
          lines={[
            t(`Đúng ${correct}/${dialogues.length} câu`, `${correct} of ${dialogues.length} right`),
          ]}
          xp={xp ?? 0}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const answered = picked !== null
  const pick = (i: number) => {
    if (answered) return
    stop()
    setPicked(i)
    const ok = i === d.answer
    onAnswer?.(ok)
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
  }
  const next = () => {
    stop()
    if (idx + 1 < dialogues.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    if (onDone) return onDone(correct, dialogues.length)
    const earned = pinyinXp(correct, dialogues.length)
    addPlayXp(code, earned)
    setXp(earned)
  }

  return (
    <GameShell
      title={title}
      onExit={onExit}
      stats={
        <span>
          {idx + 1}/{dialogues.length}
        </span>
      }
    >
      <div className="card space-y-4 p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {d.pictures
            ? t(
                'Nghe đoạn hội thoại, rồi chọn tranh đúng.',
                'Hear the dialogue, then pick its picture.'
              )
            : t(
                'Nghe đoạn hội thoại và câu hỏi, rồi chọn câu trả lời.',
                'Hear the dialogue and the question, then pick the answer.'
              )}
        </p>
        {playing ? (
          <button type="button" className="btn-secondary h-10 w-full text-sm" onClick={stop}>
            <Square className="h-4 w-4" /> {t('Dừng', 'Stop')}
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary h-10 w-full text-sm"
            onClick={() => play(d)}
          >
            <Play className="h-4 w-4" /> {t('Nghe', 'Listen')}
          </button>
        )}
        <div className={d.pictures ? 'grid grid-cols-5 gap-1.5' : 'grid gap-2'}>
          {d.options.map((o, i) => {
            const state = !answered
              ? 'idle'
              : i === d.answer
                ? 'right'
                : i === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={o}
                type="button"
                lang="zh"
                onClick={() => pick(i)}
                disabled={answered}
                className={`flex items-center rounded-xl border-2 py-3 font-medium transition ${
                  d.pictures ? 'justify-center px-1' : 'gap-2 px-3 text-left text-lg'
                } ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {d.pictures ? (
                  <span
                    className="text-3xl"
                    role="img"
                    aria-label={t(`Tranh ${'ABCDE'[i]}`, `Picture ${'ABCDE'[i]}`)}
                  >
                    {o}
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-bold text-slate-400">{'ABC'[i]}</span>
                    <span className="flex-1">{o}</span>
                  </>
                )}
                {!d.pictures && state === 'right' && (
                  <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                )}
                {!d.pictures && state === 'wrong' && (
                  <X className="h-5 w-5 shrink-0" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
        {answered && (
          <div
            className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"
            aria-live="polite"
          >
            <p
              className={`font-semibold ${picked === d.answer ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {picked === d.answer ? t('Đúng rồi!', 'Right!') : t('Chưa đúng.', 'Not quite.')}
            </p>
            {d.lines.map((l, i) => (
              <p key={i}>
                <b className="text-slate-500 dark:text-slate-400">{who[l.speaker]}:</b>{' '}
                <span lang="zh">{l.zh}</span>
                <span className="block text-slate-500 dark:text-slate-400">{l.vi}</span>
              </p>
            ))}
            {d.q && (
              <p>
                <b className="text-slate-500 dark:text-slate-400">{t('Hỏi', 'Question')}:</b>{' '}
                <span lang="zh">{d.q}</span>
                <span className="block text-slate-500 dark:text-slate-400">{d.qVi}</span>
              </p>
            )}
            {d.why && <p className="text-slate-600 dark:text-slate-300">💡 {d.why}</p>}
          </div>
        )}
      </div>
      {answered && (
        <div className="session-actions mt-4">
          <button className="btn-primary h-12 w-full" onClick={next} autoFocus>
            {idx + 1 < dialogues.length
              ? t('Câu tiếp theo', 'Next')
              : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </GameShell>
  )
}
