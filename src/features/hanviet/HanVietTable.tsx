import { useMemo, useState } from 'react'
import { ArrowRight, Check, Search, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { hanVietQuiz, hanVietTable, searchHanViet, type HanVietQuestion } from '@/lib/hanVietFamily'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useStudy } from '@/store/studyStore'
import GameShell, { GameResult } from '@/features/games/GameShell'
import { pronounce } from '@/lib/audio'
import { useT } from '@/lib/i18n'

// "Chữ Hán qua âm Hán Việt" (docs/design/han-viet-table.md): every character
// (or Korean syllable block) that two or more words of the pack share, read the
// same Sino-Vietnamese way — one key that opens several words at once.

const GUESS_SIZE = 10

export default function HanVietTable() {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const table = useMemo(() => hanVietTable(pack.words), [pack.words])
  const [query, setQuery] = useState('')
  const shown = useMemo(() => searchHanViet(table, query), [table, query])
  const zh = code === 'zh'
  const say = (text: string) => pronounce({ text, lang: pack.meta.ttsLang, rate })
  const [round, setRound] = useState<{ n: number; questions: HanVietQuestion[] } | null>(null)
  const start = () =>
    setRound((r) => ({ n: (r?.n ?? 0) + 1, questions: hanVietQuiz(pack.words, GUESS_SIZE) }))

  if (round) return <GuessRound key={round.n} questions={round.questions} onAgain={start} />

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">
            {zh
              ? t('Chữ Hán qua âm Hán Việt', 'Characters by Sino-Vietnamese reading')
              : t('Gốc Hán qua âm Hán Việt', 'Sino-Korean by Sino-Vietnamese reading')}
          </span>{' '}
          <span aria-hidden="true">🀄</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {zh
            ? t(
                'Người Việt có sẵn một chìa khoá: âm Hán Việt. Biết 学 là "học" trong 学生 (học sinh) thì đoán được 学校 (học hiệu → trường học) và 学习 (học tập). Đây là những chữ xuất hiện trong ít nhất hai từ của gói.',
                'Vietnamese speakers hold a key: the Sino-Vietnamese reading. Know 学 is "học" in 学生 and you can guess 学校 and 学习. These are the characters found in at least two words of the pack.'
              )
            : t(
                'Nhiều từ tiếng Hàn gốc Hán đọc gần âm Hán Việt: 학 là "học" trong 학생 (học sinh) và 학교 (học hiệu → trường học). Đây là những âm tiết xuất hiện trong ít nhất hai từ của gói.',
                'Many Korean words come from Chinese and sound close to Sino-Vietnamese: 학 is "học" in 학생 and 학교. These are the syllables found in at least two words of the pack.'
              )}
        </p>
        <button className="btn-primary mt-4 h-11" onClick={start}>
          {t(
            `Đoán nghĩa nhờ Hán Việt (${GUESS_SIZE} câu)`,
            `Guess by Sino-Vietnamese (${GUESS_SIZE} questions)`
          )}
        </button>
      </header>

      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(
            'Tìm theo chữ hoặc âm Hán Việt (hoc, học…)',
            'Search by character or reading (hoc, học…)'
          )}
          aria-label={t('Tìm chữ', 'Search characters')}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
        {query.trim()
          ? t(
              `${shown.length} kết quả`,
              shown.length === 1 ? '1 result' : `${shown.length} results`
            )
          : zh
            ? t(`${table.length} chữ`, `${table.length} characters`)
            : t(`${table.length} âm tiết`, `${table.length} syllables`)}
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((e) => (
          <li key={`${e.char}|${e.hv}`} className="card p-4">
            <div className="flex items-baseline gap-3">
              <button
                type="button"
                lang={code}
                onClick={() => say(e.char)}
                className="text-4xl font-bold hover:text-brand-600"
                aria-label={t(`Nghe ${e.char}`, `Hear ${e.char}`)}
              >
                {e.char}
              </button>
              <span className="text-lg font-extrabold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                {e.hv}
              </span>
              <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                {t(`${e.words.length} từ`, `${e.words.length} words`)}
              </span>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {e.words.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => say(w.word)}
                    className="text-left hover:underline"
                  >
                    <b lang={code}>{w.word}</b>{' '}
                    <span className="text-slate-500 dark:text-slate-400">{w.viRead}</span> —{' '}
                    <span className="text-slate-700 dark:text-slate-200">{w.meaning}</span>
                    {w.hanViet && (
                      <span className="text-slate-500 dark:text-slate-400"> ({w.hanViet})</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="card p-5 text-sm text-slate-500 dark:text-slate-400">
          {t('Không thấy chữ nào khớp.', 'No character matches.')}
        </p>
      )}
    </div>
  )
}

/** "Đoán nghĩa nhờ Hán Việt": a new word, the readings of its parts, four meanings. */
function GuessRound({ questions, onAgain }: { questions: HanVietQuestion[]; onAgain: () => void }) {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const title = t('Đoán nghĩa nhờ Hán Việt', 'Guess by Sino-Vietnamese')

  if (xp !== null || questions.length === 0)
    return (
      <GameShell title={title} stats={null}>
        <GameResult
          emoji="🀄"
          title={t('Xong một lượt!', 'Round complete!')}
          lines={[
            t(`Đúng ${correct}/${questions.length} câu`, `${correct} of ${questions.length} right`),
          ]}
          xp={xp ?? 0}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const q = questions[idx]
  const answered = picked !== null
  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
    pronounce({ text: q.word.word, lang: pack.meta.ttsLang, rate })
  }
  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const earned = pinyinXp(correct, questions.length)
    addPlayXp(code, earned)
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
    >
      <div className="card space-y-4 p-6">
        <div className="text-center">
          <p lang={code} className="text-5xl font-bold">
            {q.word.word}
          </p>
          <p className="mt-2 text-lg font-extrabold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            {q.word.hanViet}
          </p>
        </div>
        <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          {q.clues.map((c) => (
            <li key={c.char}>
              <b lang={code}>{c.char}</b> = {c.hv}, {t('như trong', 'as in')}{' '}
              <b lang={code}>{c.via.word}</b> ({c.via.meaning})
            </li>
          ))}
        </ul>
        <div className="grid gap-2">
          {q.options.map((m, i) => {
            const state = !answered
              ? 'idle'
              : i === q.answer
                ? 'right'
                : i === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={m}
                type="button"
                onClick={() => pick(i)}
                disabled={answered}
                className={`flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left font-medium transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {m}
                {state === 'right' && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5 shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        {answered && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
            <b lang={code}>{q.word.word}</b> {q.word.viRead} — {q.word.meaning}
          </p>
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
