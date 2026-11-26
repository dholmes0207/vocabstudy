import { CalendarCheck } from 'lucide-react'
import { EXAMS, RECHECK_DAYS, checkedDay, examsToRecheck } from '@/lib/exams'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'

/**
 * Exam facts to check again (task 4.4 in docs/PLAN.md): formats and score
 * scales change, so each exam's page is compared with its sources every six
 * months. Lists the ones due, with their sources, or says all are current.
 */
export function ExamChecks() {
  const t = useT()
  const day = today()
  const due = examsToRecheck(day)
  return (
    <section className="card p-4">
      <h2 className="flex items-center gap-2 font-bold">
        <CalendarCheck className="h-4 w-4 text-brand-500" aria-hidden="true" />
        {t('Thông tin kỳ thi', 'Exam facts')}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          `Mỗi kỳ thi được đối chiếu lại với nguồn sau ${RECHECK_DAYS} ngày; sửa xong thì cập nhật trường checked trong src/lib/exams.ts.`,
          `Each exam is compared with its sources again after ${RECHECK_DAYS} days; once updated, change its checked field in src/lib/exams.ts.`
        )}
      </p>
      {due.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
          {t(
            `Cả ${EXAMS.length} kỳ thi đều được kiểm trong 6 tháng qua.`,
            `All ${EXAMS.length} exams were checked within the last six months.`
          )}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {due.map((e) => {
            const c = checkedDay(e)
            return (
              <li key={e.id} className="py-2 text-sm">
                <p>
                  <b>{e.name}</b>{' '}
                  <span className="text-slate-500 dark:text-slate-400">
                    {c === null
                      ? t('ngày kiểm không đọc được', 'check date unreadable')
                      : t(
                          `kiểm lần cuối ${e.checked[0]} (${day - c} ngày trước)`,
                          `last checked ${e.checked[1]} (${day - c} days ago)`
                        )}
                  </span>
                </p>
                <ul className="mt-1 flex flex-wrap gap-x-3">
                  {e.sources.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 underline dark:text-brand-300"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
