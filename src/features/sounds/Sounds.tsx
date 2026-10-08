import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ear, RotateCcw, Volume2 } from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { pronounce, wordAudio } from '@/lib/audio'
import { SOUND_LESSONS, earRound, type EarRound, type SoundLesson } from '@/lib/sounds'
import { nudge, praise } from '@/lib/encourage'
import { buzz } from '@/lib/sound'
import { skyBurstAt } from '@/lib/skyEvents'

// "Âm khó cho người Việt" (docs/design/sounds.md).

type Play = (word: string) => void

const READING_TIPS = [
  ['VIẾT HOA', 'là âm nhấn: đọc to, dài và cao hơn — kơm-PYU-tơ.'],
  ['đ / d', '"đ" là /d/ tiếng Anh (red → REĐ); "d" là /z/ như giọng Bắc (zoo → DU).'],
  ['ph, th', '"ph" là /f/ (five → PHAIV); "th" là âm lưỡi giữa hai răng (think → THINGK).'],
  ['Âm cuối', 'chữ cuối viết ra là phải bật ra: rice → RAIS, không phải "rai".'],
] as const

export default function Sounds() {
  const pack = useData((s) => s.pack)!
  const rate = useSettings((s) => s.ttsRate)
  const byWord = useMemo(
    () => new Map(pack.words.map((w) => [w.word.toLowerCase(), w] as const)),
    [pack.words]
  )

  const play: Play = (text) => {
    const w = byWord.get(text)
    pronounce({
      audioSrc: w ? wordAudio(w.id) : undefined,
      text,
      lang: pack.meta.ttsLang,
      rate,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">Âm khó cho người Việt</span>{' '}
          <span aria-hidden="true">👄</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Những âm người Việt hay đọc sai nhất — cách đặt lưỡi, lỗi thường gặp, và trò “thử tai” để
          nghe ra khác biệt. Bấm vào từ nào cũng nghe được.
        </p>
      </header>

      <section className="card p-5">
        <h2 className="font-bold">Đọc dòng “cách đọc” thế nào?</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {READING_TIPS.map(([k, v]) => (
            <li key={k} className="flex gap-3">
              <span className="w-20 shrink-0 font-bold text-brand-600 dark:text-brand-300">
                {k}
              </span>
              <span className="text-slate-600 dark:text-slate-300">{v}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-500">
          Cách đọc chỉ là gợi ý gần đúng bằng chữ Việt. Có những khác biệt chữ không ghi được (như
          “ship” và “sheep”) — tai mới là thầy, nên hãy luôn nghe giọng mẫu.
        </p>
      </section>

      <div className="stagger space-y-4">
        {SOUND_LESSONS.map((l) => (
          <Lesson key={l.id} lesson={l} play={play} byWord={byWord} />
        ))}
      </div>

      <div className="text-center">
        <Link to="/speaking" className="btn-primary">
          Luyện nói với micro 🎙️
        </Link>
      </div>
    </div>
  )
}

function WordChip({ text, play, word }: { text: string; play: Play; word?: Word }) {
  return (
    <button
      onClick={() => play(text)}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-sm transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-brand-950"
    >
      <Volume2 className="h-3.5 w-3.5 text-brand-500" />
      <b>{text}</b>
      {word && <span className="text-xs text-slate-400">/{word.ipa}/</span>}
    </button>
  )
}

function Lesson({
  lesson,
  play,
  byWord,
}: {
  lesson: SoundLesson
  play: Play
  byWord: Map<string, Word>
}) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 px-2.5 py-1 font-mono text-sm font-bold text-white">
          {lesson.symbol}
        </span>
        <h2 className="text-lg font-bold">{lesson.title}</h2>
      </div>
      <p className="mt-3 text-sm">
        <b>Cách phát âm:</b> {lesson.how}
      </p>
      <p className="mt-1.5 text-sm text-amber-700 dark:text-amber-300">
        <b>Hay sai:</b> {lesson.slip}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {lesson.words.map((w) => (
          <WordChip key={w} text={w} play={play} word={byWord.get(w)} />
        ))}
      </div>
      {lesson.pairs.length > 0 && (
        <>
          <p className="mt-4 text-sm font-semibold text-slate-500">Cặp dễ nhầm</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lesson.pairs.map(([a, b]) => (
              <span
                key={a + b}
                className="inline-flex items-center gap-1 rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800/70"
              >
                <WordChip text={a} play={play} />
                <span className="text-slate-400">↔</span>
                <WordChip text={b} play={play} />
              </span>
            ))}
          </div>
          <EarTest pairs={lesson.pairs} play={play} />
        </>
      )}
    </section>
  )
}

/** Hear one word of a pair, pick which it was. */
function EarTest({ pairs, play }: { pairs: [string, string][]; play: Play }) {
  const soundOn = useSettings((s) => s.soundEnabled)
  const [round, setRound] = useState<EarRound | null>(null)
  const [picked, setPicked] = useState<0 | 1 | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  const next = () => {
    const r = earRound(pairs)
    setRound(r)
    setPicked(null)
    play(r.pair[r.answer])
  }

  const choose = (i: 0 | 1, el: HTMLElement) => {
    if (!round || picked !== null) return
    const ok = i === round.answer
    setPicked(i)
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))
    if (soundOn) buzz(ok)
    if (ok) skyBurstAt(el, 0.6)
  }

  if (!round) {
    return (
      <button onClick={next} className="btn-secondary mt-4">
        <Ear className="h-4 w-4" /> Thử tai: nghe và chọn
      </button>
    )
  }

  const target = round.pair[round.answer]
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Bạn nghe thấy từ nào?</p>
        <span className="text-xs text-slate-500">
          Đúng {score.right}/{score.total}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {round.pair.map((w, i) => {
          const tone =
            picked === null
              ? 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
              : i === round.answer
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                : i === picked
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
                  : 'border-slate-200 opacity-60 dark:border-slate-700'
          return (
            <button
              key={w}
              onClick={(e) => choose(i as 0 | 1, e.currentTarget)}
              disabled={picked !== null}
              className={`rounded-xl border-2 px-3 py-3 text-lg font-bold transition ${tone}`}
            >
              {w}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => play(target)} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Nghe lại
        </button>
        {picked !== null && (
          <>
            <p className="flex-1 text-sm" aria-live="polite">
              {picked === round.answer ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ {praise(score.total + target.length)}
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400">
                  Đó là “{target}” — {nudge(score.total + target.length)}
                </span>
              )}
            </p>
            <button onClick={next} className="btn-primary">
              Câu tiếp
            </button>
          </>
        )}
      </div>
    </div>
  )
}
