import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  CONFUSABLES,
  GAP,
  confusableRound,
  confusableXp,
  filled,
  type ConfusableQuestion,
} from '@/lib/confusables'
import { playCorrect, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { textAudio } from '@/lib/audio'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import SpeakButton from '@/components/SpeakButton'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Chữ dễ nhầm" (docs/design/confusables.md): the groups of Chinese characters
// that sound or look alike, each with how to tell them apart, then sentences
// with a gap: which one goes there?

const ROUND = 10

export default function Confusables() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'zh') return <PackOnly packs={['zh']} />
  return <ConfusablesView />
}

function ConfusablesView() {
  const t = useT()
  useDocumentTitle(`${t('Chữ dễ nhầm', 'Look-alike characters')} · VocaStudy`)
  const [round, setRound] = useState<{
    n: number
    only?: string
    questions: ConfusableQuestion[]
  } | null>(null)
  const start = (only?: string) =>
    setRound((r) => ({ n: (r?.n ?? 0) + 1, only, questions: confusableRound(ROUND, only) }))

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
          <span className="text-aurora">{t('Chữ dễ nhầm', 'Look-alike characters')}</span>{' '}
          <span lang="zh">在 · 再</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Nhiều chữ đọc y hệt nhau (在 và 再 đều là zài) hoặc trông gần giống (买 và 卖). Nghe thì không phân biệt được, phải nhìn nghĩa trong câu. Học mẹo của từng nhóm rồi thử điền chữ.',
            'Many characters sound exactly alike (在 and 再 are both zài) or look nearly the same (买 and 卖). Your ear can’t tell them apart; the sentence can. Learn each group’s trick, then fill the gaps.'
          )}
        </p>
      </header>

      <button type="button" className="btn-primary h-12 w-full" onClick={() => start()}>
        {t(`Trộn ${ROUND} câu`, `Mixed round: ${ROUND} sentences`)}{' '}
        <ArrowRight className="h-5 w-5" />
      </button>

      <ul className="grid gap-3 sm:grid-cols-2">
        {CONFUSABLES.map((g) => (
          <li key={g.id} className="card flex flex-col gap-3 p-4">
            <p className="flex flex-wrap items-center gap-2">
              <span aria-hidden="true">{g.emoji}</span>
              {g.chars.map((c) => (
                <span
                  key={c.ch}
                  className="rounded-xl bg-slate-100 px-2 py-1 text-sm dark:bg-slate-800"
                >
                  <b lang="zh" className="text-xl">
                    {c.ch}
                  </b>{' '}
                  {c.pinyin} · {c.vi}
                </span>
              ))}
            </p>
            <p className="flex-1 text-sm text-slate-600 dark:text-slate-300">{t(...g.rule)}</p>
            <button
              type="button"
              className="btn-secondary h-10 text-sm"
              onClick={() => start(g.id)}
            >
              {t('Luyện nhóm này', 'Practise this group')}
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
  questions: ConfusableQuestion[]
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
  const title = t('Chữ dễ nhầm', 'Look-alike characters')

  if (xp !== null)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji={correct === questions.length ? '🏆' : '🔍'}
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

  const { group, sentence } = questions[idx]
  const answered = picked !== null
  const [before, after] = sentence.zh.split(GAP)
  const whole = filled(sentence)

  const pick = (ch: string) => {
    if (answered) return
    setPicked(ch)
    const ok = ch === sentence.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
  }
  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const earned = confusableXp(correct, questions.length)
    addPlayXp(code, earned)
    log(code, 'confusables')
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
            {t('Chữ nào điền vào chỗ trống?', 'Which character fills the gap?')}
          </p>
          <p lang="zh" className="mt-3 text-3xl font-extrabold leading-relaxed">
            {before}
            <span
              className={`mx-1 inline-block min-w-[1.6em] rounded-lg border-b-4 px-1 ${
                !answered
                  ? 'border-brand-400'
                  : picked === sentence.answer
                    ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-rose-500 text-rose-700 dark:text-rose-300'
              }`}
            >
              {answered ? sentence.answer : ' '}
            </span>
            {after}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{sentence.vi}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {group.chars.map((c) => {
            const state = !answered
              ? 'idle'
              : c.ch === sentence.answer
                ? 'right'
                : c.ch === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={c.ch}
                type="button"
                onClick={() => pick(c.ch)}
                disabled={answered}
                aria-label={`${c.ch} ${c.pinyin}`}
                className={`flex flex-col items-center justify-center rounded-xl border-2 py-3 transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <span lang="zh" className="flex items-center gap-1 text-3xl font-bold">
                  {c.ch}
                  {state === 'right' && <Check className="h-5 w-5" aria-hidden="true" />}
                  {state === 'wrong' && <X className="h-5 w-5" aria-hidden="true" />}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {c.pinyin}
                  {answered && ` · ${c.vi}`}
                </span>
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
              className={`font-semibold ${picked === sentence.answer ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {picked === sentence.answer
                ? t('Đúng rồi!', 'Right!')
                : t('Chưa đúng.', 'Not quite.')}
            </p>
            <div className="flex items-center gap-3">
              <SpeakButton text={whole} lang={ttsLang} audioSrc={textAudio(whole)} size="sm" />
              <div>
                <p lang="zh" className="text-lg font-bold">
                  {whole}
                </p>
                <p className="text-slate-600 dark:text-slate-300">{sentence.pinyin}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300">💡 {t(...group.rule)}</p>
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
