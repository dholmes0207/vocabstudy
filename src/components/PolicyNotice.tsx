import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ScrollText, X } from 'lucide-react'
import { useT, useUiLang } from '@/lib/i18n'
import { formatLongDate } from '@/lib/formatDate'
import { POLICY_VERSION } from '@/lib/site'
import { markPolicySeen, policyNoticeDue } from '@/lib/policyNotice'

/**
 * One-time card in the app: the privacy policy and terms changed. The policy
 * promises important changes are announced in the app — this is that.
 */
export default function PolicyNotice() {
  const t = useT()
  const lang = useUiLang()
  // Newcomers are marked as having seen the current version by Layout when
  // their first visit is recorded, so this is only ever true for people who
  // used the app under an older policy.
  const [open, setOpen] = useState(() => policyNoticeDue(localStorage))

  if (!open) return null
  const dismiss = () => {
    markPolicySeen(localStorage)
    setOpen(false)
  }

  return (
    <div
      role="status"
      className="card mb-5 flex items-start gap-3 border-brand-200 p-4 text-sm animate-fade-in dark:border-brand-900"
    >
      <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {t(
            `Chúng tôi đã cập nhật Chính sách bảo mật và Điều khoản sử dụng (${formatLongDate(POLICY_VERSION, lang)}).`,
            `We updated our Privacy policy and Terms of use (${formatLongDate(POLICY_VERSION, lang)}).`
          )}
        </p>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Cập nhật theo Luật Bảo vệ dữ liệu cá nhân 2025 và Luật Trí tuệ nhân tạo 2025: nói rõ hơn về quyền của bạn, dữ liệu lưu ở nước ngoài và nội dung do AI tạo.',
            'Updated for Vietnam’s 2025 Personal Data Protection Law and AI Law: clearer about your rights, data stored abroad, and AI-generated content.'
          )}{' '}
          <Link
            to="/privacy"
            onClick={dismiss}
            className="font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            {t('Chính sách bảo mật', 'Privacy policy')}
          </Link>
          {' · '}
          <Link
            to="/terms"
            onClick={dismiss}
            className="font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            {t('Điều khoản', 'Terms')}
          </Link>
        </p>
      </div>
      <button
        onClick={dismiss}
        className="btn-ghost -m-1 h-8 w-8 shrink-0 !p-0"
        aria-label={t('Đã hiểu, đóng thông báo', 'Got it, close')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
