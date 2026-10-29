// The maths behind the animated sky drawn behind the app: twinkling stars that
// drift with the pointer, snow that the pointer brushes aside, sparkles, and
// the odd shooting star. No DOM in here — skyRenderer.ts owns the canvas and
// calls these every frame — so the behaviour is unit-tested and, given a
// seeded generator, deterministic.

import type { SkyEffects } from '@/types'

export type { SkyEffects }

/** What the renderer actually does. `static` = one still frame (reduced motion). */
export type SkyQuality = 'full' | 'lite' | 'static' | 'off'

export interface SkyEnv {
  /** prefers-reduced-motion: reduce. */
  reducedMotion: boolean
  /** navigator.connection.saveData (Data Saver on Android). */
  saveData: boolean
  /** navigator.hardwareConcurrency, 0 when unknown. */
  cores: number
  /** The primary pointer is a finger (phones, tablets). */
  coarsePointer: boolean
}

/**
 * Turn the setting into a rendering level. Motion sensitivity always wins
 * over the setting (a still sky, never a moving one); "auto" stays light on
 * phones, low-end CPUs and Data Saver, where battery matters more than flair.
 */
export function resolveQuality(setting: SkyEffects, env: SkyEnv): SkyQuality {
  if (setting === 'off') return 'off'
  if (env.reducedMotion) return 'static'
  if (setting === 'full' || setting === 'lite') return setting
  if (env.saveData || env.coarsePointer) return 'lite'
  if (env.cores > 0 && env.cores <= 4) return 'lite'
  return 'full'
}

export interface SkyBudget {
  stars: number
  snow: number
  /** Most sparkles alive at once (pointer trail + tap bursts). */
  sparkles: number
  /** Seconds between shooting stars as [min, max]; null = none. */
  meteorEvery: [number, number] | null
  /** Ceiling on devicePixelRatio for the canvas backing store. */
  dprCap: number
  /** Whether star layers drift against the pointer. */
  parallax: boolean
  /** Whether stars near the pointer join into a constellation. */
  constellation: boolean
}

/** How much to draw for a viewport of `width` × `height` CSS pixels. */
export function budgetFor(quality: SkyQuality, width: number, height: number): SkyBudget {
  const area = Math.max(0, width) * Math.max(0, height)
  switch (quality) {
    case 'off':
      return {
        stars: 0,
        snow: 0,
        sparkles: 0,
        meteorEvery: null,
        dprCap: 1,
        parallax: false,
        constellation: false,
      }
    case 'static':
      return {
        stars: clampInt(area / 3200, 40, 280),
        snow: 0,
        sparkles: 0,
        meteorEvery: null,
        dprCap: 2,
        parallax: false,
        constellation: false,
      }
    case 'lite':
      return {
        stars: clampInt(area / 5200, 40, 170),
        snow: clampInt(area / 15000, 18, 80),
        sparkles: 60,
        meteorEvery: [9, 18],
        dprCap: 1.5,
        parallax: true,
        constellation: false,
      }
    case 'full':
      return {
        stars: clampInt(area / 3200, 60, 320),
        snow: clampInt(area / 8500, 40, 180),
        sparkles: 160,
        meteorEvery: [4, 9],
        dprCap: 2,
        parallax: true,
        constellation: true,
      }
  }
}

function clampInt(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

// ---------------------------------------------------------------------------
// Random numbers
// ---------------------------------------------------------------------------

export type Rand = () => number

/** Small, fast seeded generator (mulberry32) returning floats in [0, 1). */
export function mulberry32(seed: number): Rand {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Ease `current` toward `target`; frame-rate independent (same feel at 30 or 144 fps). */
export function approach(current: number, target: number, dt: number, rate: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt))
}

// ---------------------------------------------------------------------------
// Stars
// ---------------------------------------------------------------------------

export interface Star {
  /** Position as a fraction of the viewport; a little overscan so parallax never shows an edge. */
  x: number
  y: number
  /** 0.15 (far, small, barely moves) … 1 (near, larger, drifts most). */
  depth: number
  /** Radius in CSS px. */
  r: number
  phase: number
  /** Twinkle speed in radians per second. */
  speed: number
  /** 0 white, 1 ice blue, 2 warm. */
  tint: 0 | 1 | 2
  /** A few stars get a cross-shaped glint. */
  bright: boolean
}

