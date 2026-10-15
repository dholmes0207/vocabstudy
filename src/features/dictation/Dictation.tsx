import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Ear, LogOut, Snail, Volume2 } from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useImmersive } from '@/store/uiStore'
import { exampleAudio, pronounce } from '@/lib/audio'
import {
  DICTATION_PASS,
  dictationScore,
  dictationXp,
  diffWords,
  pickDictationRound,
  type DiffPart,
} from '@/lib/dictation'
import { buzz } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'
import SessionComplete from '@/components/SessionComplete'

// "Nghe – chép" (docs/design/dictation.md): hear an example sentence from words
// you have met, type it, then see word by word what you caught. Trains the ear
// and spelling together; it never changes the review schedule.

const ROUND = 6

export default function Dictation() {
  const t = useT()
  const L = useTargetLang()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards ?? NO_CARDS)
  const [round, setRound] = useState<{ n: number; words: Word[] } | null>(null)

  const start = () =>
    setRound((r) => ({ n: (r?.n ?? 0) + 1, words: pickDictationRound(pack.words, cards, ROUND) }))

  if (round)
    return <Round key={round.n} words={round.words} onExit={() => setRound(null)} onAgain={start} />

  return (
    <div className="mx-auto max-w-xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Nghe – chép', 'Dictation')}</span>{' '}
          <span aria-hidden="true">✍️</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            `Nghe một câu ${L.vi} rồi gõ lại đúng những gì bạn nghe. Luyện tai và chính tả cùng lúc — câu lấy từ những từ bạn đã học.`,
            `Hear a ${L.en} sentence, then type exactly what you heard. Ear and spelling together — sentences come from words you have learned.`
          )}
        </p>
      </header>
      <ul className="card space-y-2 p-5 text-sm text-slate-600 dark:text-slate-300">
        <li>🔁 {t('Nghe lại bao nhiêu lần cũng được.', 'Replay as many times as you like.')}</li>
        <li>🐢 {t('Nghe chậm khi câu quá nhanh.', 'Slow it down when it is too fast.')}</li>
        <li>
          ✅{' '}
          {t(
            'Không cần viết hoa hay dấu câu — chỉ cần đúng từ.',
            'Capitals and punctuation do not matter — just the words.'
          )}
        </li>
      </ul>
      <button className="btn-primary h-12 w-full" onClick={start}>
        <Ear className="h-5 w-5" /> {t(`Bắt đầu (${ROUND} câu)`, `Start (${ROUND} sentences)`)}
      </button>
    </div>
  )
}

