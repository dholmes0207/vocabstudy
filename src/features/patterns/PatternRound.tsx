import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { placeToken, shuffledOrder, startOrder, type OrderState } from '@/lib/games'
import {
  PATTERN_PACKS,
  ROLES,
  sentenceText,
  type PatternItem,
  type PatternPack,
} from '@/lib/patterns'
import { pronounce, textAudio } from '@/lib/audio'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// Build a sentence block by block. The slots on top name the role each block
// plays (subject, verb, place…) in its colour; the blocks below are plain until
// they snap into the right slot. A wrong block shakes and costs the sentence
// its star.

const XP_PER_CLEAN = 3

function fresh(item: PatternItem): OrderState {
  const tokens = item.sentence.chunks.map(([t]) => t)
  return startOrder(tokens, shuffledOrder(tokens.length))
}

export default function PatternRound({
  items,
  pack,
  onAgain,
  onExit,
}: {
  items: PatternItem[]
  pack: PatternPack
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [idx, setIdx] = useState(0)
  const [order, setOrder] = useState(() => fresh(items[0]))
  const [shaking, setShaking] = useState<number | null>(null)
  const [clean, setClean] = useState(0)
  const [done, setDone] = useState(false)
  const item = items[idx]
  const { speech, joiner } = PATTERN_PACKS[pack]
  const lang = pack
  const said = sentenceText(item.sentence, joiner)
  const roles = item.sentence.chunks.map(([, r]) => r)

  const tap = (pos: number) => {
    const { state, correct } = placeToken(order, pos)
    setOrder(state)
    if (!correct) {
      setShaking(pos)
      setTimeout(() => setShaking((s) => (s === pos ? null : s)), 400)
      if (soundOn) buzz(false)
      return
    }
    if (state.done) {
      if (state.mistakes === 0) setClean((c) => c + 1)
      if (soundOn) buzz(true)
      pronounce({ text: said, audioSrc: textAudio(said), lang: speech })
    }
  }
  const next = () => {
    if (idx + 1 < items.length) {
      setIdx(idx + 1)
      setOrder(fresh(items[idx + 1]))
      return
    }
    addPlayXp(code, clean * XP_PER_CLEAN)
    log(code, 'patterns')
    if (clean === items.length) celebrate(1.2)
    setDone(true)
  }

  if (done)
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center animate-fade-in">
        <p className="text-6xl" aria-hidden="true">
          {clean === items.length ? '🏆' : '🧱'}
        </p>
        <h1 className="text-2xl font-extrabold">
          {t(
            `${clean}/${items.length} câu xếp đúng ngay lần đầu`,
            `${clean} of ${items.length} built without a slip`
          )}
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t(
            `+${clean * XP_PER_CLEAN} XP. Nhìn màu là thấy khung câu: mỗi phần một chỗ, một màu.`,
            `+${clean * XP_PER_CLEAN} XP. The colours show the frame: each part has its place and its colour.`
          )}
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
            {t('Xong', 'Done')}
          </button>
          <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
            {t('Lượt khác', 'Another round')}
          </button>
        </div>
      </div>
    )

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="btn-ghost h-9 w-9 p-0"
          aria-label={t('Thoát', 'Exit')}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-rose-500 transition-all"
            style={{ width: `${((idx + (order.done ? 1 : 0)) / items.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {idx + 1}/{items.length}
        </span>
      </div>

      <section className="card space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {item.pattern.emoji} {t(...item.pattern.title)}
        </p>
        <p className="text-lg font-bold">{item.sentence.vi}</p>

        {/* The frame: one slot per block, named and coloured by its role. */}
        <ol className="flex flex-wrap gap-2" aria-label={t('Khung câu', 'Sentence frame')}>
          {roles.map((role, i) => {
            const filled = i < order.placed.length
            return (
              <li key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`flex min-h-[2.75rem] min-w-[3.5rem] items-center justify-center rounded-xl px-3 py-2 font-semibold transition ${
                    filled
                      ? `${ROLES[role].tone} text-white animate-pop`
                      : 'border-2 border-dashed border-slate-300 text-transparent dark:border-slate-600'
                  }`}
                  lang={lang}
                >
                  {filled ? order.tokens[i] : '·'}
                </span>
                <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                  {t(...ROLES[role].name)}
                </span>
              </li>
            )
          })}
        </ol>

        {!order.done ? (
          <div className="flex flex-wrap gap-2">
            {order.order.map((tokenIndex, pos) => {
              const used = order.placed.includes(pos)
              return (
                <button
                  key={pos}
                  type="button"
                  disabled={used}
                  onClick={() => tap(pos)}
                  lang={lang}
                  className={`min-h-[2.75rem] rounded-xl border-2 px-3 py-2 font-semibold transition active:scale-95 ${
                    used
                      ? 'border-transparent bg-slate-100 text-transparent dark:bg-slate-800'
                      : 'border-slate-300 bg-white hover:border-brand-400 dark:border-slate-600 dark:bg-slate-900'
                  } ${shaking === pos ? 'animate-shake border-rose-400' : ''}`}
                >
                  {order.tokens[tokenIndex]}
                </button>
              )
            })}
          </div>
        ) : (
          <p
            role="status"
            className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
          >
            <b>
              {order.mistakes === 0
                ? t('Chuẩn ngay lần đầu! ⭐', 'Right first time! ⭐')
                : t('Xong!', 'Done!')}
            </b>{' '}
            <span lang={lang}>{said}</span>
            {item.sentence.py && (
              <span className="mt-1 block text-emerald-800 dark:text-emerald-200">
                {item.sentence.py}
              </span>
            )}
          </p>
        )}
      </section>

      {order.done && (
        <button type="button" className="btn-primary h-12 w-full" onClick={next}>
          {idx + 1 < items.length ? t('Câu tiếp', 'Next') : t('Xem kết quả', 'See results')}{' '}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
