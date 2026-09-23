import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Brain, LogOut } from 'lucide-react'
import type { Word } from '@/types'
import { GROUP_SIZE, chunk, learnDrills } from '@/lib/practice'
import { makeQuestion } from '@/lib/quiz'
import { exampleAudio, prefetchAudio, pronounce, wordAudio } from '@/lib/audio'
import { useSettings } from '@/store/settingsStore'
import { useProvideContext } from '@/store/contextStore'
import QuizRunner from '@/components/QuizRunner'
import WordInsight from '@/components/WordInsight'
import MySentence from '@/components/MySentence'

// A learning session for a beginner, in small groups:
//
//   meet 5 words (one full card each, no self-grading) → answer about those
//   same 5 (recognise, then recall in a sentence) → next group.
//
// Retrieving a word minutes after meeting it is what moves it out of "I have
// seen this" and into memory; the old flip-and-"Đã nhớ" flow asked learners to
// grade themselves seconds after reading the answer, which everybody passes.
// Every answer goes to the SRS, which is what puts the word on tomorrow's list.

interface Props {
  words: Word[]
  pool: Word[]
  ttsLang: string
  onAnswer: (word: Word, correct: boolean) => void
  onExit: () => void
  /** Rendered once every group is done. */
  renderComplete: (total: number) => React.ReactNode
}

type Phase = 'meet' | 'practice'

export default function LearnSession({
  words,
  pool,
  ttsLang,
  onAnswer,
  onExit,
  renderComplete,
}: Props) {
  const groups = useMemo(() => chunk(words, GROUP_SIZE), [words])
  const byId = useMemo(() => new Map(pool.map((w) => [w.id, w] as const)), [pool])
  const [groupIdx, setGroupIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('meet')
  const [cardIdx, setCardIdx] = useState(0)

  const group = groups[groupIdx] as Word[] | undefined

  // Built once per group, so options don't reshuffle on re-render.
  const questions = useMemo(
    () =>
      group ? learnDrills(group).map((d) => makeQuestion(byId.get(d.wordId)!, pool, d.mode)) : [],
    [group, byId, pool]
  )

  if (!group) return <>{renderComplete(words.length)}</>

  const groupLabel = groups.length > 1 ? `Nhóm ${groupIdx + 1}/${groups.length}` : ''
  const isLast = groupIdx + 1 >= groups.length

  if (phase === 'meet') {
    return (
      <MeetCards
        key={groupIdx}
        group={group}
        index={cardIdx}
        ttsLang={ttsLang}
        caption={groupLabel}
        onIndex={setCardIdx}
        onDone={() => setPhase('practice')}
        onExit={onExit}
      />
    )
  }

  return (
    <QuizRunner
      key={groupIdx}
      questions={questions}
      wordsById={byId}
      ttsLang={ttsLang}
      requeueWrong
      caption={`Luyện nhớ${groupLabel ? ` · ${groupLabel.toLowerCase()}` : ''}`}
      onExit={onExit}
      onAnswer={(id, correct) => {
        const w = byId.get(id)
        if (w) onAnswer(w, correct)
      }}
      renderComplete={(correct, total) =>
        isLast ? (
          renderComplete(words.length)
        ) : (
          <BetweenGroups
            label={groupLabel}
            size={group.length}
            correct={correct}
            total={total}
            onNext={() => {
              setGroupIdx((g) => g + 1)
              setCardIdx(0)
              setPhase('meet')
            }}
            onExit={onExit}
          />
        )
      }
    />
  )
}

/** A breather between groups — first-try score, framed as information, not a grade. */
function BetweenGroups({
  label,
  size,
  correct,
  total,
  onNext,
  onExit,
}: {
  label: string
  size: number
  correct: number
  total: number
  onNext: () => void
  onExit: () => void
}) {
  return (
    <div className="mx-auto max-w-md animate-fade-in text-center">
      <div className="card p-8">
        <p className="text-5xl">✅</p>
        <h2 className="mt-3 text-xl font-extrabold">Xong {label.toLowerCase()}!</h2>
        <p className="mt-2 text-slate-500">
          Bạn nhớ đúng ngay lần đầu{' '}
          <b>
            {correct}/{total}
          </b>{' '}
          câu. {size} từ vừa rồi đã vào lịch ôn — app sẽ tự hỏi lại đúng lúc bạn sắp quên.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-primary" autoFocus onClick={onNext}>
            Nhóm tiếp theo <ArrowRight className="h-4 w-4" />
          </button>
          <button className="btn-secondary" onClick={onExit}>
            Để sau
          </button>
        </div>
      </div>
    </div>
  )
}

function MeetCards({
  group,
  index,
  ttsLang,
  caption,
  onIndex,
  onDone,
  onExit,
}: {
  group: Word[]
  index: number
  ttsLang: string
  caption: string
  onIndex: (i: number) => void
  onDone: () => void
  onExit: () => void
}) {
  const autoSpeak = useSettings((s) => s.autoSpeak)
  const lang = useSettings((s) => s.currentLang)
  const word = group[index]
  const last = index + 1 >= group.length

  useProvideContext(`Đang làm quen từ "${word.word}"`, {
    word: word.word,
    meaning: word.meaning,
    ipa: word.ipa,
    pos: word.pos,
    exampleEn: word.exampleEn,
  })

  useEffect(() => {
    if (autoSpeak)
      pronounce({
        audioSrc: wordAudio(word.id),
        text: word.word,
        lang: ttsLang,
        rate: useSettings.getState().ttsRate,
      })
    prefetchAudio(
      group
        .slice(index, index + 3)
        .flatMap((w) => [wordAudio(w.id), exampleAudio(w.id, w.exampleEn)])
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id])

  const forward = () => (last ? onDone() : onIndex(index + 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && el.closest('input, textarea, select, button, a')) return
      if (e.key === 'Enter' || e.key === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault()
        forward()
      } else if (e.key === 'ArrowLeft' && index > 0) {
        onIndex(index - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onExit}
          className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500"
          aria-label="Kết thúc phiên học"
          title="Kết thúc (từ đã trả lời vẫn được lưu)"
        >
          <LogOut className="h-4 w-4" /> Thoát
        </button>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {group.map((w, i) => (
            <span
              key={w.id}
              className={`h-2 flex-1 rounded-full ${i <= index ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {index + 1}/{group.length}
        </span>
      </div>
      <p className="-mt-2 mb-3 text-xs font-medium text-slate-400">
        Làm quen{caption ? ` · ${caption.toLowerCase()}` : ''} — đọc to theo giọng mẫu, nhìn câu ví
        dụ, rồi bấm Tiếp.
      </p>

      <div className="card space-y-4 p-6">
        <WordInsight key={word.id} word={word} ttsLang={ttsLang} variant="full" />
        <MySentence key={`mine-${word.id}`} word={word} lang={lang} />
      </div>

      <div className="mt-5 flex gap-3">
        {index > 0 && (
          <button
            onClick={() => onIndex(index - 1)}
            className="btn-secondary h-14 !px-4"
            aria-label="Từ trước"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <button onClick={forward} className="btn-primary h-14 flex-1">
          {last ? (
            <>
              <Brain className="h-5 w-5" /> Luyện nhớ {group.length} từ này
            </>
          ) : (
            <>
              Tiếp <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
