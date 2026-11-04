import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useMissedWord } from '@/hooks/useMissedWord'
import { FORM_NAMES, type FormCategory, type FormQuestion } from '@/lib/wordFormDrill'
import { pronounce, wordAudio } from '@/lib/audio'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Đoán từ loại qua đuôi từ" (lib/wordFormDrill.ts): a word, four parts of
// speech, then the ending rule that gives it away — the quickest way through
// the word-form questions of TOEIC Part 5.

const CATS: FormCategory[] = ['noun', 'verb', 'adjective', 'adverb']

export default function FormRound({
  questions,
  onAgain,
  onExit,
}: {
  questions: FormQuestion[]
  onAgain: () => void
  onExit: () => void
}) {
  const t = useT()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'en-US')
  const rate = useSettings((s) => s.ttsRate)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const missed = useMissedWord()
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<FormCategory | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const title = t('Đoán từ loại qua đuôi từ', 'Part of speech from the ending')
  const q = questions[idx]

  if (xp !== null || !q)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="🔤"
          title={t('Xong một lượt!', 'Round complete!')}
          lines={[
            t(`Đúng ${correct}/${questions.length} câu`, `${correct} of ${questions.length} right`),
          ]}
          xp={xp ?? 0}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const answered = picked !== null
  const pick = (c: FormCategory) => {
    if (answered) return
    setPicked(c)
    const ok = c === q.answer
    if (ok) setCorrect((n) => n + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
    if (!ok) missed(q.word.id)
    pronounce({ audioSrc: wordAudio(q.word.id), text: q.word.word, lang, rate })
  }
  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const earned = pinyinXp(correct, questions.length)
    addPlayXp(code, earned)
    setXp(earned)
  }
  const stem = q.word.word.slice(0, -q.ending.length)

  return (
    <GameShell
      title={title}
      onExit={onExit}
      stats={
        <span>
          {idx + 1}/{questions.length}
        </span>
      }
    >
      <div className="card space-y-4 p-6">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t('Từ này là từ loại gì?', 'What part of speech is this word?')}
        </p>
        <p lang="en" className="text-center text-4xl font-bold">
          {answered ? (
            <>
              {stem}
              <span className="text-brand-600 underline dark:text-brand-300">{q.ending}</span>
            </>
          ) : (
            q.word.word
          )}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CATS.map((c) => {
            const state = !answered
              ? 'idle'
              : c === q.answer
                ? 'right'
                : c === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={c}
                type="button"
                onClick={() => pick(c)}
                disabled={answered}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 font-medium transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {t(...FORM_NAMES[c])}
                {state === 'right' && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5 shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        {answered && (
          <p
            className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
            aria-live="polite"
          >
            <b
              className={
                picked === q.answer
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-rose-600 dark:text-rose-300'
              }
            >
              {picked === q.answer ? t('Đúng rồi! ', 'Right! ') : t('Chưa đúng. ', 'Not quite. ')}
            </b>
            {t(
              `Đuôi -${q.ending} thường là ${FORM_NAMES[q.answer][0].toLowerCase()}. `,
              `The ending -${q.ending} usually marks ${q.answer === 'adjective' || q.answer === 'adverb' ? 'an' : 'a'} ${FORM_NAMES[q.answer][1].toLowerCase()}. `
            )}
            <b lang="en">{q.word.word}</b> = {q.word.meaning}
          </p>
        )}
      </div>
      {answered && (
        <div className="session-actions mt-4">
          <button className="btn-primary h-12 w-full" onClick={next} autoFocus>
            {idx + 1 < questions.length
              ? t('Câu tiếp theo', 'Next')
              : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </GameShell>
  )
}
