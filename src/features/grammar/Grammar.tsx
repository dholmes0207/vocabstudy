import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, LogOut, XCircle } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useGrammar } from '@/store/grammarStore'
import { useImmersive } from '@/store/uiStore'
import {
  PASS_SCORE,
  buildGrammarRound,
  grammarXp,
  isPassed,
  loadGrammarPack,
  type GrammarExercise,
  type GrammarPack,
  type GrammarUnit,
} from '@/lib/grammar'
import { placeToken, shuffledOrder, startOrder, tokenize, type OrderState } from '@/lib/games'
import { nudge, praise } from '@/lib/encourage'
import { buzz } from '@/lib/sound'
import { skyBurstAt } from '@/lib/skyEvents'
import { useT, useUiLang } from '@/lib/i18n'
import { CenterSpinner } from '@/components/DataGate'
import SessionComplete from '@/components/SessionComplete'
import SpeakButton from '@/components/SpeakButton'
import BuildTiles from '@/components/BuildTiles'

// "Ngữ pháp căn bản" (docs/design/grammar.md): twelve short units — the rule in
// plain Vietnamese, the pattern, examples to listen to, the mistakes Vietnamese
// learners usually make, then a round of practice.

/** Examples are read in the pack's own voice (en-US, ko-KR…). */
const useTtsLang = () => useData((s) => s.pack?.meta.ttsLang ?? 'en-US')

function useGrammarPack(): { pack: GrammarPack | null; error: string | null } {
  const code = useSettings((s) => s.currentLang)
  const [state, setState] = useState<{ pack: GrammarPack | null; error: string | null }>({
    pack: null,
    error: null,
  })
  useEffect(() => {
    let alive = true
    loadGrammarPack(code)
      .then((pack) => alive && setState({ pack, error: null }))
      .catch((e) => alive && setState({ pack: null, error: String(e?.message ?? e) }))
    return () => {
      alive = false
    }
  }, [code])
  return state
}

export default function Grammar() {
  const t = useT()
  const { unitId } = useParams()
  const { pack, error } = useGrammarPack()
  if (error)
    return (
      <p className="card p-6 text-slate-500">
        {t(
          'Ngôn ngữ này chưa có bài ngữ pháp.',
          'There are no grammar lessons for this language yet.'
        )}
      </p>
    )
  if (!pack) return <CenterSpinner />
  const unit = unitId ? pack.units.find((u) => u.id === unitId) : undefined
  if (unitId && !unit)
    return (
      <p className="card p-6">
        {t('Không tìm thấy bài này.', 'This lesson was not found.')}{' '}
        <Link to="/grammar" className="font-medium text-brand-600 dark:text-brand-300">
          {t('Về danh sách bài', 'Back to the lessons')}
        </Link>
      </p>
    )
  return unit ? <UnitView key={unit.id} unit={unit} /> : <UnitList pack={pack} />
}

