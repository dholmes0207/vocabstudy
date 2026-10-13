import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { useT } from '@/lib/i18n'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthShell, Field, Notice, inputCls } from './AuthShell'

type Mode = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const login = useAuth((s) => s.login)
  const register = useAuth((s) => s.register)
  const requestPasswordReset = useAuth((s) => s.requestPasswordReset)
  const [mode, setMode] = useState<Mode>(() => (params.get('forgot') ? 'forgot' : 'login'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const t = useT()
  const titles: Record<Mode, string> = {
    login: t('Đăng nhập', 'Sign in'),
    register: t('Đăng ký', 'Sign up'),
    forgot: t('Quên mật khẩu', 'Forgot password'),
  }
  useDocumentTitle(`${titles[mode]} · VocaStudy`)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'forgot') {
        await requestPasswordReset(email)
        setInfo(
          t(
            `Nếu ${email} đã có tài khoản, link đặt lại mật khẩu đang trên đường tới hộp thư. Nhớ xem cả mục thư rác nhé.`,
            `If ${email} has an account, a reset link is on its way. Check your spam folder too.`
          )
        )
      } else if (mode === 'login') {
        await login(email, password)
        navigate('/home')
      } else {
        await register(email, password, name)
        const { needsEmailConfirm, pendingApproval } = useAuth.getState()
        if (needsEmailConfirm) {
          setInfo(
            t(
              'Sắp xong rồi! Mở email để xác nhận địa chỉ — sau đó bạn có tên trong danh sách chờ bản beta. Trong lúc chờ, cứ học ở chế độ khách nhé.',
              "Almost there! Open your email to confirm the address — then you're on the beta waitlist. Meanwhile, keep learning as a guest."
            )
          )
          setMode('login')
        } else if (pendingApproval) {
          setInfo(
            t(
              'Bạn đã có tên trong danh sách chờ bản beta! Tài khoản mới được duyệt thủ công — thỉnh thoảng thử đăng nhập lại nhé. Trong lúc chờ, cứ học ở chế độ khách: tiến độ trên máy này sẽ được đồng bộ khi tài khoản được mở.',
              "You're on the beta waitlist! New accounts are approved by hand — try signing in again later. Meanwhile, keep learning as a guest: your progress on this device will sync once you're in."
            )
          )
          setMode('login')
        } else {
          navigate('/home')
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

  const subtitle = {
    login: t('Đăng nhập để đồng bộ tiến độ', 'Sign in to sync your progress'),
    register: t('Tham gia bản beta', 'Join the beta'),
    forgot: t('Đặt lại mật khẩu qua email', 'Reset your password by email'),
  }[mode]

  return (
    <AuthShell subtitle={subtitle}>
      {mode !== 'forgot' && (
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => switchMode('login')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}
          >
            {t('Đăng nhập', 'Sign in')}
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}
          >
            {t('Đăng ký', 'Sign up')}
          </button>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        {mode === 'register' && (
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
            🚀{' '}
            {t(
              'Tài khoản VocaStudy đang trong giai đoạn beta: đăng ký để vào danh sách chờ, tài khoản mới được duyệt thủ công. Không cần tài khoản vẫn học được ngay.',
              'VocaStudy accounts are in beta: sign up to join the waitlist — new accounts are approved by hand. You can start learning right now without one.'
            )}
          </p>
        )}
        {mode === 'forgot' && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              'Nhập email bạn dùng để đăng ký. Chúng tôi sẽ gửi một link để đặt mật khẩu mới.',
              "Enter the email you signed up with and we'll send you a link to set a new password."
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
        {mode !== 'forgot' && (
          <div>
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
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="mt-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                {t('Quên mật khẩu?', 'Forgot password?')}
              </button>
            )}
          </div>
        )}

        {info && <Notice tone="info">{info}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}

        <button type="submit" disabled={busy} className="btn-primary h-11 w-full">
          {mode === 'login' ? (
            <LogIn className="h-4 w-4" />
          ) : mode === 'register' ? (
            <UserPlus className="h-4 w-4" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          {busy
            ? t('Đang xử lý…', 'Working…')
            : {
                login: t('Đăng nhập', 'Sign in'),
                register: t('Vào danh sách chờ', 'Join the waitlist'),
                forgot: t('Gửi link đặt lại', 'Send reset link'),
              }[mode]}
        </button>
      </form>

      {mode === 'forgot' ? (
        <button onClick={() => switchMode('login')} className="btn-ghost mt-3 w-full text-sm">
          {t('← Quay lại đăng nhập', '← Back to sign in')}
        </button>
      ) : (
        <button onClick={() => navigate('/home')} className="btn-ghost mt-3 w-full text-sm">
          {t('Dùng thử không cần tài khoản →', 'Try it without an account →')}
        </button>
      )}
    </AuthShell>
  )
}
