import { useState } from 'react'
import type { OrderState } from '@/lib/games'
import { useT } from '@/lib/i18n'

/**
 * Build a sentence by tapping word tiles in order (lib/games OrderState). A
 * wrong tile shakes instead of being placed. Shared by the phrases practice
 * and the grammar practice.
 */
export default function BuildTiles({
  order,
  onTap,
}: {
  order: OrderState
  onTap: (pos: number, el: HTMLElement) => boolean
}) {
  const t = useT()
  const [shaking, setShaking] = useState<number | null>(null)
  const press = (pos: number, el: HTMLElement) => {
    if (onTap(pos, el)) return
    setShaking(pos)
    setTimeout(() => setShaking((s) => (s === pos ? null : s)), 400)
  }
  const built = order.placed.map((pos) => order.tokens[order.order[pos]])
  return (
    <div className="space-y-3">
      <div
        className={`flex min-h-[3.5rem] flex-wrap content-start gap-2 rounded-xl border-2 border-dashed p-3 ${
          order.done
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
            : 'border-slate-300 dark:border-slate-700'
        }`}
      >
        {built.length ? (
          built.map((word, i) => (
            <span
              key={i}
              className="rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white animate-pop"
            >
              {word}
            </span>
          ))
        ) : (
          <span className="self-center text-sm text-slate-500 dark:text-slate-400">
            {t('Chạm các ô bên dưới theo thứ tự…', 'Tap the tiles below in order…')}
          </span>
        )}
      </div>
      {!order.done && (
        <div className="flex flex-wrap gap-2">
          {order.order.map((tokenIndex, pos) => {
            const used = order.placed.includes(pos)
            return (
              <button
                key={pos}
                onClick={(e) => press(pos, e.currentTarget)}
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
      {order.mistakes > 0 && !order.done && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {t(
            `Nhầm ${order.mistakes} lần — cứ bình tĩnh nhé.`,
            `${order.mistakes} wrong taps — take your time.`
          )}
        </p>
      )}
    </div>
  )
}
