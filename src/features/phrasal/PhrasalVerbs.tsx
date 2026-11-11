import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  GAP,
  PARTICLES,
  answerOf,
  filled,
  phrasalRound,
  phrasalXp,
  type PhrasalQuestion,
} from '@/lib/phrasalVerbs'
import { playCorrect, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { textAudio } from '@/lib/audio'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import SpeakButton from '@/components/SpeakButton'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Cụm động từ" (docs/design/phrasal-verbs.md): English phrasal verbs by
// their particle, each particle with the sense it adds, then sentences with
// the particle missing: up, out, off, on, down or back?

const ROUND = 12

export default function PhrasalVerbs() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'en') return <PackOnly packs={['en']} />
  return <PhrasalView />
}

function PhrasalView() {
  const t = useT()
  useDocumentTitle(`${t('Cụm động từ', 'Phrasal verbs')} · VocaStudy`)
  const [round, setRound] = useState<{
    n: number
    only?: string
    questions: PhrasalQuestion[]
  } | null>(null)
  const start = (only?: string) =>
    setRound((r) => ({ n: (r?.n ?? 0) + 1, only, questions: phrasalRound(ROUND, only) }))

  if (round)
    return (
      <Round
        key={round.n}
        questions={round.questions}
        onAgain={() => start(round.only)}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Cụm động từ', 'Phrasal verbs')}</span>{' '}
          <span lang="en">give up · turn off</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Give up, turn off, pick up… có mặt khắp nơi trong hội thoại, TOEIC và IELTS. Mẹo: tiểu từ phía sau có nghĩa riêng. "up" thường là làm tới cùng, "off" là rời đi hoặc tắt, "back" là trở lại. Nắm nghĩa tiểu từ thì đoán được cả cụm.',
            'Give up, turn off, pick up… are everywhere in conversation, TOEIC and IELTS. The trick: the little word at the end has a meaning of its own. "up" is often all the way, "off" is away or stopped, "back" is returning. Know the particle and you can guess the verb.'
          )}
        </p>
      </header>

      <button type="button" className="btn-primary h-12 w-full" onClick={() => start()}>
        {t(`Trộn ${ROUND} câu`, `Mixed round: ${ROUND} sentences`)}{' '}
        <ArrowRight className="h-5 w-5" />
      </button>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PARTICLES.map((p) => (
          <li key={p.id} className="card flex min-w-0 flex-col gap-3 p-4">
            <p className="flex items-center gap-2 text-xl font-extrabold" lang="en">
              <span aria-hidden="true">{p.emoji}</span> {p.id.toUpperCase()}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t(...p.sense)}</p>
            <ul className="flex-1 space-y-1 text-sm">
              {p.verbs.map((v) => (
                <li key={v.verb}>
                  <b lang="en">{v.verb}</b>{' '}
                  <span className="text-slate-500 dark:text-slate-400">· {t(...v.meaning)}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-secondary h-10 text-sm"
              onClick={() => start(p.id)}
            >
              {t(`Luyện riêng "${p.id}"`, `Practise "${p.id}"`)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Round({
  questions,
  onAgain,
  onExit,
}: {
  questions: PhrasalQuestion[]
  onAgain: () => void
  onExit: () => void
}) {
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const title = t('Cụm động từ', 'Phrasal verbs')

  if (xp !== null)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji={correct === questions.length ? '🏆' : '🧩'}
          title={t('Xong một lượt!', 'Round complete!')}
          lines={[
            t(`Đúng ${correct}/${questions.length} câu`, `${correct} of ${questions.length} right`),
          ]}
          xp={xp}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const q = questions[idx]
  const answer = answerOf(q)
  const answered = picked !== null
  const right = picked === answer
  const [before, after] = q.item.sentence.split(GAP)
  const whole = filled(q)

  const pick = (id: string) => {
    if (answered) return
    setPicked(id)
    const ok = id === answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
  }
  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const earned = phrasalXp(correct, questions.length)
    addPlayXp(code, earned)
    log(code, 'phrasal')
    if (correct === questions.length) celebrate(1.2)
    setXp(earned)
  }

  return (
    <GameShell
      title={title}
      stats={
        <span>
          {idx + 1}/{questions.length}
        </span>
      }
      onExit={onExit}
    >
      <div className="card space-y-5 p-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('Tiểu từ nào điền vào chỗ trống?', 'Which particle fills the gap?')}
          </p>
          <p lang="en" className="mt-3 text-2xl font-bold leading-relaxed">
            {before}
            <span
              className={`mx-1 inline-block min-w-[2.5em] rounded-lg border-b-4 px-1 ${
                !answered
                  ? 'border-brand-400'
                  : right
                    ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-rose-500 text-rose-700 dark:text-rose-300'
              }`}
            >
              {answered ? answer : ' '}
            </span>
            {after}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{q.item.vi}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {q.options.map((id) => {
            const state = !answered
              ? 'idle'
              : id === answer
                ? 'right'
                : id === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={id}
                type="button"
                onClick={() => pick(id)}
                disabled={answered}
                lang="en"
                className={`flex h-12 items-center justify-center gap-1 rounded-xl border-2 text-lg font-bold transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {id}
                {state === 'right' && <Check className="h-5 w-5" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5" aria-hidden="true" />}
              </button>
            )
          })}
        </div>

        {answered && (
          <div
            className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60"
            aria-live="polite"
          >
            <p
              className={`font-semibold ${right ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {right ? t('Đúng rồi!', 'Right!') : t('Chưa đúng.', 'Not quite.')}
            </p>
            <div className="flex items-center gap-3">
              <SpeakButton text={whole} lang={ttsLang} audioSrc={textAudio(whole)} size="sm" />
              <p>
                <b lang="en">{q.item.verb}</b> · {t(...q.item.meaning)}
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              {q.particle.emoji} <b lang="en">{answer}</b>: {t(...q.particle.sense)}
            </p>
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
