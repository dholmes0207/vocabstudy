import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, SkipForward } from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useProvideContext } from '@/store/contextStore'
import { isRecordingSupported } from '@/lib/recorder'
import { isRecognitionSupported } from '@/lib/speech'
import PronounceTrainer from '@/components/PronounceTrainer'
import PosBadge from '@/components/PosBadge'
import SessionComplete from '@/components/SessionComplete'
import EmptyState from '@/components/EmptyState'
import { Field, Segment } from '@/components/Choice'

type Scope = 'learned' | 'hard' | 'all'

const COUNTS = [5, 10, 20]

const STRICTNESS_LABELS = {
  easy: 'Dễ',
  normal: 'Vừa',
  hard: 'Khó',
} as const

/** Shuffle a copy — sessions should not always start at word #1. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Speaking() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const strictness = useSettings((s) => s.speechStrictness)
  const setStrictness = useSettings((s) => s.setSpeechStrictness)
  const progress = useStudy((s) => s.progress[code])
  const recordAnswer = useStudy((s) => s.recordAnswer)

  const cards = progress?.cards ?? NO_CARDS
  const learnedWords = useMemo(() => pack.words.filter((w) => cards[w.id]), [pack.words, cards])
  const hardWords = useMemo(
    () =>
      pack.words.filter((w) => cards[w.id] && cards[w.id].wrongCount > cards[w.id].correctCount),
    [pack.words, cards]
  )

  const [scope, setScope] = useState<Scope>('learned')
  const [count, setCount] = useState(10)
  const [session, setSession] = useState<Word[] | null>(null)

  if (session) {
    return (
      <SpeakingSession
        words={session}
        ttsLang={pack.meta.ttsLang}
        onAttempt={(wordId, passed) => recordAnswer(code, wordId, passed)}
        onRestart={() => setSession(null)}
      />
    )
  }

  const scopeWords = scope === 'all' ? pack.words : scope === 'hard' ? hardWords : learnedWords
  const noLearned = learnedWords.length === 0
  const canRecord = isRecordingSupported()

  const start = () => {
    const picked = shuffle(scopeWords).slice(0, count)
    if (picked.length) setSession(picked)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">Luyện nói</span> <span aria-hidden="true">🎙️</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Nghe mẫu → đọc vào micro → nghe lại giọng mình. Kết quả được đưa vào lịch ôn.
        </p>
      </header>

      {!canRecord && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          Trình duyệt này không ghi âm được. Hãy dùng Chrome, Edge hoặc Safari bản mới, và mở trang
          qua HTTPS.
        </p>
      )}
      {canRecord && !isRecognitionSupported() && (
        <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Trình duyệt này chưa chấm điểm phát âm tự động được (Firefox). Bạn vẫn ghi âm, nghe đối
          chiếu với giọng mẫu và tự chấm bình thường.
        </p>
      )}

      {noLearned && scope !== 'all' ? (
        <EmptyState
          emoji="🎤"
          title="Bạn chưa học từ nào"
          description="Hãy học vài từ trước, hoặc chọn “Toàn bộ” để luyện nói thử."
        >
          <Link to="/learn" className="btn-primary">
            Học từ mới
          </Link>
          <button className="btn-secondary" onClick={() => setScope('all')}>
            Luyện toàn bộ
          </button>
        </EmptyState>
      ) : (
        <div className="card space-y-6 p-6">
          <Field label="Phạm vi">
            <div className="grid grid-cols-3 gap-2">
              <Segment
                active={scope === 'learned'}
                onClick={() => setScope('learned')}
                disabled={noLearned}
              >
                Đã học <span className="opacity-60">({learnedWords.length})</span>
              </Segment>
              <Segment
                active={scope === 'hard'}
                onClick={() => setScope('hard')}
                disabled={hardWords.length === 0}
              >
                Hay sai <span className="opacity-60">({hardWords.length})</span>
              </Segment>
              <Segment active={scope === 'all'} onClick={() => setScope('all')}>
                Toàn bộ <span className="opacity-60">({pack.words.length})</span>
              </Segment>
            </div>
          </Field>

          <Field label="Số từ">
            <div className="grid grid-cols-3 gap-2">
              {COUNTS.map((c) => (
                <Segment key={c} active={count === c} onClick={() => setCount(c)}>
                  {c} từ
                </Segment>
              ))}
            </div>
          </Field>

          <Field label="Độ khó chấm điểm">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STRICTNESS_LABELS) as (keyof typeof STRICTNESS_LABELS)[]).map((s) => (
                <Segment key={s} active={strictness === s} onClick={() => setStrictness(s)}>
                  {STRICTNESS_LABELS[s]}
                </Segment>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              “Khó” chỉ chấp nhận khi máy nghe đúng hẳn từ; “Dễ” chấp nhận cả khi đọc gần đúng.
            </p>
          </Field>

          <button
            onClick={start}
            disabled={!canRecord || scopeWords.length === 0}
            className="btn-primary h-12 w-full"
          >
            <Mic className="h-5 w-5" /> Bắt đầu ({Math.min(count, scopeWords.length)} từ)
          </button>
        </div>
      )}
    </div>
  )
}

function SpeakingSession({
  words,
  ttsLang,
  onAttempt,
  onRestart,
}: {
  words: Word[]
  ttsLang: string
  onAttempt: (wordId: number, passed: boolean) => void
  onRestart: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [passedCount, setPassedCount] = useState(0)
  /** Words the learner never cleared, so the summary can list them. */
  const [missed, setMissed] = useState<Word[]>([])
  /** Whether the current word has already been graded (avoids double-counting). */
  const [graded, setGraded] = useState(false)

  const word = words[idx]
  const done = idx >= words.length

  useProvideContext(
    word ? `Đang luyện phát âm từ "${word.word}"` : 'Đang luyện nói',
    word
      ? {
          word: word.word,
          meaning: word.meaning,
          ipa: word.ipa,
          pos: word.pos,
          exampleEn: word.exampleEn,
        }
      : undefined
  )

  if (done) {
    // SessionComplete throws its own confetti, scaled by accuracy.
    return (
      <SessionComplete
        emoji="🎙️"
        title="Xong buổi luyện nói!"
        correct={passedCount}
        total={words.length}
      >
        {missed.length > 0 && (
          <div className="w-full text-left">
            <p className="mb-2 text-sm font-semibold text-slate-500">Từ nên luyện thêm:</p>
            <ul className="space-y-1.5">
              {missed.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60"
                >
                  <b>{w.word}</b>
                  {w.ipa && <span className="font-mono text-xs text-slate-400">/{w.ipa}/</span>}
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-600 dark:text-slate-300">{w.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="btn-primary" onClick={onRestart}>
          Luyện bộ mới
        </button>
      </SessionComplete>
    )
  }

  const next = () => {
    setGraded(false)
    setIdx((i) => i + 1)
  }

  const handleAttempt = (passed: boolean) => {
    // Only the first attempt on a word counts — for the session score and for
    // the SRS alike. First-try recall is the signal the schedule is built on;
    // letting retries overwrite it would push words the learner still struggles
    // with out to a 30-day interval. Retries are for practice.
    if (graded) return
    setGraded(true)
    onAttempt(word.id, passed)
    if (passed) setPassedCount((c) => c + 1)
    else setMissed((m) => [...m, word])
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 animate-fade-in">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Từ {idx + 1}/{words.length}
        </span>
        <span>✅ {passedCount}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${(idx / words.length) * 100}%` }}
        />
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex flex-col items-center gap-2">
          <PosBadge category={word.posCategory} raw={word.pos} />
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {word.word}
          </h2>
          {word.ipa && <p className="font-mono text-slate-400">/{word.ipa}/</p>}
          {word.viRead && (
            <p className="text-sm text-slate-400">
              cách đọc:{' '}
              <span className="font-semibold text-slate-500 dark:text-slate-300">
                {word.viRead}
              </span>
            </p>
          )}
          <p className="text-center text-lg font-semibold text-brand-600 dark:text-brand-300">
            {word.meaning}
          </p>
        </div>

        <PronounceTrainer
          word={word}
          ttsLang={ttsLang}
          onAttempt={handleAttempt}
          footer={
            <button onClick={next} className="btn-primary h-12 w-full">
              {graded ? 'Từ tiếp theo' : 'Bỏ qua'} <SkipForward className="h-4 w-4" />
            </button>
          }
        />
      </div>
    </div>
  )
}
