import { useState } from 'react'
import { Hand, Keyboard } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useNoTypingStore } from '@/store/noTypingStore'
import {
  DEVICES,
  VIETNAMESE_IME_NOTE,
  deviceOf,
  keyboardGuide,
  type Device,
} from '@/lib/keyboardHelp'
import { useT } from '@/lib/i18n'

const guessDevice = (): Device =>
  typeof navigator === 'undefined'
    ? 'android'
    : deviceOf(navigator.userAgent, navigator.maxTouchPoints ?? 0)

/**
 * The line under a box where the learner types Korean or Chinese: how to add
 * the keyboard on this device, and — where the screen has a tap-only version —
 * a way to carry on without typing. Renders nothing for English.
 */
export default function KeyboardHelp({ canSkip = false }: { canSkip?: boolean }) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const setNoTyping = useNoTypingStore((s) => s.set)
  const [open, setOpen] = useState(false)
  const [device, setDevice] = useState<Device>(guessDevice)
  const guide = keyboardGuide(code)
  if (!guide) return null

  return (
    <div className="text-sm">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          <Keyboard className="h-4 w-4" aria-hidden="true" />
          {t(`Chưa gõ được ${guide.script[0]}?`, `Can't type ${guide.script[1]} yet?`)}
        </button>
        {canSkip && (
          <button
            type="button"
            onClick={() => setNoTyping(code, true)}
            className="inline-flex items-center gap-1 font-medium text-slate-500 hover:underline dark:text-slate-400"
          >
            <Hand className="h-4 w-4" aria-hidden="true" />
            {t('Làm không cần gõ', 'Do it without typing')}
          </button>
        )}
      </p>

      {open && (
        <div className="mt-2 space-y-3 rounded-xl bg-slate-50 p-3 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          <div role="group" aria-label={t('Thiết bị', 'Device')} className="flex flex-wrap gap-1.5">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={device === d.id}
                onClick={() => setDevice(d.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  device === d.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-brand-50 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <ol className="list-decimal space-y-1 pl-5">
            {guide.steps[device].map((s) => (
              <li key={s[0]}>{t(...s)}</li>
            ))}
          </ol>
          <p>💡 {t(...guide.howTo)}</p>
          {guide.noKeyboard && <p>🔤 {t(...guide.noKeyboard)}</p>}
          {(device === 'windows' || device === 'mac' || device === 'linux') && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {t(...VIETNAMESE_IME_NOTE)}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'Tên mục có thể hơi khác tuỳ phiên bản máy.',
              'Menu names can differ a little between versions.'
            )}
          </p>
        </div>
      )}
    </div>
  )
}

/** "Typing is off" note with the way back, shown where a screen switched to tapping. */
export function NoTypingNote() {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const setNoTyping = useNoTypingStore((s) => s.set)
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
      <Hand className="h-3.5 w-3.5" aria-hidden="true" />
      {t('Đang làm không cần gõ.', 'Typing is off.')}
      <button
        type="button"
        onClick={() => setNoTyping(code, false)}
        className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
      >
        {t('Gõ bằng bàn phím', 'Type on the keyboard')}
      </button>
    </p>
  )
}
