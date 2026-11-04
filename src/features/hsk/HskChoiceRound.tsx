import { useEffect, useState } from 'react'
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useMissedWord } from '@/hooks/useMissedWord'
import type { HskChoice } from '@/lib/hskPractice'
import { exampleAudio, prefetchAudio, pronounce, stopPronounce, wordAudio } from '@/lib/audio'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// HSK practice, listening (听力, 判断对错), gap-fill (选词填空) and character
// (写汉字) questions, and pictures to judge, heard or read (lib/hskPractice.ts).
// A listening question plays its recording as it appears: the example sentence,
// or for right-or-wrong the word alone; a read question plays it once answered.
// A gap-fill shows its options with pinyin, as HSK 1–2 print it.

/** A question that is heard rather than read. */
const heard = (qn: HskChoice) => qn.kind === 'listen' || qn.kind === 'judge' || qn.kind === 'pick'
/** A right-or-wrong picture question, heard (judge) or read (look). */
const pictured = (qn: HskChoice) => qn.kind === 'judge' || qn.kind === 'look'
/** Its recording: the word alone for a picture question, else the example. */
const clip = (qn: HskChoice) =>
  pictured(qn) ? wordAudio(qn.word.id) : exampleAudio(qn.word.id, qn.word.exampleEn)

export default function HskChoiceRound({
  title,
  questions,
  onAgain,
  onExit,
  onDone,
  onAnswer,
}: {
  title: string
  questions: HskChoice[]
  onAgain: () => void
  onExit: () => void
  /** Hand the score back (the mini test) instead of showing the round's result. */
  onDone?: (correct: number, total: number) => void
  /** Each answer as it is given, for the weak-spot count. */
  onAnswer?: (kind: string, correct: boolean) => void
}) {
  const t = useT()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'zh-CN')
  const rate = useSettings((s) => s.ttsRate)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const missed = useMissedWord()
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const q = questions[idx]

  const play = (qn: HskChoice) =>
    pronounce({
      audioSrc: clip(qn),
      text: pictured(qn) ? qn.word.word : qn.word.exampleEn,
      lang,
      rate,
    })

  useEffect(() => prefetchAudio(questions.filter(heard).map(clip)), [questions])
  useEffect(() => {
    if (!q || !heard(q)) return
    const timer = window.setTimeout(() => play(q), 300)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per question
  }, [idx])
  useEffect(() => () => stopPronounce(), [])

  if (xp !== null || !q)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="🀄"
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
  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
    if (!ok) missed(q.word.id)
    onAnswer?.(q.kind, ok)
    // A read question is heard once answered: a gap-fill's sentence, a picture's word.
    if (!heard(q)) play(q)
  }
  const next = () => {
    stopPronounce()
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    if (onDone) return onDone(correct, questions.length)
    const earned = pinyinXp(correct, questions.length)
    addPlayXp(code, earned)
    setXp(earned)
  }

  const [before, after] = (q.sentence ?? '').split('___')

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
        {q.kind === 'see' ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('Đọc câu, rồi chọn tranh đúng.', 'Read the sentence, then pick its picture.')}
            </p>
            <p lang="zh" className="text-center text-2xl font-bold">
              {q.word.exampleEn.replace(/\u200b/g, '')}
            </p>
            {q.word.exampleRead && (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                {q.word.exampleRead}
              </p>
            )}
          </>
        ) : q.kind === 'look' ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('Tranh có đúng là từ này không?', 'Is the picture this word?')}
            </p>
            <p className="flex flex-col items-center">
              <span className="text-sm text-brand-600 dark:text-brand-300">{q.word.viRead}</span>
              <span lang="zh" className="text-3xl font-bold">
                {q.word.word}
              </span>
            </p>
            <p className="py-2 text-center text-7xl" role="img" aria-label={t('Tranh', 'Picture')}>
              {q.picture}
            </p>
          </>
        ) : heard(q) ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {q.kind === 'judge'
                ? t(
                    'Nghe một từ, rồi xem tranh: tranh có đúng là từ đó không?',
                    'Hear a word, then look: is the picture that word?'
                  )
                : q.kind === 'pick'
                  ? t('Nghe câu, rồi chọn tranh đúng.', 'Hear the sentence, then pick its picture.')
                  : t(
                      'Nghe câu, rồi chọn nghĩa đúng.',
                      'Hear the sentence, then pick what it means.'
                    )}
            </p>
            <button type="button" className="btn-secondary h-10 text-sm" onClick={() => play(q)}>
              <RotateCcw className="h-4 w-4" /> {t('Nghe lại', 'Play again')}
            </button>
            {q.kind === 'judge' && (
              <p
                className="py-2 text-center text-7xl"
                role="img"
                aria-label={t('Tranh', 'Picture')}
              >
                {q.picture}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {q.kind === 'char'
                ? t('Chọn chữ Hán đúng với pinyin.', 'Pick the character that matches the pinyin.')
                : t('Chọn từ điền vào chỗ trống.', 'Pick the word for the gap.')}
            </p>
            <p lang="zh" className="text-2xl font-bold leading-relaxed">
              {before}
              <span className="mx-1 inline-flex min-w-12 flex-col items-center align-bottom">
                {/* 写汉字 gives the pinyin of the missing character above the gap. */}
                {q.kind === 'char' && (
                  <span className="text-sm font-normal text-brand-600 dark:text-brand-300">
                    {q.word.viRead}
                  </span>
                )}
                <span className="w-full border-b-2 border-brand-500 text-center text-brand-700 dark:text-brand-300">
                  {answered ? q.options[q.answer] : '\u00a0'}
                </span>
              </span>
              {after}
            </p>
            {/* The meaning is always shown: another word of the same kind can fit the
                Chinese alone (我的___不太好: 数学 or 周末), never the Vietnamese. */}
            {!answered && (
              <p className="text-sm text-slate-500 dark:text-slate-400">💬 {q.word.exampleVi}</p>
            )}
          </>
        )}

        <div
          className={
            q.kind === 'listen'
              ? 'grid gap-2'
              : q.kind === 'pick' || q.kind === 'see'
                ? 'grid grid-cols-3 gap-2'
                : 'grid grid-cols-2 gap-2'
          }
        >
          {q.options.map((o, i) => {
            const state = !answered
              ? 'idle'
              : i === q.answer
                ? 'right'
                : i === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={o}
                type="button"
                onClick={() => pick(i)}
                disabled={answered}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 font-medium transition ${
                  q.kind === 'listen' ? 'justify-start text-left' : ''
                } ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {q.kind === 'pick' || q.kind === 'see' ? (
                  <span
                    className="text-5xl"
                    role="img"
                    aria-label={t(`Tranh ${i + 1}`, `Picture ${i + 1}`)}
                  >
                    {o}
                  </span>
                ) : pictured(q) ? (
                  <span>{i === 0 ? t('✓ Đúng', '✓ Right') : t('✗ Sai', '✗ Wrong')}</span>
                ) : q.kind !== 'listen' ? (
                  <span className="flex flex-col items-center">
                    <span lang="zh" className="text-xl font-bold">
                      {o}
                    </span>
                    {q.readings && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {q.readings[i]}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex-1">{o}</span>
                )}
                {state === 'right' && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5 shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>

        {answered && (
          <div
            className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"
            aria-live="polite"
          >
            <p
              className={`font-semibold ${picked === q.answer ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {picked === q.answer ? t('Đúng rồi!', 'Right!') : t('Chưa đúng.', 'Not quite.')}
            </p>
            {pictured(q) ? (
              <>
                <p className="text-slate-600 dark:text-slate-300">
                  {q.kind === 'judge' ? t('Từ nghe được', 'You heard') : t('Từ', 'The word')}:{' '}
                  <b lang="zh" className="text-lg">
                    {q.word.word}
                  </b>{' '}
                  {q.word.viRead} — {q.word.meaning} {q.word.emoji}
                </p>
                {q.pictureOf && (
                  <p className="text-slate-500 dark:text-slate-400">
                    {t('Tranh là', 'The picture is')}: {q.pictureOf.emoji}{' '}
                    <b lang="zh">{q.pictureOf.word}</b> {q.pictureOf.viRead} — {q.pictureOf.meaning}
                  </p>
                )}
              </>
            ) : (
              <>
                <p lang="zh" className="text-lg font-bold">
                  {q.word.exampleEn.replace(/\u200b/g, '')}
                </p>
                {q.word.exampleRead && (
                  <p className="text-slate-600 dark:text-slate-300">{q.word.exampleRead}</p>
                )}
                <p className="text-slate-500 dark:text-slate-400">{q.word.exampleVi}</p>
                <p className="text-slate-500 dark:text-slate-400">
                  <b lang="zh">{q.word.word}</b> {q.word.viRead} — {q.word.meaning}
                </p>
              </>
            )}
          </div>
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
