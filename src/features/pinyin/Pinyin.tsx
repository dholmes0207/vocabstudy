import { useMemo, useState } from 'react'
import { ArrowRight, LogOut, Volume2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useImmersive } from '@/store/uiStore'
import { pronounce } from '@/lib/audio'
import { buzz } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import {
  INITIALS,
  SANDHI,
  TONES,
  TRICKY_FINALS,
  pinyinQuiz,
  pinyinXp,
  type PinyinQuestion,
  type Sound,
} from '@/lib/pinyin'
import SessionComplete from '@/components/SessionComplete'

// "Pinyin & thanh điệu" (docs/design/chinese.md): the tones and sounds a
// Vietnamese beginner needs before any Chinese word, then a quick check.

const TTS_LANG = 'zh-CN'
const QUIZ_SIZE = 10

function useSay() {
  const rate = useSettings((s) => s.ttsRate)
  return (text: string) => pronounce({ text, lang: TTS_LANG, rate })
}

export default function Pinyin() {
  const t = useT()
  const words = useData((s) => s.pack?.words)
  const [quiz, setQuiz] = useState<{ n: number; questions: PinyinQuestion[] } | null>(null)
  const start = () =>
    setQuiz((q) => ({ n: (q?.n ?? 0) + 1, questions: pinyinQuiz(words ?? [], QUIZ_SIZE) }))

  if (quiz)
    return (
      <Quiz key={quiz.n} questions={quiz.questions} onExit={() => setQuiz(null)} onAgain={start} />
    )

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Pinyin & thanh điệu', 'Pinyin & tones')}</span>{' '}
          <span aria-hidden="true">🎵</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            'Pinyin ghi cách đọc chữ Hán bằng chữ Latin: phụ âm đầu + vần + thanh điệu. Tiếng Việt cũng có thanh, nên bạn đã có lợi thế — chỉ cần nghe ra 4 thanh và thanh nhẹ.',
            'Pinyin spells how a character is read in Latin letters: initial + final + tone. Vietnamese has tones too, so you start ahead — you just need to hear the four tones and the neutral one.'
          )}
        </p>
        <button className="btn-primary mt-4 h-11" onClick={start}>
          {t(`Kiểm tra nhanh (${QUIZ_SIZE} câu)`, `Quick check (${QUIZ_SIZE} questions)`)}
        </button>
      </header>

      <Tones />
      <Sandhi />
      <SoundGroup
        title={t('Thanh mẫu (phụ âm đầu)', 'Initials')}
        note={t(
          'Chạm để nghe một chữ có âm đó. Cặp không bật hơi / bật hơi (b–p, d–t, g–k…) là chỗ dễ nhầm nhất.',
          'Tap to hear a character with that sound. Unaspirated / aspirated pairs (b–p, d–t, g–k…) are the easiest to mix up.'
        )}
        sounds={INITIALS}
      />
      <SoundGroup
        title={t('Vần dễ đọc sai', 'Tricky finals')}
        note={t(
          'Những vần người Việt hay đọc theo thói quen tiếng Việt.',
          'Finals Vietnamese speakers tend to read the Vietnamese way.'
        )}
        sounds={TRICKY_FINALS}
      />
    </div>
  )
}

