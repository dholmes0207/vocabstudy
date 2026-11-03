import { useEffect, useRef, useState } from 'react'
import { Play, Square } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import type { Speaker, TalkSet } from '@/lib/toeicTalks'
import type { ShuffledQuestion } from '@/lib/toeicReading'
import { prefetchAudio, pronounce, stopPronounce, textAudio } from '@/lib/audio'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'
import { QuestionList } from './ReadingRound'

// TOEIC Part 3 and Part 4 practice (docs/design/toeic.md): the conversation or
// talk is heard line by line while its three questions stay on screen, as on
// the test. The transcript shows once every question is answered.

const GAP_MS = 500

export default function TalkRound({
  set,
  questions,
  onAgain,
  onExit,
  onDone,
}: {
  set: TalkSet
  questions: ShuffledQuestion[]
  onAgain: () => void
  onExit: () => void
  /** Hand the score back (the mini test) instead of showing the round's result. */
  onDone?: (correct: number, total: number) => void
}) {
  const t = useT()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'en-US')
  const rate = useSettings((s) => s.ttsRate)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null))
  const [xp, setXp] = useState<number | null>(null)
  const [line, setLine] = useState<number | null>(null)
  const run = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const title =
    set.part === 3
      ? t('Part 3 · Hội thoại', 'Part 3 · Conversations')
      : t('Part 4 · Bài nói ngắn', 'Part 4 · Talks')
  const correct = questions.filter((qn, i) => picked[i] === qn.answer).length
  const done = picked.every((p) => p !== null)
  const who: Record<Speaker, string> = {
    W: t('Người nữ', 'Woman'),
    M: t('Người nam', 'Man'),
    N: t('Người nói', 'Speaker'),
  }

  const stop = () => {
    run.current++
    window.clearTimeout(timer.current)
    stopPronounce()
    setLine(null)
  }
  const play = () => {
    stop()
    const id = run.current
    const step = (i: number) => {
      if (id !== run.current) return
      if (i >= set.lines.length) return setLine(null)
      setLine(i)
      const { text } = set.lines[i]
      pronounce({
        audioSrc: textAudio(text),
        text,
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

  useEffect(() => prefetchAudio(set.lines.map((l) => textAudio(l.text))), [set])
  useEffect(() => stop, [])

  if (xp !== null)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="🎧"
          title={t('Xong một bài!', 'Set done!')}
          lines={[
            t(`Đúng ${correct}/${questions.length} câu`, `${correct} of ${questions.length} right`),
          ]}
          xp={xp}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const pick = (qi: number, i: number) => {
    if (picked[qi] !== null) return
    setPicked((p) => p.map((v, j) => (j === qi ? i : v)))
    if (soundOn) (i === questions[qi].answer ? playCorrect : playWrong)()
  }
  const finish = () => {
    stop()
    if (onDone) return onDone(correct, questions.length)
    const earned = pinyinXp(correct, questions.length)
    addPlayXp(code, earned)
    setXp(earned)
  }

  return (
    <GameShell
      title={title}
      onExit={onExit}
      stats={
        <span>
          {picked.filter((p) => p !== null).length}/{questions.length}
        </span>
      }
    >
      <div className="space-y-4">
        <section className="card space-y-3 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {set.part === 3
              ? t(
                  'Đọc trước 3 câu hỏi, rồi nghe đoạn hội thoại.',
                  'Read the three questions first, then hear the conversation.'
                )
              : t(
                  'Đọc trước 3 câu hỏi, rồi nghe bài nói.',
                  'Read the three questions first, then hear the talk.'
                )}
          </p>
          {line === null ? (
            <button type="button" className="btn-primary h-11 w-full" onClick={play}>
              <Play className="h-4 w-4" /> {t('Nghe', 'Listen')}
            </button>
          ) : (
            <button type="button" className="btn-secondary h-11 w-full" onClick={stop}>
              <Square className="h-4 w-4" /> {t('Dừng', 'Stop')} · {who[set.lines[line].speaker]} (
              {line + 1}/{set.lines.length})
            </button>
          )}
          {done && (
            <div
              lang="en"
              className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"
            >
              {set.lines.map((l, i) => (
                <p key={i}>
                  <b className="text-slate-500 dark:text-slate-400">{who[l.speaker]}:</b> {l.text}
                </p>
              ))}
            </div>
          )}
        </section>

        <QuestionList questions={questions} picked={picked} onPick={pick} />

        {done && (
          <div className="session-actions">
            <button className="btn-primary h-12 w-full" onClick={finish} autoFocus>
              {t('Xem kết quả', 'See results')}
            </button>
          </div>
        )}
      </div>
    </GameShell>
  )
}
