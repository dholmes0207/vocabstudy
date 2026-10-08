import { useEffect, useState } from 'react'
import { Smartphone, X } from 'lucide-react'
import { INSTALL_DISMISS_KEY, isIos, shouldOfferInstall } from '@/lib/install'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function readDismissed(): number | null {
  try {
    const v = localStorage.getItem(INSTALL_DISMISS_KEY)
    return v ? Number(v) : null
  } catch {
    return null
  }
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return Boolean(nav.standalone) || window.matchMedia?.('(display-mode: standalone)').matches
}

/**
 * "Thêm vào màn hình chính": on Android/Chrome a one-tap install (the browser's
 * own prompt), on iPhone the two manual steps. Hidden inside the installed app
 * and for a month after "Để sau".
 */
export default function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [hidden, setHidden] = useState(
    () =>
      !shouldOfferInstall({
        standalone: isStandalone(),
        dismissedAt: readDismissed(),
        now: Date.now(),
      })
  )
  const [ios] = useState(() => isIos(navigator.userAgent))

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
    }
    const onInstalled = () => setHidden(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (hidden || (!event && !ios)) return null

  const dismiss = () => {
    try {
      localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()))
    } catch {
      // private mode: just hide for this visit
    }
    setHidden(true)
  }

  const install = async () => {
    if (!event) return
    await event.prompt()
    const choice = await event.userChoice
    if (choice.outcome === 'accepted') setHidden(true)
    setEvent(null)
  }

  return (
    <section className="card relative flex items-start gap-3 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow">
        <Smartphone className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">Đặt VocabStudy lên màn hình chính</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {ios
            ? 'Mở học bằng một chạm như ứng dụng: bấm nút Chia sẻ (ô vuông có mũi tên) rồi chọn “Thêm vào MH chính”.'
            : 'Mở học bằng một chạm như ứng dụng, chạy cả khi mất mạng.'}
        </p>
        <div className="mt-3 flex gap-2">
          {event && (
            <button className="btn-primary !py-2" onClick={install}>
              Cài đặt
            </button>
          )}
          <button className="btn-ghost !py-2" onClick={dismiss}>
            Để sau
          </button>
        </div>
      </div>
      <button
        className="btn-ghost absolute right-2 top-2 h-8 w-8 !p-0"
        aria-label="Đóng"
        onClick={dismiss}
      >
        <X className="h-4 w-4" />
      </button>
    </section>
  )
}
