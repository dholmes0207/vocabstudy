import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, LogIn, LogOut, Menu, Settings, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/store/authStore'

export default function UserMenu() {
  const user = useAuth((s) => s.user)
  const status = useAuth((s) => s.status)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  if (status === 'loading')
    return <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

  const initial = user ? ((user.name || user.email)[0]?.toUpperCase() ?? '?') : null
  const close = () => setOpen(false)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={
          user
            ? 'grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-bold text-white'
            : 'grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }
        aria-label={user ? 'Tài khoản & menu' : 'Menu'}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user ? initial : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div
          className="card absolute right-0 z-40 mt-2 w-56 overflow-hidden p-1 animate-fade-in"
          role="menu"
        >
          {user ? (
            <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
              <p className="truncate text-sm font-semibold">{user.name || 'Người học'}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
              <span
                className={`chip mt-1 ${user.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
              >
                {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
              </span>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={close}
              className="m-1 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              role="menuitem"
            >
              <LogIn className="h-4 w-4" /> Đăng nhập / Đăng ký
            </Link>
          )}

          <MenuLink to="/settings" onClick={close} icon={Settings}>
            Cài đặt
          </MenuLink>
          <MenuLink to="/stats" onClick={close} icon={BarChart3}>
            Thống kê
          </MenuLink>
          {user?.role === 'admin' && (
            <MenuLink to="/admin" onClick={close} icon={ShieldCheck}>
              Quản trị
            </MenuLink>
          )}

          {user && (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                onClick={async () => {
                  close()
                  await logout()
                  navigate('/')
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" /> Đăng xuất
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
