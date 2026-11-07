import { Link } from 'react-router-dom'
import { useAuth } from '@/store/authStore'
import { useT } from '@/lib/i18n'
import { AiQuotaPanel } from './AiQuotaPanel'
import { RetentionPanel } from './RetentionPanel'
import { FeedbackInbox } from './FeedbackInbox'
import { RecentErrors } from './RecentErrors'
import { UsersTab } from './UsersTab'

export default function AdminPage() {
  const me = useAuth((s) => s.user)
  const t = useT()

  if (me?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="card p-8">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-3 text-lg font-bold">
            {t('Chỉ dành cho quản trị viên', 'Admins only')}
          </h1>
          <Link to="/home" className="btn-primary mt-4">
            {t('Về trang chủ', 'Back to home')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Quản trị', 'Admin')}</span>{' '}
          <span aria-hidden="true">🛡️</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Quản lý tài khoản người dùng. Quyền được kiểm ở server (Cloudflare Function + Supabase).',
            'Manage user accounts. Permissions are enforced on the server (Cloudflare Function + Supabase).'
          )}
        </p>
      </header>

      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        🔑{' '}
        {t(
          'API key AI được đặt bằng biến môi trường OPENAI_API_KEY trên Cloudflare Pages (secret) — không nằm trong app, học viên không bao giờ thấy. Đổi key/model ở Cloudflare → Settings → Environment variables.',
          'The AI API key is the OPENAI_API_KEY environment variable on Cloudflare Pages (a secret) — it is not in the app and learners never see it. Change the key/model under Cloudflare → Settings → Environment variables.'
        )}
      </div>

      <RetentionPanel />

      <AiQuotaPanel />

      <FeedbackInbox />

      <RecentErrors />

      <UsersTab meId={me.id} />
    </div>
  )
}
