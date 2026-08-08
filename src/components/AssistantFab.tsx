import { useState } from 'react'
import { Bot, X } from 'lucide-react'
import TutorChat from '@/features/tutor/TutorChat'
import { useEffectiveLevel } from '@/hooks/useEffectiveLevel'
import { levelInfo } from '@/lib/level'

export default function AssistantFab() {
  const [open, setOpen] = useState(false)
  const level = useEffectiveLevel()
  const info = levelInfo(level)

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Mở trợ lý AI"
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 transition hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6"
        >
          <Bot className="h-7 w-7" />
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
        </button>
      )}

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel: bottom sheet on mobile, right side panel on desktop */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:w-[26rem] lg:rounded-none lg:border-l lg:border-t-0 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-bold leading-tight">
                  Trợ lý AI
                  <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200" title={info.blurb}>
                    {info.tag} · {info.name}
                  </span>
                </p>
                <p className="truncate text-xs text-slate-400">Chỉ hỗ trợ học từ vựng tiếng Anh</p>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost h-9 w-9 !px-0" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat */}
            <div className="min-h-0 flex-1">
              <TutorChat level={level} onClose={() => setOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
