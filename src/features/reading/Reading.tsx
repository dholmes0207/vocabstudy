import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Square,
  Languages,
  Volume2,
  X,
} from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useReading } from '@/store/readingStore'
import { pronounce, stopPronounce, wordAudio } from '@/lib/audio'
import {
  buildGlossary,
  glossInLine,
  loadReadingPack,
  readingXp,
  shuffleOptions,
  type ReadingPack,
  type Story,
} from '@/lib/reading'
import { buzz } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'
import { CenterSpinner } from '@/components/DataGate'
import SessionComplete from '@/components/SessionComplete'
import { useReadingLabel } from '@/hooks/useReadingLabel'
import { tokenize } from '@/lib/games'

// "Đọc truyện ngắn" (docs/design/reading.md): short graded stories in the
// language being learned (public/data/reading/<code>.json). Tap any word from
// the pack to see what it means, show the Vietnamese line by line when you need
// it, then answer a few questions.

function useReadingPack(): { pack: ReadingPack | null; error: boolean } {
  const code = useSettings((s) => s.currentLang)
  const [state, setState] = useState<{ pack: ReadingPack | null; error: boolean }>({
    pack: null,
    error: false,
  })
  useEffect(() => {
    let alive = true
    loadReadingPack(code)
      .then((pack) => alive && setState({ pack, error: false }))
      .catch(() => alive && setState({ pack: null, error: true }))
    return () => {
      alive = false
    }
  }, [code])
  return state
}

export default function Reading() {
  const t = useT()
  const { storyId } = useParams()
  const { pack, error } = useReadingPack()
  if (error)
    return (
      <p className="card p-6 text-slate-500">
        {t('Ngôn ngữ này chưa có truyện đọc.', 'There are no stories for this language yet.')}
      </p>
    )
  if (!pack) return <CenterSpinner />
  const story = storyId ? pack.stories.find((s) => s.id === storyId) : undefined
  if (storyId && !story)
    return (
      <p className="card p-6">
        {t('Không tìm thấy truyện này.', 'This story was not found.')}{' '}
        <Link to="/reading" className="font-medium text-brand-600 dark:text-brand-300">
          {t('Về danh sách truyện', 'Back to the stories')}
        </Link>
      </p>
    )
  return story ? <StoryView key={story.id} story={story} /> : <StoryList pack={pack} />
}

