import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, Lightbulb, LogOut, RotateCcw, Volume2, X } from 'lucide-react'
import type { QuizMode, QuizQuestion, Word } from '@/types'
import { GAP, buildSkeleton, checkFillAnswer } from '@/lib/quiz'
import { MAX_ATTEMPTS, requeue } from '@/lib/practice'
import { exampleAudio, pronounce, wordAudio } from '@/lib/audio'
import { buzz, playCorrect, playWrong } from '@/lib/sound'
import { nudge, praise } from '@/lib/encourage'
import { skyBurstAt } from '@/lib/skyEvents'
import { useSettings } from '@/store/settingsStore'
import { useProvideContext } from '@/store/contextStore'
import { useImmersive } from '@/store/uiStore'
import HighlightExample from './HighlightExample'
import PosBadge from './PosBadge'
import SpeakButton from './SpeakButton'
import WordInsight from './WordInsight'
import { useT, useUiLang } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'

// One question at a time, for every place the app asks something: the quiz,
// the practice rounds of a learning session, and recall-based review.
//
// Two things make it a teacher rather than a grader:
//  * after a miss it explains — the right word on a small card, and what the
//    option you picked actually means, because telling look-alikes apart is
//    half of knowing a word;
//  * with `requeueWrong` a missed question comes back a few questions later,
//    so the session ends on a success instead of a red cross.

interface Props {
  questions: QuizQuestion[]
  wordsById: Map<number, Word>
  ttsLang: string
  /** Every answer, retries included — the SRS decides what counts. */
  onAnswer: (wordId: number, correct: boolean) => void
  /** `correct` and `wrongIds` describe first attempts only. */
  renderComplete: (correct: number, total: number, wrongIds: number[]) => React.ReactNode
  /** Bring a missed question back a few questions later (learning & review). */
  requeueWrong?: boolean
  /** Show a "Thoát" button. Answers already given are kept. */
  onExit?: () => void
  /** Small caption next to the progress bar, e.g. "Luyện nhớ · nhóm 1/3". */
  caption?: string
}

interface Item {
  q: QuizQuestion
  attempt: number
}