export function makeStars(n: number, rand: Rand): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < n; i++) {
    // Squaring skews toward far, faint stars — a real sky has few bright ones.
    const depth = 0.15 + rand() * rand() * 0.85
    const roll = rand()
    stars.push({
      x: -0.05 + rand() * 1.1,
      // Denser toward the top of the screen, where the sky "is".
      y: -0.05 + Math.pow(rand(), 1.35) * 1.1,
      depth,
      r: 0.35 + depth * 1.3,
      phase: rand() * Math.PI * 2,
      speed: 0.6 + rand() * 1.8,
      tint: roll < 0.18 ? 1 : roll < 0.28 ? 2 : 0,
      bright: rand() < 0.06,
    })
  }
  return stars
}

/** Brightness of a star at time `t` (seconds), in [0.1, 1]. */
export function twinkle(star: Star, t: number): number {
  return 0.55 + 0.45 * Math.sin(star.phase + t * star.speed)
}

/**
 * Where the parallax "looks" when nobody is moving a mouse (phones, idle
 * desktops): a slow figure-eight so the sky never feels frozen.
 */
export function idleDrift(t: number): { x: number; y: number } {
  return { x: Math.sin(t * 0.07) * 0.6, y: Math.sin(t * 0.11 + 1) * 0.35 }
}

/**
 * Indices of the points within `radius` of (px, py), nearest first, at most
 * `max` of them.
 */
export function pointsNear(
  points: readonly { x: number; y: number }[],
  px: number,
  py: number,
  radius: number,
  max: number
): number[] {
  const r2 = radius * radius
  const hits: { i: number; d2: number }[] = []
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - px
    const dy = points[i].y - py
    const d2 = dx * dx + dy * dy
    if (d2 <= r2) hits.push({ i, d2 })
  }
  hits.sort((a, b) => a.d2 - b.d2)
  return hits.slice(0, max).map((h) => h.i)
}

/**
 * Join the selected stars into a constellation: each links to its nearest
 * selected neighbour (if closer than `maxLen`). Returns unique index pairs,
 * smaller index first.
 */
export function constellationLinks(
  points: readonly { x: number; y: number }[],
  selected: readonly number[],
  maxLen: number
): [number, number][] {
  const seen = new Set<string>()
  const links: [number, number][] = []
  const max2 = maxLen * maxLen
  for (const a of selected) {
    let best = -1
    let bestD2 = Infinity
    for (const b of selected) {
      if (a === b) continue
      const dx = points[a].x - points[b].x
      const dy = points[a].y - points[b].y
      const d2 = dx * dx + dy * dy
      if (d2 < bestD2) {
        bestD2 = d2
        best = b
      }
    }
    if (best < 0 || bestD2 > max2) continue
    const pair: [number, number] = a < best ? [a, best] : [best, a]
    const key = `${pair[0]}-${pair[1]}`
    if (!seen.has(key)) {
      seen.add(key)
      links.push(pair)
    }
  }
  return links
}

// ---------------------------------------------------------------------------
// Snow
// ---------------------------------------------------------------------------

export interface Flake {
  x: number
  y: number
  r: number
  depth: number
  /** Fall speed, px/s. */
  vy: number
  /** Side-to-side sway amplitude (px/s) and frequency (rad/s). */
  sway: number
  swayFreq: number
  phase: number
  /** Velocity from being pushed by the pointer; decays back to 0. */
  px: number
  py: number
}

/** A new flake; `anywhere` scatters it over the screen (first frame), else just above the top. */
export function makeFlake(w: number, h: number, rand: Rand, anywhere: boolean): Flake {
  const depth = 0.3 + rand() * 0.7
  const r = 0.8 + depth * 2.6
  return {
    x: rand() * w,
    y: anywhere ? rand() * h : -r - rand() * 40,
    r,
    depth,
    vy: 16 + depth * 44,
    sway: 6 + rand() * 18,
    swayFreq: 0.4 + rand() * 0.9,
    phase: rand() * Math.PI * 2,
    px: 0,
    py: 0,
  }
}

export interface SnowField {
  w: number
  h: number
  /** Seconds since start, drives the sway. */
  t: number
  /** Steady breeze in px/s (positive = to the right), scaled by each flake's depth. */
  wind: number
  pointer: { x: number; y: number; active: boolean }
  /** How far (px) the pointer's "hand" reaches into the snowfall. */
  radius: number
}

const PUSH = 320
const PUSH_DECAY = 2.6

