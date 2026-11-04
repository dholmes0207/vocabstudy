import { useState } from 'react'
import { ArrowRight, Volume2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { familySlots, markingEnding, type WordFamily } from '@/lib/wordFamilies'
import { FORM_NAMES } from '@/lib/wordFormDrill'
import { placeToken, shuffledOrder, startOrder, type OrderState } from '@/lib/games'
import { pronounce, textAudio } from '@/lib/audio'
import { pinyinXp } from '@/lib/pinyin'
import { buzz, playCorrect } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Ghép họ từ" (lib/wordFamilies.ts): the forms of one word, shuffled, go into
// the noun, verb, adjective and adverb slots in turn. A family placed without a
// wrong tap counts as right; once it is complete, the ending of each form that
// has one is underlined, as in the endings drill.

const fresh = (fam: WordFamily | undefined): OrderState | null => {
  if (!fam) return null
  const tokens = familySlots(fam).map((s) => s.en)
  return startOrder(tokens, shuffledOrder(tokens.length))
}

export default function FamilyRound({
  families,
  onAgain,
  onExit,
}: {
  families: WordFamily[]
  onAgain: () => void
  onExit: () => void
}) {
  const t = useT()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'en-US')
  const rate = useSettings((s) => s.ttsRate)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [order, setOrder] = useState<OrderState | null>(() => fresh(families[0]))
  const [shaking, setShaking] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const title = t('Ghép họ từ', 'Word families')
  const fam = families[idx]

  if (xp !== null || !fam || !order)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="🌳"
          title={t('Xong một lượt!', 'Round complete!')}
          lines={[
            t(
              `Ghép đúng ngay lần đầu ${correct}/${families.length} họ từ`,
              `${correct} of ${families.length} families without a slip`
            ),
          ]}
          xp={xp ?? 0}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const slots = familySlots(fam)
  const say = (text: string) => pronounce({ audioSrc: textAudio(text), text, lang, rate })
  const tap = (pos: number) => {
    const { state, correct: ok } = placeToken(order, pos)
    setOrder(state)
    if (!ok) {
      if (soundOn) buzz(false)
      setShaking(pos)
      setTimeout(() => setShaking((s) => (s === pos ? null : s)), 400)
      return
    }
    say(state.tokens[state.order[pos]])
    if (state.done) {
      if (state.mistakes === 0) setCorrect((c) => c + 1)
      if (soundOn) playCorrect()
    }
  }
  const next = () => {
    if (idx + 1 < families.length) {
      setIdx(idx + 1)
      setOrder(fresh(families[idx + 1]))
      return
    }
    const earned = pinyinXp(correct, families.length)
    addPlayXp(code, earned)
    setXp(earned)
  }
  const filled = order.placed.length
  const current = slots[filled]

  return (
    <GameShell
      title={title}
      onExit={onExit}
      stats={
        <span>
          {idx + 1}/{families.length}
        </span>
      }
    >
      <div className="card space-y-4 p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {current
            ? t(
                `Chọn ${FORM_NAMES[current.cat][0].toLowerCase()} của họ từ này.`,
                `Pick the ${FORM_NAMES[current.cat][1].toLowerCase()} of this family.`
              )
            : t('Đủ cả họ từ!', 'The whole family!')}
        </p>
        <ul className="space-y-2">
          {slots.map((s, i) => {
            const done = i < filled
            const ending = done ? markingEnding(s.en, s.cat) : null
            return (
              <li
                key={s.cat}
                className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 ${
                  i === filled
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                    : done
                      ? 'border-emerald-300 dark:border-emerald-800'
                      : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="w-24 shrink-0 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  {t(...FORM_NAMES[s.cat])}
                </span>
                {done ? (
                  <>
                    <span lang="en" className="font-bold">
                      {ending ? (
                        <>
                          {s.en.slice(0, -ending.length)}
                          <span className="text-brand-600 underline dark:text-brand-300">
                            {ending}
                          </span>
                        </>
                      ) : (
                        s.en
                      )}
                    </span>
                    {order.done && (
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {s.vi}
                      </span>
                    )}
                    {order.done && (
                      <button
                        type="button"
                        className="ml-auto rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => say(s.en)}
                        aria-label={t(`Nghe "${s.en}"`, `Hear "${s.en}"`)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400">…</span>
                )}
              </li>
            )
          })}
        </ul>
        {!order.done && (
          <div className="flex flex-wrap gap-2">
            {order.order.map((tokenIndex, pos) => {
              const used = order.placed.includes(pos)
              return (
                <button
                  key={pos}
                  type="button"
                  lang="en"
                  onClick={() => tap(pos)}
                  disabled={used}
                  className={`min-h-[2.75rem] rounded-lg border-2 px-3 py-2 font-semibold transition active:scale-95 ${
                    used
                      ? 'border-transparent bg-slate-100 text-transparent dark:bg-slate-800'
                      : shaking === pos
                        ? 'animate-shake border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'border-slate-200 bg-white hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900'
                  }`}
                >
                  {order.tokens[tokenIndex]}
                </button>
              )
            })}
          </div>
        )}
        {order.done && (
          <p
            aria-live="polite"
            className={`text-sm font-semibold ${order.mistakes === 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}
          >
            {order.mistakes === 0
              ? t('Đúng ngay lần đầu!', 'Right first time!')
              : t(
                  `Xong, sai ${order.mistakes} lần.`,
                  `Done, with ${order.mistakes} slip${order.mistakes > 1 ? 's' : ''}.`
                )}
          </p>
        )}
      </div>
      {order.done && (
        <div className="session-actions mt-4">
          <button className="btn-primary h-12 w-full" onClick={next} autoFocus>
            {idx + 1 < families.length
              ? t('Họ từ tiếp theo', 'Next family')
              : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </GameShell>
  )
}
