// Draws the sky (the maths lives in lib/sky.ts) on a canvas fixed behind the
// app, and owns everything that touches the DOM: the animation loop, pointer
// tracking, theme changes, and the rules that keep it kind to phones —
// capped pixel ratio, no work in background tabs, one still frame for
// reduced motion, and a step down to "lite" if frames come in slow.

import {
  approach,
  budgetFor,
  constellationLinks,
  emitSparkles,
  idleDrift,
  makeFlake,
  makeStars,
  mulberry32,
  nextMeteorIn,
  pointsNear,
  resolveQuality,
  sparkleAlpha,
  spawnMeteor,
  stepFlake,
  stepMeteor,
  stepSparkles,
  trailEmission,
  twinkle,
  type Flake,
  type Meteor,
  type SkyBudget,
  type SkyEffects,
  type SkyEnv,
  type SkyQuality,
  type Sparkle,
  type Star,
} from './sky'
import { SKY_EVENT, type SkyEventDetail } from './skyEvents'

export interface SkyOptions {
  effects: SkyEffects
  snow: boolean
  trail: boolean
}

export interface SkyController {
  /** Quieter sky while a study session is on screen. */
  setCalm(calm: boolean): void
  stop(): void
}

/** Same seed every visit: the learner's sky keeps its constellations. */
const STAR_SEED = 20261002
/** Frames to ignore after (re)starting — app start-up work makes them slow. */
const WARMUP_FRAMES = 60
const SAMPLE_FRAMES = 120
/** Median frame time above this (≈ 38 fps) drops "full" to "lite". */
const SLOW_FRAME_MS = 26
/** How strong the pointer effects stay during a study session (1 = unchanged). */
const CALM = 0.6
/** Flakes nearer than this are drawn as crystals rather than soft dots. */
const CRYSTAL_DEPTH = 0.86

type Rgb = [number, number, number]

interface Palette {
  stars: HTMLCanvasElement[]
  glint: HTMLCanvasElement
  moon: HTMLCanvasElement | null
  flake: HTMLCanvasElement
  /** Six-armed crystal for the nearest, biggest flakes. */
  crystal: HTMLCanvasElement
  sparkles: HTMLCanvasElement[]
  sparkleBlend: GlobalCompositeOperation
  glow: Rgb
  glowAlpha: number
  line: Rgb
}

const NOOP: SkyController = { setCalm() {}, stop() {} }

/**
 * `canvas` sits behind the page (sky, snow, glow); `fx` floats above it with
 * pointer-events off, so sparkles from a tap on a card are not hidden by it.
 */
