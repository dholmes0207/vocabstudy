import { Monitor, Moon, Sun } from 'lucide-react'
import type { ThemeSetting } from '@/types'
import { setThemeOrigin, useSettings } from '@/store/settingsStore'

const ORDER: ThemeSetting[] = ['light', 'dark', 'system']
const ICON = { light: Sun, dark: Moon, system: Monitor }
const LABEL = { light: 'Sáng', dark: 'Tối', system: 'Theo hệ thống' }

export default function ThemeToggle() {
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)
  const Icon = ICON[theme]

  const next = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setThemeOrigin(r.left + r.width / 2, r.top + r.height / 2)
    setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])
  }

  return (
    <button
      type="button"
      onClick={next}
      aria-label={`Giao diện: ${LABEL[theme]}. Bấm để đổi.`}
      title={`Giao diện: ${LABEL[theme]}`}
      className="btn-ghost h-10 w-10 !px-0"
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
