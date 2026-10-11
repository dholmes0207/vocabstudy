import { useEffect } from 'react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'

// The word pack is ~2 MB, so only the screen waits for it — never the app's
// chrome. The header (avatar, sign-in, settings, stats) and the navigation are
// rendered around this gate and work from the very first frame.

/** Ensures the manifest and the active language pack are loaded before children render. */
export function DataGate({ children }: { children: React.ReactNode }) {
  const currentLang = useSettings((s) => s.currentLang)
  const { manifest, pack, status, error, ensureManifest, loadLanguage } = useData()

  useEffect(() => {
    ensureManifest()
  }, [ensureManifest])

  useEffect(() => {
    loadLanguage(currentLang)
  }, [currentLang, loadLanguage])

  if (status === 'error') {
    return (
      <div className="grid min-h-[60vh] place-items-center p-6 text-center">
        <div className="card max-w-md p-8">
          <p className="text-4xl">😕</p>
          <h1 className="mt-3 text-lg font-bold">Không tải được dữ liệu</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button className="btn-primary mt-5" onClick={() => location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!manifest || !pack || status !== 'ready') {
    return <CenterSpinner />
  }

  return <>{children}</>
}

/** While a screen or the word pack loads: a tiny constellation drawing itself. */
export function CenterSpinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status">
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 64 40" className="loader-constellation h-12 w-20" aria-hidden="true">
          <polyline points="6,30 20,12 34,22 48,8 58,26" />
          {[
            [6, 30],
            [20, 12],
            [34, 22],
            [48, 8],
            [58, 26],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.4" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </svg>
        <span className="text-sm text-slate-500 dark:text-slate-400">Đang tải…</span>
      </div>
    </div>
  )
}