function Tones() {
  const t = useT()
  const say = useSay()
  return (
    <section className="card p-5">
      <h2 className="font-bold">
        {t('Bốn thanh và thanh nhẹ', 'Four tones and the neutral tone')}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {t(
          'Cùng âm "ma", đổi thanh là đổi nghĩa. Chạm để nghe.',
          'The same "ma" means different things in each tone. Tap to listen.'
        )}
      </p>
      <ul className="mt-3 space-y-2">
        {TONES.map((tone) => (
          <li key={tone.n}>
            <button
              type="button"
              onClick={() => say(tone.char)}
              className="flex w-full items-start gap-3 rounded-xl bg-slate-50 p-3 text-left transition hover:bg-brand-50 dark:bg-slate-800/60 dark:hover:bg-brand-950"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-2xl font-bold text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300">
                {tone.mark}
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block font-semibold">
                  {tone.n < 5 ? t(`Thanh ${tone.n}`, `Tone ${tone.n}`) : t('Thanh nhẹ', 'Neutral')}{' '}
                  · <span className="text-base">{tone.char}</span> {tone.read} — {tone.meaning}
                </span>
                <span className="text-slate-500">{t(...tone.how)}</span>
              </span>
              <Volume2 className="mt-1 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Sandhi() {
  const t = useT()
  const say = useSay()
  return (
    <section className="card p-5">
      <h2 className="font-bold">{t('Biến điệu khi nói liền', 'Tone changes in speech')}</h2>
      <ul className="mt-3 space-y-2">
        {SANDHI.map((r) => (
          <li key={r.example}>
            <button
              type="button"
              onClick={() => say(r.example)}
              className="flex w-full items-start gap-3 rounded-xl bg-slate-50 p-3 text-left transition hover:bg-brand-50 dark:bg-slate-800/60 dark:hover:bg-brand-950"
            >
              <span className="shrink-0 text-2xl font-bold">{r.example}</span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block">
                  {t('viết', 'written')} <b>{r.read}</b> → {t('đọc', 'said')}{' '}
                  <b className="text-brand-700 dark:text-brand-300">{r.said}</b>
                </span>
                <span className="text-slate-500">{t(...r.rule)}</span>
              </span>
              <Volume2 className="mt-1 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SoundGroup({ title, note, sounds }: { title: string; note: string; sounds: Sound[] }) {
  const t = useT()
  const say = useSay()
  const words = useData((s) => s.pack?.words)
  const meaningOf = useMemo(() => new Map((words ?? []).map((w) => [w.word, w.meaning])), [words])
  const [picked, setPicked] = useState<Sound | null>(null)

  return (
    <section>
      <h2 className="font-bold">{title}</h2>
      <p className="text-sm text-slate-500">{note}</p>
      <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
        {sounds.map((s) => (
          <li key={s.ch} className="min-w-0">
            <button
              type="button"
              onClick={() => {
                setPicked(s)
                say(s.char)
              }}
              aria-pressed={picked === s}
              className={`card flex w-full flex-col items-center px-1 py-3 transition hover:-translate-y-0.5 ${
                picked === s ? 'ring-2 ring-brand-400' : ''
              }`}
            >
              <span className="max-w-full truncate text-xl font-bold leading-none">{s.ch}</span>
              <span className="mt-1.5 text-xs font-semibold text-brand-600 dark:text-brand-300">
                {s.char} {s.read}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {picked && (
        <div className="card mt-2 flex items-start gap-3 p-4 animate-fade-in" aria-live="polite">
          <button
            type="button"
            onClick={() => say(picked.char)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300"
            aria-label={t(`Nghe ${picked.char}`, `Play ${picked.char}`)}
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <div className="min-w-0 text-sm">
            <p>
              <b className="text-lg">{picked.ch}</b> · {picked.char} <b>{picked.read}</b>
            </p>
            <p className="mt-1 text-slate-500">💡 {t(...picked.hint)}</p>
            {picked.word && (
              <button
                type="button"
                onClick={() => say(picked.word!)}
                className="mt-1 font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                {t('Ví dụ', 'Example')}: {picked.word}
                {meaningOf.get(picked.word) && ` — ${meaningOf.get(picked.word)}`} 🔊
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function Quiz({
  questions,
  onExit,
  onAgain,
}: {
  questions: PinyinQuestion[]
  onExit: () => void
  onAgain: () => void
}) {
  useImmersive()
  const t = useT()
  const say = useSay()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState<{ xp: number } | null>(null)
  const q = questions[idx]

  // A tone question offers the five tones; a word question its own options.
  const labels =
    q?.kind === 'tone'
      ? TONES.map((tone) =>
          tone.n < 5
            ? t(`Thanh ${tone.n} (${tone.mark})`, `Tone ${tone.n} (${tone.mark})`)
            : t('Thanh nhẹ', 'Neutral')
        )
      : (q?.options ?? [])
  const rightIndex = q?.kind === 'tone' ? q.answer - 1 : (q?.answer ?? -1)

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const ok = i === rightIndex
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) buzz(ok)
    say(q.prompt)
  }

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const xp = pinyinXp(correct, questions.length)
    addPlayXp(code, xp)
    setFinished({ xp })
  }

  if (finished || questions.length === 0)
    return (
      <SessionComplete
        emoji="🎵"
        title={t('Xong bài kiểm tra pinyin!', 'Pinyin check done!')}
        correct={correct}
        total={questions.length}
      >
        <p className="w-full text-sm font-semibold text-brand-600 dark:text-brand-300">
          +{finished?.xp ?? 0} XP ⭐
        </p>
        <button className="btn-primary" onClick={onAgain}>
          {t('Làm lượt mới', 'Another round')}
        </button>
        <button className="btn-secondary" onClick={onExit}>
          {t('Xem lại bảng pinyin', 'Back to pinyin')}
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
            style={{ width: `${(idx / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {idx + 1}/{questions.length}
        </span>
      </div>

      <div className="card space-y-5 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {q.kind === 'tone'
            ? t('Chữ này mang thanh mấy?', 'Which tone does this character have?')
            : t('Từ này đọc là gì?', 'How do you read this word?')}
        </p>
        <p className="text-6xl font-bold">{q.prompt}</p>
        {q.kind === 'tone' && <p className="text-2xl font-semibold text-slate-600">{q.reading}</p>}
        <div className="grid grid-cols-2 gap-2">
          {labels.map((opt, i) => {
            const tone =
              picked === null
                ? 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
                : i === rightIndex
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                  : i === picked
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
                    : 'border-slate-200 opacity-50 dark:border-slate-700'
            return (
              <button
                key={opt}
                onClick={() => choose(i)}
                disabled={picked !== null}
                className={`rounded-xl border-2 px-3 py-3 text-lg font-semibold transition ${tone}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <p className="text-sm text-slate-500">
            {q.prompt} = <b className="text-slate-700 dark:text-slate-200">{q.note}</b>
          </p>
        )}
        {picked !== null && (
          <button
            type="button"
            onClick={() => say(q.prompt)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300"
          >
            <Volume2 className="h-4 w-4" /> {t(`Nghe lại ${q.prompt}`, `Hear ${q.prompt} again`)}
          </button>
        )}
      </div>

      {picked !== null && (
        <div className="session-actions mt-4">
          <button onClick={next} className="btn-primary h-12 w-full">
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
