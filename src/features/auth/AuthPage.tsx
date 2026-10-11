import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { useT } from '@/lib/i18n'
import UiLangToggle from '@/components/UiLangToggle'

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
  const t = useT()

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
        const { needsEmailConfirm, pendingApproval } = useAuth.getState()
        if (needsEmailConfirm) {
          setInfo(
            t(
              'Đã gửi đăng ký! Mở email để xác nhận địa chỉ. Sau đó tài khoản cần quản trị viên duyệt — trong lúc chờ, bạn cứ học ở chế độ khách nhé.',
              'Sign-up sent! Open your email to confirm the address. Then an admin needs to approve your account — meanwhile, keep learning as a guest.'
            )
          )
          setMode('login')
        } else if (pendingApproval) {
          setInfo(
            t(
              'Đăng ký thành công! Tài khoản đang chờ quản trị viên duyệt. Trong lúc chờ, bạn cứ học ở chế độ khách — tiến độ sẽ được đồng bộ khi tài khoản được duyệt.',
              "You're signed up! Your account is waiting for an admin's approval. Meanwhile, keep learning as a guest — your progress will sync once you're approved."
            )
          )
          setMode('login')
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('Có lỗi xảy ra, thử lại nhé.', 'Something went wrong — please try again.')
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-[100dvh] place-items-center p-4">
      <div className="card relative w-full max-w-sm p-7 animate-fade-in">
        <UiLangToggle className="absolute right-3 top-3" />
        <div className="mb-5 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-2xl shadow">
            📚
          </span>
          <h1 className="mt-3 text-xl font-extrabold">
            <span className="text-aurora">VocaStudy</span>
          </h1>
          <p className="text-sm text-slate-400">
            {mode === 'login'
              ? t('Đăng nhập để đồng bộ tiến độ', 'Sign in to sync your progress')
              : t('Tạo tài khoản mới', 'Create a new account')}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setMode('login')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}
          >
            {t('Đăng nhập', 'Sign in')}
          </button>
          <button
            onClick={() => setMode('register')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}
          >
            {t('Đăng ký', 'Sign up')}
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
              🛡️{' '}
              {t(
                'Tài khoản mới cần quản trị viên duyệt trước khi đăng nhập được.',
                'New accounts need an admin’s approval before you can sign in.'
              )}
            </p>
          )}
          {mode === 'register' && (
            <Field label={t('Tên hiển thị (tuỳ chọn)', 'Display name (optional)')}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder={t('Nguyễn Văn A', 'Jane Doe')}
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
              placeholder={t('ban@email.com', 'you@email.com')}
              autoComplete="email"
            />
          </Field>
          <Field label={t('Mật khẩu', 'Password')}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder={t('Tối thiểu 6 ký tự', 'At least 6 characters')}
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
            {busy
              ? t('Đang xử lý…', 'Working…')
              : mode === 'login'
                ? t('Đăng nhập', 'Sign in')
                : t('Đăng ký', 'Sign up')}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="btn-ghost mt-3 w-full text-sm">
          {t('Dùng thử không cần tài khoản →', 'Try it without an account →')}
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