export function startSky(
  canvas: HTMLCanvasElement,
  fx: HTMLCanvasElement | null,
  opts: SkyOptions
): SkyController {
  const ctx = canvas.getContext('2d')
  if (!ctx || typeof window.matchMedia !== 'function') return NOOP
  const fxCtx = fx?.getContext('2d') ?? null
  let fxDirty = false

  const root = document.documentElement
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const mqCoarse = window.matchMedia('(pointer: coarse)')
  const readEnv = (): SkyEnv => ({
    reducedMotion: mqReduce.matches,
    saveData: Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    ),
    cores: navigator.hardwareConcurrency || 0,
    coarsePointer: mqCoarse.matches,
  })

  const rand = mulberry32((Math.random() * 2 ** 32) >>> 0)
  let quality: SkyQuality = resolveQuality(opts.effects, readEnv())
  let budget: SkyBudget = budgetFor(quality, 1, 1)
  let w = 0
  let h = 0
  let dark = root.classList.contains('dark')
  let palette = makePalette(dark)
  let calm = false

  let stars: Star[] = []
  let starPts: { x: number; y: number }[] = []
  const flakes: Flake[] = []
  const sparkles: Sparkle[] = []
  const meteors: Meteor[] = []
  let meteorTimer = 3

  let t = 0
  let last = 0
  let raf = 0
  let running = false
  let frames = 0
  const samples: number[] = []

  const pointer = {
    tx: 0,
    ty: 0,
    active: false,
    /** A real mouse/pen (hover-capable), not a finger. */
    fine: false,
    lastMove: -Infinity,
    lx: 0,
    ly: 0,
    hasLast: false,
    carry: 0,
  }
  // Eased parallax "look" direction, each axis −1…1.
  let lookX = 0
  let lookY = 0
  // Eased glow position.
  let glowX = 0
  let glowY = 0
  const field = { w: 0, h: 0, t: 0, wind: 0, pointer: { x: 0, y: 0, active: false }, radius: 0 }

  function resize() {
    w = window.innerWidth
    h = window.innerHeight
    budget = budgetFor(quality, w, h)
    const dpr = Math.min(window.devicePixelRatio || 1, budget.dprCap)
    canvas.width = Math.max(1, Math.round(w * dpr))
    canvas.height = Math.max(1, Math.round(h * dpr))
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (fx && fxCtx) {
      fx.width = canvas.width
      fx.height = canvas.height
      fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    if (stars.length !== budget.stars) {
      // The generator is consumed the same way per star, so a resize keeps
      // every existing star in place and only adds or drops the tail.
      stars = makeStars(budget.stars, mulberry32(STAR_SEED))
      starPts = stars.map(() => ({ x: 0, y: 0 }))
    }
    const wantFlakes = opts.snow ? budget.snow : 0
    while (flakes.length < wantFlakes) flakes.push(makeFlake(w, h, rand, true))
    flakes.length = Math.min(flakes.length, wantFlakes)
    if (!pointer.active) {
      glowX = w / 2
      glowY = h / 2
    }
    if (!running) draw()
  }

  function update(dt: number) {
    t += dt
    const mouseRecent = pointer.fine && t - pointer.lastMove < 6
    const look = mouseRecent
      ? { x: (pointer.tx / Math.max(1, w)) * 2 - 1, y: (pointer.ty / Math.max(1, h)) * 2 - 1 }
      : idleDrift(t)
    lookX = approach(lookX, look.x, dt, mouseRecent ? 2.5 : 0.6)
    lookY = approach(lookY, look.y, dt, mouseRecent ? 2.5 : 0.6)
    glowX = approach(glowX, pointer.tx, dt, 9)
    glowY = approach(glowY, pointer.ty, dt, 9)

    if (flakes.length) {
      field.w = w
      field.h = h
      field.t = t
      field.wind = 8 + Math.sin(t * 0.13) * 14
      field.pointer.x = pointer.tx
      field.pointer.y = pointer.ty
      field.pointer.active = pointer.active
      field.radius = pointer.fine ? 110 : 80
      for (const f of flakes) stepFlake(f, dt, field, rand)
    }

    stepSparkles(sparkles, dt)

    if (dark && budget.meteorEvery) {
      // Calm (a study session): still a living sky, just quieter.
      meteorTimer -= calm ? dt * 0.5 : dt
      if (meteorTimer <= 0) {
        meteors.push(spawnMeteor(w, h, rand))
        meteorTimer = nextMeteorIn(budget.meteorEvery, rand)
      }
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      if (!stepMeteor(meteors[i], dt)) meteors.splice(i, 1)
    }
  }

  function draw() {
    const c = ctx!
    c.clearRect(0, 0, w, h)
    if (quality === 'off') return
    const still = !running
    if (dark) {
      drawMoon(c)
      drawStars(c, still)
      if (budget.constellation && pointer.fine && pointer.active && t - pointer.lastMove < 2.5) {
        drawConstellation(c)
      }
      drawMeteors(c)
    }
    if (opts.trail && pointer.fine && pointer.active) drawGlow(c)
    drawSnow(c)
    drawSparkles(fxCtx ?? c)
    c.globalAlpha = 1
    c.globalCompositeOperation = 'source-over'
  }

  function shiftMax() {
    return budget.parallax ? Math.min(w, h) * 0.035 : 0
  }

  function drawMoon(c: CanvasRenderingContext2D) {
    if (!palette.moon) return
    const size = Math.max(40, Math.min(72, Math.min(w, h) * 0.085))
    const m = shiftMax() * 0.12
    // High in the top-right corner, half behind the frosted header, so it
    // glows through the glass instead of sitting under the page's text.
    const x = w * 0.9 - lookX * m
    const y = Math.max(40, h * 0.07) - lookY * m
    const s = size * 2.6 // the sprite includes its halo
    c.globalAlpha = 0.85
    c.drawImage(palette.moon, x - s / 2, y - s / 2, s, s)
  }

  function drawStars(c: CanvasRenderingContext2D, still: boolean) {
    const max = shiftMax()
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]
      const x = s.x * w - lookX * max * s.depth
      const y = s.y * h - lookY * max * s.depth
      starPts[i].x = x
      starPts[i].y = y
      if (x < -12 || x > w + 12 || y < -12 || y > h + 12) continue
      const a = still ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase)) : twinkle(s, t)
      const size = s.r * 6
      c.globalAlpha = a
      c.drawImage(palette.stars[s.tint], x - size / 2, y - size / 2, size, size)
      if (s.bright) {
        const g = s.r * 13 * (0.75 + 0.25 * a)
        c.globalAlpha = a * 0.75
        c.drawImage(palette.glint, x - g / 2, y - g / 2, g, g)
      }
    }
  }

  function drawConstellation(c: CanvasRenderingContext2D) {
    const near = pointsNear(starPts, pointer.tx, pointer.ty, 170, 9)
    if (near.length < 2) return
    const fade = Math.max(0, 1 - (t - pointer.lastMove) / 2.5) * (calm ? CALM : 1)
    const [r, g, b] = palette.line
    c.lineWidth = 0.8
    for (const [a, bIdx] of constellationLinks(starPts, near, 140)) {
      const pa = starPts[a]
      const pb = starPts[bIdx]
      const mx = (pa.x + pb.x) / 2 - pointer.tx
      const my = (pa.y + pb.y) / 2 - pointer.ty
      const closeness = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / 170)
      c.globalAlpha = 1
      c.strokeStyle = `rgba(${r},${g},${b},${(0.45 * closeness * fade).toFixed(3)})`
      c.beginPath()
      c.moveTo(pa.x, pa.y)
      c.lineTo(pb.x, pb.y)
      c.stroke()
    }
    // The joined stars light up a little.
    c.globalCompositeOperation = 'lighter'
    for (const i of near) {
      const p = starPts[i]
      const size = stars[i].r * 10
      c.globalAlpha = 0.5 * fade
      c.drawImage(palette.stars[stars[i].tint], p.x - size / 2, p.y - size / 2, size, size)
    }
    c.globalCompositeOperation = 'source-over'
  }

  function drawMeteors(c: CanvasRenderingContext2D) {
    for (const m of meteors) {
      const p = m.life / m.maxLife
      const a = p < 0.2 ? p / 0.2 : Math.max(0, 1 - (p - 0.2) / 0.8)
      const speed = Math.hypot(m.vx, m.vy) || 1
      const tx = m.x - (m.vx / speed) * m.len
      const ty = m.y - (m.vy / speed) * m.len
      const grad = c.createLinearGradient(m.x, m.y, tx, ty)
      grad.addColorStop(0, `rgba(255,255,255,${(0.9 * a).toFixed(3)})`)
      grad.addColorStop(1, 'rgba(165,180,252,0)')
      c.globalAlpha = 1
      c.strokeStyle = grad
      c.lineWidth = 1.6
      c.lineCap = 'round'
      c.beginPath()
      c.moveTo(m.x, m.y)
      c.lineTo(tx, ty)
      c.stroke()
      c.globalAlpha = a
      c.drawImage(palette.stars[0], m.x - 6, m.y - 6, 12, 12)
    }
  }

  function drawGlow(c: CanvasRenderingContext2D) {
    const fade = Math.max(0, 1 - (t - pointer.lastMove) / 4) * (calm ? CALM : 1)
    if (fade <= 0) return
    const radius = 200
    const [r, g, b] = palette.glow
    const grad = c.createRadialGradient(glowX, glowY, 0, glowX, glowY, radius)
    grad.addColorStop(0, `rgba(${r},${g},${b},${(palette.glowAlpha * fade).toFixed(3)})`)
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
    c.globalAlpha = 1
    c.fillStyle = grad
    c.fillRect(glowX - radius, glowY - radius, radius * 2, radius * 2)
  }

  function drawSnow(c: CanvasRenderingContext2D) {
    if (!flakes.length) return
    for (const f of flakes) {
      c.globalAlpha = 0.35 + f.depth * 0.6
      if (f.depth > CRYSTAL_DEPTH) {
        // The closest flakes are big enough to show their shape, slowly turning.
        const size = f.r * 6.5
        c.save()
        c.translate(f.x, f.y)
        c.rotate(f.phase + t * 0.4 * (f.swayFreq - 0.85))
        c.drawImage(palette.crystal, -size / 2, -size / 2, size, size)
        c.restore()
      } else {
        const size = f.r * 4
        c.drawImage(palette.flake, f.x - size / 2, f.y - size / 2, size, size)
      }
    }
  }

  function drawSparkles(c: CanvasRenderingContext2D) {
    if (c === fxCtx) {
      if (!sparkles.length && !fxDirty) return
      c.clearRect(0, 0, w, h)
      fxDirty = sparkles.length > 0
    }
    if (!sparkles.length) return
    c.globalCompositeOperation = palette.sparkleBlend
    for (const s of sparkles) {
      const size = s.size * 6
      c.globalAlpha = sparkleAlpha(s)
      c.drawImage(palette.sparkles[s.color], s.x - size / 2, s.y - size / 2, size, size)
    }
    c.globalCompositeOperation = 'source-over'
  }

  function monitor(frameMs: number) {
    if (quality !== 'full') return
    frames++
    if (frames <= WARMUP_FRAMES) return
    samples.push(frameMs)
    if (samples.length < SAMPLE_FRAMES) return
    const sorted = [...samples].sort((a, b) => a - b)
    const median = sorted[sorted.length >> 1]
    samples.length = 0
    if (median > SLOW_FRAME_MS) {
      // This device can't keep up — the lighter sky looks almost as good, and
      // the frosted-glass blur on the bars goes too (CSS keys off this flag).
      quality = 'lite'
      root.dataset.skySlow = ''
      resize()
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const raw = last ? now - last : 16.7
    last = now
    update(Math.min(0.05, raw / 1000))
    draw()
    monitor(raw)
  }

  function start() {
    if (running || quality === 'static' || quality === 'off' || document.hidden) return
    running = true
    last = 0
    frames = 0
    samples.length = 0
    raf = requestAnimationFrame(frame)
  }

  function halt() {
    running = false
    cancelAnimationFrame(raf)
  }

  // --- events -------------------------------------------------------------

  function onMove(e: PointerEvent) {
    const x = e.clientX
    const y = e.clientY
    pointer.fine = e.pointerType === 'mouse' || e.pointerType === 'pen'
    pointer.tx = x
    pointer.ty = y
    pointer.active = true
    pointer.lastMove = t
    if (opts.trail && running && budget.sparkles > 0) {
      const dist = pointer.hasLast ? Math.hypot(x - pointer.lx, y - pointer.ly) : 0
      const spacing = (pointer.fine ? 16 : 28) * (calm ? 1.6 : 1)
      const { count, carry } = trailEmission(dist, pointer.carry, spacing)
      pointer.carry = carry
      if (count > 0) {
        emitSparkles(sparkles, x, y, Math.min(count, 3), rand, {
          speed: 36,
          cap: budget.sparkles,
          colors: palette.sparkles.length,
        })
      }
    }
    pointer.lx = x
    pointer.ly = y
    pointer.hasLast = true
  }

  function onDown(e: PointerEvent) {
    onMove(e)
    if (!opts.trail || !running || budget.sparkles === 0) return
    const n = calm ? 5 : quality === 'full' ? 16 : 10
    emitSparkles(sparkles, e.clientX, e.clientY, n, rand, {
      speed: calm ? 90 : 170,
      cap: budget.sparkles,
      colors: palette.sparkles.length,
    })
  }

  function onUp(e: PointerEvent) {
    // A finger lifting ends its "hand" in the snow; a mouse keeps hovering.
    if (e.pointerType !== 'mouse') {
      pointer.active = false
      pointer.hasLast = false
    }
  }

  function onLeave(e: MouseEvent) {
    if (e.relatedTarget === null) {
      pointer.active = false
      pointer.hasLast = false
    }
  }

  function onBlur() {
    pointer.active = false
    pointer.hasLast = false
  }

  function onSkyEvent(e: Event) {
    const d = (e as CustomEvent<SkyEventDetail>).detail
    if (!d || !opts.trail || !running || budget.sparkles === 0) return
    const colors = palette.sparkles.length
    // Feedback for the learner, so it may briefly exceed the ambient cap.
    const cap = budget.sparkles * 2
    if (d.kind === 'burst') {
      emitSparkles(sparkles, d.x, d.y, Math.round(14 * d.power), rand, { speed: 190, cap, colors })
      return
    }
    const spots = Math.round(3 + 3 * d.power)
    for (let i = 0; i < spots; i++) {
      const x = w * (0.15 + rand() * 0.7)
      const y = h * (0.12 + rand() * 0.45)
      emitSparkles(sparkles, x, y, Math.round(10 * d.power), rand, { speed: 220, cap, colors })
    }
    if (dark) {
      const n = Math.round(2 + 3 * d.power)
      for (let i = 0; i < n; i++) meteors.push(spawnMeteor(w, h, rand))
    }
  }

  let resizeQueued = false
  function onResize() {
    if (resizeQueued) return
    resizeQueued = true
    requestAnimationFrame(() => {
      resizeQueued = false
      resize()
    })
  }

  function onVisibility() {
    if (document.hidden) halt()
    else start()
  }

  function onEnvChange() {
    halt()
    quality = resolveQuality(opts.effects, readEnv())
    resize()
    start()
  }

  const themeObserver = new MutationObserver(() => {
    const d = root.classList.contains('dark')
    if (d === dark) return
    dark = d
    palette = makePalette(dark)
    meteors.length = 0
    sparkles.length = 0
    if (!running) draw()
  })

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onUp, { passive: true })
  window.addEventListener('mouseout', onLeave, { passive: true })
  window.addEventListener('blur', onBlur)
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener(SKY_EVENT, onSkyEvent)
  document.addEventListener('visibilitychange', onVisibility)
  mqReduce.addEventListener?.('change', onEnvChange)
  mqCoarse.addEventListener?.('change', onEnvChange)
  themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] })

  resize()
  start()

  return {
    setCalm(next) {
      calm = next
    },
    stop() {
      halt()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('mouseout', onLeave)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('resize', onResize)
      window.removeEventListener(SKY_EVENT, onSkyEvent)
      document.removeEventListener('visibilitychange', onVisibility)
      mqReduce.removeEventListener?.('change', onEnvChange)
      mqCoarse.removeEventListener?.('change', onEnvChange)
      themeObserver.disconnect()
    },
  }
}

