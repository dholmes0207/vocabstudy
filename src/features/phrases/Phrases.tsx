import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  LogOut,
  MessagesSquare,
  Volume2,
} from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useData } from '@/store/dataStore'
import { useStudy } from '@/store/studyStore'
import { usePhrases } from '@/store/phrasesStore'
import { useImmersive } from '@/store/uiStore'
import { useProvideContext } from '@/store/contextStore'
import { phraseAudio, prefetchAudio, pronounce } from '@/lib/audio'
import {
  buildPhraseSession,
  isKnown,
  loadPhrasePack,
  phraseXp,
  topicProgress,
  type Phrase,
  type PhrasePack,
  type PhraseQuestion,
  type PhraseTopic,
} from '@/lib/phrases'
import { placeToken, shuffledOrder, startOrder, type OrderState } from '@/lib/games'
import BuildTiles from '@/components/BuildTiles'
import { nudge, praise } from '@/lib/encourage'
import { buzz } from '@/lib/sound'
import { skyBurstAt } from '@/lib/skyEvents'
import { useT, useUiLang } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'
import { CenterSpinner } from '@/components/DataGate'
import SessionComplete from '@/components/SessionComplete'
import SpeakButton from '@/components/SpeakButton'
import ProgressRing from '@/components/ProgressRing'

// "Mẫu câu giao tiếp" (docs/design/phrases.md): everyday sentences by
// situation — hear them, understand them, put them together, say them.

/** Phrases are read in the pack's own voice (en-US, ko-KR…). */
const useTtsLang = () => useData((s) => s.pack?.meta.ttsLang ?? 'en-US')

/** The phrase pack, loaded once per visit (it is small and cached by the SW). */
function usePhrasePack(): { pack: PhrasePack | null; error: string | null } {
  const code = useSettings((s) => s.currentLang)
  const [state, setState] = useState<{ pack: PhrasePack | null; error: string | null }>({
    pack: null,
    error: null,
  })
  useEffect(() => {
    let alive = true
    loadPhrasePack(code)
      .then((pack) => alive && setState({ pack, error: null }))
      .catch((e) => alive && setState({ pack: null, error: String(e?.message ?? e) }))
    return () => {
      alive = false
    }
  }, [code])
  return state
}

function play(p: Phrase, rate: number, lang: string) {
  pronounce({ audioSrc: phraseAudio(p.id, p.en), text: p.en, lang, rate })
}

export default function Phrases() {
  const { topicId } = useParams()
  const { pack, error } = usePhrasePack()
  const t = useT()
  useProvideContext(t('Mẫu câu giao tiếp', 'Everyday phrases'))

  if (error) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="text-4xl">😕</p>
        <p className="mt-3 font-bold">{t('Không tải được mẫu câu', "Couldn't load the phrases")}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    )
  }
  if (!pack) return <CenterSpinner />

  const topic = topicId ? pack.topics.find((x) => x.id === topicId) : undefined
  if (topicId && !topic) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="font-bold">{t('Không tìm thấy chủ đề này', 'Topic not found')}</p>
        <Link to="/phrases" className="btn-primary mt-4">
          {t('Xem tất cả tình huống', 'See all situations')}
        </Link>
      </div>
    )
  }
  return topic ? <TopicView key={topic.id} topic={topic} pack={pack} /> : <TopicList pack={pack} />
}

