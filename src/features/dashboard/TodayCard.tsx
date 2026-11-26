import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { usePathStates } from '@/hooks/usePathContext'
import { pathFor, practiceSuggestion, type PathLevel } from '@/lib/learningPath'
import { todayPlan } from '@/lib/todayPlan'
import { useT } from '@/lib/i18n'

// "Hôm nay" (task 2.1 in docs/PLAN.md): the first card on the home page, with
// the one thing worth doing now (lib/todayPlan.ts) as its only main button.

const NO_LEVELS: readonly PathLevel[] = []

export default function TodayCard({ due, newLeft }: { due: number; newLeft: number }) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const levels = pathFor(code) ?? NO_LEVELS
  const states = usePathStates(code, levels)
  const next = levels.length ? practiceSuggestion(states) : undefined
  const plan = todayPlan({ due, newLeft, pathStep: next ? next.step : null })

  const text =
    plan.kind === 'review'
      ? {
          title: t(
            `Ôn ${plan.count} từ đến hạn`,
            `Review ${plan.count} word${plan.count === 1 ? '' : 's'} due`
          ),
          sub: t(
            'Ôn đúng lúc sắp quên là cách nhớ lâu nhất.',
            'Reviewing just before you forget is what makes words stick.'
          ),
          cta: t('Ôn ngay', 'Review now'),
        }
      : plan.kind === 'learn'
        ? {
            title: t(
              `Học ${plan.count} từ mới`,
              `Learn ${plan.count} new word${plan.count === 1 ? '' : 's'}`
            ),
            sub: t(
              'Khoảng 2 phút. App sẽ nhắc lại đúng lúc bạn sắp quên.',
              'About 2 minutes. The app brings them back just before you forget.'
            ),
            cta: t('Bắt đầu', 'Start'),
          }
        : plan.kind === 'path' && next
          ? {
              title: t(...next.step.title),
              sub: t(
                `Bước tiếp theo trên lộ trình: ${next.value}/${next.step.goal} ${next.step.unit[0]}.`,
                `Next on your path: ${next.value}/${next.step.goal} ${next.step.unit[1]}.`
              ),
              cta: t('Làm tiếp', 'Continue'),
            }
          : {
              title: t('Xong hôm nay! 🎉', 'Done for today! 🎉'),
              sub: t(
                'Mai quay lại nhé. Còn hứng thì thử một trò ở Luyện tập.',
                'Come back tomorrow. Still keen? Try something in Practice.'
              ),
              cta: t('Luyện thêm', 'Practise more'),
            }

  return (
    <section
      aria-labelledby="today-title"
      className="card relative overflow-hidden border-brand-200/70 p-5 dark:border-brand-500/30"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-200">
        {t('Hôm nay', 'Today')}
      </p>
      <h2 id="today-title" className="mt-1 text-xl font-extrabold">
        {text.title}
      </h2>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{text.sub}</p>
      <Link
        to={plan.to}
        className={`${plan.kind === 'done' ? 'btn-secondary' : 'btn-primary'} mt-4 h-12 w-full sm:w-auto`}
      >
        {text.cta} <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Link>
    </section>
  )
}
