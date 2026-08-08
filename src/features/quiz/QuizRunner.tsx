import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, Lightbulb, Volume2, X } from 'lucide-react'
import type { QuizQuestion, Word } from '@/types'
import { buildSkeleton, checkFillAnswer } from '@/lib/quiz'
import { pronounce, wordAudio } from '@/lib/audio'
import { playCorrect, playWrong } from '@/lib/sound'
import { useSettings } from '@/store/settingsStore'
import { useProvideContext } from '@/store/contextStore'
import HighlightExample from '@/components/HighlightExample'

interface Props {
  questions: QuizQuestion[]
  wordsById: Map<number, Word>
  ttsLang: string
  onAnswer: (wordId: number, correct: boolean) => void
  renderComplete: (correct: number, total: number, wrongIds: number[]) => React.ReactNode
}

export default function QuizRunner({ questions, wordsById, ttsLang, onAnswer, renderComplete }: Props) {
  const ttsRate = useSettings((s) => s.ttsRate)
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [hintCount, setHintCount] = useState(0)
  const wrongIds = useRef<number[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const done = idx >= questions.length
  const q = questions[idx]
  const word = q ? wordsById.get(q.wordId) : undefined

  // Spelling skeleton (abi__ty) + the positions the learner still must recall.
  const skeleton = useMemo(() => (q?.mode === 'spell' && word ? buildSkeleton(word.word) : []), [q, word])
  const hiddenPositions = useMemo(
    () => skeleton.map((c, i) => (!c.revealed ? i : -1)).filter((i) => i >= 0),
    [skeleton],
  )

  useProvideContext(
    word ? `Đang kiểm tra từ "${word.word}"` : 'Đang làm quiz',
    word
      ? { word: word.word, meaning: word.meaning, ipa: word.ipa, pos: word.pos, exampleEn: word.exampleEn }
      : undefined,
  )

  const play = () => pronounce({ audioSrc: wordAudio(q.wordId), text: word?.word ?? q.prompt, lang: ttsLang, rate: ttsRate })

  useEffect(() => {
    if (done || !q) return
    if (q.mode === 'listen' || q.mode === 'spell') play()
    if (q.mode === 'fill' || q.mode === 'spell') inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done])

  if (done) return <>{renderComplete(correctCount, questions.length, wrongIds.current)}</>

  const isTyping = q.mode === 'fill' || q.mode === 'spell'

  const commit = (correct: boolean) => {
    setRevealed(true)
    setLastCorrect(correct)
    if (correct) {
      setCorrectCount((c) => c + 1)
      playCorrect()
    } else {
      wrongIds.current.push(q.wordId)
      playWrong()
    }
    onAnswer(q.wordId, correct)
  }

  const chooseOption = (i: number) => {
    if (revealed) return
    setSelected(i)
    commit(q.options[i].correct)
  }

  const submitTyping = () => {
    if (revealed || !input.trim() || !word) return
    commit(checkFillAnswer(word, input))
  }

  const next = () => {
    setSelected(null)
    setInput('')
    setRevealed(false)
    setHintCount(0)
    setIdx((i) => i + 1)
  }

  // The single-form answer we display for feedback (first form of "a / an").
  const answerForm = (q.answer.split('/')[0] || q.answer).trim()

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      {/* Progress */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {idx + 1}/{questions.length}
        </span>
      </div>

      <div className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{q.hint}</p>

        {/* Prompt */}
        <div className="mt-3">
          {q.mode === 'listen' ? (
            <button
              onClick={play}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition active:scale-95"
              aria-label="Nghe lại"
            >
              <Volume2 className="h-9 w-9" />
            </button>
          ) : q.mode === 'fill' ? (
            <p className="text-xl font-medium leading-relaxed">
              <HighlightExample sentence={q.prompt} word="_____" />
            </p>
          ) : q.mode === 'spell' ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold">{q.prompt}</span>
                <button
                  onClick={play}
                  className="rounded-full bg-brand-600 p-2 text-white shadow transition active:scale-90"
                  aria-label="Nghe từ"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <Skeleton cells={skeleton} hiddenPositions={hiddenPositions} hintCount={hintCount} revealed={revealed} answer={answerForm} />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-center text-3xl font-extrabold">{q.prompt}</h2>
              {q.mode === 'en-to-vi' && (
                <button
                  onClick={play}
                  className="rounded-full bg-brand-50 p-2 text-brand-600 dark:bg-brand-950 dark:text-brand-300"
                  aria-label="Phát âm"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Options / Typing input */}
        {isTyping ? (
          <div className="mt-6">
            <input
              ref={inputRef}
              value={input}
              disabled={revealed}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (revealed ? next() : submitTyping())}
              placeholder="Gõ từ tiếng Anh…"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-lg tracking-wide outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
            />
            {q.mode === 'spell' && !revealed && hintCount < hiddenPositions.length && (
              <button
                onClick={() => setHintCount((h) => h + 1)}
                className="btn-ghost mt-2 text-sm"
              >
                <Lightbulb className="h-4 w-4" /> Gợi ý (mở thêm 1 chữ)
              </button>
            )}
            {revealed &&
              (lastCorrect ? (
                <p className="mt-3 text-sm font-medium text-emerald-600">✓ Chính xác!</p>
              ) : (
                <div className="mt-3 text-sm">
                  <span className="font-medium text-rose-600">✗ Đáp án đúng: </span>
                  <span className="font-mono text-base font-bold tracking-wide">
                    {answerForm.split('').map((ch, i) => {
                      const ok = (input.trim()[i] || '').toLowerCase() === ch.toLowerCase()
                      return (
                        <span key={i} className={ok ? 'text-emerald-600' : 'text-rose-600'}>
                          {ch}
                        </span>
                      )
                    })}
                  </span>
                  {word && <span className="ml-1 text-slate-400">— {word.meaning}</span>}
                </div>
              ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {q.options.map((opt, i) => {
              const state = !revealed ? 'idle' : opt.correct ? 'correct' : selected === i ? 'wrong' : 'idle'
              return (
                <button
                  key={i}
                  onClick={() => chooseOption(i)}
                  disabled={revealed}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition ${
                    state === 'correct'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                      : state === 'wrong'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.text}</span>
                  {state === 'correct' && <Check className="h-5 w-5 shrink-0" />}
                  {state === 'wrong' && <X className="h-5 w-5 shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        {/* Footer action */}
        <div className="mt-6 min-h-[3rem]">
          {isTyping && !revealed ? (
            <button onClick={submitTyping} disabled={!input.trim()} className="btn-primary h-12 w-full">
              Kiểm tra
            </button>
          ) : revealed ? (
            <button onClick={next} className="btn-primary h-12 w-full">
              {idx + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp theo'} <ArrowRight className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** The abi__ty skeleton row: revealed letters shown, hidden ones as blanks. */
function Skeleton({
  cells,
  hiddenPositions,
  hintCount,
  revealed,
  answer,
}: {
  cells: { ch: string; isLetter: boolean; revealed: boolean }[]
  hiddenPositions: number[]
  hintCount: number
  revealed: boolean
  answer: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5">
      {cells.map((cell, i) => {
        if (!cell.isLetter) {
          return (
            <span key={i} className="px-1 text-2xl font-bold text-slate-400">
              {cell.ch === ' ' ? ' ' : cell.ch}
            </span>
          )
        }
        const hiddenRank = hiddenPositions.indexOf(i)
        const show = cell.revealed || (hiddenRank >= 0 && hiddenRank < hintCount) || revealed
        return (
          <span
            key={i}
            className={`grid h-11 w-9 place-items-center rounded-lg border-2 text-xl font-bold uppercase ${
              cell.revealed
                ? 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : show
                  ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                  : 'border-dashed border-slate-300 text-transparent dark:border-slate-600'
            }`}
          >
            {show ? (revealed && !cell.revealed ? answer[i] ?? cell.ch : cell.ch) : '_'}
          </span>
        )
      })}
    </div>
  )
}
