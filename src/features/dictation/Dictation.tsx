import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Ear, LogOut, Snail, Volume2 } from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { exampleAudio, prefetchAudio, pronounce } from '@/lib/audio'
import {
  DICTATION_PASS,
  dictationScore,
  dictationXp,
  diffWords,
  dictationTiles,
  pickDictationRound,
  tileScore,
  type DiffPart,
} from '@/lib/dictation'
import { acceptsPinyin, diffPinyin, isPinyinAnswer } from '@/lib/pinyinInput'
import { placeToken, shuffledOrder, startOrder, type OrderState } from '@/lib/games'
import { useNoTyping } from '@/store/noTypingStore'
import { buzz } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'
import SessionComplete from '@/components/SessionComplete'
import BuildTiles from '@/components/BuildTiles'
import KeyboardHelp, { NoTypingNote } from '@/components/KeyboardHelp'
import { useReadingLabel } from '@/hooks/useReadingLabel'

// "Nghe – chép" (docs/design/dictation.md): hear an example sentence from words
// you have met, type it, then see word by word what you caught. Trains the ear
// and spelling together; it never changes the review schedule.

const ROUND = 6

/**
 * One sentence to write down. Example sentences carry their recorded clip;
 * story and grammar sentences are read by the browser's voice.
 */
export interface DictationItem {
  key: string
  text: string
  vi: string
  /** Pinyin line for Chinese. */
  read?: string
  audioSrc?: string
}

const freshTiles = (it: DictationItem | undefined): OrderState => {
  const tiles = it ? dictationTiles(it.text) : []
  return startOrder(tiles, shuffledOrder(tiles.length))
}

const fromWords = (words: Word[]): DictationItem[] =>
  words.map((w) => ({
    key: `w${w.id}`,
    text: w.exampleEn,
    vi: w.exampleVi,
    read: w.exampleRead,
    audioSrc: exampleAudio(w.id, w.exampleEn),
  }))

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
    return (
      <DictationRound
        key={round.n}
        items={fromWords(round.words)}
        onExit={() => setRound(null)}
        onAgain={start}
      />
    )

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
        {acceptsPinyin(code) && (
          <li>
            🔤{' '}
            {t(
              'Chưa có bàn phím chữ Hán? Gõ bính âm không dấu (wo shi xuesheng) cũng được chấm.',
              'No Chinese keyboard yet? Pinyin without tones (wo shi xuesheng) is graded too.'
            )}
          </li>
        )}
      </ul>
      <button className="btn-primary h-12 w-full" onClick={start}>
        <Ear className="h-5 w-5" /> {t(`Bắt đầu (${ROUND} câu)`, `Start (${ROUND} sentences)`)}
      </button>
    </div>
  )
}

/**
 * A dictation session over any list of sentences — example sentences here, a
 * whole story sentence by sentence, or a grammar lesson's examples.
 */
