import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  COLLOCATION_PACKS,
  GAP,
  collocationRound,
  collocationXp,
  filled,
  type CollocationQuestion,
  type CollocationTheme,
} from '@/lib/collocations'
import { playCorrect, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { textAudio } from '@/lib/audio'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import SpeakButton from '@/components/SpeakButton'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Kết hợp từ" (docs/design/collocations.md): English and Chinese word partners
// that word-for-word translation from Vietnamese gets wrong, by theme, each with
// the slip crossed out; then a round that fills a sentence with the right
// partner, the slip and one more wrong word on offer.

const ROUND = 10

type Code = keyof typeof COLLOCATION_PACKS

export default function Collocations() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'en' && code !== 'zh') return <PackOnly packs={['en', 'zh']} />
  return <CollocationsView code={code} />
}

function CollocationsView({ code }: { code: Code }) {
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  useDocumentTitle(`${t('Kết hợp từ', 'Collocations')} · VocaStudy`)
  const [round, setRound] = useState<{
    n: number
    theme?: CollocationTheme
    questions: CollocationQuestion[]
  } | null>(null)
  const { themes, items: all } = COLLOCATION_PACKS[code]
  const start = (theme?: CollocationTheme) =>
    setRound((r) => ({
      n: (r?.n ?? 0) + 1,
      theme,
      questions: collocationRound(ROUND, theme, Math.random, all),
    }))

  if (round)
    return (
      <Round
        key={round.n}
        questions={round.questions}
        lang={code}
        onAgain={() => start(round.theme)}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Kết hợp từ', 'Collocations')}</span>{' '}
          <span lang={code}>{code === 'zh' ? '吃药' : 'turn on the light'}</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {code === 'zh'
            ? t(
                '"Uống thuốc" tiếng Trung là 吃药 ("ăn thuốc"), "đội mũ" là 戴帽子 chứ không phải 穿, "kiếm tiền" là 挣钱 vì 找钱 là "thối tiền". Mỗi danh từ có động từ đi kèm riêng, dịch từng chữ từ tiếng Việt sẽ sai.',
                '"Uống thuốc" is 吃药 in Chinese ("eat medicine"), a hat takes 戴 not 穿, and earning money is 挣钱 because 找钱 means giving change. Each noun has its own verb, and translating word for word from Vietnamese gets it wrong.'
              )
            : t(
                '"Mở đèn" không phải "open the light", "uống thuốc" không phải "drink medicine". Từ nào đi với từ nào là thói quen của người bản xứ, dịch từng chữ từ tiếng Việt sẽ lộ ngay. IELTS chấm phần này trong tiêu chí từ vựng (Lexical Resource).',
                '"Mở đèn" isn’t "open the light", "uống thuốc" isn’t "drink medicine". Which words go together is a native habit, and translating word for word from Vietnamese gives you away. IELTS marks it under Lexical Resource.'
              )}
        </p>
      </header>

      <button type="button" className="btn-primary h-12 w-full" onClick={() => start()}>
        {t(`Thử ${ROUND} câu`, `Try ${ROUND} questions`)} <ArrowRight className="h-5 w-5" />
      </button>

      {themes.map((th) => {
        const items = all.filter((x) => x.theme === th.id)
        return (
          <section key={th.id} aria-labelledby={`col-${th.id}`} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id={`col-${th.id}`} className="text-lg font-bold">
                <span aria-hidden="true">{th.emoji}</span> {t(...th.title)}
              </h2>
              <button
                type="button"
                className="btn-secondary h-9 text-sm"
                onClick={() => start(th.id)}
              >
                {t(`Luyện ${items.length} câu`, `Practise ${items.length}`)}
              </button>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((x) => (
                <li key={x.vi} className="card flex min-w-0 items-center gap-3 p-3">
                  <SpeakButton
                    text={x.right}
                    lang={ttsLang}
                    audioSrc={textAudio(x.right)}
                    size="sm"
                  />
                  <div className="min-w-0 text-sm">
                    <p className="text-slate-500 dark:text-slate-400">{x.vi}</p>
                    <p lang={code}>
                      <b className="text-emerald-700 dark:text-emerald-300">✓ {x.right}</b>
                      {x.reading && (
                        <span className="ml-1 text-slate-500 dark:text-slate-400">{x.reading}</span>
                      )}
                    </p>
                    <p lang={code} className="text-rose-600 dark:text-rose-300">
                      ✗ <s>{x.slip}</s>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function Round({
  questions,
  lang,
  onAgain,
  onExit,
}: {
  questions: CollocationQuestion[]
  lang: Code
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
  const title = t('Kết hợp từ', 'Collocations')

  if (xp !== null)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji={correct === questions.length ? '🏆' : '🧲'}
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
  const [before, after] = item.sentence.split(GAP)

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
    const earned = collocationXp(correct, questions.length)
    addPlayXp(code, earned)
    log(code, 'collocations')
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
            {q.kind === 'pick'
              ? t('Câu nào tự nhiên hơn?', 'Which sentence sounds natural?')
              : t('Từ nào đi với cụm này?', 'Which word goes with it?')}
          </p>
          <p className="mt-2 font-semibold text-brand-700 dark:text-brand-300">{item.vi}</p>
          {q.kind === 'fill' && (
            <p lang={lang} className="mt-3 text-xl font-bold leading-relaxed">
              {before}
              <span
                className={`mx-1 inline-block min-w-16 border-b-2 px-1 ${
                  answered
                    ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-400'
                }`}
              >
                {answered ? item.answer : ' '}
              </span>
              {after}
            </p>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-3 ${q.kind === 'pick' ? '' : 'sm:grid-cols-3'}`}>
          {q.options.map((label, i) => {
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
                lang={lang}
                onClick={() => pick(i)}
                disabled={answered}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-center font-semibold transition ${q.kind === 'pick' ? 'text-base' : 'text-lg'} ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {label}
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
              <SpeakButton
                text={filled(item)}
                lang={ttsLang}
                audioSrc={textAudio(filled(item))}
                size="sm"
              />
              <p lang={lang}>
                <b className="text-emerald-700 dark:text-emerald-300">✓ {item.right}</b>
                {item.reading && (
                  <span className="ml-1 text-slate-500 dark:text-slate-400">{item.reading}</span>
                )}
                <span className="mx-2 text-slate-400">·</span>
                <span className="text-rose-600 dark:text-rose-300">
                  ✗ <s>{item.slip}</s>
                </span>
              </p>
            </div>
            <p>{item.why}</p>
          </div>
        )}
      </div>

      {answered && (
        <div className="session-actions mt-4">
          <button className="btn-primary h-12 w-full" onClick={next} autoFocus>
            {idx + 1 < questions.length ? t('Câu tiếp', 'Next') : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </GameShell>
  )
}