const TASK: Record<QuizMode, [vi: string, en: string]> = {
  'en-to-vi': ['Chọn nghĩa đúng', 'Pick the right meaning'],
  'vi-to-en': ['Chọn từ đúng với nghĩa', 'Pick the word for this meaning'],
  listen: ['Nghe rồi chọn nghĩa đúng', 'Listen, then pick the meaning'],
  context: ['Chọn từ hợp với chỗ trống', 'Pick the word that fits the gap'],
  fill: ['Gõ từ còn thiếu', 'Type the missing word'],
  spell: ['Nghe và gõ lại từ', 'Listen and type the word'],
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizRunner({
  questions,
  wordsById,
  ttsLang,
  onAnswer,
  renderComplete,
  requeueWrong = false,
  onExit,
  caption,
}: Props) {
  useImmersive()
  const ttsRate = useSettings((s) => s.ttsRate)
  const soundEnabled = useSettings((s) => s.soundEnabled)
  const [queue, setQueue] = useState<Item[]>(() => questions.map((q) => ({ q, attempt: 1 })))
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [willReturn, setWillReturn] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [hintCount, setHintCount] = useState(0)
  const [wrongIds, setWrongIds] = useState<number[]>([])
  // Right answers in a row — a little momentum makes a session feel like a game.
  const [combo, setCombo] = useState(0)
  const t = useT()
  const L = useTargetLang()
  const lang = useUiLang()
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const done = idx >= queue.length
  const item = queue[idx]
  const q = item?.q
  const word = q ? wordsById.get(q.wordId) : undefined

  // Spelling skeleton (abi__ty) + the positions the learner still must recall.
  const skeleton = useMemo(
    () => (q?.mode === 'spell' && word ? buildSkeleton(word.word) : []),
    [q, word]
  )
  const hiddenPositions = useMemo(
    () => skeleton.map((c, i) => (!c.revealed ? i : -1)).filter((i) => i >= 0),
    [skeleton]
  )

  useProvideContext(
    word ? `Đang trả lời câu hỏi về từ "${word.word}"` : 'Đang làm bài',
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

  const play = () => {
    if (!q) return
    pronounce({
      audioSrc: wordAudio(q.wordId),
      text: word?.word ?? q.prompt,
      lang: ttsLang,
      rate: ttsRate,
    })
  }

  useEffect(() => {
    if (done || !q) return
    if (q.mode === 'listen' || q.mode === 'spell') play()
    if (q.mode === 'fill' || q.mode === 'spell') inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done])

  const isTyping = q?.mode === 'fill' || q?.mode === 'spell'

  // Hand the keyboard to "next" once a multiple-choice answer is shown. NOT for
  // typing questions: the Enter that submits would land its keypress on the
  // freshly focused button and skip the correction unseen. There the input
  // keeps focus (read-only) and a second Enter continues.
  useEffect(() => {
    if (revealed && !isTyping) nextRef.current?.focus()
  }, [revealed, isTyping])

  const commit = (correct: boolean) => {
    if (!item || !q) return
    setRevealed(true)
    setLastCorrect(correct)
    if (item.attempt === 1) {
      if (correct) setCorrectCount((c) => c + 1)
      else setWrongIds((ids) => (ids.includes(q.wordId) ? ids : [...ids, q.wordId]))
    }
    setCombo((c) => (correct ? c + 1 : 0))
    if (soundEnabled) {
      ;(correct ? playCorrect : playWrong)()
      buzz(correct)
    }
    const retry = !correct && requeueWrong && item.attempt < MAX_ATTEMPTS
    setWillReturn(retry)
    if (retry) {
      const again: Item = { q: { ...q, options: shuffle(q.options) }, attempt: item.attempt + 1 }
      setQueue((cur) => requeue(cur, idx, again))
    }
    onAnswer(q.wordId, correct)
  }

  // The sky lights up where the learner got it right; a streak makes it bigger.
  const sparkleAt = (el: Element | null) => skyBurstAt(el, 0.8 + Math.min(combo, 5) * 0.15)

  const chooseOption = (i: number) => {
    if (revealed || !q || !q.options[i]) return
    setSelected(i)
    commit(q.options[i].correct)
    if (q.options[i].correct) sparkleAt(document.querySelector(`[data-quiz-option="${i}"]`))
  }

  const submitTyping = () => {
    if (revealed || !input.trim() || !word || !q) return
    const ok = checkFillAnswer(word, input, q.surface)
    commit(ok)
    if (ok) sparkleAt(inputRef.current)
  }

  const next = () => {
    setSelected(null)
    setInput('')
    setRevealed(false)
    setWillReturn(false)
    setHintCount(0)
    setIdx((i) => i + 1)
  }

  // Number keys pick an option; Enter/Space continue once answered. Keys that
  // land on a real control are left to it, so nothing fires twice.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || !q) return
      const el = e.target as HTMLElement | null
      if (el && el.closest('input, textarea, select, button, a')) return
      if (!revealed && !isTyping && /^[1-4]$/.test(e.key)) {
        chooseOption(Number(e.key) - 1)
      } else if (revealed && (e.key === 'Enter' || e.code === 'Space')) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (done || !q) return <>{renderComplete(correctCount, questions.length, wrongIds)}</>

  // The form to show as "the answer": the one the sentence uses, if any.
  const answerForm = (q.surface ?? q.answer.split('/')[0] ?? q.answer).trim()
  const chosen = selected !== null ? q.options[selected] : undefined
  const chosenWord = chosen && !chosen.correct ? wordsById.get(chosen.wordId) : undefined
  const sentencePrompt = q.mode === 'fill' || q.mode === 'context'

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      {/* Progress */}
      <div className="mb-5 flex items-center gap-3">
        {onExit && (
          <button
            onClick={onExit}
            className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500"
            aria-label={t('Kết thúc phiên', 'End session')}
            title={t('Kết thúc (câu đã trả lời vẫn được lưu)', 'End (answers so far are saved)')}
          >
            <LogOut className="h-4 w-4" /> {t('Thoát', 'Exit')}
          </button>
        )}
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(idx / queue.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {idx + 1}/{queue.length}
        </span>
      </div>
      {caption && (
        <p className="-mt-3 mb-3 text-xs font-medium text-slate-400">
          {caption}
          {item.attempt > 1 && (
            <span className="ml-2 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-3 w-3" /> {t('thử lại', 'retry')}
            </span>
          )}
        </p>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t(TASK[q.mode][0], TASK[q.mode][1])}
          </p>
          {word && (q.mode === 'en-to-vi' || q.mode === 'vi-to-en') && (
            <PosBadge category={word.posCategory} />
          )}
          {combo >= 3 && (
            <span
              key={combo}
              className="chip ml-auto animate-pop bg-orange-100 font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300"
              title={t('Số câu đúng liên tiếp', 'Correct in a row')}
            >
              🔥 x{combo}
            </span>
          )}
          {!caption && item.attempt > 1 && (
            <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <RotateCcw className="h-3 w-3" /> {t('thử lại', 'retry')}
            </span>
          )}
        </div>

        {/* Prompt */}
        <div className="mt-3">
          {q.mode === 'listen' ? (
            revealed && word ? (
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-center text-3xl font-extrabold">{word.word}</h2>
                <button
                  onClick={play}
                  className="rounded-full bg-brand-50 p-2 text-brand-600 dark:bg-brand-950 dark:text-brand-300"
                  aria-label={t('Nghe lại', 'Play again')}
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={play}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition active:scale-95"
                aria-label={t('Nghe lại', 'Play again')}
              >
                <Volume2 className="h-9 w-9" />
              </button>
            )
          ) : sentencePrompt ? (
            <div className="space-y-2">
              <p className="text-xl font-medium leading-relaxed">
                {revealed && q.surface ? (
                  <HighlightExample sentence={q.prompt.replace(GAP, q.surface)} word={q.surface} />
                ) : (
                  <HighlightExample sentence={q.prompt} word={GAP} />
                )}
              </p>
              {q.hint && (
                <p className="text-sm italic text-slate-500 dark:text-slate-400">
                  {q.mode === 'fill' && q.surface
                    ? t(`Nghĩa của từ: ${q.hint}`, `Meaning: ${q.hint}`)
                    : q.hint}
                </p>
              )}
            </div>
          ) : q.mode === 'spell' ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold">{q.prompt}</span>
                <button
                  onClick={play}
                  className="rounded-full bg-brand-600 p-2 text-white shadow transition active:scale-90"
                  aria-label={t('Nghe từ', 'Play the word')}
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <Skeleton
                cells={skeleton}
                hiddenPositions={hiddenPositions}
                hintCount={hintCount}
                revealed={revealed}
                answer={answerForm}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-center text-3xl font-extrabold">{q.prompt}</h2>
              {q.mode === 'en-to-vi' && (
                <button
                  onClick={play}
                  className="rounded-full bg-brand-50 p-2 text-brand-600 dark:bg-brand-950 dark:text-brand-300"
                  aria-label={t('Phát âm', 'Pronounce')}
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
              readOnly={revealed}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (revealed ? next() : submitTyping())}
              placeholder={t(`Gõ từ ${L.vi}…`, `Type the ${L.en} word…`)}
              aria-label={t('Câu trả lời', 'Your answer')}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-lg tracking-wide outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
            />
            {q.mode === 'spell' && !revealed && hintCount < hiddenPositions.length && (
              <button onClick={() => setHintCount((h) => h + 1)} className="btn-ghost mt-2 text-sm">
                <Lightbulb className="h-4 w-4" />{' '}
                {t('Gợi ý (mở thêm 1 chữ)', 'Hint (reveal 1 letter)')}
              </button>
            )}
            {revealed && !lastCorrect && (
              <div className="mt-3 text-sm">
                <span className="font-medium text-rose-600">{t('Đáp án:', 'Answer:')} </span>
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
              </div>
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
                  key={`${opt.wordId}-${i}`}
                  onClick={() => chooseOption(i)}
                  data-quiz-option={i}
                  disabled={revealed}
                  className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition ${
                    state === 'correct'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                      : state === 'wrong'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <kbd className="hidden h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs text-slate-400 dark:bg-slate-800 sm:grid">
                      {i + 1}
                    </kbd>
                    {opt.text}
                  </span>
                  {state === 'correct' && <Check className="h-5 w-5 shrink-0" />}
                  {state === 'wrong' && <X className="h-5 w-5 shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        {/* Feedback that teaches */}
        {revealed && word && (
          <div className="mt-5 space-y-3 animate-fade-in" aria-live="polite">
            {lastCorrect ? (
              <>
                <p className="font-semibold text-emerald-600">
                  ✓ {praise(q.wordId + item.attempt, lang)}
                  {isTyping && q.surface && norm(input) !== norm(q.surface) && (
                    <span className="ml-1 font-normal text-slate-500">
                      {t('Trong câu, từ này được viết là', 'In this sentence it is written')}{' '}
                      <b>{q.surface}</b>.
                    </span>
                  )}
                </p>
                <CorrectEcho word={word} ttsLang={ttsLang} showSentence={!sentencePrompt} />
              </>
            ) : (
              <>
                <p className="font-semibold text-rose-600">
                  {t('Chưa đúng', 'Not quite')} — {nudge(q.wordId + item.attempt, lang)}
                </p>
                {chosenWord && <Contrast mode={q.mode} chosen={chosenWord} />}
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <WordInsight word={word} ttsLang={ttsLang} variant="compact" />
                </div>
                {willReturn && (
                  <p className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                    <RotateCcw className="h-4 w-4" />{' '}
                    {t(
                      'Từ này sẽ quay lại sau vài câu nữa.',
                      'This word will come back in a few questions.'
                    )}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer action — sticks to the bottom of a phone screen */}
        <div className={isTyping || revealed ? 'session-actions' : 'mt-6'}>
          {isTyping && !revealed ? (
            <button
              onClick={submitTyping}
              disabled={!input.trim()}
              className="btn-primary h-12 w-full"
            >
              {t('Kiểm tra', 'Check')}
            </button>
          ) : revealed ? (
            <button ref={nextRef} onClick={next} className="btn-primary h-12 w-full">
              {idx + 1 >= queue.length
                ? t('Xem kết quả', 'See results')
                : t('Câu tiếp theo', 'Next question')}{' '}
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const norm = (s: string) => s.trim().toLowerCase()

/** "What you picked is actually…" — turns a miss into a lesson on look-alikes. */
function Contrast({ mode, chosen }: { mode: QuizMode; chosen: Word }) {
  const lang = useUiLang()
  const pickedMeaning = mode === 'en-to-vi' || mode === 'listen'
  return (
    <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
      {lang === 'en' ? (
        pickedMeaning ? (
          <>
            You picked <b>“{chosen.meaning}”</b> — that is the meaning of <b>{chosen.word}</b>.
          </>
        ) : (
          <>
            You picked <b>{chosen.word}</b> — it means <b>“{chosen.meaning}”</b>.
          </>
        )
      ) : pickedMeaning ? (
        <>
          Bạn chọn <b>“{chosen.meaning}”</b> — đó là nghĩa của từ <b>{chosen.word}</b>.
        </>
      ) : (
        <>
          Bạn chọn <b>{chosen.word}</b> — từ đó nghĩa là <b>“{chosen.meaning}”</b>.
        </>
      )}
    </p>
  )
}

/** After a right answer: one line that puts the word back in its sentence. */
function CorrectEcho({
  word,
  ttsLang,
  showSentence,
}: {
  word: Word
  ttsLang: string
  showSentence: boolean
}) {
  const t = useT()
  return (
    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
      <p>
        {word.emoji && <span aria-hidden>{word.emoji} </span>}
        <b>{word.word}</b>
        {word.viRead && <span className="text-slate-400"> ({word.viRead})</span>} — {word.meaning}
      </p>
      {showSentence && word.exampleEn && (
        <p className="flex items-start gap-2">
          <SpeakButton
            text={word.exampleEn}
            lang={ttsLang}
            audioSrc={exampleAudio(word.id, word.exampleEn)}
            size="sm"
            label={t('Nghe câu ví dụ', 'Hear the example')}
            className="shrink-0"
          />
          <span className="pt-1">
            <HighlightExample sentence={word.exampleEn} word={word.word} pos={word.posCategory} />
            <span className="block italic text-slate-400">{word.exampleVi}</span>
          </span>
        </p>
      )}
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
              {cell.ch === ' ' ? ' ' : cell.ch}
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
            {show ? (revealed && !cell.revealed ? (answer[i] ?? cell.ch) : cell.ch) : '_'}
          </span>
        )
      })}
    </div>
  )
}