// ---------------------------------------------------------------------------
// Sprites: everything is pre-rendered once per theme and stamped with
// drawImage, far cheaper than building gradients for hundreds of dots a frame.
// ---------------------------------------------------------------------------

function sprite(size: number, paint: (g: CanvasRenderingContext2D, size: number) => void) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const g = c.getContext('2d')
  if (g) paint(g, size)
  return c
}

/** A soft round light: solid core fading through `rgb` to nothing. */
function dot([r, g, b]: Rgb, core = '255,255,255', size = 32) {
  return sprite(size, (ctx, s) => {
    const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    grad.addColorStop(0, `rgba(${core},1)`)
    grad.addColorStop(0.18, `rgba(${r},${g},${b},0.9)`)
    grad.addColorStop(0.45, `rgba(${r},${g},${b},0.25)`)
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, s, s)
  })
}

/** Four-pointed glint for the brightest stars. */
function glint() {
  return sprite(64, (ctx, s) => {
    const c = s / 2
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
    ]) {
      const grad = ctx.createLinearGradient(c - dx * c, c - dy * c, c + dx * c, c + dy * c)
      grad.addColorStop(0, 'rgba(255,255,255,0)')
      grad.addColorStop(0.5, 'rgba(255,255,255,0.9)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      if (dx) ctx.fillRect(0, c - 0.75, s, 1.5)
      else ctx.fillRect(c - 0.75, 0, 1.5, s)
    }
    const halo = ctx.createRadialGradient(c, c, 0, c, c, c * 0.35)
    halo.addColorStop(0, 'rgba(255,255,255,0.8)')
    halo.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, s, s)
  })
}

