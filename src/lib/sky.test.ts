import { describe, expect, it } from 'vitest'
import {
  approach,
  budgetFor,
  constellationLinks,
  emitSparkles,
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
  type SkyEnv,
  type Sparkle,
} from './sky'

const desktop: SkyEnv = { reducedMotion: false, saveData: false, cores: 8, coarsePointer: false }

describe('resolveQuality', () => {
  it('off always means off', () => {
    expect(resolveQuality('off', desktop)).toBe('off')
    expect(resolveQuality('off', { ...desktop, reducedMotion: true })).toBe('off')
  })

  it('reduced motion turns any moving sky into one still frame', () => {
    for (const s of ['auto', 'full', 'lite'] as const) {
      expect(resolveQuality(s, { ...desktop, reducedMotion: true })).toBe('static')
    }
  })

  it('auto is full on a desktop, light on phones, low-end CPUs and Data Saver', () => {
    expect(resolveQuality('auto', desktop)).toBe('full')
    expect(resolveQuality('auto', { ...desktop, coarsePointer: true })).toBe('lite')
    expect(resolveQuality('auto', { ...desktop, cores: 4 })).toBe('lite')
    expect(resolveQuality('auto', { ...desktop, saveData: true })).toBe('lite')
    // Unknown core count is not treated as weak.
    expect(resolveQuality('auto', { ...desktop, cores: 0 })).toBe('full')
  })

  it('an explicit choice is respected', () => {
    expect(resolveQuality('full', { ...desktop, coarsePointer: true })).toBe('full')
    expect(resolveQuality('lite', desktop)).toBe('lite')
  })
})

describe('budgetFor', () => {
  it('draws nothing when off, and nothing moving when static', () => {
    expect(budgetFor('off', 1440, 900)).toMatchObject({ stars: 0, snow: 0, sparkles: 0 })
    const still = budgetFor('static', 1440, 900)
    expect(still.stars).toBeGreaterThan(0)
    expect(still).toMatchObject({ snow: 0, sparkles: 0, meteorEvery: null, parallax: false })
  })

  it('scales with the screen but stays inside its caps', () => {
    const phone = budgetFor('lite', 390, 844)
    const big = budgetFor('full', 2560, 1440)
    expect(phone.stars).toBeLessThan(big.stars)
    expect(big.stars).toBeLessThanOrEqual(320)
    expect(big.snow).toBeLessThanOrEqual(180)
    expect(budgetFor('full', 10, 10).stars).toBeGreaterThanOrEqual(60)
  })

  it('lite is cheaper than full on the same screen', () => {
    const full = budgetFor('full', 1280, 800)
    const lite = budgetFor('lite', 1280, 800)
    expect(lite.stars).toBeLessThan(full.stars)
    expect(lite.snow).toBeLessThan(full.snow)
    expect(lite.dprCap).toBeLessThan(full.dprCap)
    expect(lite.constellation).toBe(false)
  })
})

describe('mulberry32 + approach', () => {
  it('is deterministic for a seed and stays in [0, 1)', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('approach eases toward the target the same way at any frame rate', () => {
    let fast = 0
    for (let i = 0; i < 4; i++) fast = approach(fast, 100, 0.025, 6)
    const slow = approach(0, 100, 0.1, 6)
    expect(fast).toBeCloseTo(slow, 6)
    expect(slow).toBeGreaterThan(0)
    expect(slow).toBeLessThan(100)
  })
})

describe('stars', () => {
  const stars = makeStars(400, mulberry32(7))

  it('mostly far and faint, a few bright', () => {
    const far = stars.filter((s) => s.depth < 0.5).length
    expect(far).toBeGreaterThan(stars.length / 2)
    const bright = stars.filter((s) => s.bright).length
    expect(bright).toBeGreaterThan(0)
    expect(bright).toBeLessThan(stars.length * 0.15)
    for (const s of stars) {
      expect(s.depth).toBeGreaterThanOrEqual(0.15)
      expect(s.depth).toBeLessThanOrEqual(1)
    }
  })

  it('twinkle stays visible but never fully bright all the time', () => {
    const s = stars[0]
    const values = Array.from({ length: 200 }, (_, i) => twinkle(s, i * 0.05))
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0.1 - 1e-9)
    expect(Math.max(...values)).toBeLessThanOrEqual(1 + 1e-9)
    expect(Math.max(...values) - Math.min(...values)).toBeGreaterThan(0.5)
  })
})

describe('constellation', () => {
  const pts = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 0, y: 30 },
    { x: 500, y: 500 },
  ]

  it('finds the points near the pointer, nearest first, capped', () => {
    expect(pointsNear(pts, 0, 0, 50, 10)).toEqual([0, 1, 2])
    expect(pointsNear(pts, 0, 0, 50, 2)).toEqual([0, 1])
    expect(pointsNear(pts, 1000, 1000, 50, 5)).toEqual([])
  })

  it('links each star to its nearest neighbour once, skipping long jumps', () => {
    const links = constellationLinks(pts, [0, 1, 2], 100)
    expect(links).toContainEqual([0, 1])
    expect(links).toContainEqual([0, 2])
    expect(links).toHaveLength(2)
    expect(constellationLinks(pts, [0, 3], 100)).toEqual([])
    expect(constellationLinks(pts, [0], 100)).toEqual([])
  })
})

