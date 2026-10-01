import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, GraduationCap, Library, Mic, Repeat2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { summarize } from '@/lib/summary'
import { useProvideContext } from '@/store/contextStore'
import ProgressRing from '@/components/ProgressRing'
import WordOfDay from './WordOfDay'
import { useTilt } from '@/hooks/useTilt'

export default function Dashboard() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const dailyNewLimit = useSettings((s) => s.dailyNewLimit)
  const progress = useStudy((s) => s.progress[code])
  const stats = progress?.stats

  const s = summarize(pack.words, progress, dailyNewLimit)
  const masteredPct = s.total ? s.mastered / s.total : 0
  const learnedPct = s.total ? s.learned / s.total : 0

  useProvideContext('Trang chủ')

  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{greeting}! 👋</h1>
          <p className="mt-1 text-slate-500">
            Học <b>{pack.meta.nativeName}</b> · mỗi ngày một chút là đủ.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
          <span className="text-sm" title="Chuỗi ngày học liên tục">
            🔥 <b className="text-lg">{stats?.streak ?? 0}</b> ngày
          </span>
          <span className="text-sm text-brand-600 dark:text-brand-300" title="Điểm kinh nghiệm">
            ⭐ <b className="text-lg">{stats?.xp ?? 0}</b>
          </span>
        </div>
      </div>

      {/* Today's plan */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Kế hoạch hôm nay
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ActionCard
            to="/review"
            icon={Repeat2}
            tone="brand"
            title="Ôn tập"
            count={s.due}
            unit="từ cần ôn"
            cta={s.due > 0 ? 'Ôn ngay' : 'Chưa có từ đến hạn'}
            disabled={s.due === 0}
            hint="Lặp lại ngắt quãng giúp nhớ lâu."
          />
          <ActionCard
            to="/learn"
            icon={BookOpen}
            tone="emerald"
            title="Học từ mới"
            count={s.newRemainingToday}
            unit="từ mới hôm nay"
            cta={s.newRemainingToday > 0 ? 'Bắt đầu học' : 'Đã đủ từ mới hôm nay'}
            disabled={s.newRemainingToday === 0}
            hint={`Giới hạn ${dailyNewLimit} từ/ngày · đã học ${s.newDoneToday}`}
          />
        </div>
      </section>

      {/* Progress overview */}
      <section className="grid gap-4 sm:grid-cols-[auto,1fr]">
        <div className="card flex items-center justify-center p-6">
          <ProgressRing value={masteredPct} size={150} stroke={12}>
            <div>
              <p className="text-3xl font-extrabold">{Math.round(masteredPct * 100)}%</p>
              <p className="text-xs text-slate-400">thành thạo</p>
            </div>
          </ProgressRing>
        </div>
        <div className="card grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
          <Metric label="Đã học" value={s.learned} total={s.total} tone="text-brand-600" />
          <Metric label="Thành thạo" value={s.mastered} total={s.total} tone="text-emerald-600" />
          <Metric label="Đang học" value={s.learning} tone="text-amber-600" />
          <Metric label="Chưa học" value={s.fresh} tone="text-slate-400" />
          <div className="col-span-2 sm:col-span-4">
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${learnedPct * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Bạn đã chạm tới {s.learned}/{s.total} từ.
            </p>
          </div>
        </div>
      </section>

      <WordOfDay />

      {/* Play & practise */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Chơi mà học
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickLink
            to="/games/match"
            emoji="🧩"
            title="Ghép cặp"
            desc="6 cặp từ – nghĩa, đua với đồng hồ."
          />
          <QuickLink
            to="/games/order"
            emoji="🔤"
            title="Xếp câu"
            desc="Xếp mảnh thành câu tiếng Anh đúng."
          />
          <QuickLink
            to="/quiz"
            icon={GraduationCap}
            title="Kiểm tra nhanh"
            desc="6 dạng câu hỏi: chọn nghĩa, nghe, điền câu…"
          />
          <QuickLink
            to="/speaking"
            icon={Mic}
            title="Luyện nói"
            desc="Đọc vào micro, so với giọng mẫu."
          />
        </div>
        <Link
          to="/browse"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300"
        >
          <Library className="h-4 w-4" /> Tra cứu {pack.meta.count} từ
        </Link>
      </section>
    </div>
  )
}

function ActionCard({
  to,
  icon: Icon,
  tone,
  title,
  count,
  unit,
  cta,
  disabled,
  hint,
}: {
  to: string
  icon: typeof BookOpen
  tone: 'brand' | 'emerald'
  title: string
  count: number
  unit: string
  cta: string
  disabled: boolean
  hint: string
}) {
  const tilt = useTilt()
  const toneCls =
    tone === 'brand' ? 'from-brand-500 to-brand-700' : 'from-emerald-500 to-emerald-700'
  const inner = (
    <div
      className={`card relative overflow-hidden p-5 ${disabled ? '' : 'tilt'}`}
      {...(disabled ? {} : tilt)}
    >
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${toneCls} opacity-10`}
      />
      {/* Dim the content, not the card: a see-through card would show the sky. */}
      <div className={disabled ? 'opacity-60' : ''}>
        <div className="flex items-center gap-3">
          <span
            className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${toneCls} text-white shadow`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="mt-4">
          <span className="text-4xl font-extrabold">{count}</span>{' '}
          <span className="text-slate-500">{unit}</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
        <div
          className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${disabled ? 'text-slate-400' : 'text-brand-600 dark:text-brand-300'}`}
        >
          {cta} {!disabled && <ArrowRight className="h-4 w-4" />}
        </div>
      </div>
    </div>
  )
  return disabled ? <div>{inner}</div> : <Link to={to}>{inner}</Link>
}

function Metric({
  label,
  value,
  total,
  tone,
}: {
  label: string
  value: number
  total?: number
  tone: string
}) {
  return (
    <div>
      <p className={`text-2xl font-extrabold ${tone}`}>
        {value}
        {total != null && <span className="text-sm font-medium text-slate-400">/{total}</span>}
      </p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

function QuickLink({
  to,
  icon: Icon,
  emoji,
  title,
  desc,
}: {
  to: string
  icon?: typeof BookOpen
  emoji?: string
  title: string
  desc: string
}) {
  return (
    <Link
      to={to}
      className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-2xl text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {emoji ?? (Icon && <Icon className="h-6 w-6" />)}
      </span>
      <div className="min-w-0">
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
      <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-300" />
    </Link>
  )
}
