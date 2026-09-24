import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, BookOpen, Dumbbell, Library, Repeat2, Settings, Sparkles } from 'lucide-react'
import AssistantFab, { AssistantHeaderButton } from './AssistantFab'
import { useStudy, cardsOf } from '@/store/studyStore'
import { useSettings } from '@/store/settingsStore'
import { useIsImmersive } from '@/store/uiStore'
import { getDueCards } from '@/lib/srs'
import { today } from '@/lib/date'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import UserMenu from './UserMenu'
import ErrorBoundary from './ErrorBoundary'
import { useProgressSync } from '@/hooks/useProgressSync'

interface NavItem {
  to: string
  label: string
  /** Shorter label for the phone's bottom bar. */
  short?: string
  icon: typeof BookOpen
  primary?: boolean // shown in the mobile bottom bar
  /** Other routes that belong to this tab (keeps it highlighted there). */
  also?: string[]
}

// Five tabs on a phone — six squeezed labels into 60px each. Quiz, games and
// speaking live under one "Luyện tập" hub; Stats/Settings stay in the sidebar
// and the header menu.
const NAV: NavItem[] = [
  { to: '/', label: 'Trang chủ', icon: Sparkles, primary: true },
  { to: '/learn', label: 'Học mới', short: 'Học', icon: BookOpen, primary: true },
  { to: '/review', label: 'Ôn tập', icon: Repeat2, primary: true },
  {
    to: '/practice',
    label: 'Luyện tập',
    icon: Dumbbell,
    primary: true,
    also: ['/quiz', '/games', '/speaking'],
  },
  { to: '/browse', label: 'Tra cứu', icon: Library, primary: true },
  { to: '/stats', label: 'Thống kê', icon: BarChart3 },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
]

const isOn = (item: NavItem, pathname: string) =>
  item.to === '/'
    ? pathname === '/'
    : [item.to, ...(item.also ?? [])].some((p) => pathname === p || pathname.startsWith(p + '/'))

export default function Layout() {
  useProgressSync()
  const currentLang = useSettings((s) => s.currentLang)
  const progress = useStudy((s) => s.progress)
  const stats = progress[currentLang]?.stats
  const dueCount = getDueCards(cardsOf(progress, currentLang), today()).length
  const { pathname } = useLocation()
  // In a study session the phone gets the whole screen: no bottom bar, and the
  // session's own action bar sticks to the bottom instead.
  const immersive = useIsImmersive()

  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-slate-200 bg-white/70 px-4 py-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <SideLink
              key={item.to}
              item={item}
              active={isOn(item, pathname)}
              badge={item.to === '/review' ? dueCount : 0}
            />
          ))}
        </nav>
        <StreakPill streak={stats?.streak ?? 0} xp={stats?.xp ?? 0} />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] dark:border-slate-800 dark:bg-slate-900 lg:bg-white/80 lg:py-3 lg:backdrop-blur lg:dark:bg-slate-900/80">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <AssistantHeaderButton />
            <UserMenu />
          </div>
        </header>

        <main
          className={`mx-auto w-full max-w-5xl flex-1 px-4 pt-6 lg:pb-10 ${immersive ? 'pb-6' : 'pb-28'}`}
        >
          {/* Keyed by path so a crash on one screen clears the moment the
              learner taps another tab — the nav around it keeps working. */}
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {!immersive && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          {NAV.filter((n) => n.primary).map((item) => (
            <BottomLink
              key={item.to}
              item={item}
              active={isOn(item, pathname)}
              badge={item.to === '/review' ? dueCount : 0}
            />
          ))}
        </nav>
      )}

      {/* Floating AI assistant (desktop bubble; on phones it opens from the header) */}
      <AssistantFab />
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg shadow-sm">
        📚
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="font-extrabold tracking-tight">VocabStudy</p>
          <p className="text-xs text-slate-400">Học từ vựng thông minh</p>
        </div>
      )}
      {compact && <p className="font-extrabold tracking-tight">VocabStudy</p>}
    </div>
  )
}

function SideLink({ item, badge, active }: { item: NavItem; badge: number; active: boolean }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1">{item.label}</span>
      {badge > 0 && <span className="chip bg-brand-600 text-white">{badge}</span>}
    </NavLink>
  )
}

function BottomLink({ item, badge, active }: { item: NavItem; badge: number; active: boolean }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={`relative flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition active:bg-slate-100 dark:active:bg-slate-800 ${
        active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
      }`}
    >
      <span
        className={`grid h-7 w-12 place-items-center rounded-full transition ${active ? 'bg-brand-100 dark:bg-brand-950' : ''}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="whitespace-nowrap">{item.short ?? item.label}</span>
      {badge > 0 && (
        <span className="absolute right-1/2 top-1 translate-x-5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-4 text-white">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

function StreakPill({ streak, xp }: { streak: number; xp: number }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5 text-sm dark:bg-slate-800">
      <span className="flex items-center gap-1.5" title="Chuỗi ngày học liên tục">
        🔥 <b>{streak}</b> ngày
      </span>
      <span
        className="flex items-center gap-1.5 text-brand-600 dark:text-brand-300"
        title="Điểm kinh nghiệm"
      >
        ⭐ {xp}
      </span>
    </div>
  )
}