function UnitList({ pack }: { pack: GrammarPack }) {
  const t = useT()
  const progress = useGrammar((s) => s.progress)
  const passed = pack.units.filter((u) => isPassed(progress[u.id])).length
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Ngữ pháp căn bản', 'Grammar basics')}</span>{' '}
          <span aria-hidden="true">📐</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            `Những cấu trúc dùng hằng ngày, giải thích bằng tiếng Việt dễ hiểu. Đạt ${PASS_SCORE}% là xong một bài — đã xong ${passed}/${pack.units.length} bài.`,
            `The structures you use every day, explained simply. Score ${PASS_SCORE}% to complete a lesson — ${passed}/${pack.units.length} done.`
          )}
        </p>
      </header>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pack.units.map((u, i) => {
          const rec = progress[u.id]
          return (
            <li key={u.id} className="min-w-0">
              <Link
                to={`/grammar/${u.id}`}
                className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-2xl dark:bg-brand-950"
                  aria-hidden="true"
                >
                  {u.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-400">
                    {t(`Bài ${i + 1}`, `Lesson ${i + 1}`)} · {u.level}
                  </span>
                  <span className="block font-bold">{t(...u.title)}</span>
                  <span className="block truncate text-sm text-slate-500">{t(...u.summary)}</span>
                </span>
                {isPassed(rec) ? (
                  <CheckCircle2
                    className="h-6 w-6 shrink-0 text-emerald-500"
                    aria-label={t('Đã xong', 'Done')}
                  />
                ) : rec ? (
                  <span className="shrink-0 text-sm font-bold tabular-nums text-slate-400">
                    {rec.best}%
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function UnitView({ unit }: { unit: GrammarUnit }) {
  const t = useT()
  const ttsLang = useTtsLang()
  const rec = useGrammar((s) => s.progress[unit.id])
  const [round, setRound] = useState<{ n: number; items: GrammarExercise[] } | null>(null)

  if (round)
    return (
      <Practice
        key={round.n}
        unit={unit}
        items={round.items}
        onExit={() => setRound(null)}
        onAgain={() => setRound({ n: round.n + 1, items: buildGrammarRound(unit) })}
      />
    )

  return (
    <article className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <Link
        to="/grammar"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> {t('Tất cả bài', 'All lessons')}
      </Link>
      <header>
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">
          {unit.emoji} {unit.level}
          {rec && ` · ${t('Điểm cao nhất', 'Best score')} ${rec.best}%`}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{t(...unit.title)}</h1>
        <p className="mt-1 text-slate-500">{t(...unit.summary)}</p>
      </header>

      <section className="card p-5">
        <h2 className="font-bold">{t('Cách dùng', 'How it works')}</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700 marker:text-brand-400 dark:text-slate-200">
          {unit.explain.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="font-bold">{t('Công thức', 'Pattern')}</h2>
        <ul className="mt-2 space-y-1.5">
          {unit.patterns.map((p) => (
            <li
              key={p}
              className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm dark:bg-slate-800"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="font-bold">{t('Ví dụ', 'Examples')}</h2>
        <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
          {unit.examples.map((ex) => (
            <li key={ex.en} className="flex items-start gap-3 py-2.5">
              <SpeakButton text={ex.en} lang={ttsLang} size="sm" />
              <span>
                <span className="block font-semibold">{ex.en}</span>
                <span className="text-sm text-slate-500">{ex.vi}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="font-bold">{t('Lỗi người Việt hay gặp', 'Common mistakes')}</h2>
        <ul className="mt-2 space-y-3">
          {unit.mistakes.map((m) => (
            <li key={m.wrong} className="text-sm">
              <p className="flex items-start gap-2 text-rose-600 dark:text-rose-300">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="line-through">{m.wrong}</span>
              </p>
              <p className="flex items-start gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {m.right}
              </p>
              <p className="ml-6 text-slate-500">{m.why}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* In the page flow, not the sticky session bar: the bottom nav is still here. */}
      <div>
        <button
          className="btn-primary h-12 w-full"
          onClick={() => setRound({ n: 0, items: buildGrammarRound(unit) })}
        >
          <GraduationCap className="h-5 w-5" />
          {t(`Luyện tập (${unit.exercises.length} câu)`, `Practise (${unit.exercises.length})`)}
        </button>
      </div>
    </article>
  )
}

const freshOrder = (e: GrammarExercise): OrderState | null =>
  e.type === 'order' ? startOrder(tokenize(e.en), shuffledOrder(tokenize(e.en).length)) : null

function Practice({
  unit,
  items,
  onExit,
  onAgain,
}: {
  unit: GrammarUnit
  items: GrammarExercise[]
  onExit: () => void
  onAgain: () => void
}) {
  useImmersive()
  const t = useT()
  const ttsLang = useTtsLang()
  const lang = useUiLang()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const record = useGrammar((s) => s.record)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [order, setOrder] = useState<OrderState | null>(() => freshOrder(items[0]))
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState<{ xp: number; score: number } | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const q = items[idx]
  const answered = q.type === 'order' ? !!order?.done : picked !== null
  const wasRight =
    q.type === 'order' ? (order?.done ?? false) && order?.mistakes === 0 : picked === q.answer

  useEffect(() => {
    if (answered) nextRef.current?.focus()
  }, [answered])

  const settle = (right: boolean, el?: HTMLElement) => {
    if (right) {
      setCorrect((c) => c + 1)
      if (el) skyBurstAt(el, 0.6)
    }
    if (soundOn) buzz(right)
  }

  const choose = (i: number, el: HTMLElement) => {
    if (picked !== null || q.type !== 'choice') return
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
    if (idx + 1 < items.length) {
      setIdx(idx + 1)
      setPicked(null)
      setOrder(freshOrder(items[idx + 1]))
      return
    }
    record(unit.id, correct, items.length)
    const xp = grammarXp(correct, items.length)
    addPlayXp(code, xp)
    setFinished({ xp, score: Math.round((correct / items.length) * 100) })
  }

  if (finished)
    return (
      <SessionComplete
        emoji={finished.score >= PASS_SCORE ? '🎓' : '💪'}
        title={
          finished.score >= PASS_SCORE
            ? t('Xong bài rồi!', 'Lesson complete!')
            : t('Gần được rồi!', 'Almost there!')
        }
        correct={correct}
        total={items.length}
      >
        <p className="w-full text-sm font-semibold text-brand-600 dark:text-brand-300">
          +{finished.xp} XP ⭐
        </p>
        {finished.score < PASS_SCORE && (
          <p className="w-full text-sm text-slate-500">
            {t(
              `Đạt ${PASS_SCORE}% để hoàn thành bài — xem lại ví dụ rồi thử lần nữa nhé.`,
              `Score ${PASS_SCORE}% to complete the lesson — look at the examples again, then retry.`
            )}
          </p>
        )}
        <button className="btn-primary" onClick={onAgain}>
          {t('Luyện lại', 'Practise again')}
        </button>
        <button className="btn-secondary" onClick={onExit}>
          {t('Về bài học', 'Back to the lesson')}
        </button>
      </SessionComplete>
    )

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onExit}
          className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500"
          aria-label={t('Kết thúc phiên', 'End session')}
        >
          <LogOut className="h-4 w-4" /> {t('Thoát', 'Exit')}
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(idx / items.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {idx + 1}/{items.length}
        </span>
      </div>

      <div className="card space-y-5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {q.type === 'choice'
            ? t('Chọn từ đúng cho chỗ trống', 'Pick the word for the gap')
            : t('Xếp các từ thành câu', 'Put the words in order')}
        </p>

        {q.type === 'choice' ? (
          <>
            <p className="text-center text-xl font-semibold">
              {answered ? q.prompt.replace('___', q.options[q.answer]) : q.prompt}
            </p>
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
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-lg font-semibold">{q.vi}</p>
            {order && <BuildTiles order={order} onTap={tap} />}
          </>
        )}

        {answered && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${wasRight ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}
            aria-live="polite"
          >
            <p className="font-semibold">
              {wasRight
                ? `✓ ${praise(idx, lang)}`
                : `${t('Chưa đúng', 'Not quite')} — ${nudge(idx, lang)}`}
            </p>
            {q.type === 'choice' && q.explain && <p className="mt-1">💡 {q.explain}</p>}
            {q.type === 'order' && (
              <p className="mt-1 flex items-center gap-2">
                <SpeakButton text={q.en} lang={ttsLang} size="sm" />
                <b>{q.en}</b>
              </p>
            )}
          </div>
        )}
      </div>

      {answered && (
        <div className="session-actions mt-4">
          <button ref={nextRef} onClick={next} className="btn-primary h-12 w-full">
            {idx + 1 < items.length ? t('Câu tiếp theo', 'Next') : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
