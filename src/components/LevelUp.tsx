import { useEffect, useState } from 'react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { levelForXp } from '@/lib/xpLevel'
import { skyCelebrate } from '@/lib/skyEvents'
import { useT } from '@/lib/i18n'

const key = (code: string) => `vocab.levelSeen.${code}`

function readSeen(code: string): number | null {
  try {
    const v = localStorage.getItem(key(code))
    return v ? Number(v) : null
  } catch {
    return null
  }
}

/**
 * "Lên cấp N!" — a short toast and a sky full of sparkles whenever XP crosses
 * into a new level. Levels already reached before this shipped are not
 * celebrated again (the first visit just records the current one).
 */
export default function LevelUp() {
  const code = useSettings((s) => s.currentLang)
  const xp = useStudy((s) => s.progress[code]?.stats.xp ?? 0)
  const level = levelForXp(xp).level
  const [shown, setShown] = useState<number | null>(null)
  const t = useT()

  useEffect(() => {
    const seen = readSeen(code)
    if (seen !== null && level <= seen) return
    // Record and celebrate in one deferred step: if the effect is torn down
    // first (StrictMode, a quick re-render), nothing was recorded and the
    // next run still celebrates.
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key(code), String(level))
      } catch {
        // storage blocked: celebrate anyway, it just may repeat next visit
      }
      if (seen === null) return // first visit: just remember the current level
      skyCelebrate(1.2)
      setShown(level)
    }, 0)
    return () => clearTimeout(t)
  }, [code, level])

  useEffect(() => {
    if (shown === null) return
    const t = setTimeout(() => setShown(null), 3500)
    return () => clearTimeout(t)
  }, [shown])

  if (shown === null) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="pop-in fixed left-1/2 top-[max(4.5rem,calc(env(safe-area-inset-top)+4rem))] z-50 -translate-x-1/2"
    >
      <div className="glow-ring card px-6 py-3 text-center">
        <p className="text-lg font-extrabold">
          🎉 <span className="text-aurora">{t(`Lên cấp ${shown}!`, `Level ${shown}!`)}</span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('Mỗi câu trả lời đều đưa bạn đi xa hơn.', 'Every answer takes you further.')}
        </p>
      </div>
    </div>
  )
}