export function DictationRound({
  items,
  caption,
  onExit,
  onAgain,
}: {
  items: DictationItem[]
  /** Shown above the progress bar, e.g. the story's title. */
  caption?: string
  onExit: () => void
  /** "Thêm một lượt"; left out where a second round makes no sense. */
  onAgain?: () => void
}) {
  useImmersive()
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const logActivity = useActivity((s) => s.log)
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<{
    parts: DiffPart[]
    score: number
    /** Built from tiles: the wrong taps, instead of a word-by-word diff. */
    mistakes?: number
    /** Typed in pinyin; `peeked` when the pinyin hint was open, which gives it away. */
    pinyin?: { peeked: boolean }
  } | null>(null)
  const [caught, setCaught] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showRead, setShowRead] = useState(false)
  const readLabel = useReadingLabel('cách đọc', 'reading')
  const [finished, setFinished] = useState<{ xp: number } | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const item = items[idx]
  // No Hangul / pinyin keyboard: hear the sentence, then tap its tiles in order.
  const noTyping = useNoTyping()
  const shuffled = useMemo(() => freshTiles(items[idx]), [items, idx])
  const [tapped, setTapped] = useState<{ idx: number; order: OrderState } | null>(null)
  const order = tapped?.idx === idx ? tapped.order : shuffled
  const play = (slow = false) =>
    pronounce({
      audioSrc: item.audioSrc,
      text: item.text,
      lang: pack.meta.ttsLang,
      rate: slow ? Math.min(rate, 0.7) : rate,
    })

  // The whole round's clips up front: each sentence plays 250 ms after it shows.
  useEffect(() => prefetchAudio(items.map((it) => it.audioSrc)), [items])

  // Each sentence plays as soon as it appears.
  useEffect(() => {
    const it = items[idx]
    if (!it) return
    const timer = setTimeout(
      () =>
        pronounce({
          audioSrc: it.audioSrc,
          text: it.text,
          lang: pack.meta.ttsLang,
          rate,
        }),
      250
    )
    return () => clearTimeout(timer)
  }, [idx, items, pack.meta.ttsLang, rate])

  useEffect(() => {
    if (result) nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [result, noTyping])

  const check = () => {
    if (!typed.trim() || result) return
    // No Chinese keyboard: the sentence can be written in pinyin, tones aside.
    const pinyin = acceptsPinyin(code) && !!item.read && isPinyinAnswer(typed)
    const parts = pinyin ? diffPinyin(item.read!, typed) : diffWords(item.text, typed)
    const score = dictationScore(parts)
    setResult({ parts, score, pinyin: pinyin ? { peeked: showRead } : undefined })
    const ok = score >= DICTATION_PASS && !(pinyin && showRead)
    if (ok) setCaught((c) => c + 1)
    if (soundOn) buzz(ok)
  }

  const tap = (pos: number): boolean => {
    if (result) return false
    const { state, correct } = placeToken(order, pos)
    setTapped({ idx, order: state })
    if (state.done) {
      const score = tileScore(state.tokens.length, state.mistakes)
      setResult({ parts: [], score, mistakes: state.mistakes })
      const ok = score >= DICTATION_PASS
      if (ok) setCaught((c) => c + 1)
      if (soundOn) buzz(ok)
    }
    return correct
  }

  const next = () => {
    if (idx + 1 < items.length) {
      setIdx(idx + 1)
      setTyped('')
      setResult(null)
      setShowHint(false)
      setShowRead(false)
      return
    }
    const xp = dictationXp(caught, items.length)
    addPlayXp(code, xp)
    logActivity(code, 'dictation')
    setFinished({ xp })
  }

  if (items.length === 0)
    return (
      <p className="card p-6 text-slate-500 dark:text-slate-400">
        {t('Chưa có câu nào phù hợp để nghe – chép.', 'There are no sentences to write yet.')}
      </p>
    )

  if (finished)
    return (
      <SessionComplete
        emoji="✍️"
        title={t('Xong một lượt nghe – chép!', 'Dictation complete!')}
        correct={caught}
        total={items.length}
      >
        <p className="w-full text-sm font-semibold text-brand-600 dark:text-brand-300">
          +{finished.xp} XP ⭐
        </p>
        {onAgain && (
          <button className="btn-primary" onClick={onAgain}>
            {t('Thêm một lượt', 'Another round')}
          </button>
        )}
        <button className={onAgain ? 'btn-secondary' : 'btn-primary'} onClick={onExit}>
          {t('Xong', 'Done')}
        </button>
      </SessionComplete>
    )

  const passed = !!result && result.score >= DICTATION_PASS && !result.pinyin?.peeked
  const tone: Record<DiffPart['status'], string> = {
    ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    missing:
      'bg-amber-100 text-amber-900 underline decoration-dotted dark:bg-amber-950/60 dark:text-amber-200',
    extra: 'bg-rose-100 text-rose-700 line-through dark:bg-rose-950/60 dark:text-rose-300',
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      {caption && (
        <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{caption}</p>
      )}
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
        <span className="text-sm font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {idx + 1}/{items.length}
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

        {(result ? result.mistakes !== undefined : noTyping) && (
          <BuildTiles order={order} onTap={tap} />
        )}

        {!result ? (
          <>
            {noTyping ? (
              <NoTypingNote />
            ) : (
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
                  placeholder={
                    acceptsPinyin(code) && item.read
                      ? t(
                          'Gõ lại câu bạn vừa nghe (chữ Hán hoặc bính âm)…',
                          'Type what you heard (characters or pinyin)…'
                        )
                      : t('Gõ lại câu bạn vừa nghe…', 'Type the sentence you heard…')
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
                <KeyboardHelp canSkip />
              </>
            )}
            <div className="flex flex-col items-start gap-1">
              {showHint ? (
                <p className="text-sm text-slate-500">💡 {item.vi}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
                >
                  {t('Gợi ý: xem nghĩa tiếng Việt', 'Hint: show the Vietnamese meaning')}
                </button>
              )}
              {/* Chinese is typed through a pinyin keyboard: the reading is the real help. */}
              {item.read &&
                (showRead ? (
                  <p className="text-sm text-slate-500">🔤 {item.read}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowRead(true)}
                    className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
                  >
                    {t(`Gợi ý: xem ${readLabel}`, `Hint: show the ${readLabel}`)}
                  </button>
                ))}
            </div>
          </>
        ) : (
          <div className="space-y-3" aria-live="polite">
            {result.parts.length > 0 && (
              <p className="flex flex-wrap gap-1.5 text-lg">
                {result.parts.map((p, i) => (
                  <span key={i} className={`rounded-md px-1.5 py-0.5 ${tone[p.status]}`}>
                    {p.text}
                  </span>
                ))}
              </p>
            )}
            <p
              className={`text-sm font-semibold ${passed ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}
            >
              {result.pinyin?.peeked && result.score >= DICTATION_PASS
                ? t(
                    'Đúng bính âm, nhưng bạn đã xem gợi ý bính âm nên câu này chưa tính.',
                    'The pinyin is right, but the pinyin hint was open, so this one does not count.'
                  )
                : passed
                  ? t('Nghe rất tốt! 👂', 'Great listening! 👂')
                  : result.mistakes !== undefined
                    ? t(
                        `Nhầm ${result.mistakes} lần — nghe lại câu rồi đọc theo nhé.`,
                        `${result.mistakes} wrong taps — play it again and read along.`
                      )
                    : t(
                        'Chưa trọn câu — nghe lại phần màu vàng nhé.',
                        'Not quite — listen again for the yellow words.'
                      )}{' '}
              ({Math.round(result.score * 100)}%)
            </p>
            {result.pinyin && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'Chấm theo bính âm, không tính dấu thanh. Gõ bằng chữ Hán để luyện cả mặt chữ.',
                  'Graded on the pinyin, tones aside. Type the characters to practise them too.'
                )}
              </p>
            )}
            <p className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
              <b>{item.text}</b>
              {item.read && (
                <>
                  <br />
                  <span className="text-slate-600 dark:text-slate-300">{item.read}</span>
                </>
              )}
              <br />
              <span className="text-slate-500">{item.vi}</span>
            </p>
          </div>
        )}
      </div>

      <div className="session-actions mt-4">
        {!result ? (
          !noTyping && (
            <button
              onClick={check}
              disabled={!typed.trim()}
              className="btn-primary h-12 w-full disabled:opacity-50"
            >
              {t('Kiểm tra', 'Check')}
            </button>
          )
        ) : (
          <button ref={nextRef} onClick={next} className="btn-primary h-12 w-full">
            {idx + 1 < items.length ? t('Câu tiếp theo', 'Next') : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
