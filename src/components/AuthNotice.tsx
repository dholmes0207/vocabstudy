import { Info, X } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { accountBlockMessage } from '@/lib/authz'
import { useT, useUiLang } from '@/lib/i18n'

/**
 * Why a sign-in that finished away from the sign-in page was turned back —
 * most often a new Google account that is now on the beta waitlist. Without
 * this the person came back from Google to find themselves silently signed out.
 */
export default function AuthNotice() {
  const t = useT()
  const lang = useUiLang()
  const notice = useAuth((s) => s.notice)
  const clearNotice = useAuth((s) => s.clearNotice)
  const message = accountBlockMessage(notice, lang)
  if (!message) return null
  return (
    <div
      role="status"
      className="card mb-5 flex items-start gap-3 border-sky-200 p-4 text-sm animate-fade-in dark:border-sky-900"
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" aria-hidden="true" />
      <p className="min-w-0 flex-1">{message}</p>
      <button
        onClick={clearNotice}
        className="btn-ghost -m-1 h-8 w-8 shrink-0 !p-0"
        aria-label={t('Đóng thông báo', 'Close')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
