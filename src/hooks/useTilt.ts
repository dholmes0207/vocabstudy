import { useCallback } from 'react'
import { tiltFor } from '@/lib/tilt'

/**
 * Pointer handlers that make a `.tilt` element lean toward the mouse with a
 * glare that follows it. Mouse only — touch screens get the normal tap
 * feedback, and the CSS switches the effect off for reduced motion.
 * Writes CSS variables straight onto the element: no re-render per move.
 */
export function useTilt(max = 7) {
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      const t = tiltFor((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, max)
      el.style.setProperty('--tilt-x', `${t.rx}deg`)
      el.style.setProperty('--tilt-y', `${t.ry}deg`)
      el.style.setProperty('--glare-x', `${t.gx}%`)
      el.style.setProperty('--glare-y', `${t.gy}%`)
      el.dataset.tilting = ''
    },
    [max]
  )
  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    delete el.dataset.tilting
  }, [])
  return { onPointerMove, onPointerLeave }
}
