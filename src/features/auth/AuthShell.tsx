import { useState } from 'react'
import { Link } from 'react-router-dom'
import UiLangToggle from '@/components/UiLangToggle'
import SiteFooter from '@/components/SiteFooter'
import { LogoMark } from '@/components/Logo'
import { useT } from '@/lib/i18n'
import { passwordProblem } from '@/lib/password'

// Shared pieces of the standalone account screens: sign in / sign up, and
// setting a new password from an email link (docs/design/account.md).

/** The centred card with the logo, language switch and footer. */
export function AuthShell({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex flex-1 items-center justify-center py-6">
        <div className="card relative w-full max-w-sm p-7 animate-fade-in">
          <UiLangToggle className="absolute right-3 top-3" />
          <div className="mb-5 text-center">
            <Link to="/" aria-label="VocaStudy" className="inline-block">
              <LogoMark className="mx-auto h-12 w-12 drop-shadow-md" />
            </Link>
            <h1 className="mt-3 text-xl font-extrabold">
              Voca<span className="text-aurora">Study</span>
            </h1>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
      <SiteFooter className="pb-[env(safe-area-inset-bottom)]" />
    </div>
  )
}

export const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900'

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  )
}

/** A success or error line under a form. */
export function Notice({ tone, children }: { tone: 'info' | 'error'; children: React.ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={
        tone === 'error'
          ? 'rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
          : 'rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
      }
    >
      {children}
    </p>
  )
}

/**
 * "New password" + "repeat it" with a submit button. Used by the reset page and
 * by Settings → Account.
 */
export function NewPasswordForm({
  onSubmit,
  submitLabel,
}: {
  onSubmit: (password: string) => Promise<void>
  submitLabel: string
}) {
  const t = useT()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = passwordProblem(password, confirm, t)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      await onSubmit(password)
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
    <form onSubmit={submit} className="space-y-3">
      <Field label={t('Mật khẩu mới', 'New password')}>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          placeholder={t('Tối thiểu 6 ký tự', 'At least 6 characters')}
          autoComplete="new-password"
        />
      </Field>
      <Field label={t('Nhập lại mật khẩu mới', 'Repeat the new password')}>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputCls}
          autoComplete="new-password"
        />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" disabled={busy} className="btn-primary h-11 w-full">
        {busy ? t('Đang xử lý…', 'Working…') : submitLabel}
      </button>
    </form>
  )
}