/** A pale moon with a soft halo and a few faint craters. */
function moon() {
  return sprite(160, (ctx, s) => {
    const c = s / 2
    const r = s / 2.6 / 2 // the disc is 1/2.6 of the sprite; the rest is halo
    const halo = ctx.createRadialGradient(c, c, r * 0.8, c, c, c)
    halo.addColorStop(0, 'rgba(254,249,195,0.35)')
    halo.addColorStop(0.4, 'rgba(199,210,254,0.12)')
    halo.addColorStop(1, 'rgba(199,210,254,0)')
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, s, s)
    const disc = ctx.createRadialGradient(c - r * 0.35, c - r * 0.35, r * 0.1, c, c, r)
    disc.addColorStop(0, '#fffbeb')
    disc.addColorStop(0.7, '#f1f5f9')
    disc.addColorStop(1, '#cbd5e1')
    ctx.fillStyle = disc
    ctx.beginPath()
    ctx.arc(c, c, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(148,163,184,0.28)'
    for (const [dx, dy, cr] of [
      [-0.3, -0.15, 0.2],
      [0.25, 0.2, 0.14],
      [0.05, -0.4, 0.09],
      [-0.1, 0.35, 0.11],
    ]) {
      ctx.beginPath()
      ctx.arc(c + dx * r, c + dy * r, cr * r, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

/** A white flake: solid body with a soft rim in `rim` so it reads on a pale sky too. */
function flake([r, g, b]: Rgb, rimAlpha: number) {
  return sprite(24, (ctx, s) => {
    const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.4, 'rgba(255,255,255,0.92)')
    grad.addColorStop(0.62, `rgba(${r},${g},${b},${(rimAlpha * 0.6).toFixed(2)})`)
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, s, s)
  })
}

/** A six-armed snow crystal with little side branches. */
function crystal(stroke: string, shadow: string) {
  return sprite(64, (ctx, s) => {
    const c = s / 2
    const arm = s * 0.42
    ctx.translate(c, c)
    ctx.lineCap = 'round'
    ctx.strokeStyle = stroke
    ctx.shadowColor = shadow
    ctx.shadowBlur = 4
    ctx.lineWidth = 2.4
    for (let i = 0; i < 6; i++) {
      ctx.save()
      ctx.rotate((i * Math.PI) / 3)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, -arm)
      for (const at of [0.45, 0.7]) {
        const len = arm * (at === 0.45 ? 0.3 : 0.22)
        ctx.moveTo(0, -arm * at)
        ctx.lineTo(-len * 0.8, -arm * at - len * 0.6)
        ctx.moveTo(0, -arm * at)
        ctx.lineTo(len * 0.8, -arm * at - len * 0.6)
      }
      ctx.stroke()
      ctx.restore()
    }
  })
}

function makePalette(dark: boolean): Palette {
  if (dark) {
    return {
      stars: [dot([226, 232, 240]), dot([147, 197, 253]), dot([253, 230, 138])],
      glint: glint(),
      moon: moon(),
      flake: flake([191, 219, 254], 0.35),
      crystal: crystal('rgba(241,245,249,0.95)', 'rgba(147,197,253,0.8)'),
      sparkles: [
        dot([253, 224, 71]),
        dot([165, 180, 252]),
        dot([244, 114, 182]),
        dot([94, 234, 212]),
      ],
      sparkleBlend: 'lighter',
      glow: [129, 140, 248],
      glowAlpha: 0.16,
      line: [199, 210, 254],
    }
  }
  return {
    stars: [dot([148, 163, 184]), dot([96, 165, 250]), dot([251, 191, 36])],
    glint: glint(),
    moon: null,
    // White flakes vanish on a pale sky, so give them a cool blue-grey rim.
    flake: flake([100, 130, 180], 0.4),
    crystal: crystal('rgba(255,255,255,0.98)', 'rgba(71,105,160,0.75)'),
    sparkles: [
      dot([27, 94, 245], '191,219,254'),
      dot([168, 85, 247], '233,213,255'),
      dot([245, 158, 11], '254,243,199'),
    ],
    sparkleBlend: 'source-over',
    glow: [59, 130, 246],
    glowAlpha: 0.1,
    line: [59, 130, 246],
  }
}