describe('snow', () => {
  const field = (over = {}) => ({
    w: 400,
    h: 800,
    t: 0,
    wind: 0,
    pointer: { x: 0, y: 0, active: false },
    radius: 120,
    ...over,
  })

  it('falls, and near flakes fall faster than far ones', () => {
    const rand = mulberry32(1)
    const f = makeFlake(400, 800, rand, true)
    const y0 = f.y
    stepFlake(f, 0.1, field(), rand)
    expect(f.y).toBeGreaterThan(y0)
    const near = { ...f, depth: 1, vy: 16 + 44 }
    const far = { ...f, depth: 0.3, vy: 16 + 0.3 * 44 }
    expect(near.vy).toBeGreaterThan(far.vy)
  })

  it('a flake that leaves the bottom falls again from the top', () => {
    const rand = mulberry32(2)
    const f = makeFlake(400, 800, rand, true)
    f.y = 805
    stepFlake(f, 0.1, field(), rand)
    expect(f.y).toBeLessThan(0)
  })

  it('wraps around the sides instead of piling up off-screen', () => {
    const rand = mulberry32(3)
    const f = makeFlake(400, 800, rand, true)
    f.x = 405
    f.y = 100
    f.sway = 0
    stepFlake(f, 0.016, field({ wind: 30 }), rand)
    expect(f.x).toBeLessThan(10)
  })

  it('the pointer brushes flakes aside, and only when active and close', () => {
    const rand = mulberry32(4)
    const make = () => {
      const f = makeFlake(400, 800, rand, true)
      f.x = 210
      f.y = 400
      f.sway = 0
      return f
    }
    const pushed = make()
    stepFlake(pushed, 0.05, field({ pointer: { x: 200, y: 400, active: true } }), rand)
    expect(pushed.px).toBeGreaterThan(0)

    const idle = make()
    stepFlake(idle, 0.05, field({ pointer: { x: 200, y: 400, active: false } }), rand)
    expect(idle.px).toBe(0)

    const far = make()
    stepFlake(far, 0.05, field({ pointer: { x: 0, y: 0, active: true } }), rand)
    expect(far.px).toBe(0)
  })

  it('a push wears off', () => {
    const rand = mulberry32(5)
    const f = makeFlake(400, 800, rand, true)
    f.px = 100
    for (let i = 0; i < 60; i++) stepFlake(f, 0.05, field(), rand)
    expect(Math.abs(f.px)).toBeLessThan(1)
  })
})

describe('sparkles', () => {
  it('respects the cap', () => {
    const list: Sparkle[] = []
    emitSparkles(list, 0, 0, 50, mulberry32(1), { speed: 100, cap: 20, colors: 3 })
    expect(list).toHaveLength(20)
    emitSparkles(list, 0, 0, 5, mulberry32(1), { speed: 100, cap: 20, colors: 3 })
    expect(list).toHaveLength(20)
    for (const s of list) expect(s.color).toBeLessThan(3)
  })

  it('die after their life and are removed in place', () => {
    const list: Sparkle[] = []
    emitSparkles(list, 0, 0, 10, mulberry32(9), { speed: 100, cap: 50, colors: 2 })
    stepSparkles(list, 0.2)
    expect(list.length).toBe(10)
    for (let i = 0; i < 20; i++) stepSparkles(list, 0.1)
    expect(list).toHaveLength(0)
  })

  it('fade in quickly and out slowly', () => {
    const s: Sparkle = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1, color: 0 }
    expect(sparkleAlpha(s)).toBe(0)
    expect(sparkleAlpha({ ...s, life: 0.15 })).toBeCloseTo(1)
    expect(sparkleAlpha({ ...s, life: 0.6 })).toBeGreaterThan(0)
    expect(sparkleAlpha({ ...s, life: 0.6 })).toBeLessThan(1)
    expect(sparkleAlpha({ ...s, life: 1 })).toBe(0)
  })

  it('the trail drops sparkles by distance, carrying the remainder', () => {
    expect(trailEmission(35, 0, 14)).toEqual({ count: 2, carry: 7 })
    expect(trailEmission(7, 7, 14)).toEqual({ count: 1, carry: 0 })
    expect(trailEmission(5, 0, 14)).toEqual({ count: 0, carry: 5 })
    expect(trailEmission(100, 0, 0)).toEqual({ count: 0, carry: 0 })
  })
})

describe('shooting stars', () => {
  it('start in the upper sky and head down-left, then burn out', () => {
    const rand = mulberry32(11)
    for (let i = 0; i < 20; i++) {
      const m = spawnMeteor(1000, 800, rand)
      expect(m.y).toBeLessThanOrEqual(800 * 0.35)
      expect(m.vx).toBeLessThan(0)
      expect(m.vy).toBeGreaterThan(0)
    }
    const m = spawnMeteor(1000, 800, rand)
    let alive = true
    let frames = 0
    while (alive && frames < 1000) {
      alive = stepMeteor(m, 0.016)
      frames++
    }
    expect(alive).toBe(false)
    expect(frames).toBeLessThan(100)
  })

  it('the wait between them stays in range', () => {
    const rand = mulberry32(12)
    for (let i = 0; i < 50; i++) {
      const s = nextMeteorIn([4, 9], rand)
      expect(s).toBeGreaterThanOrEqual(4)
      expect(s).toBeLessThanOrEqual(9)
    }
  })
})