function TopicList({ pack }: { pack: PhrasePack }) {
  const t = useT()
  const progress = usePhrases((s) => s.progress)
  const total = pack.topics.reduce((n, x) => n + x.phrases.length, 0)
  const known = pack.topics.reduce((n, x) => n + topicProgress(x, progress).known, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-aurora">{t('Mẫu câu giao tiếp', 'Everyday phrases')}</span>{' '}
            <span aria-hidden="true">💬</span>
          </h1>
          <p className="mt-1 max-w-2xl text-slate-500 dark:text-slate-400">
            {t(
              'Những câu nói dùng được ngay theo từng tình huống — nghe câu đọc mẫu, hiểu nghĩa, rồi luyện cho tới khi bật ra tự nhiên.',
              'Ready-to-use sentences for real situations — hear them read aloud, understand them, then practise until they come out naturally.'
            )}
          </p>
        </div>
        <div className="card flex items-center gap-3 px-4 py-2.5 text-sm">
          <MessagesSquare className="h-5 w-5 text-brand-500" />
          <span>
            <b className="text-lg">{known}</b>/{total} {t('câu đã thuộc', 'phrases learned')}
          </span>
        </div>
      </header>

      <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pack.topics.map((topic) => {
          const pr = topicProgress(topic, progress)
          return (
            <Link
              key={topic.id}
              to={`/phrases/${topic.id}`}
              className="card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ProgressRing value={pr.ratio} size={56} stroke={5}>
                <span className="text-2xl" aria-hidden="true">
                  {topic.emoji}
                </span>
              </ProgressRing>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{t(topic.title, topic.titleEn)}</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">
                  {pr.known}/{pr.total} {t('câu đã thuộc', 'learned')}
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function TopicView({ topic, pack }: { topic: PhraseTopic; pack: PhrasePack }) {
  const t = useT()
  const rate = useSettings((s) => s.ttsRate)
  const ttsLang = useTtsLang()
  const progress = usePhrases((s) => s.progress)
  // `round` remounts the practice for "Practise again", even with the same phrases.
  const [session, setSession] = useState<{ round: number; questions: PhraseQuestion[] } | null>(
    null
  )
  const all = useMemo(() => pack.topics.flatMap((x) => x.phrases), [pack])
  const pr = topicProgress(topic, progress)

  // Warm the cache so the first tap on each phrase plays at once.
  useEffect(() => {
    prefetchAudio(topic.phrases.map((p) => phraseAudio(p.id, p.en)))
  }, [topic])

  const start = () =>
    setSession((prev) => ({
      round: (prev?.round ?? 0) + 1,
      questions: buildPhraseSession(topic, all, usePhrases.getState().progress),
    }))

  if (session) {
    return (
      <PhrasePractice
        key={session.round}
        topic={topic}
        questions={session.questions}
        onExit={() => setSession(null)}
        onAgain={start}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <Link
        to="/phrases"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-300"
      >
        <ArrowLeft className="h-4 w-4" /> {t('Tất cả tình huống', 'All situations')}
      </Link>

      <header className="card flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-3xl shadow-md">
          {topic.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight">{t(topic.title, topic.titleEn)}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pr.known}/{pr.total} {t('câu đã thuộc', 'phrases learned')} ·{' '}
            {t('bấm vào câu để nghe', 'tap a phrase to hear it')}
          </p>
        </div>
        <button onClick={start} className="btn-primary h-11 w-full sm:w-auto">
          {t('Luyện tập', 'Practise')} <ArrowRight className="h-4 w-4" />
        </button>
      </header>

      <ul className="space-y-2.5">
        {topic.phrases.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => play(p, rate, ttsLang)}
              className="card flex w-full items-start gap-3 p-4 text-left transition hover:border-brand-300 active:scale-[0.995] dark:hover:border-brand-700"
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                <Volume2 className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold leading-snug">{p.en}</span>
                {p.read && (
                  <span className="block text-sm text-slate-600 dark:text-slate-300">{p.read}</span>
                )}
                <span className="block text-slate-500 dark:text-slate-400">{p.vi}</span>
                {p.note && (
                  <span className="mt-1.5 flex gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                    {p.note}
                  </span>
                )}
              </span>
              {isKnown(progress[p.id]) && (
                <CheckCircle2
                  className="mt-1 h-5 w-5 shrink-0 text-emerald-500"
                  aria-label={t('Đã thuộc', 'Learned')}
                />
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="text-center">
        <button onClick={start} className="btn-primary h-12 px-6">
          {t(
            `Luyện tập ${Math.min(8, topic.phrases.length)} câu`,
            `Practise ${Math.min(8, topic.phrases.length)} phrases`
          )}{' '}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function PhrasePractice({
  topic,
  questions,
  onExit,
  onAgain,
}: {
  topic: PhraseTopic
  questions: PhraseQuestion[]
  onExit: () => void
  onAgain: () => void
}) {
  useImmersive()
  const t = useT()
  const lang = useUiLang()
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const ttsLang = useTtsLang()
  const L = useTargetLang()
  const soundOn = useSettings((s) => s.soundEnabled)
  const record = usePhrases((s) => s.record)
  const addPlayXp = useStudy((s) => s.addPlayXp)

  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [order, setOrder] = useState<OrderState | null>(() => freshOrder(questions[0]))
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState<{ xp: number } | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const q = questions[idx]
  const answered = q.kind === 'build' ? !!order?.done : picked !== null
  const wasRight =
    q.kind === 'build' ? (order?.done ?? false) && order?.mistakes === 0 : picked === q.answer

  // Listening questions speak as soon as they appear.
  useEffect(() => {
    const cur = questions[idx]
    if (cur.kind !== 'meaning') return
    const timer = setTimeout(() => play(cur.phrase, rate, ttsLang), 150)
    return () => clearTimeout(timer)
  }, [idx, questions, rate, ttsLang])

  useEffect(() => {
    if (answered) nextRef.current?.focus()
  }, [answered])

  const settle = (right: boolean, el?: HTMLElement) => {
    record(q.phrase.id, right)
    if (right) {
      setCorrect((c) => c + 1)
      if (el) skyBurstAt(el, 0.6)
    }
    if (soundOn) buzz(right)
    if (q.kind !== 'meaning') play(q.phrase, rate, ttsLang)
  }

  const choose = (i: number, el: HTMLElement) => {
    if (picked !== null || q.kind === 'build') return
    setPicked(i)
    settle(i === q.answer, el)
  }

  const tap = (pos: number, el: HTMLElement): boolean => {
    if (!order || order.done) return false
    const { state, correct: ok } = placeToken(order, pos)
    setOrder(state)
    if (!ok && soundOn) buzz(false)
    if (state.done) settle(state.mistakes === 0, el)
    return ok
  }

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      setOrder(freshOrder(questions[idx + 1]))
      return
    }
    const xp = phraseXp(correct, questions.length)
    addPlayXp(code, xp)
    setFinished({ xp })
  }

  if (finished) {
    return (
      <SessionComplete
        emoji="💬"
        title={t('Xong một lượt luyện!', 'Round complete!')}
        correct={correct}
        total={questions.length}
      >
        <p className="w-full text-sm font-semibold text-brand-600 dark:text-brand-300">
          +{finished.xp} XP ⭐
        </p>
        <button className="btn-primary" onClick={onAgain}>
          {t('Luyện tiếp', 'Practise again')}
        </button>
        <button className="btn-secondary" onClick={onExit}>
          {t(`Về "${topic.title}"`, `Back to "${topic.titleEn}"`)}
        </button>
      </SessionComplete>
    )
  }

  const prompt =
    q.kind === 'meaning'
      ? t('Nghe rồi chọn nghĩa đúng', 'Listen, then pick the meaning')
      : q.kind === 'phrase'
        ? t(`Chọn câu ${L.vi} đúng`, `Pick the right ${L.en} phrase`)
        : t('Xếp các từ thành câu', 'Put the words in order')

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onExit}
          className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500 dark:text-slate-400"
          aria-label={t('Kết thúc phiên', 'End session')}
        >
          <LogOut className="h-4 w-4" /> {t('Thoát', 'Exit')}
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(idx / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {idx + 1}/{questions.length}
        </span>
      </div>

      <div className="card space-y-5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {prompt}
        </p>

        {q.kind === 'meaning' ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <button
              onClick={() => play(q.phrase, rate, ttsLang)}
              className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg transition hover:scale-105 active:scale-95"
              aria-label={t('Nghe lại', 'Play again')}
            >
              <Volume2 className="h-9 w-9" />
            </button>
            {answered && (
              <div className="text-center">
                <p className="text-xl font-semibold">{q.phrase.en}</p>
                {q.phrase.read && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">{q.phrase.read}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-xl font-semibold">{q.phrase.vi}</p>
        )}

        {q.kind === 'build' && order ? (
          <BuildTiles order={order} onTap={tap} />
        ) : q.kind !== 'build' ? (
          <div className="grid gap-2">
            {q.options.map((opt, i) => {
              const tone =
                picked === null
                  ? 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
                  : i === q.answer
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                    : i === picked
                      ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
                      : 'border-slate-200 opacity-50 dark:border-slate-700'
              return (
                <button
                  key={opt}
                  onClick={(e) => choose(i, e.currentTarget)}
                  disabled={picked !== null}
                  className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition ${tone}`}
                >
                  {opt}
                  {q.kind === 'phrase' && q.reads && (
                    <span className="block text-sm font-normal text-slate-500 dark:text-slate-400">
                      {q.reads[i]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ) : null}

        {answered && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${wasRight ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}
            aria-live="polite"
          >
            <p className="font-semibold">
              {wasRight
                ? `✓ ${praise(q.phrase.id + idx, lang)}`
                : `${t('Chưa đúng', 'Not quite')} — ${nudge(q.phrase.id + idx, lang)}`}
            </p>
            <p className="mt-1 flex items-center gap-2">
              <SpeakButton
                text={q.phrase.en}
                lang={ttsLang}
                audioSrc={phraseAudio(q.phrase.id, q.phrase.en)}
                size="sm"
              />
              <span>
                <b>{q.phrase.en}</b>
                {q.phrase.read && ` (${q.phrase.read})`} — {q.phrase.vi}
              </span>
            </p>
            {q.phrase.note && <p className="mt-1 opacity-80">💡 {q.phrase.note}</p>}
          </div>
        )}
      </div>

      {answered && (
        <div className="session-actions mt-4">
          <button ref={nextRef} onClick={next} className="btn-primary h-12 w-full">
            {idx + 1 < questions.length
              ? t('Câu tiếp theo', 'Next')
              : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

/** Shuffled word tiles for a build question (null for the other kinds). */
function freshOrder(q: PhraseQuestion): OrderState | null {
  return q.kind === 'build' ? startOrder(q.tokens, shuffledOrder(q.tokens.length)) : null
}
