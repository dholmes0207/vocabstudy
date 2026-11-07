import { Suspense, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Dumbbell,
  Library,
  MessagesSquare,
  Repeat2,
  Settings,
  Sparkles,
  FolderOpen,
  Target,
  GraduationCap,
  Languages,
  AudioWaveform,
  Map as MapIcon,
} from 'lucide-react'
import AssistantFab, { AssistantHeaderButton } from './AssistantFab'
import { useStudy, cardsOf } from '@/store/studyStore'
import { useSettings } from '@/store/settingsStore'
import { useIsImmersive } from '@/store/uiStore'
import { getDueCards } from '@/lib/srs'
import { today } from '@/lib/date'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import UserMenu from './UserMenu'
import { CenterSpinner, DataGate } from './DataGate'
import ErrorBoundary from './ErrorBoundary'
import LevelUp from './LevelUp'
import { levelForXp } from '@/lib/xpLevel'
import { useProgressSync } from '@/hooks/useProgressSync'
import { useT } from '@/lib/i18n'
import UiLangToggle from './UiLangToggle'
import SiteFooter from './SiteFooter'
import NotificationBell from './NotificationBell'
import AuthNotice from './AuthNotice'
import Logo, { LogoMark } from './Logo'
import { markEntered } from '@/lib/entry'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { availableIn, packsFor } from '@/lib/packContent'
import PackOnly from './PackOnly'
import { useTargetLang } from '@/hooks/useTargetLang'
import { useLangParam } from '@/hooks/useLangParam'

/** A Vietnamese/English pair, picked by the interface language. */
type Pair = [vi: string, en: string]

interface NavItem {
  to: string
  label: Pair
  /** Shorter label for the phone's bottom bar. */
  short?: Pair
  icon: typeof BookOpen
  primary?: boolean // shown in the mobile bottom bar
  /** Other routes that belong to this tab (keeps it highlighted there). */
  also?: string[]
}

// Five tabs on a phone — six squeezed labels into 60px each. Quiz, games and
// speaking live under one "Luyện tập" hub; Stats/Settings stay in the sidebar
// and the header menu.
const NAV: NavItem[] = [
  { to: '/home', label: ['Trang chủ', 'Home'], icon: Sparkles, primary: true },
  { to: '/path', label: ['Lộ trình theo cấp', 'Level path'], icon: MapIcon },
  {
    to: '/learn',
    label: ['Học mới', 'Learn'],
    short: ['Học', 'Learn'],
    icon: BookOpen,
    primary: true,
  },
  { to: '/review', label: ['Ôn tập', 'Review'], icon: Repeat2, primary: true },
  {
    to: '/practice',
    label: ['Luyện tập', 'Practice'],
    icon: Dumbbell,
    primary: true,
    also: ['/quiz', '/games', '/speaking', '/listen', '/sounds'],
  },
  {
    to: '/phrases',
    label: ['Mẫu câu giao tiếp', 'Everyday phrases'],
    short: ['Mẫu câu', 'Phrases'],
    icon: MessagesSquare,
    primary: true,
  },
  // Korean and Chinese take the phrases slot on the phone with their own
  // sounds page (lib/packContent.ts decides which pack sees which); their
  // phrases then stay in the sidebar and the practice hub.
  {
    to: '/hangul',
    label: ['Bảng chữ Hangul', 'Hangul alphabet'],
    short: ['Hangul', 'Hangul'],
    icon: Languages,
    primary: true,
  },
  {
    to: '/pinyin',
    label: ['Pinyin & thanh điệu', 'Pinyin & tones'],
    short: ['Pinyin', 'Pinyin'],
    icon: AudioWaveform,
    primary: true,
  },
  // The dictionary moved off the phone's bottom bar to make room for phrases;
  // it stays in the sidebar, the account menu and on the home screen.
  { to: '/grammar', label: ['Ngữ pháp căn bản', 'Grammar basics'], icon: GraduationCap },
  { to: '/topics', label: ['Học theo chủ đề', 'Learn by topic'], icon: FolderOpen },
  { to: '/exam', label: ['Lộ trình luyện thi', 'Exam roadmap'], icon: Target },
  { to: '/browse', label: ['Tra cứu', 'Dictionary'], icon: Library },
  { to: '/stats', label: ['Thống kê', 'Stats'], icon: BarChart3 },
  { to: '/settings', label: ['Cài đặt', 'Settings'], icon: Settings },
]

const isOn = (item: NavItem, pathname: string) =>
  item.to === '/home'
    ? pathname === '/home'
    : [item.to, ...(item.also ?? [])].some((p) => pathname === p || pathname.startsWith(p + '/'))

