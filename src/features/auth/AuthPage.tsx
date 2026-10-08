import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/store/authStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const login = useAuth((s) => s.login)
  const register = useAuth((s) => s.register)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        navigate('/')
      } else {
        await register(email, password, name)
        if (useAuth.getState().needsEmailConfirm) {
          setInfo('Đã tạo tài khoản! Kiểm tra email để xác nhận, rồi quay lại đăng nhập nhé.')
          setMode('login')
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-[100dvh] place-items-center p-4">
      <div className="card w-full max-w-sm p-7 animate-fade-in">
        <div className="mb-5 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-2xl shadow">
            📚
          </span>
          <h1 className="mt-3 text-xl font-extrabold">
            <span className="text-aurora">VocabStudy</span>
          </h1>
          <p className="text-sm text-slate-400">
            {mode === 'login' ? 'Đăng nhập để đồng bộ tiến độ' : 'Tạo tài khoản mới'}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setMode('login')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setMode('register')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <Field label="Tên hiển thị (tuỳ chọn)">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="Nguyễn Văn A"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="ban@email.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </Field>

          {info && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              {info}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary h-11 w-full">
            {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {busy ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="btn-ghost mt-3 w-full text-sm">
          Dùng thử không cần tài khoản →
        </button>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  )
}
