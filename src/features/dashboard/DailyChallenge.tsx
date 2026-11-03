import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useChallenge } from '@/store/challengeStore'
import { CHALLENGE_SIZE, currentStreak } from '@/lib/dailyChallenge'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'

// "Thử thách hôm nay" on the home page: five questions, the same for everyone
// today (lib/dailyChallenge.ts). Done today, it shows the score and the streak.

export default function DailyChallenge() {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const rec = useChallenge((s) => s.records[code])
  const day = today()
  const done = rec?.day === day
  const streak = currentStreak(rec, day)

  return (
    <section className="card flex items-center gap-4 p-4">
      <span className="text-3xl" aria-hidden="true">
        🎯
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{t('Thử thách hôm nay', "Today's challenge")}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {done
            ? t(
                `Đã xong: đúng ${rec.correct}/${rec.total}. Chuỗi ${streak} ngày 🔥`,
                `Done: ${rec.correct}/${rec.total} right. ${streak}-day streak 🔥`
              )
            : t(
                `${CHALLENGE_SIZE} câu, mọi người cùng một đề hôm nay.` +
                  (streak ? ` Giữ chuỗi ${streak} ngày!` : ''),
                `${CHALLENGE_SIZE} questions, the same for everyone today.` +
                  (streak ? ` Keep your ${streak}-day streak!` : '')
              )}
        </p>
      </div>
      <Link
        to="/challenge"
        className={`${done ? 'btn-secondary' : 'btn-primary'} h-10 shrink-0 text-sm`}
        aria-label={
          done
            ? t('Làm lại thử thách', 'Retry the challenge')
            : t('Làm thử thách', 'Take the challenge')
        }
      >
        {done ? t('Làm lại', 'Retry') : t('Làm ngay', 'Go')} <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}
