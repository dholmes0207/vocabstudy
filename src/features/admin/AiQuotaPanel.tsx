import { useEffect, useState } from 'react'
import { api, ApiError, type AiUsageReport } from '@/lib/api'
import { tx, useT } from '@/lib/i18n'

/**
 * Is the AI daily cap actually counting?
 *
 * The cap fails open on purpose, so a missing migration or a stale PostgREST
 * schema cache leaves it silently inactive while everything still looks fine.
 * The only hard proof it works is today's request count going up.
 */
export function AiQuotaPanel() {
  const t = useT()
  const [report, setReport] = useState<AiUsageReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api
      .adminAiUsage()
      .then((r) => alive && setReport(r))
      .catch(
        (e) =>
          alive &&
          setError(
            e instanceof ApiError
              ? e.message
              : tx('Lỗi tải bộ đếm AI', "Couldn't load the AI counter")
          )
      )
    return () => {
      alive = false
    }
  }, [])

  if (error) {
    return (
      <div className="card p-4 text-sm text-rose-600 dark:text-rose-400">
        ⚠️ {t('Không đọc được tình trạng hạn mức AI:', "Couldn't read the AI quota status:")}{' '}
        {error}
      </div>
    )
  }
  if (!report)
    return (
      <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">
        {t('Đang kiểm tra hạn mức AI…', 'Checking the AI quota…')}
      </div>
    )

  const off = report.limit === 0
  const broken = !report.reachable
  const counted = report.today.requests > 0

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">{t('Hạn mức trợ lý AI', 'AI tutor quota')}</h2>
        <span
          className={`chip px-3 py-1 text-xs font-semibold ${
            broken
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              : off
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
          }`}
        >
          {broken
            ? t('✕ Không đếm được', '✕ Not counting')
            : off
              ? t('○ Đã tắt hạn mức', '○ Quota off')
              : t('✓ Đang đếm', '✓ Counting')}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {off
          ? t(
              'AI_DAILY_LIMIT đang là 0 — học sinh hỏi không giới hạn.',
              'AI_DAILY_LIMIT is 0 — learners can ask without limit.'
            )
          : t(
              `Mỗi học sinh ${report.limit} lượt/ngày, mốc sang ngày theo giờ Việt Nam.`,
              `${report.limit} questions per learner per day; the day resets on Vietnam time.`
            )}
      </p>

      {broken ? (
        <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {t(
            'Hạn mức đang không có tác dụng — trợ lý vẫn trả lời nhưng không ai bị chặn.',
            'The quota is not in effect — the tutor still answers, but nobody is limited.'
          )}
          {report.error ? ` ${report.error}` : ''}
        </p>
      ) : (
        <p className="mt-3 text-sm">
          {t('Hôm nay', 'Today')} ({report.day}): <b>{report.today.requests}</b>{' '}
          {t('lượt hỏi từ', 'questions from')} <b>{report.today.users}</b>{' '}
          {t('học sinh.', 'learners.')}
          {!off && !counted && (
            <span className="text-slate-500 dark:text-slate-400">
              {' '}
              {t(
                'Chưa có lượt nào — hỏi thử một câu rồi tải lại trang để chắc chắn bộ đếm chạy.',
                'No questions yet — ask one, then reload to confirm the counter works.'
              )}
            </span>
          )}
        </p>
      )}
    </div>
  )
}
