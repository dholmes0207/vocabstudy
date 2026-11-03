import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import type { HskOrder } from '@/lib/hskPractice'
import { placeToken, shuffledOrder, startOrder, type OrderState } from '@/lib/games'
import { exampleAudio, pronounce, stopPronounce } from '@/lib/audio'
import { pinyinXp } from '@/lib/pinyin'
import { buzz } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'
import BuildTiles from '@/components/BuildTiles'

// HSK 3 writing, part one (完成句子): put the words of a sentence in order
// (lib/hskPractice.ts). A sentence built without a wrong tap counts as right.

const fresh = (q: HskOrder | undefined): OrderState | null =>
  q ? startOrder(q.tokens, shuffledOrder(q.tokens.length)) : null

export default function HskOrderRound({
  title,
  questions,
  onAgain,
  onExit,
  onDone,
}: {
  title: string
  questions: HskOrder[]
  onAgain: () => void
  onExit: () => void
  onDone?: (correct: number, total: number) => void
}) {
  const t = useT()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'zh-CN')
  const rate = useSettings((s) => s.ttsRate)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [order, setOrder] = useState<OrderState | null>(() => fresh(questions[0]))
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const q = questions[idx]

  if (xp !== null || !q || !order)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="🧱"
          title={t('Xong một lượt!', 'Round complete!')}
          lines={[
            t(
              `Xếp đúng ngay lần đầu ${correct}/${questions.length} câu`,
              `${correct} of ${questions.length} built without a slip`
            ),
          ]}
          xp={xp ?? 0}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const tap = (pos: number): boolean => {
    if (order.done) return false
    const { state, correct: ok } = placeToken(order, pos)
    setOrder(state)
    if (!ok && soundOn) buzz(false)
    if (state.done) {
      if (state.mistakes === 0) setCorrect((c) => c + 1)
      pronounce({
        audioSrc: exampleAudio(q.word.id, q.word.exampleEn),
        text: q.word.exampleEn,
        lang,
        rate,
      })
    }
    return ok
  }
  const next = () => {
    stopPronounce()
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setOrder(fresh(questions[idx + 1]))
      return
    }
    if (onDone) return onDone(correct, questions.length)
    const earned = pinyinXp(correct, questions.length)
    addPlayXp(code, earned)
    setXp(earned)
  }

  return (
    <GameShell
      title={title}
      onExit={onExit}
      stats={
        <span>
          {idx + 1}/{questions.length}
        </span>
      }
    >
      <div className="card space-y-4 p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            `Xếp các từ thành câu hoàn chỉnh (câu kết thúc bằng "${q.end || '。'}").`,
            `Put the words in order to make a sentence (it ends with "${q.end || '。'}").`
          )}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">💬 {q.word.exampleVi}</p>
        <div lang="zh" className="text-xl">
          <BuildTiles order={order} onTap={tap} />
        </div>
        {order.done && (
          <div
            className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"
            aria-live="polite"
          >
            <p
              className={`font-semibold ${order.mistakes === 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}
            >
              {order.mistakes === 0
                ? t('Đúng ngay lần đầu!', 'Right first time!')
                : t(`Xong, sai ${order.mistakes} lần.`, `Done, with ${order.mistakes} slips.`)}
            </p>
            <p lang="zh" className="text-lg font-bold">
              {q.tokens.join('') + q.end}
            </p>
            {q.word.exampleRead && (
              <p className="text-slate-600 dark:text-slate-300">{q.word.exampleRead}</p>
            )}
          </div>
        )}
      </div>
      {order.done && (
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
