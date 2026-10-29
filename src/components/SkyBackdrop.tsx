import { useEffect, useRef } from 'react'
import { useSettings } from '@/store/settingsStore'
import { useIsImmersive } from '@/store/uiStore'
import { startSky, type SkyController } from '@/lib/skyRenderer'

/**
 * The living sky behind every screen: a gradient (night with aurora in dark
 * mode, a pale winter morning in light mode) plus a canvas of twinkling stars,
 * snow, shooting stars and pointer sparkles. Purely decorative — hidden from
 * screen readers, never takes a click, and calmer while a study session is on.
 */
export default function SkyBackdrop() {
  const effects = useSettings((s) => s.skyEffects)
  const snow = useSettings((s) => s.snow)
  const trail = useSettings((s) => s.cursorTrail)
  const calm = useIsImmersive()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)
  const controller = useRef<SkyController | null>(null)
  const calmRef = useRef(calm)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || effects === 'off') return
    let sky: SkyController | null = null
    // Once the first screen is up: sizing the sky took ~200 ms of a slow
    // phone's main thread right while the dashboard was rendering. The CSS
    // gradient behind it is there from the first paint; the stars fade in.
    const start = () => {
      sky = startSky(canvas, fxRef.current, { effects, snow, trail })
      sky.setCalm(calmRef.current)
      controller.current = sky
      canvas.dataset.on = ''
    }
    const idle = typeof window.requestIdleCallback === 'function'
    const handle = idle
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 300)
    return () => {
      if (idle) window.cancelIdleCallback(handle)
      else clearTimeout(handle)
      sky?.stop()
      controller.current = null
    }
  }, [effects, snow, trail])

  // Also re-run after a restart (settings changed) so the new sky starts calm too.
  useEffect(() => {
    calmRef.current = calm
    controller.current?.setCalm(calm)
  }, [calm, effects, snow, trail])

  return (
    <>
      <div aria-hidden="true" className={`sky ${calm ? 'sky--calm' : ''}`}>
        <div className="sky-glow" />
        {effects !== 'off' && <canvas ref={canvasRef} className="sky-canvas" />}
      </div>
      {effects !== 'off' && trail && <canvas ref={fxRef} aria-hidden="true" className="sky-fx" />}
    </>
  )
}
