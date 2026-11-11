import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  HAN_VIET_TRAPS,
  trapRound,
  trapXp,
  type HanVietTrap,
  type TrapQuestion,
} from '@/lib/hanVietTraps'
import { playCorrect, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { textAudio } from '@/lib/audio'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import SpeakButton from '@/components/SpeakButton'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Bẫy Hán Việt" (docs/design/han-viet-traps.md): Chinese words whose
// Sino-Vietnamese reading suggests the wrong meaning (大家 = "đại gia", yet it
// means everyone), then a round where that wrong meaning is always an option.

const ROUND = 10

export default function HanVietTraps() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'zh') return <PackOnly packs={['zh']} />
  return <HanVietTrapsView />
}

function HanVietTrapsView() {
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  useDocumentTitle(`${t('Bẫy Hán Việt', 'Hán Việt traps')} · VocaStudy`)
  const [round, setRound] = useState<{ n: number; questions: TrapQuestion[] } | null>(null)
  const start = () => setRound((r) => ({ n: (r?.n ?? 0) + 1, questions: trapRound(ROUND) }))

  if (round)
    return (
      <Round
        key={round.n}
        questions={round.questions}
        onAgain={start}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Bẫy Hán Việt', 'Hán Việt traps')}</span>{' '}
          <span lang="zh">大家 ≠ đại gia</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Âm Hán Việt giúp người Việt đoán nghĩa chữ Hán rất nhanh, nhưng có những từ đánh lừa: 大家 đọc là "đại gia" mà nghĩa là "mọi người", 便宜 là "tiện nghi" mà nghĩa là "rẻ". Xem nghĩa thật của từng từ rồi thử một lượt: nghĩa "bẫy" luôn nằm trong các lựa chọn.',
            'Sino-Vietnamese sounds let Vietnamese learners guess Chinese words fast, but some words mislead: 大家 reads "đại gia" (a tycoon) yet means "everyone", 便宜 reads "tiện nghi" (comfortable) yet means "cheap". See what each really means, then try a round: the trap is always among the options.'
          )}
        </p>
      </header>

      <button type="button" className="btn-primary h-12 w-full" onClick={start}>
        {t(`Thử ${ROUND} câu`, `Try ${ROUND} questions`)} <ArrowRight className="h-5 w-5" />
      </button>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {HAN_VIET_TRAPS.map((it) => (
          <li key={it.zh} className="card min-w-0 space-y-2 p-4">
            <div className="flex items-center gap-3">
              <SpeakButton text={it.zh} lang={ttsLang} audioSrc={textAudio(it.zh)} size="sm" />
              <div className="min-w-0">
                <p lang="zh" className="text-2xl font-extrabold">
                  {it.zh}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{it.pinyin}</p>
              </div>
            </div>
            <p className="text-sm">
              <b className="text-brand-700 dark:text-brand-300">{it.hv}</b>{' '}
              <span className="text-slate-400 line-through dark:text-slate-500">
                {t(...it.trap)}
              </span>
            </p>
            <p className="text-sm font-semibold">→ {t(...it.meaning)}</p>
            <details className="text-sm text-slate-600 dark:text-slate-300">
              <summary className="cursor-pointer font-medium">{t('Ví dụ', 'Example')}</summary>
              <Example item={it} />
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The word in a sentence. */
function Example({ item }: { item: HanVietTrap }) {
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  const ex = item.example
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-start gap-2">
        <SpeakButton text={ex.zh} lang={ttsLang} audioSrc={textAudio(ex.zh)} size="sm" />
        <div className="min-w-0">
          <p lang="zh" className="font-semibold text-slate-900 dark:text-slate-100">
            {ex.zh}
          </p>
          <p>{ex.pinyin}</p>
          <p className="text-slate-500 dark:text-slate-400">{ex.vi}</p>
        </div>
      </div>
    </div>
  )
}

function Round({
  questions,
  onAgain,
  onExit,
}: {
  questions: TrapQuestion[]
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
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const title = t('Bẫy Hán Việt', 'Hán Việt traps')

  if (xp !== null)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji={correct === questions.length ? '🏆' : '🪤'}
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
  const { item } = q
  const answered = picked !== null
  const right = picked === q.answer
  const trapped = picked === q.trapAt
  const labels = q.options.map((o) => t(...o))

  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
  }
  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const earned = trapXp(correct, questions.length)
    addPlayXp(code, earned)
    log(code, 'hanviet-traps')
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
            {t('Trong tiếng Trung, từ này nghĩa là gì?', 'What does this word mean in Chinese?')}
          </p>
          <p lang="zh" className="mt-3 text-4xl font-extrabold tracking-wider">
            {item.zh}
          </p>
          <p className="mt-2 font-semibold text-brand-700 dark:text-brand-300">
            {item.pinyin} · {item.hv}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {labels.map((label, i) => {
            const state = !answered
              ? 'idle'
              : i === q.answer
                ? 'right'
                : i === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={label}
                type="button"
                onClick={() => pick(i)}
                disabled={answered}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-center font-semibold transition ${'text-sm'} ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <span>{label}</span>
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
              {right
                ? t('Đúng rồi, không dính bẫy!', 'Right, you dodged the trap!')
                : trapped
                  ? t('Dính bẫy Hán Việt rồi!', 'Caught by the trap!')
                  : t('Chưa đúng.', 'Not quite.')}
            </p>
            <p>
              {t(
                `Đọc Hán Việt là "${item.hv}", dễ tưởng là "${item.trap[0]}", nhưng trong tiếng Trung nghĩa là "${item.meaning[0]}".`,
                `It reads "${item.hv}" in Hán Việt, which suggests "${item.trap[1]}", but in Chinese it means "${item.meaning[1]}".`
              )}
            </p>
            <div className="flex items-center gap-3">
              <SpeakButton text={item.zh} lang={ttsLang} audioSrc={textAudio(item.zh)} size="sm" />
              <p>
                <b lang="zh" className="text-lg">
                  {item.zh}
                </b>{' '}
                {item.pinyin} · {t(...item.meaning)}
              </p>
            </div>
            <Example item={item} />
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
