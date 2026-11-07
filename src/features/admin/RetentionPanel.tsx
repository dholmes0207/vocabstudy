import { useEffect, useState } from 'react'
import { Repeat } from 'lucide-react'
import { api } from '@/lib/api'
import { tx, useT } from '@/lib/i18n'
import { formatDay } from '@/lib/date'
import { percent, type Rate, type RetentionReport } from '@/lib/retention'

/**
 * Do learners come back? (docs/design/retention.md) Counted on the server from
 * synced progress, so it only sees learners who are signed in.
 */
export function RetentionPanel() {
  const t = useT()
  const [report, setReport] = useState<RetentionReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api.adminRetention().then(
      (r) => alive && setReport(r),
      (e: unknown) =>
        alive &&
        setError(
          e instanceof Error ? e.message : tx('Lỗi tải thống kê', "Couldn't load the figures")
        )
    )
    return () => {
      alive = false
    }
  }, [])

  const rate = (r: Rate) =>
    percent(r) ? (
      <>
        <b>{percent(r)}</b>{' '}
        <span className="text-slate-500 dark:text-slate-400">
          ({r.returned}/{r.eligible})
        </span>
      </>
    ) : (
      <span className="text-slate-500 dark:text-slate-400">—</span>
    )

  return (
    <section className="card p-4">
      <h2 className="flex items-center gap-2 font-bold">
        <Repeat className="h-4 w-4 text-brand-500" />{' '}
        {t('Người học quay lại', 'Returning learners')}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Tính từ tiến độ đồng bộ, nên chỉ gồm người đã đăng nhập. Ngày đầu là ngày đầu tiên có trả lời hay học từ mới.',
          'Counted from synced progress, so only learners who signed in. A first day is the first day with any answer or new word.'
        )}
      </p>

      {error ? (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">⚠️ {error}</p>
      ) : !report ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t('Đang tính…', 'Counting…')}
        </p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {(
              [
                [t('Người học', 'Learners'), <b key="n">{report.learners}</b>],
                [
                  t('Học hôm nay / 7 ngày', 'Active today / 7 days'),
                  <b key="a">
                    {report.activeToday} / {report.active7}
                  </b>,
                ],
                [t('Quay lại hôm sau', 'Back the next day'), rate(report.nextDay)],
                [t('Quay lại trong tuần đầu', 'Back within a week'), rate(report.firstWeek)],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-base">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-1.5 pr-3 font-semibold">
                    {t('Tuần bắt đầu học', 'First week')}
                  </th>
                  <th className="py-1.5 pr-3 font-semibold">{t('Người mới', 'New')}</th>
                  <th className="py-1.5 pr-3 font-semibold">{t('Hôm sau', 'Next day')}</th>
                  <th className="py-1.5 font-semibold">{t('Trong tuần', 'Within a week')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.cohorts.map((c) => (
                  <tr key={c.week}>
                    <td className="py-1.5 pr-3">
                      {formatDay(c.week)} – {formatDay(c.week + 6)}
                    </td>
                    <td className="py-1.5 pr-3">{c.learners}</td>
                    <td className="py-1.5 pr-3">{rate(c.nextDay)}</td>
                    <td className="py-1.5">{rate(c.firstWeek)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
