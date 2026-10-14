import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { useT } from '@/lib/i18n'
import { fetchAuthSettings } from '@/lib/supabase'
import { parseProviders } from '@/lib/authProviders'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { POLICY_VERSION } from '@/lib/site'
import { AuthShell, Field, Notice, inputCls } from './AuthShell'

type Mode = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const login = useAuth((s) => s.login)
  const register = useAuth((s) => s.register)
  const requestPasswordReset = useAuth((s) => s.requestPasswordReset)
  const signInWithGoogle = useAuth((s) => s.signInWithGoogle)
  const googleOn = useGoogleSignIn()
  const [mode, setMode] = useState<Mode>(() => (params.get('forgot') ? 'forgot' : 'login'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  // Never pre-ticked: consent must be an action the person takes.
  const [agreed, setAgreed] = useState(false)
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
    if (mode === 'register' && !agreed) {
      setError(
        t(
          'Hãy đọc và đồng ý với Điều khoản sử dụng và Chính sách bảo mật để đăng ký.',
          'Please read and accept the Terms of use and Privacy policy to sign up.'
        )
      )
      return
    }
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
        await register(email, password, name, POLICY_VERSION)
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

  const continueWithGoogle = async () => {
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      await signInWithGoogle(POLICY_VERSION)
      // The browser is now on its way to Google; stay busy until it leaves.
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('Có lỗi xảy ra, thử lại nhé.', 'Something went wrong — please try again.')
      )
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

      {googleOn && mode !== 'forgot' && (
        <div className="mb-4 space-y-2.5">
          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={busy}
            className="btn-secondary h-11 w-full"
          >
            <GoogleMark className="h-4 w-4" /> {t('Tiếp tục với Google', 'Continue with Google')}
          </button>
          <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t(
              'Tiếp tục với Google nghĩa là bạn đồng ý với ',
              'By continuing with Google you agree to the '
            )}
            <ConsentLink to="/terms">{t('Điều khoản sử dụng', 'Terms of use')}</ConsentLink>
            {t(' và ', ' and the ')}
            <ConsentLink to="/privacy">{t('Chính sách bảo mật', 'Privacy policy')}</ConsentLink>
            {t(
              ', gồm việc lưu trữ dữ liệu ở nước ngoài. Tài khoản mới vào danh sách chờ beta; nếu dưới 16 tuổi, bạn cần cha mẹ đồng ý.',
              ', including storing data outside Vietnam. New accounts join the beta waitlist; if you are under 16, a parent must agree too.'
            )}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            {t('hoặc dùng email', 'or use email')}
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
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

        {mode === 'register' && (
          <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
            />
            <span>
              {t('Tôi đồng ý với ', 'I agree to the ')}
              <ConsentLink to="/terms">{t('Điều khoản sử dụng', 'Terms of use')}</ConsentLink>
              {t(' và ', ' and the ')}
              <ConsentLink to="/privacy">{t('Chính sách bảo mật', 'Privacy policy')}</ConsentLink>
              {t(
                ', gồm việc dữ liệu được lưu trữ và xử lý trên máy chủ ở nước ngoài. Nếu dưới 16 tuổi, tôi đã có sự đồng ý của cha mẹ hoặc người giám hộ.',
                ', including storing and processing my data on servers outside Vietnam. If I am under 16, a parent or guardian has agreed too.'
              )}
            </span>
          </label>
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

/** Opens in a new tab so the half-filled form is not lost. */
function ConsentLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      target="_blank"
      rel="noopener"
      className="font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
    >
      {children}
    </Link>
  )
}

/**
 * Is "Continue with Google" switched on in Supabase? Asked once per visit, so
 * enabling the provider there is all it takes — no redeploy.
 */
function useGoogleSignIn(): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => {
    let alive = true
    void fetchAuthSettings().then((json) => {
      if (alive) setOn(parseProviders(json).google)
    })
    return () => {
      alive = false
    }
  }, [])
  return on
}

/** Google's "G", as its sign-in branding asks. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  )
}
