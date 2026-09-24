import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useImmersive } from '@/store/uiStore'

/** Common frame for a game: exit, title, and a live stat line. Focus mode on phones. */
export default function GameShell({
  title,
  stats,
  children,
}: {
  title: string
  stats: React.ReactNode
  children: React.ReactNode
}) {
  useImmersive()
  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/practice"
          className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500"
          aria-label="Thoát trò chơi"
        >
          <LogOut className="h-4 w-4" /> Thoát
        </Link>
        <h1 className="flex-1 truncate text-lg font-extrabold">{title}</h1>
        <div className="flex shrink-0 items-center gap-3 text-sm font-semibold tabular-nums text-slate-500">
          {stats}
        </div>
      </div>
      {children}
    </div>
  )
}

/** End-of-round card shared by the games. */
export function GameResult({
  emoji,
  title,
  lines,
  xp,
  record,
  onAgain,
}: {
  emoji: string
  title: string
  lines: string[]
  xp: number
  record: boolean
  onAgain: () => void
}) {
  return (
    <div className="card p-8 text-center animate-fade-in">
      <p className="text-6xl">{emoji}</p>
      <h2 className="mt-3 text-2xl font-extrabold">{title}</h2>
      {record && (
        <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          🏆 Kỷ lục mới của bạn!
        </p>
      )}
      <ul className="mt-4 space-y-1 text-slate-500">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p className="mt-3 text-lg font-bold text-brand-600 dark:text-brand-300">+{xp} XP ⭐</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button className="btn-primary" onClick={onAgain} autoFocus>
          Chơi ván mới
        </button>
        <Link to="/practice" className="btn-secondary">
          Trò khác
        </Link>
      </div>
    </div>
  )
}
