import { Monitor, Moon, Sun } from 'lucide-react'
import type { ThemeSetting } from '@/types'
import { setThemeOrigin, useSettings } from '@/store/settingsStore'
import { useT } from '@/lib/i18n'

const ORDER: ThemeSetting[] = ['light', 'dark', 'system']
const ICON = { light: Sun, dark: Moon, system: Monitor }
const LABEL: Record<ThemeSetting, [string, string]> = {
  light: ['Sáng', 'Light'],
  dark: ['Tối', 'Dark'],
  system: ['Theo hệ thống', 'System'],
}

export default function ThemeToggle() {
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)
  const t = useT()
  const Icon = ICON[theme]
  const label = t(...LABEL[theme])

  const next = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setThemeOrigin(r.left + r.width / 2, r.top + r.height / 2)
    setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])
  }

  return (
    <button
      type="button"
      onClick={next}
      aria-label={t(`Giao diện: ${label}. Bấm để đổi.`, `Theme: ${label}. Click to change.`)}
      title={t(`Giao diện: ${label}`, `Theme: ${label}`)}
      className="btn-ghost h-10 w-10 !px-0"
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
