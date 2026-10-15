import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  FolderOpen,
  GraduationCap,
  Monitor,
  Moon,
  Sun,
  Library,
  LogIn,
  LogOut,
  Menu,
  MessageSquareHeart,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { setThemeOrigin, useSettings } from '@/store/settingsStore'
import type { ThemeSetting } from '@/types'
import { usePendingSignups } from '@/hooks/usePendingSignups'
import { useT } from '@/lib/i18n'
import { openFeedback } from '@/store/feedbackStore'
import { availableIn } from '@/lib/packContent'

export default function UserMenu() {
  // No loading placeholder: a returning learner's avatar comes from the cache
  // at once, and everyone else gets a working menu right away.
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pending = usePendingSignups(user?.role === 'admin', open)
  const currentLang = useSettings((s) => s.currentLang)
  const t = useT()

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const initial = user ? ((user.name || user.email)[0]?.toUpperCase() ?? '?') : null
  const close = () => setOpen(false)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={
          user
            ? 'relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 font-bold text-white shadow-md shadow-brand-600/30'
            : 'grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }
        aria-label={
          user
            ? t(
                `Tài khoản & menu${pending ? ` — ${pending} người trong danh sách chờ` : ''}`,
                `Account & menu${pending ? ` — ${pending} on the waitlist` : ''}`
              )
            : t('Menu: đăng nhập, cài đặt, thống kê', 'Menu: sign in, settings, stats')
        }
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user ? initial : <Menu className="h-5 w-5" />}
        {pending > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
        )}
      </button>
      {open && (
        <div
          className="card absolute right-0 z-40 mt-2 w-56 overflow-hidden p-1 animate-fade-in"
          role="menu"
        >
          {user ? (
            <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
              <p className="truncate text-sm font-semibold">
                {user.name || t('Người học', 'Learner')}
              </p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
              <span
                className={`chip mt-1 ${user.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
              >
                {user.role === 'admin' ? t('Quản trị viên', 'Admin') : t('Học viên', 'Learner')}
              </span>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={close}
              className="m-1 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              role="menuitem"
            >
              <LogIn className="h-4 w-4" /> {t('Đăng nhập / Đăng ký', 'Sign in / Sign up')}
            </Link>
          )}

          <ThemeMenuItem />
          <MenuLink to="/settings" onClick={close} icon={Settings}>
            {t('Cài đặt', 'Settings')}
          </MenuLink>
          <MenuLink to="/stats" onClick={close} icon={BarChart3}>
            {t('Thống kê', 'Stats')}
          </MenuLink>
          {availableIn('/grammar', currentLang) && (
            <MenuLink to="/grammar" onClick={close} icon={GraduationCap}>
              {t('Ngữ pháp căn bản', 'Grammar basics')}
            </MenuLink>
          )}
          {availableIn('/topics', currentLang) && (
            <MenuLink to="/topics" onClick={close} icon={FolderOpen}>
              {t('Học theo chủ đề', 'Learn by topic')}
            </MenuLink>
          )}
          <MenuLink to="/browse" onClick={close} icon={Library}>
            {t('Tra cứu từ', 'Dictionary')}
          </MenuLink>
          <button
            type="button"
            onClick={() => {
              close()
              openFeedback()
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            role="menuitem"
          >
            <MessageSquareHeart className="h-4 w-4" /> {t('Góp ý', 'Send feedback')}
          </button>
          {user?.role === 'admin' && (
            <MenuLink to="/admin" onClick={close} icon={ShieldCheck}>
              {t('Quản trị', 'Admin')}
              {pending > 0 && (
                <span className="ml-auto rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                  {pending} {t('chờ duyệt', 'waiting')}
                </span>
              )}
            </MenuLink>
          )}

          {user && (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                onClick={async () => {
                  close()
                  await logout()
                  navigate('/home')
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" /> {t('Đăng xuất', 'Sign out')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MenuLink({
  to,
  onClick,
  icon: Icon,
  children,
}: {
  to: string
  onClick: () => void
  icon: typeof Settings
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
      role="menuitem"
    >
      <Icon className="h-4 w-4" /> {children}
    </Link>
  )
}

const THEMES: { value: ThemeSetting; icon: typeof Sun; label: [string, string] }[] = [
  { value: 'light', icon: Sun, label: ['Sáng', 'Light'] },
  { value: 'dark', icon: Moon, label: ['Tối', 'Dark'] },
  { value: 'system', icon: Monitor, label: ['Theo máy', 'System'] },
]

/** Phones only: the header has no room for the theme button there. */
function ThemeMenuItem() {
  const t = useT()
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)
  const i = Math.max(
    0,
    THEMES.findIndex((x) => x.value === theme)
  )
  const current = THEMES[i]
  const Icon = current.icon
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setThemeOrigin(r.left + 24, r.top + r.height / 2)
        setTheme(THEMES[(i + 1) % THEMES.length].value)
      }}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"
    >
      <Icon className="h-4 w-4" /> {t('Giao diện', 'Theme')}:{' '}
      <span className="font-semibold">{t(...current.label)}</span>
    </button>
  )
}