function Round({
  words,
  onExit,
  onAgain,
}: {
  words: Word[]
  onExit: () => void
  onAgain: () => void
}) {
  useImmersive()
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<{ parts: DiffPart[]; score: number } | null>(null)
  const [caught, setCaught] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState<{ xp: number } | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const word = words[idx]
  const play = (slow = false) =>
    pronounce({
      audioSrc: exampleAudio(word.id, word.exampleEn),
      text: word.exampleEn,
      lang: pack.meta.ttsLang,
      rate: slow ? Math.min(rate, 0.7) : rate,
    })

  // Each sentence plays as soon as it appears.
  useEffect(() => {
    const w = words[idx]
    if (!w) return
    const timer = setTimeout(
      () =>
        pronounce({
          audioSrc: exampleAudio(w.id, w.exampleEn),
          text: w.exampleEn,
          lang: pack.meta.ttsLang,
          rate,
        }),
      250
    )
    return () => clearTimeout(timer)
  }, [idx, words, pack.meta.ttsLang, rate])

  useEffect(() => {
    if (result) nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [result])

  const check = () => {
    if (!typed.trim() || result) return
    const parts = diffWords(word.exampleEn, typed)
    const score = dictationScore(parts)
    setResult({ parts, score })
    const ok = score >= DICTATION_PASS
    if (ok) setCaught((c) => c + 1)
    if (soundOn) buzz(ok)
  }

  const next = () => {
    if (idx + 1 < words.length) {
      setIdx(idx + 1)
      setTyped('')
      setResult(null)
      setShowHint(false)
      return
    }
    const xp = dictationXp(caught, words.length)
    addPlayXp(code, xp)
    setFinished({ xp })
  }

  if (words.length === 0)
    return (
      <p className="card p-6 text-slate-500">
        {t('Chưa có câu nào phù hợp để nghe – chép.', 'There are no sentences to write yet.')}
      </p>
    )

  if (finished)
    return (
      <SessionComplete
        emoji="✍️"
        title={t('Xong một lượt nghe – chép!', 'Dictation complete!')}
        correct={caught}
        total={words.length}
      >
        <p className="w-full text-sm font-semibold text-brand-600 dark:text-brand-300">
          +{finished.xp} XP ⭐
        </p>
        <button className="btn-primary" onClick={onAgain}>
          {t('Thêm một lượt', 'Another round')}
        </button>
        <button className="btn-secondary" onClick={onExit}>
          {t('Xong', 'Done')}
        </button>
      </SessionComplete>
    )

  const tone: Record<DiffPart['status'], string> = {
    ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    missing:
      'bg-amber-100 text-amber-900 underline decoration-dotted dark:bg-amber-950/60 dark:text-amber-200',
    extra: 'bg-rose-100 text-rose-700 line-through dark:bg-rose-950/60 dark:text-rose-300',
  }

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
            style={{ width: `${(idx / words.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {idx + 1}/{words.length}
        </span>
      </div>

      <div className="card space-y-5 p-6">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => play()}
            className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg transition hover:scale-105 active:scale-95"
            aria-label={t('Nghe lại', 'Play again')}
          >
            <Volume2 className="h-9 w-9" />
          </button>
          <button
            onClick={() => play(true)}
            className="btn-secondary h-12 gap-1.5"
            aria-label={t('Nghe chậm', 'Play slowly')}
          >
            <Snail className="h-5 w-5" /> {t('Chậm', 'Slow')}
          </button>
        </div>

        {!result ? (
          <>
            <textarea
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  check()
                }
              }}
              rows={2}
              maxLength={300}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label={t('Câu bạn nghe được', 'What you heard')}
              placeholder={t('Gõ lại câu bạn vừa nghe…', 'Type the sentence you heard…')}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            />
            {showHint ? (
              <p className="text-sm text-slate-500">💡 {word.exampleVi}</p>
            ) : (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                {t('Gợi ý: xem nghĩa tiếng Việt', 'Hint: show the Vietnamese meaning')}
              </button>
            )}
          </>
        ) : (
          <div className="space-y-3" aria-live="polite">
            <p className="flex flex-wrap gap-1.5 text-lg">
              {result.parts.map((p, i) => (
                <span key={i} className={`rounded-md px-1.5 py-0.5 ${tone[p.status]}`}>
                  {p.text}
                </span>
              ))}
            </p>
            <p
              className={`text-sm font-semibold ${result.score >= DICTATION_PASS ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}
            >
              {result.score >= DICTATION_PASS
                ? t('Nghe rất tốt! 👂', 'Great listening! 👂')
                : t(
                    'Chưa trọn câu — nghe lại phần màu vàng nhé.',
                    'Not quite — listen again for the yellow words.'
                  )}{' '}
              ({Math.round(result.score * 100)}%)
            </p>
            <p className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
              <b>{word.exampleEn}</b>
              <br />
              <span className="text-slate-500">{word.exampleVi}</span>
            </p>
          </div>
        )}
      </div>

      <div className="session-actions mt-4">
        {!result ? (
          <button
            onClick={check}
            disabled={!typed.trim()}
            className="btn-primary h-12 w-full disabled:opacity-50"
          >
            {t('Kiểm tra', 'Check')}
          </button>
        ) : (
          <button ref={nextRef} onClick={next} className="btn-primary h-12 w-full">
            {idx + 1 < words.length ? t('Câu tiếp theo', 'Next') : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