function StoryList({ pack }: { pack: ReadingPack }) {
  const t = useT()
  const L = useTargetLang()
  const progress = useReading((s) => s.progress)
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Đọc truyện ngắn', 'Short stories')}</span>{' '}
          <span aria-hidden="true">📖</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            `Truyện ngắn bằng ${L.vi} dễ hiểu. Chạm vào một từ để xem nghĩa, mở bản dịch khi cần, rồi trả lời vài câu hỏi.`,
            `Short stories in easy ${L.en}. Tap a word to see its meaning, open the translation when you need it, then answer a few questions.`
          )}
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pack.stories.map((s) => {
          const rec = progress[s.id]
          return (
            <li key={s.id} className="min-w-0">
              <Link
                to={`/reading/${s.id}`}
                className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-2xl dark:bg-brand-950"
                  aria-hidden="true"
                >
                  {s.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-400">
                    {s.level} · {t(`${s.sentences.length} câu`, `${s.sentences.length} sentences`)}
                  </span>
                  <span className="block font-bold">{t(...s.title)}</span>
                </span>
                {rec ? (
                  rec.best === 100 ? (
                    <CheckCircle2
                      className="h-6 w-6 shrink-0 text-emerald-500"
                      aria-label={t('Hiểu trọn', 'Fully understood')}
                    />
                  ) : (
                    <span className="shrink-0 text-sm font-bold tabular-nums text-slate-400">
                      {rec.best}%
                    </span>
                  )
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function StoryView({ story }: { story: Story }) {
  const t = useT()
  const readLabel = useReadingLabel('đọc gần giống', 'sounds like')
  const pack = useData((s) => s.pack)!
  const rate = useSettings((s) => s.ttsRate)
  const glossary = useMemo(() => buildGlossary(pack.words), [pack.words])
  const byId = useMemo(() => new Map(pack.words.map((w) => [w.id, w])), [pack.words])
  const [showVi, setShowVi] = useState(false)
  const [gloss, setGloss] = useState<Word | null>(null)
  const [quiz, setQuiz] = useState(false)

  // The line being read aloud. "Nghe cả bài" reads one sentence after another,
  // so the line lights up as it is spoken; a newer play or Stop bumps `run` and
  // the old chain's callbacks (a cancelled utterance still fires onEnd) do nothing.
  const [reading, setReading] = useState<{ line: number; all: boolean } | null>(null)
  const run = useRef(0)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  const playLine = (line: number, all: boolean) => {
    const id = ++run.current
    setReading({ line, all })
    lineRefs.current[line]?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
    pronounce({
      text: story.sentences[line].en,
      lang: pack.meta.ttsLang,
      rate,
      onEnd: () => {
        if (id !== run.current) return
        if (all && line + 1 < story.sentences.length) playLine(line + 1, true)
        else setReading(null)
      },
    })
  }
  const stop = () => {
    run.current++
    stopPronounce()
    setReading(null)
  }

  // Leaving the story (or opening the quiz) stops the voice.
  useEffect(
    () => () => {
      run.current++
      stopPronounce()
    },
    []
  )

  if (quiz) return <StoryQuiz story={story} onBack={() => setQuiz(false)} />

  return (
    <article className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <Link
        to="/reading"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> {t('Tất cả truyện', 'All stories')}
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">
            {story.emoji} {story.level}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{story.title[1]}</h1>
          <p className="text-slate-500">{story.title[0]}</p>
        </div>
        <div className="flex gap-2">
          {reading?.all ? (
            <button
              className="btn-secondary !border-brand-400 !text-brand-700 dark:!text-brand-300"
              onClick={stop}
            >
              <Square className="h-4 w-4" /> {t('Dừng', 'Stop')}
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => playLine(0, true)}>
              <Volume2 className="h-4 w-4" /> {t('Nghe cả bài', 'Listen')}
            </button>
          )}
          <button
            className={`btn-secondary ${showVi ? '!border-brand-400 !text-brand-700 dark:!text-brand-300' : ''}`}
            onClick={() => setShowVi((v) => !v)}
            aria-pressed={showVi}
          >
            <Languages className="h-4 w-4" /> {t('Bản dịch', 'Translation')}
          </button>
        </div>
      </header>

      <p className="text-sm text-slate-400">
        {t(
          'Chạm vào từ có gạch chân để xem nghĩa.',
          'Tap an underlined word to see what it means.'
        )}
      </p>

      <section className="card space-y-4 p-5 text-lg leading-relaxed">
        {story.sentences.map((line, i) => (
          <div
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el
            }}
            className={`-mx-2 rounded-xl px-2 transition-colors ${
              reading?.line === i ? 'bg-brand-50 dark:bg-brand-950/60' : ''
            }`}
            aria-current={reading?.line === i ? 'true' : undefined}
          >
            <p>
              {tokenize(line.en).map((token, j) => {
                const w = glossInLine(token, line, glossary, byId)
                return (
                  <span key={j}>
                    {w ? (
                      <button
                        type="button"
                        onClick={() => setGloss(w)}
                        className="rounded underline decoration-brand-300 decoration-dotted underline-offset-4 hover:bg-brand-50 dark:hover:bg-brand-950"
                      >
                        {token}
                      </button>
                    ) : (
                      token
                    )}
                    {/* Chinese is written without spaces (its words are split by
                        invisible breaks); every other language gets one back. */}
                    {line.en.includes(' ') ? ' ' : ''}
                  </span>
                )
              })}
              <button
                type="button"
                onClick={() => playLine(i, false)}
                className="ml-1 inline-grid h-7 w-7 place-items-center rounded-full align-middle text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                aria-label={t('Nghe câu này', 'Listen to this sentence')}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </p>
            {showVi && <p className="mt-0.5 text-base text-slate-500">{line.vi}</p>}
          </div>
        ))}
      </section>

      <button className="btn-primary h-12 w-full" onClick={() => setQuiz(true)}>
        <BookOpenText className="h-5 w-5" />
        {t(
          `Trả lời ${story.questions.length} câu hỏi`,
          `Answer ${story.questions.length} questions`
        )}
      </button>

      {gloss &&
        createPortal(
          <div
            role="dialog"
            aria-label={gloss.word}
            className="card fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto max-w-md !bg-white p-4 shadow-xl animate-fade-in dark:!bg-slate-900 lg:bottom-6"
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => {
                  // The word's own voice ends the story read-through first.
                  stop()
                  pronounce({
                    audioSrc: wordAudio(gloss.id),
                    text: gloss.word,
                    lang: pack.meta.ttsLang,
                    rate,
                  })
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300"
                aria-label={t('Nghe từ này', 'Listen to this word')}
              >
                <Volume2 className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">
                  {gloss.emoji && <span aria-hidden="true">{gloss.emoji} </span>}
                  {gloss.word}
                </p>
                {gloss.viRead && (
                  <p className="text-sm text-slate-500">
                    {readLabel} <b>{gloss.viRead}</b>
                  </p>
                )}
                <p className="mt-1 font-semibold text-brand-700 dark:text-brand-300">
                  {gloss.meaning}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGloss(null)}
                className="btn-ghost -m-1 h-8 w-8 shrink-0 !p-0"
                aria-label={t('Đóng', 'Close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </article>
  )
}

function StoryQuiz({ story, onBack }: { story: Story; onBack: () => void }) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const record = useReading((s) => s.record)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState<{ xp: number } | null>(null)
  const [questions] = useState(() => story.questions.map((x) => shuffleOptions(x)))
  const q = questions[idx]

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) buzz(ok)
  }

  const next = () => {
    if (idx + 1 < story.questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    record(story.id, correct, story.questions.length)
    const xp = readingXp(correct, story.questions.length)
    addPlayXp(code, xp)
    setFinished({ xp })
  }

  if (finished)
    return (
      <SessionComplete
        emoji={story.emoji}
        title={t('Đọc xong rồi!', 'Story finished!')}
        correct={correct}
        total={story.questions.length}
      >
        <p className="w-full text-sm font-semibold text-brand-600 dark:text-brand-300">
          +{finished.xp} XP ⭐
        </p>
        <button className="btn-secondary" onClick={onBack}>
          {t('Đọc lại truyện', 'Read it again')}
        </button>
        <Link to="/reading" className="btn-primary">
          {t('Truyện khác', 'Another story')}
        </Link>
      </SessionComplete>
    )

  return (
    <div className="mx-auto max-w-xl space-y-4 animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> {t('Xem lại truyện', 'Back to the story')}
      </button>
      <div className="card space-y-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t('Câu hỏi', 'Question')} {idx + 1}/{story.questions.length}
        </p>
        <p className="text-lg font-semibold">{q.q}</p>
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
                onClick={() => choose(i)}
                disabled={picked !== null}
                className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition ${tone}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
      {picked !== null && (
        <button onClick={next} className="btn-primary h-12 w-full">
          {idx + 1 < story.questions.length
            ? t('Câu tiếp theo', 'Next')
            : t('Xem kết quả', 'See results')}{' '}
          <ArrowRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
