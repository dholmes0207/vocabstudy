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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || effects === 'off') return
    const sky = startSky(canvas, fxRef.current, { effects, snow, trail })
    controller.current = sky
    return () => {
      sky.stop()
      controller.current = null
    }
  }, [effects, snow, trail])

  // Also re-run after a restart (settings changed) so the new sky starts calm too.
  useEffect(() => {
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
