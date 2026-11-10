import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, ScrollText, Sparkles } from 'lucide-react'
import { useT, useUiLang } from '@/lib/i18n'
import { formatLongDate } from '@/lib/formatDate'
import { POLICY_VERSION } from '@/lib/site'
import { hasUsedApp } from '@/lib/entry'
import {
  buildNotifications,
  markRead,
  readIds,
  unreadCount,
  type ReleaseLike,
} from '@/lib/notifications'

/**
 * The bell beside the language and theme buttons (docs/design/notifications.md).
 * Policy updates and recent releases wait here quietly instead of a card across
 * the top of every page; tapping one shows the details and marks it read.
 */
export default function NotificationBell() {
  const t = useT()
  const lang = useUiLang()
  const [releases, setReleases] = useState<ReleaseLike[]>([])
  const list = useMemo(() => buildNotifications(releases, POLICY_VERSION), [releases])
  // A newcomer starts with everything read — they are reading the current
  // policy and app for the first time anyway. Decided before Layout records
  // the visit, so it is only ever true on that very first render.
  const [newcomer] = useState(() => !hasUsedApp(localStorage))
  const [read, setRead] = useState(() =>
    newcomer ? new Set(list.map((n) => n.id)) : readIds(localStorage, POLICY_VERSION)
  )
  // The release history is long (it is the whole /changelog) and only the
  // newest few are shown here, so it loads after the page instead of in the
  // main bundle. Until then the bell lists the policy notice alone.
  useEffect(() => {
    let alive = true
    void import('@/features/marketing/releases').then(({ RELEASES }) => {
      if (!alive) return
      setReleases(RELEASES)
      // A newcomer's bell stays quiet for the releases too.
      if (newcomer) {
        const all = buildNotifications(RELEASES, POLICY_VERSION)
        setRead(
          markRead(
            localStorage,
            all.map((n) => n.id),
            all,
            POLICY_VERSION
          )
        )
      }
    })
    return () => {
      alive = false
    }
  }, [newcomer])
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const unread = unreadCount(list, read)

  useEffect(() => {
    if (newcomer)
      markRead(
        localStorage,
        list.map((n) => n.id),
        list,
        POLICY_VERSION
      )
  }, [newcomer, list])

  // Close on a tap outside, on Escape, and when a link inside leads elsewhere.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), 0)
    return () => clearTimeout(timer)
  }, [pathname])

  const toggleItem = (id: string) => {
    setExpanded((cur) => (cur === id ? null : id))
    if (!read.has(id)) setRead(markRead(localStorage, [id], list, POLICY_VERSION))
  }
  const markAll = () =>
    setRead(
      markRead(
        localStorage,
        list.map((n) => n.id),
        list,
        POLICY_VERSION
      )
    )

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={
          unread
            ? t(`Thông báo — ${unread} mới`, `Notifications — ${unread} new`)
            : t('Thông báo', 'Notifications')
        }
        className="btn-ghost relative h-10 w-10 !px-0"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('Thông báo', 'Notifications')}
          className="card fixed inset-x-4 top-[calc(env(safe-area-inset-top)+3.75rem)] z-40 max-h-[75vh] overflow-y-auto p-2 animate-fade-in sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <p className="font-bold">{t('Thông báo', 'Notifications')}</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                {t('Đánh dấu đã đọc hết', 'Mark all as read')}
              </button>
            )}
          </div>
          <ul className="space-y-0.5">
            {list.map((n) => {
              const isOpen = expanded === n.id
              const Icon = n.kind === 'policy' ? ScrollText : Sparkles
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => toggleItem(n.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Icon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${n.kind === 'policy' ? 'text-brand-500' : 'text-amber-500'}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{t(...n.title)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatLongDate(n.date, lang)}
                      </span>
                    </span>
                    {!read.has(n.id) && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500">
                        <span className="sr-only">{t('Mới', 'New')}</span>
                      </span>
                    )}
                  </button>
                  {isOpen && (
                    <div className="space-y-2 pb-3 pl-10 pr-2 text-sm text-slate-600 dark:text-slate-300">
                      {n.body.length > 1 ? (
                        <ul className="list-disc space-y-1 pl-4 marker:text-brand-400">
                          {n.body.map((b) => (
                            <li key={b[1]}>{t(...b)}</li>
                          ))}
                        </ul>
                      ) : (
                        n.body.map((b) => <p key={b[1]}>{t(...b)}</p>)
                      )}
                      <p className="flex flex-wrap gap-x-3 gap-y-1">
                        {n.links.map((l) => (
                          <Link
                            key={l.to}
                            to={l.to}
                            className="font-medium text-brand-600 hover:underline dark:text-brand-300"
                          >
                            {t(...l.label)}
                          </Link>
                        ))}
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
