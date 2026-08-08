import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, BookOpen, GraduationCap, Library, Repeat2, Settings, Sparkles } from 'lucide-react'
import AssistantFab from './AssistantFab'
import { useStudy, cardsOf } from '@/store/studyStore'
import { useSettings } from '@/store/settingsStore'
import { getDueCards } from '@/lib/srs'
import { today } from '@/lib/date'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import UserMenu from './UserMenu'
import { useProgressSync } from '@/hooks/useProgressSync'

interface NavItem {
  to: string
  label: string
  icon: typeof BookOpen
  primary?: boolean // shown in the mobile bottom bar
}

const NAV: NavItem[] = [
  { to: '/', label: 'Trang chủ', icon: Sparkles, primary: true },
  { to: '/learn', label: 'Học mới', icon: BookOpen, primary: true },
  { to: '/review', label: 'Ôn tập', icon: Repeat2, primary: true },
  { to: '/quiz', label: 'Kiểm tra', icon: GraduationCap, primary: true },
  { to: '/browse', label: 'Tra cứu', icon: Library, primary: true },
  { to: '/stats', label: 'Thống kê', icon: BarChart3 },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
]

export default function Layout() {
  useProgressSync()
  const currentLang = useSettings((s) => s.currentLang)
  const progress = useStudy((s) => s.progress)
  const stats = progress[currentLang]?.stats
  const dueCount = getDueCards(cardsOf(progress, currentLang), today()).length

  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-slate-200 bg-white/70 px-4 py-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <SideLink key={item.to} item={item} badge={item.to === '/review' ? dueCount : 0} />
          ))}
        </nav>
        <StreakPill streak={stats?.streak ?? 0} xp={stats?.xp ?? 0} />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:hidden">
        {NAV.filter((n) => n.primary).map((item) => (
          <BottomLink key={item.to} item={item} badge={item.to === '/review' ? dueCount : 0} />
        ))}
      </nav>

      {/* Floating AI assistant, available on every screen */}
      <AssistantFab />
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg shadow-sm">📚</span>
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

function SideLink({ item, badge }: { item: NavItem; badge: number }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1">{item.label}</span>
      {badge > 0 && (
        <span className="chip bg-brand-600 text-white">{badge}</span>
      )}
    </NavLink>
  )
}

function BottomLink({ item, badge }: { item: NavItem; badge: number }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
          isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
      {badge > 0 && (
        <span className="absolute right-1/2 top-1 translate-x-3 rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
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
      <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-300" title="Điểm kinh nghiệm">
        ⭐ {xp}
      </span>
    </div>
  )
}
