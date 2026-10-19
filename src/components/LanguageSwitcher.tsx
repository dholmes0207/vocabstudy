import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useT } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const manifest = useData((s) => s.manifest)
  const currentLang = useSettings((s) => s.currentLang)
  const setCurrentLang = useSettings((s) => s.setCurrentLang)
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const langs = manifest?.languages ?? []
  const active = langs.find((l) => l.code === currentLang) ?? langs[0]
  if (!active) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-secondary h-10 gap-1.5 !px-3"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-lg leading-none">{active.flag}</span>
        <span className="hidden text-sm sm:inline">{t(active.nativeName, active.name)}</span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="card fixed inset-x-4 top-[calc(env(safe-area-inset-top)+3.75rem)] z-30 overflow-hidden p-1 animate-fade-in sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-56"
        >
          {langs.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === currentLang}
                onClick={() => {
                  setCurrentLang(l.code)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    {t(l.nativeName, l.name)}
                    {l.beta && (
                      <span className="chip bg-amber-100 px-1.5 py-0 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        Beta
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {l.count} {t('từ', 'words')}
                  </span>
                </span>
                {l.code === currentLang && <Check className="h-4 w-4 text-brand-500" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
