import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, ShieldCheck } from 'lucide-react'
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
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  if (status === 'loading')
    return <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

  if (!user) {
    return (
      <Link to="/login" className="btn-secondary h-10 gap-1.5 !px-3">
        <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Đăng nhập</span>
      </Link>
    )
  }

  const initial = (user.name || user.email)[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-bold text-white"
        aria-label="Tài khoản"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initial}
      </button>
      {open && (
        <div
          className="card absolute right-0 z-40 mt-2 w-56 overflow-hidden p-1 animate-fade-in"
          role="menu"
        >
          <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <p className="truncate text-sm font-semibold">{user.name || 'Người học'}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
            <span
              className={`chip mt-1 ${user.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
            >
              {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
            </span>
          </div>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              role="menuitem"
            >
              <ShieldCheck className="h-4 w-4" /> Quản trị
            </Link>
          )}
          <button
            onClick={async () => {
              setOpen(false)
              await logout()
              navigate('/')
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
