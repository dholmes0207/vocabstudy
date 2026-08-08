import { Link } from 'react-router-dom'

interface Props {
  title?: string
  emoji?: string
  correct: number
  total: number
  children?: React.ReactNode
}

/** Friendly end-of-session celebration with a light accuracy readout. */
export default function SessionComplete({ title = 'Hoàn thành!', emoji = '🎉', correct, total, children }: Props) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const praise = pct >= 90 ? 'Tuyệt vời!' : pct >= 70 ? 'Làm tốt lắm!' : pct >= 50 ? 'Cố lên nhé!' : 'Đừng nản, ôn lại nào!'

  return (
    <div className="mx-auto max-w-md animate-fade-in text-center">
      <div className="card p-8">
        <p className="text-6xl">{emoji}</p>
        <h1 className="mt-4 text-2xl font-extrabold">{title}</h1>
        <p className="mt-1 text-slate-500">{praise}</p>

        {total > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Đúng" value={`${correct}`} tone="text-emerald-600" />
            <Stat label="Tổng" value={`${total}`} tone="text-slate-700 dark:text-slate-200" />
            <Stat label="Chính xác" value={`${pct}%`} tone="text-brand-600" />
          </div>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>

        <Link to="/" className="btn-ghost mt-4 w-full">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
