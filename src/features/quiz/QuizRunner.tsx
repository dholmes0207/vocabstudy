import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Volume2, X } from 'lucide-react'
import type { QuizQuestion, Word } from '@/types'
import { checkFillAnswer } from '@/lib/quiz'
import { pronounce, wordAudio } from '@/lib/audio'
import { playCorrect, playWrong } from '@/lib/sound'
import { useSettings } from '@/store/settingsStore'
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
  const wrongIds = useRef<number[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const done = idx >= questions.length
  const q = questions[idx]

  // Auto-play audio for listen questions; focus the input for fill questions.
  useEffect(() => {
    if (done || !q) return
    if (q.mode === 'listen') pronounce({ audioSrc: wordAudio(q.wordId), text: q.prompt, lang: ttsLang, rate: ttsRate })
    if (q.mode === 'fill') inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done])

  if (done) return <>{renderComplete(correctCount, questions.length, wrongIds.current)}</>

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

  const submitFill = () => {
    if (revealed || !input.trim()) return
    const word = wordsById.get(q.wordId)!
    commit(checkFillAnswer(word, input))
  }

  const next = () => {
    setSelected(null)
    setInput('')
    setRevealed(false)
    setIdx((i) => i + 1)
  }

  const word = wordsById.get(q.wordId)

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
              onClick={() => pronounce({ audioSrc: wordAudio(q.wordId), text: q.prompt, lang: ttsLang, rate: ttsRate })}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition active:scale-95"
              aria-label="Nghe lại"
            >
              <Volume2 className="h-9 w-9" />
            </button>
          ) : q.mode === 'fill' ? (
            <p className="text-xl font-medium leading-relaxed">
              <HighlightExample sentence={q.prompt} word="_____" />
            </p>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-center text-3xl font-extrabold">{q.prompt}</h2>
              {q.mode === 'en-to-vi' && (
                <button
                  onClick={() => pronounce({ audioSrc: wordAudio(q.wordId), text: q.prompt, lang: ttsLang, rate: ttsRate })}
                  className="rounded-full bg-brand-50 p-2 text-brand-600 dark:bg-brand-950 dark:text-brand-300"
                  aria-label="Phát âm"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Options / Input */}
        {q.mode === 'fill' ? (
          <div className="mt-6">
            <input
              ref={inputRef}
              value={input}
              disabled={revealed}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (revealed ? next() : submitFill())}
              placeholder="Gõ từ tiếng Anh…"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {revealed && (
              <p className={`mt-3 text-sm font-medium ${lastCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                {lastCorrect ? '✓ Chính xác!' : `✗ Đáp án đúng: `}
                {!lastCorrect && <b>{q.answer}</b>}
                {word && <span className="ml-1 text-slate-400">— {word.meaning}</span>}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {q.options.map((opt, i) => {
              const state = !revealed
                ? 'idle'
                : opt.correct
                  ? 'correct'
                  : selected === i
                    ? 'wrong'
                    : 'idle'
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
          {q.mode === 'fill' && !revealed ? (
            <button onClick={submitFill} disabled={!input.trim()} className="btn-primary h-12 w-full">
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
