import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { shouldAsk } from '@/lib/usageClient'
import { gpc, useConsent } from '@/hooks/useUsageConsent'

// The one-time question about the anonymous usage signal, at the end of a
// finished session (docs/design/usage-metrics.md). The choice and the sender
// live in hooks/useUsageConsent.ts.

/** Asked once, at the end of a session; gone for good after either answer. */
export function UsageConsentCard() {
  const t = useT()
  const [consent, choose] = useConsent()
  const [asking] = useState(() => shouldAsk(consent, gpc()))
  if (!asking) return null
  if (consent !== null)
    return (
      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400" role="status">
        {consent === 'yes'
          ? t(
              'Cảm ơn bạn! Đổi lại được trong Cài đặt.',
              'Thank you! You can change this in Settings.'
            )
          : t(
              'Đã ghi nhận. Đổi lại được trong Cài đặt.',
              'Noted. You can change this in Settings.'
            )}
      </p>
    )
  return (
    <section className="mt-5 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/60">
      <p className="flex items-center gap-2 font-bold">
        <BarChart3 className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
        {t('Giúp VocaStudy tốt hơn?', 'Help make VocaStudy better?')}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'Mỗi ngày bạn học, app gửi một số liệu ẩn danh: số câu và số từ mới (theo khoảng), không email, không IP, không nội dung học. Nhờ đó chúng tôi biết người học có quay lại không.',
          'Each day you study, the app sends one anonymous signal: answers and new words (as ranges), no email, no IP address, nothing you learned. It tells us whether learners come back.'
        )}{' '}
        <Link to="/privacy" className="font-semibold text-brand-600 underline dark:text-brand-300">
          {t('Chi tiết', 'Details')}
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="btn-primary h-10 flex-1 text-sm"
          onClick={() => choose(true)}
        >
          {t('Đồng ý', 'Yes, send it')}
        </button>
        <button
          type="button"
          className="btn-secondary h-10 flex-1 text-sm"
          onClick={() => choose(false)}
        >
          {t('Không, cảm ơn', 'No, thanks')}
        </button>
      </div>
    </section>
  )
}
