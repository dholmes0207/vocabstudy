import { useEffect } from 'react'
import { Bot, X } from 'lucide-react'
import TutorChat from '@/features/tutor/TutorChat'
import { useEffectiveLevel } from '@/hooks/useEffectiveLevel'
import { useAuth } from '@/store/authStore'
import { levelInfo, levelLabel } from '@/lib/level'
import { useContextStore } from '@/store/contextStore'
import { useT } from '@/lib/i18n'
import { useSettings } from '@/store/settingsStore'

export default function AssistantFab() {
  // Kept in the store so another screen can open the assistant with a
  // question (contextStore.ask) — e.g. "is my sentence right?".
  const open = useContextStore((s) => s.assistantOpen)
  const setOpen = useContextStore((s) => s.setAssistantOpen)
  const user = useAuth((s) => s.user)
  const level = useEffectiveLevel()
  const info = levelInfo(level)
  const label = levelLabel(
    info,
    useSettings((s) => s.uiLang)
  )
  const t = useT()

  // Đóng bằng phím Esc (trang phía sau vẫn dùng được, không bị che mờ).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  return (
    <>
      {/* Floating bubble — desktop only. On a phone it sat on top of the very
          buttons a learner taps most (Tiếp, loa, đáp án); there the assistant
          opens from the header instead (AssistantHeaderButton). */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={
            user
              ? t('Mở trợ lý AI', 'Open AI tutor')
              : t('Trợ lý AI (cần đăng nhập)', 'AI tutor (sign in required)')
          }
          title={
            user
              ? t('Trợ lý AI học từ vựng', 'AI vocabulary tutor')
              : t('Trợ lý AI — cần đăng nhập', 'AI tutor — sign in required')
          }
          className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 transition hover:scale-105 active:scale-95 lg:flex"
        >
          <Bot className="h-7 w-7" />
          {/* "Online" dot only when the assistant is actually usable (logged in),
              so guests aren't invited then blocked. See F10. */}
          {user && (
            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
          )}
        </button>
      )}

      {open && (
        <>
          {/* Bắt chạm ra ngoài để đóng — CHỈ trên mobile, và trong suốt (không
              làm mờ/tối trang). Trên desktop không có lớp phủ: trang vẫn dùng
              được bình thường như popup chat Messenger. */}
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)} />

          {/* Popup: bottom sheet trên mobile, thẻ nổi góc phải-dưới trên desktop.
              Không có backdrop tối/mờ — chỉ "hiện lên" trên nội dung trang. */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 origin-bottom animate-chat-in dark:border-slate-800 dark:bg-slate-900 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:h-[min(85vh,42rem)] lg:w-[24rem] lg:rounded-2xl lg:origin-bottom-right">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-bold leading-tight">
                  {t('Trợ lý AI', 'AI tutor')}
                  <span
                    className="chip bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                    title={label.blurb}
                  >
                    {info.tag} · {label.name}
                  </span>
                </p>
                <p className="truncate text-xs text-slate-400">
                  {t('Chỉ hỗ trợ học từ vựng tiếng Anh', 'Helps with English vocabulary only')}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="btn-ghost h-9 w-9 !px-0"
                aria-label={t('Đóng', 'Close')}
              >
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

/** The assistant's entry point in the phone header (the bubble is desktop-only). */
export function AssistantHeaderButton() {
  const user = useAuth((s) => s.user)
  const setOpen = useContextStore((s) => s.setAssistantOpen)
  const t = useT()
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label={
        user
          ? t('Mở trợ lý AI', 'Open AI tutor')
          : t('Trợ lý AI (cần đăng nhập)', 'AI tutor (sign in required)')
      }
      className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm active:scale-95 lg:hidden"
    >
      <Bot className="h-5 w-5" />
      {user && (
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
      )}
    </button>
  )
}
