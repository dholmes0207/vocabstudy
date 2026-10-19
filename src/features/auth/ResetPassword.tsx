import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/authStore'
import { useT } from '@/lib/i18n'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthShell, NewPasswordForm, Notice } from './AuthShell'

// /reset-password — where the "forgot password" email link lands
// (docs/design/account.md). supabase-js reads the link's fragment on start-up
// and opens a short recovery session; with it, the learner sets a new password.

type Phase = 'checking' | 'ready' | 'invalid' | 'done'

/** Supabase puts `#error_description=…` on an expired or already-used link. */
function linkFailed(hash: string): boolean {
  return new URLSearchParams(hash.replace(/^#/, '')).has('error_description')
}

export default function ResetPassword() {
  const t = useT()
  const navigate = useNavigate()
  const updatePassword = useAuth((s) => s.updatePassword)
  const [phase, setPhase] = useState<Phase>(() =>
    !supabase || linkFailed(window.location.hash) ? 'invalid' : 'checking'
  )
  useDocumentTitle(`${t('Đặt mật khẩu mới', 'Set a new password')} · VocaStudy`)

  // getSession waits until supabase-js has finished reading the link.
  useEffect(() => {
    if (phase !== 'checking' || !supabase) return
    let alive = true
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setPhase(data.session ? 'ready' : 'invalid')
    })
    return () => {
      alive = false
    }
  }, [phase])

  return (
    <AuthShell subtitle={t('Đặt mật khẩu mới', 'Set a new password')}>
      {phase === 'checking' && (
        <p role="status" className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('Đang kiểm tra link…', 'Checking your link…')}
        </p>
      )}

      {phase === 'ready' && (
        <NewPasswordForm
          submitLabel={t('Lưu mật khẩu mới', 'Save new password')}
          onSubmit={async (password) => {
            await updatePassword(password)
            setPhase('done')
          }}
        />
      )}

      {phase === 'done' && (
        <div className="space-y-3">
          <Notice tone="info">
            {t(
              'Đã đổi mật khẩu. Từ giờ hãy dùng mật khẩu mới nhé.',
              'Your password has been changed.'
            )}
          </Notice>
          <button onClick={() => navigate('/home')} className="btn-primary h-11 w-full">
            {t('Vào học →', 'Continue to the app →')}
          </button>
        </div>
      )}

      {phase === 'invalid' && (
        <div className="space-y-3">
          <Notice tone="error">
            {t(
              'Link này đã hết hạn hoặc đã được dùng. Mỗi link chỉ dùng được một lần, trong thời gian ngắn.',
              'This link has expired or has already been used. Each link works once, for a short time.'
            )}
          </Notice>
          <Link to="/login?forgot=1" className="btn-primary h-11 w-full">
            {t('Gửi link mới', 'Send a new link')}
          </Link>
          <Link to="/login" className="btn-ghost w-full text-sm">
            {t('← Quay lại đăng nhập', '← Back to sign in')}
          </Link>
        </div>
      )}
    </AuthShell>
  )
}