/** Advance one flake by `dt` seconds, in place. Flakes that leave the bottom fall again from the top. */
export function stepFlake(f: Flake, dt: number, field: SnowField, rand: Rand): void {
  const { pointer, radius } = field
  if (pointer.active && radius > 0) {
    const dx = f.x - pointer.x
    const dy = f.y - pointer.y
    const d2 = dx * dx + dy * dy
    if (d2 < radius * radius && d2 > 1e-6) {
      const d = Math.sqrt(d2)
      const k = 1 - d / radius
      const force = PUSH * k * k
      f.px += (dx / d) * force * dt
      f.py += (dy / d) * force * dt
    }
  }
  const decay = Math.exp(-PUSH_DECAY * dt)
  f.px *= decay
  f.py *= decay

  const sway = f.sway * Math.cos(f.phase + field.t * f.swayFreq)
  f.x += (field.wind * f.depth + sway + f.px) * dt
  f.y += (f.vy + f.py) * dt

  if (f.y - f.r > field.h) {
    f.y = -f.r - rand() * 20
    f.x = rand() * field.w
    f.px = 0
    f.py = 0
  } else if (f.y < -field.h * 0.25) {
    // Shoved far above the screen: let it start falling again from the edge.
    f.y = -f.r
    f.py = 0
  }
  const span = field.w + 2 * f.r
  if (f.x < -f.r) f.x += span
  else if (f.x > field.w + f.r) f.x -= span
}

// ---------------------------------------------------------------------------
// Sparkles (pointer trail, tap bursts)
// ---------------------------------------------------------------------------

export interface Sparkle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  /** Index into the renderer's sparkle palette. */
  color: number
}

/** Add up to `count` sparkles at (x, y) without exceeding `cap` alive. */
export function emitSparkles(
  out: Sparkle[],
  x: number,
  y: number,
  count: number,
  rand: Rand,
  opts: { speed: number; cap: number; colors: number }
): void {
  const n = Math.min(count, Math.max(0, opts.cap - out.length))
  for (let i = 0; i < n; i++) {
    const angle = rand() * Math.PI * 2
    const sp = opts.speed * (0.3 + rand() * 0.7)
    out.push({
      x,
      y,
      vx: Math.cos(angle) * sp,
      vy: Math.sin(angle) * sp - opts.speed * 0.25,
      life: 0,
      maxLife: 0.45 + rand() * 0.7,
      size: 1 + rand() * 2.2,
      color: Math.floor(rand() * opts.colors),
    })
  }
}

const SPARKLE_DRAG = 2.4
const SPARKLE_GRAVITY = 46

/** Advance all sparkles and drop the dead ones, in place. */
export function stepSparkles(list: Sparkle[], dt: number): void {
  const drag = Math.exp(-SPARKLE_DRAG * dt)
  let write = 0
  for (let read = 0; read < list.length; read++) {
    const s = list[read]
    s.life += dt
    if (s.life >= s.maxLife) continue
    s.vx *= drag
    s.vy = s.vy * drag + SPARKLE_GRAVITY * dt
    s.x += s.vx * dt
    s.y += s.vy * dt
    list[write++] = s
  }
  list.length = write
}

/** Opacity over a sparkle's life: quick fade-in, slow fade-out. */
export function sparkleAlpha(s: Sparkle): number {
  const p = s.life / s.maxLife
  if (p <= 0) return 0
  if (p >= 1) return 0
  return p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85
}

/**
 * The pointer trail drops one sparkle every `spacing` px travelled, so fast
 * and slow movements leave the same density. `carry` is the distance left
 * over from the previous move.
 */
export function trailEmission(
  distance: number,
  carry: number,
  spacing: number
): { count: number; carry: number } {
  if (spacing <= 0) return { count: 0, carry: 0 }
  const total = carry + Math.max(0, distance)
  const count = Math.floor(total / spacing)
  return { count, carry: total - count * spacing }
}

// ---------------------------------------------------------------------------
// Shooting stars
// ---------------------------------------------------------------------------

export interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  /** Tail length in px. */
  len: number
}

/** A shooting star entering from the upper part of the sky, heading down-left. */
export function spawnMeteor(w: number, h: number, rand: Rand): Meteor {
  const angle = ((200 + rand() * 30) * Math.PI) / 180
  const speed = 650 + rand() * 450
  return {
    x: w * (0.25 + rand() * 0.8),
    y: h * rand() * 0.35,
    vx: Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed,
    life: 0,
    maxLife: 0.7 + rand() * 0.5,
    len: 80 + rand() * 90,
  }
}

/** Advance a meteor; false once it has burnt out. */
export function stepMeteor(m: Meteor, dt: number): boolean {
  m.life += dt
  m.x += m.vx * dt
  m.y += m.vy * dt
  return m.life < m.maxLife
}

/** Seconds until the next shooting star. */
export function nextMeteorIn(range: [number, number], rand: Rand): number {
  return range[0] + rand() * (range[1] - range[0])
}
