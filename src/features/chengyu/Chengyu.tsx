import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  CHENGYU,
  GAP,
  chengyuRound,
  chengyuXp,
  withGap,
  type Chengyu as Idiom,
  type ChengyuQuestion,
} from '@/lib/chengyu'
import { playCorrect, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { textAudio } from '@/lib/audio'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import SpeakButton from '@/components/SpeakButton'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Thành ngữ" (docs/design/chengyu.md): four-character idioms through their
// Sino-Vietnamese sounds, then a round that asks what one means or which
// character is missing.

const ROUND = 10

export default function Chengyu() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'zh') return <PackOnly packs={['zh']} />
  return <ChengyuView />
}

function ChengyuView() {
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  useDocumentTitle(`${t('Thành ngữ', 'Chinese idioms')} · VocaStudy`)
  const [round, setRound] = useState<{ n: number; questions: ChengyuQuestion[] } | null>(null)
  const start = () => setRound((r) => ({ n: (r?.n ?? 0) + 1, questions: chengyuRound(ROUND) }))

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
          <span className="text-aurora">{t('Thành ngữ', 'Chinese idioms')}</span>{' '}
          <span lang="zh">成语</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Thành ngữ bốn chữ là "đặc sản" của tiếng Trung, và người Việt đã biết sẵn khá nhiều: 半信半疑 đọc Hán Việt là "bán tín bán nghi". Đọc âm Hán Việt để đoán nghĩa, nghe chuyện kể đằng sau, rồi thử một lượt.',
            'Four-character idioms are a Chinese speciality, and Vietnamese already has many of them: 半信半疑 reads "bán tín bán nghi" in Sino-Vietnamese. Use those sounds to guess the meaning, hear the fables behind some, then try a round.'
          )}
        </p>
      </header>

      <button type="button" className="btn-primary h-12 w-full" onClick={start}>
        {t(`Thử ${ROUND} câu`, `Try ${ROUND} questions`)} <ArrowRight className="h-5 w-5" />
      </button>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CHENGYU.map((it) => (
          <li key={it.id} className="card min-w-0 space-y-2 p-4">
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
              <b className="text-brand-700 dark:text-brand-300">{it.hv}</b> · {t(...it.meaning)}
            </p>
            <details className="text-sm text-slate-600 dark:text-slate-300">
              <summary className="cursor-pointer font-medium">
                {it.story ? t('Ví dụ & chuyện kể', 'Example & fable') : t('Ví dụ', 'Example')}
              </summary>
              <Example item={it} />
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The idiom in a sentence, and the fable behind it when there is one. */
function Example({ item }: { item: Idiom }) {
  const t = useT()
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
      {item.story && <p>📖 {t(...item.story)}</p>}
    </div>
  )
}

function Round({
  questions,
  onAgain,
  onExit,
}: {
  questions: ChengyuQuestion[]
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
  const title = t('Thành ngữ', 'Chinese idioms')

  if (xp !== null)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji={correct === questions.length ? '🏆' : '🐉'}
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
  const labels =
    q.kind === 'meaning'
      ? q.options.map((o) => t(...o))
      : q.kind === 'missing'
        ? q.options.map((o) => `${o.ch} · ${o.hv}`)
        : q.options.map((o) => o.zh)
  // Options in characters: a missing character, or a whole idiom.
  const zhOptions = q.kind !== 'meaning'

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
    const earned = chengyuXp(correct, questions.length)
    addPlayXp(code, earned)
    log(code, 'chengyu')
    if (correct === questions.length) celebrate(1.2)
    setXp(earned)
  }

  // A missing character hides its Hán Việt syllable too, so the meaning has to lead.
  const hv =
    q.kind === 'missing'
      ? item.hv
          .split(' ')
          .map((s, i) => (i === q.at && !answered ? GAP : s))
          .join(' ')
      : item.hv

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
            {q.kind === 'meaning'
              ? t('Thành ngữ này nghĩa là gì?', 'What does this idiom mean?')
              : q.kind === 'missing'
                ? t('Chữ nào còn thiếu?', 'Which character is missing?')
                : t('Thành ngữ nào hợp với câu này?', 'Which idiom fits this sentence?')}
          </p>
          {q.kind === 'fill' ? (
            <>
              <p lang="zh" className="mt-3 text-2xl font-bold leading-relaxed">
                {answered ? item.example.zh : q.sentence}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.example.vi}</p>
            </>
          ) : (
            <>
              <p lang="zh" className="mt-3 text-4xl font-extrabold tracking-wider">
                {q.kind === 'missing' && !answered ? withGap(item, q.at) : item.zh}
              </p>
              <p className="mt-2 font-semibold text-brand-700 dark:text-brand-300">{hv}</p>
            </>
          )}
          {q.kind === 'missing' && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(...item.meaning)}</p>
          )}
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
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-center font-semibold transition ${
                  zhOptions ? 'text-xl' : 'text-sm'
                } ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <span lang={zhOptions ? 'zh' : undefined}>{label}</span>
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
