import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { sceneStars, sceneXp, validateRoleplay } from './roleplay'

const raw = (code: string) => JSON.parse(readFileSync(`public/data/roleplay/${code}.json`, 'utf8'))

describe('role-play scenes', () => {
  it('give both packs scenes where the learner speaks at least twice', () => {
    for (const code of ['en', 'zh']) {
      const { scenes } = validateRoleplay(raw(code))
      expect(scenes.length, code).toBeGreaterThanOrEqual(4)
      for (const s of scenes) {
        const speakers = s.lines.map((l) => l.who)
        // A conversation: the two sides take turns.
        speakers
          .slice(1)
          .forEach((w, i) => expect(w, `${s.id} line ${i + 2}`).not.toBe(speakers[i]))
        // One voice per side.
        for (const who of ['them', 'you'] as const)
          expect(new Set(s.lines.filter((l) => l.who === who).map((l) => l.voice)).size, s.id).toBe(
            1
          )
        if (code === 'zh')
          expect(
            s.lines.every((l) => l.read),
            s.id
          ).toBe(true)
      }
    }
  })

  it('has workplace scenes marked for TOEIC', () => {
    const { scenes } = validateRoleplay(raw('en'))
    expect(scenes.filter((s) => s.tag === 'TOEIC').length).toBeGreaterThanOrEqual(3)
    const b = raw('en')
    b.scenes[0].tag = ''
    expect(() => validateRoleplay(b)).toThrow(/empty tag/)
  })

  it('turns down a scene with a bad line', () => {
    const b = raw('en')
    b.scenes[0].lines[0].who = 'me'
    expect(() => validateRoleplay(b)).toThrow(/who, voice, text and meaning/)
    const c = raw('en')
    c.scenes[0].lines = c.scenes[0].lines.filter((l: { who: string }) => l.who === 'them')
    expect(() => validateRoleplay(c)).toThrow()
  })

  it('gives stars from the average line score', () => {
    expect(sceneStars([90, 95])).toBe(3)
    expect(sceneStars([70, 60])).toBe(2)
    expect(sceneStars([40, 70])).toBe(1)
    expect(sceneStars([])).toBe(1)
    expect(sceneXp(3)).toBe(12)
  })
})
