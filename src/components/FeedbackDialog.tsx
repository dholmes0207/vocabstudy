import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquareHeart, Star, X } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { closeFeedback, useFeedbackDialog } from '@/store/feedbackStore'
import { useT, useUiLang } from '@/lib/i18n'
import { ApiError, api } from '@/lib/api'
import { CONTACT_EMAIL, feedbackHref } from '@/lib/site'
import { FEEDBACK_MAX, checkFeedback } from '@/lib/feedback'
import { DISPLAY_NAME_MAX } from '@/lib/displayName'
import { Field, Notice, inputCls } from '@/features/auth/AuthShell'

// The in-app "Send feedback" form (docs/design/feedback.md). Opened from the
// account menu, the changelog and the site footer; mounted once in App.

export default function FeedbackDialog() {
  const open = useFeedbackDialog((s) => s.open)
  if (!open) return null
  return <FeedbackForm onClose={closeFeedback} />
}

function FeedbackForm({ onClose }: { onClose: () => void }) {
  const t = useT()
  const lang = useUiLang()
  const user = useAuth((s) => s.user)
  const [rating, setRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [name, setName] = useState(user?.name ?? '')
  const [allowQuote, setAllowQuote] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fallback, setFallback] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const checked = checkFeedback({
      message,
      name,
      rating,
      allowQuote,
      page: window.location.pathname,
    })
    if (!checked.ok) {
      setError(t(...checked.reason))
      return
    }
    setBusy(true)
    try {
      await api.sendFeedback(checked.value)
      setSent(true)
    } catch (err) {
      const status = err instanceof ApiError ? err.status : -1
      if (status === 0) setError(err instanceof Error ? err.message : '')
      else if (status === 429)
        setError(
          t(
            'Đang có quá nhiều góp ý cùng lúc — thử lại sau vài phút nhé.',
            'Too much feedback at once — please try again in a few minutes.'
          )
        )
      else {
        // Not set up yet, or the server failed: email always works.
        setFallback(true)
        setError(
          t(
            'Chưa gửi được qua app. Bạn gửi giúp qua email nhé — chúng tôi đọc mọi thư.',
            "Couldn't send it through the app. Please email it instead — we read every message."
          )
        )
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm animate-fade-in sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="card max-h-[92dvh] w-full max-w-md overflow-y-auto p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id="feedback-title" className="flex items-center gap-2 text-lg font-extrabold">
            <MessageSquareHeart className="h-5 w-5 text-brand-500" />
            {t('Góp ý cho VocaStudy', 'Send feedback')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost -m-1 h-9 w-9 !p-0"
            aria-label={t('Đóng', 'Close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-4xl" aria-hidden="true">
              💌
            </p>
            <p className="font-semibold">
              {t('Cảm ơn bạn đã góp ý!', 'Thank you for your feedback!')}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(
                'Chúng tôi đọc từng góp ý để làm VocaStudy tốt hơn.',
                'We read every message to make VocaStudy better.'
              )}
            </p>
            <button type="button" onClick={onClose} className="btn-primary w-full">
              {t('Đóng', 'Close')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                {t(
                  'Bạn thấy VocaStudy thế nào? (tuỳ chọn)',
                  'How do you like VocaStudy? (optional)'
                )}
              </p>
              <div className="flex gap-1" role="group" aria-label={t('Chấm điểm', 'Rating')}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating((r) => (r === n ? null : n))}
                    aria-pressed={rating === n}
                    aria-label={t(`${n} sao`, `${n} star${n > 1 ? 's' : ''}`)}
                    className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Star
                      className={`h-7 w-7 ${rating !== null && n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Field label={t('Góp ý của bạn', 'Your feedback')}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                maxLength={FEEDBACK_MAX}
                autoFocus
                className={`${inputCls} resize-y`}
                placeholder={t(
                  'Điều gì giúp ích cho bạn? Điều gì nên làm tốt hơn?',
                  'What helps you? What should be better?'
                )}
              />
            </Field>
            <Field label={t('Tên của bạn (tuỳ chọn)', 'Your name (optional)')}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={DISPLAY_NAME_MAX}
                autoComplete="name"
                className={inputCls}
              />
            </Field>
            <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={allowQuote && name.trim() !== ''}
                disabled={name.trim() === ''}
                onChange={(e) => setAllowQuote(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
              />
              <span>
                {t(
                  'Cho phép VocaStudy trích dẫn góp ý này kèm tên của tôi trên trang giới thiệu.',
                  'VocaStudy may quote this feedback with my name on the website.'
                )}
                {name.trim() === '' && (
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {t('Cần nhập tên để được trích dẫn.', 'Add your name to allow quoting.')}
                  </span>
                )}
              </span>
            </label>
            {error && <Notice tone="error">{error}</Notice>}
            {fallback && (
              <a href={feedbackHref(lang)} className="btn-secondary w-full">
                {t(`Gửi email tới ${CONTACT_EMAIL}`, `Email ${CONTACT_EMAIL}`)}
              </a>
            )}
            <button type="submit" disabled={busy} className="btn-primary h-11 w-full">
              {busy ? t('Đang gửi…', 'Sending…') : t('Gửi góp ý', 'Send')}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'Góp ý được lưu để chúng tôi đọc và cải thiện app. ',
                'Feedback is stored so we can read it and improve the app. '
              )}
              <Link to="/privacy" onClick={onClose} className="underline">
                {t('Chính sách bảo mật', 'Privacy policy')}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
