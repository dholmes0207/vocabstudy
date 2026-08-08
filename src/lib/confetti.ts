// A tiny, dependency-free canvas confetti burst for session celebrations.
// Respects prefers-reduced-motion.

export function celebrate(power = 1): void {
  if (typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const W = window.innerWidth
  const H = window.innerHeight
  const dpr = window.devicePixelRatio || 1

  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  document.body.appendChild(canvas)

  const colors = ['#337dff', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899']
  const count = Math.round(140 * power)
  const parts = Array.from({ length: count }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.4,
    y: H * 0.38 + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 11,
    vy: Math.random() * -9 - 4,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
  }))

  const DURATION = 2200
  const start = performance.now()
  let raf = 0

  const tick = (t: number) => {
    const elapsed = t - start
    ctx.clearRect(0, 0, W, H)
    const alpha = Math.max(0, 1 - elapsed / DURATION)
    for (const p of parts) {
      p.vy += 0.25 // gravity
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }
    if (elapsed < DURATION) raf = requestAnimationFrame(tick)
    else canvas.remove()
  }
  raf = requestAnimationFrame(tick)
  // Safety cleanup in case the tab was backgrounded.
  window.setTimeout(() => {
    cancelAnimationFrame(raf)
    canvas.remove()
  }, DURATION + 500)
}