export default function Layout() {
  useProgressSync()
  useLangParam()
  const t = useT()
  const L = useTargetLang()
  // Once the app has been opened here, "/" brings this device straight back to it.
  useEffect(() => markEntered(localStorage), [])
  useDocumentTitle(t(`VocaStudy · Học ${L.vi} mỗi ngày`, `VocaStudy · ${L.en}, a little every day`))
  const currentLang = useSettings((s) => s.currentLang)
  const progress = useStudy((s) => s.progress)
  const stats = progress[currentLang]?.stats
  const dueCount = getDueCards(cardsOf(progress, currentLang), today()).length
  const { pathname } = useLocation()
  // Screens written for another pack drop out of the menus and the bottom bar.
  const nav = NAV.filter((item) => availableIn(item.to, currentLang))
  const hasSoundsPage = nav.some((item) => item.to === '/hangul' || item.to === '/pinyin')
  const onlyFor = packsFor(pathname)
  // In a study session the phone gets the whole screen: no bottom bar, and the
  // session's own action bar sticks to the bottom instead.
  const immersive = useIsImmersive()

  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/85 px-4 py-6 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
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
      {/* Full height on every screen size, so a short page still puts the footer at the bottom. */}
      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-200/70 bg-white/90 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] shadow-sm shadow-slate-900/[0.03] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/85 lg:py-3">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          {/* Fits a 360 px phone: the theme switch moves into the account menu there. */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <UiLangToggle />
            <span className="hidden sm:block">
              <ThemeToggle />
            </span>
            <NotificationBell />
            <AssistantHeaderButton />
            <UserMenu />
          </div>
        </header>

        <main
          className={`mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-6 lg:pb-8 ${immersive ? 'pb-6' : 'pb-24'}`}
        >
          {!immersive && <AuthNotice />}
          {/* Keyed by path so a crash on one screen clears the moment the
              learner taps another tab — the nav around it keeps working. */}
          <ErrorBoundary key={pathname}>
            {/* Only the screen waits for the word pack or its code chunk; the
                header, avatar menu and navigation stay usable meanwhile. */}
            <div className="flex-1">
              <Suspense fallback={<CenterSpinner />}>
                <DataGate>
                  {onlyFor && !onlyFor.includes(currentLang) ? (
                    <PackOnly packs={onlyFor} />
                  ) : (
                    <Outlet />
                  )}
                </DataGate>
              </Suspense>
            </div>
          </ErrorBoundary>
          {/* Pinned to the bottom of short pages; hidden in study sessions to keep them focused. */}
          {!immersive && (
            <SiteFooter className="mt-12 border-t border-slate-200/70 pt-5 dark:border-white/10 lg:pr-20 xl:pr-0" />
          )}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {!immersive && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90 lg:hidden">
          {nav
            .filter((n) => n.primary && !(n.to === '/phrases' && hasSoundsPage))
            .map((item) => (
              <BottomLink
                key={item.to}
                item={item}
                active={isOn(item, pathname)}
                badge={item.to === '/review' ? dueCount : 0}
              />
            ))}
        </nav>
      )}

      <LevelUp />

      {/* Floating AI assistant (desktop bubble; on phones it opens from the header) */}
      <AssistantFab />
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  const t = useT()
  const L = useTargetLang()
  if (compact)
    return (
      <Link to="/home" aria-label="VocaStudy">
        {/* Just the mark on a small phone, where every header pixel counts. */}
        <LogoMark className="h-9 w-9 sm:hidden" />
        <span className="hidden sm:block">
          <Logo />
        </span>
      </Link>
    )
  return (
    <Link to="/home" aria-label="VocaStudy">
      <Logo tagline={t(`Học ${L.vi} mỗi ngày`, `${L.en}, a little every day`)} />
    </Link>
  )
}

function SideLink({ item, badge, active }: { item: NavItem; badge: number; active: boolean }) {
  const t = useT()
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
      <span className="flex-1">{t(...item.label)}</span>
      {badge > 0 && <span className="chip bg-brand-600 text-white">{badge}</span>}
    </NavLink>
  )
}

function BottomLink({ item, badge, active }: { item: NavItem; badge: number; active: boolean }) {
  const t = useT()
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
        className={`grid h-7 w-12 place-items-center rounded-full transition ${active ? 'nav-pill bg-brand-100 dark:bg-brand-950' : ''}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="whitespace-nowrap">{t(...(item.short ?? item.label))}</span>
      {badge > 0 && (
        <span className="absolute right-1/2 top-1 translate-x-5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-4 text-white">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

function StreakPill({ streak, xp }: { streak: number; xp: number }) {
  const t = useT()
  const lv = levelForXp(xp)
  return (
    <div className="mt-4 rounded-xl bg-slate-100/80 px-3 py-2.5 text-sm dark:bg-slate-800/70">
      <div
        className="mb-2"
        title={t(
          `${xp - lv.floor}/${lv.next - lv.floor} XP tới cấp ${lv.level + 1}`,
          `${xp - lv.floor}/${lv.next - lv.floor} XP to level ${lv.level + 1}`
        )}
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>
            {t('Cấp', 'Level')} {lv.level}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {t('cấp', 'level')} {lv.level + 1}
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
            style={{ width: `${Math.round(lv.ratio * 100)}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span
          className="flex items-center gap-1.5"
          title={t('Chuỗi ngày học liên tục', 'Study streak')}
        >
          🔥 <b>{streak}</b> {t('ngày', streak === 1 ? 'day' : 'days')}
        </span>
        <span
          className="flex items-center gap-1.5 text-brand-600 dark:text-brand-300"
          title={t('Điểm kinh nghiệm', 'Experience points')}
        >
          ⭐ {xp}
        </span>
      </div>
    </div>
  )
}
