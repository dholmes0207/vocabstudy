import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import type { QuizMode, QuizQuestion, Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { generateQuiz } from '@/lib/quiz'
import SessionComplete from '@/components/SessionComplete'
import EmptyState from '@/components/EmptyState'
import SpeakButton from '@/components/SpeakButton'
import { Field, Segment } from '@/components/Choice'
import { wordAudio } from '@/lib/audio'
import QuizRunner from '@/components/QuizRunner'

type Scope = 'learned' | 'hard' | 'all'

const MODE_LABELS: Record<QuizMode, string> = {
  'en-to-vi': 'Anh → Việt',
  'vi-to-en': 'Việt → Anh',
  listen: 'Nghe → chọn từ',
  spell: 'Đánh vần (gõ từ) ✍️',
  context: 'Chọn từ điền vào câu',
  fill: 'Gõ từ vào câu',
}

const COUNTS = [10, 20, 30]

export default function Quiz() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const progress = useStudy((s) => s.progress[code])
  const recordAnswer = useStudy((s) => s.recordAnswer)

  const cards = progress?.cards ?? NO_CARDS
  const wordsById = useMemo(() => new Map(pack.words.map((w) => [w.id, w] as const)), [pack.words])

  const learnedWords = useMemo(() => pack.words.filter((w) => cards[w.id]), [pack.words, cards])
  const hardWords = useMemo(
    () =>
      pack.words.filter((w) => cards[w.id] && cards[w.id].wrongCount > cards[w.id].correctCount),
    [pack.words, cards]
  )

  const [scope, setScope] = useState<Scope>('learned')
  const [modes, setModes] = useState<QuizMode[]>(['en-to-vi', 'vi-to-en', 'listen', 'context'])
  const [count, setCount] = useState(10)
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)

  const scopeWords: Word[] =
    scope === 'all' ? pack.words : scope === 'hard' ? hardWords : learnedWords

  if (questions) {
    return (
      <QuizRunner
        questions={questions}
        wordsById={wordsById}
        ttsLang={pack.meta.ttsLang}
        onAnswer={(id, correct) => recordAnswer(code, id, correct)}
        onExit={() => setQuestions(null)}
        renderComplete={(correct, total, wrongIds) => (
          <SessionComplete emoji="🏁" title="Xong bài quiz!" correct={correct} total={total}>
            {wrongIds.length > 0 && (
              <div className="w-full text-left">
                <p className="mb-2 text-sm font-semibold text-slate-500">Từ cần xem lại:</p>
                <ul className="space-y-1.5">
                  {wrongIds.map((id) => {
                    const w = wordsById.get(id)
                    if (!w) return null
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60"
                      >
                        <SpeakButton
                          text={w.word}
                          lang={pack.meta.ttsLang}
                          audioSrc={wordAudio(w.id)}
                          size="sm"
                        />
                        <b>{w.word}</b>
                        <span className="text-slate-400">—</span>
                        <span className="text-slate-600 dark:text-slate-300">{w.meaning}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <button className="btn-primary" onClick={() => setQuestions(null)}>
              Làm bộ mới
            </button>
          </SessionComplete>
        )}
      />
    )
  }

  const start = () => {
    if (scopeWords.length === 0 || modes.length === 0) return
    const qs = generateQuiz({ words: scopeWords, pool: pack.words, modes, limit: count })
    if (qs.length) setQuestions(qs)
  }

  const toggleMode = (m: QuizMode) =>
    setModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))

  const noLearned = learnedWords.length === 0

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Kiểm tra 🎯</h1>
        <p className="mt-1 text-slate-500">
          Tự nhớ lại là cách nhớ lâu nhất. Câu sai sẽ được đưa vào lịch ôn lại; câu đúng khi từ chưa
          tới hạn ôn thì không làm từ &quot;thành thạo&quot; nhanh hơn — nhớ sâu cần thời gian giãn
          cách.
        </p>
      </header>

      {noLearned && scope !== 'all' ? (
        <EmptyState
          emoji="📝"
          title="Bạn chưa học từ nào"
          description={`Hãy học vài từ trước, hoặc chọn phạm vi “Toàn bộ ${pack.meta.count} từ” để kiểm tra thử.`}
        >
          <Link to="/learn" className="btn-primary">
            Học từ mới
          </Link>
          <button className="btn-secondary" onClick={() => setScope('all')}>
            Kiểm tra toàn bộ
          </button>
        </EmptyState>
      ) : (
        <div className="card space-y-6 p-6">
          {/* Scope */}
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

          {/* Modes */}
          <Field label="Dạng câu hỏi">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MODE_LABELS) as QuizMode[]).map((m) => (
                <label
                  key={m}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition ${
                    modes.includes(m)
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-brand-600"
                    checked={modes.includes(m)}
                    onChange={() => toggleMode(m)}
                  />
                  {MODE_LABELS[m]}
                </label>
              ))}
            </div>
          </Field>

          {/* Count */}
          <Field label="Số câu hỏi">
            <div className="grid grid-cols-3 gap-2">
              {COUNTS.map((c) => (
                <Segment key={c} active={count === c} onClick={() => setCount(c)}>
                  {c} câu
                </Segment>
              ))}
            </div>
          </Field>

          <button
            onClick={start}
            disabled={modes.length === 0 || scopeWords.length === 0}
            className="btn-primary h-12 w-full"
          >
            <GraduationCap className="h-5 w-5" /> Bắt đầu ({Math.min(count, scopeWords.length)} câu)
          </button>
          {modes.length === 0 && (
            <p className="text-center text-sm text-rose-500">Chọn ít nhất một dạng câu hỏi.</p>
          )}
        </div>
      )}
    </div>
  )
}
