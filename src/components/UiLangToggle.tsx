import { Languages } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'

/** EN ⇄ VI for the interface. Shows the language you would switch *to*. */
export default function UiLangToggle({ className = '' }: { className?: string }) {
  const lang = useSettings((s) => s.uiLang)
  const setUiLang = useSettings((s) => s.setUiLang)
  const next = lang === 'vi' ? 'en' : 'vi'
  return (
    <button
      type="button"
      onClick={() => setUiLang(next)}
      className={`btn-secondary h-10 gap-1 !px-2.5 text-xs font-bold ${className}`}
      aria-label={
        lang === 'vi' ? 'Switch the interface to English' : 'Chuyển giao diện sang tiếng Việt'
      }
      title={lang === 'vi' ? 'English' : 'Tiếng Việt'}
    >
      <Languages className="h-4 w-4" />
      {next.toUpperCase()}
    </button>
  )
}
