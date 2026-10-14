import { useState } from 'react'
import { UserRound } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { useT } from '@/lib/i18n'
import { DISPLAY_NAME_MAX } from '@/lib/displayName'
import { LogoMark } from '@/components/Logo'
import { Field, Notice, inputCls } from '@/features/auth/AuthShell'

/**
 * "One more step": right after a first Google sign-in, the person chooses the
 * display name the admin will see on the waitlist (prefilled from Google),
 * instead of hunting for it in Settings later (docs/design/google-login.md).
 */
export default function CompleteProfile() {
  const step = useAuth((s) => s.onboarding)
  if (!step) return null
  // Keyed so a different account never inherits a half-typed name.
  return <CompleteProfileDialog key={step.userId} initialName={step.name} />
}

function CompleteProfileDialog({ initialName }: { initialName: string }) {
  const t = useT()
  const finishOnboarding = useAuth((s) => s.finishOnboarding)
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (chosen?: string) => {
    setError(null)
    setBusy(true)
    try {
      await finishOnboarding(chosen)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('Có lỗi xảy ra, thử lại nhé.', 'Something went wrong — please try again.')
      )
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-profile-title"
        className="card w-full max-w-sm p-6"
      >
        <div className="mb-4 text-center">
          <LogoMark className="mx-auto h-11 w-11" />
          <h2 id="complete-profile-title" className="mt-3 text-lg font-extrabold">
            {t('Một bước nữa thôi', 'One more step')}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t(
              'Chọn tên hiển thị của bạn. Tên này hiện trong tài khoản và giúp quản trị viên nhận ra bạn khi duyệt danh sách chờ.',
              'Choose your display name. It shows on your account and helps the admin recognise you on the waitlist.'
            )}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void run(name)
          }}
          className="space-y-3"
        >
          <Field label={t('Tên hiển thị', 'Display name')}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={DISPLAY_NAME_MAX}
              required
              autoFocus
              autoComplete="name"
              className={inputCls}
              placeholder={t('Nguyễn Văn A', 'Jane Doe')}
            />
          </Field>
          {error && <Notice tone="error">{error}</Notice>}
          <button type="submit" disabled={busy} className="btn-primary h-11 w-full">
            <UserRound className="h-4 w-4" />
            {busy ? t('Đang lưu…', 'Saving…') : t('Lưu và tiếp tục', 'Save and continue')}
          </button>
          {initialName && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run()}
              className="btn-ghost w-full text-sm"
            >
              {t(`Giữ tên "${initialName}"`, `Keep "${initialName}"`)}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
