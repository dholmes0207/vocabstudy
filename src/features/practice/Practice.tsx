import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useProvideContext } from '@/store/contextStore'
import { PRACTICE } from './entries'
import { useTilt } from '@/hooks/useTilt'

// The "Luyện tập" hub: everything that practises words you have already met.
// One tab on the phone's bottom bar instead of three.

export default function Practice() {
  useProvideContext('Luyện tập')
  const tilt = useTilt(6)
  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Luyện tập 💪</h1>
        <p className="mt-1 text-slate-500">
          Dùng lại những từ đã gặp theo nhiều cách — càng đa dạng càng nhớ lâu.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {PRACTICE.map((e) => (
          <Link
            key={e.to}
            to={e.to}
            className="card tilt flex items-center gap-4 p-4 active:scale-[0.99]"
            {...tilt}
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow ${e.tone}`}
            >
              {typeof e.icon === 'string' ? e.icon : <e.icon className="h-6 w-6" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{e.title}</span>
              <span className="block text-sm text-slate-500">{e.desc}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  )
}
