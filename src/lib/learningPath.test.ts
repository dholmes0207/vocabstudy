import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  CLEAR_AT,
  EN_PATH,
  KO_PATH,
  ZH_PATH,
  currentLevel,
  levelForPlacement,
  nextStep,
  pathFor,
  pathState,
  type PathContext,
} from './learningPath'
import { TOEIC_WORDS } from './toeic'

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const en = json('public/data/en.json') as { words: { word: string }[] }
const ids = (file: string, key: string) =>
  new Set((json(file)[key] as { id: string }[]).map((x) => x.id))
const content = {
  en: {
    grammar: ids('public/data/grammar/en.json', 'units'),
    stories: ids('public/data/reading/en.json', 'stories'),
  },
  zh: {
    grammar: ids('public/data/grammar/zh.json', 'units'),
    stories: ids('public/data/reading/zh.json', 'stories'),
  },
  ko: {
    grammar: ids('public/data/grammar/ko.json', 'units'),
    stories: ids('public/data/reading/ko.json', 'stories'),
  },
}
const routes = readFileSync('src/App.tsx', 'utf8')

/** A learner who has done nothing yet, with overrides. */
function ctx(over: Partial<PathContext> = {}): PathContext {
  return {
    learnedInRange: () => 0,
    learnedWords: () => 0,
    grammarPassed: () => 0,
    storiesRead: () => 0,
    activity: () => 0,
    toeicPart: () => [0, 0],
    examBest: () => 0,
    hskAnswered: () => 0,
    ...over,
  }
}

/** A learner who has done everything every step asks for. */
const everything = ctx({
  learnedInRange: (from, to) => to - from,
  learnedWords: (w) => w.length,
  grammarPassed: (ids) => ids.length,
  storiesRead: (ids) => ids.length,
  activity: () => 99,
  toeicPart: () => [10, 10],
  examBest: () => 1,
  hskAnswered: () => 999,
})

describe('the paths', () => {
  it.each([
    ['en', EN_PATH],
    ['zh', ZH_PATH],
    ['ko', KO_PATH],
  ] as const)('%s: points only at content and screens that exist', (code, path) => {
    const { grammar: grammarIds, stories: storyIds } = content[code]
    for (const level of path)
      for (const step of level.steps) {
        expect(routes, step.to).toContain(`path="${step.to}"`)
        const probe = { ...everything }
        // Each step's measure only asks for ids the data has.
        probe.grammarPassed = (ids) => {
          for (const id of ids) expect(grammarIds.has(id), id).toBe(true)
          return ids.length
        }
        probe.storiesRead = (ids) => {
          for (const id of ids) expect(storyIds.has(id), id).toBe(true)
          return ids.length
        }
        expect(step.measure(probe), step.id).toBeGreaterThanOrEqual(step.goal)
      }
  })

  it('has unique step ids, word ranges back to back inside the pack, and enough TOEIC words', () => {
    const ids = EN_PATH.flatMap((l) => l.steps.map((s) => s.id))
    expect(new Set(ids).size).toBe(ids.length)
    const ranges = EN_PATH.flatMap((l) => l.steps.flatMap((s) => (s.range ? [s.range] : [])))
    expect(ranges[0][0]).toBe(0)
    for (let i = 1; i < ranges.length; i++) expect(ranges[i][0]).toBe(ranges[i - 1][1])
    expect(ranges[ranges.length - 1][1]).toBeLessThanOrEqual(en.words.length)
    const known = new Set(en.words.map((w) => w.word))
    expect(TOEIC_WORDS.filter((w) => known.has(w)).length).toBeGreaterThanOrEqual(200)
  })

  it('belongs to English, Chinese and Korean', () => {
    expect(pathFor('en')).toBe(EN_PATH)
    expect(pathFor('zh')).toBe(ZH_PATH)
    expect(pathFor('ko')).toBe(KO_PATH)
    expect(pathFor('fr')).toBeNull()
  })

  it('walks the Korean words back to back to the end of the pack', () => {
    const ko = json('public/data/ko.json') as { words: unknown[] }
    const ranges = KO_PATH.flatMap((l) => l.steps.flatMap((s) => (s.range ? [s.range] : [])))
    expect(ranges[0][0]).toBe(0)
    for (let i = 1; i < ranges.length; i++) expect(ranges[i][0]).toBe(ranges[i - 1][1])
    expect(ranges[ranges.length - 1][1]).toBe(ko.words.length)
  })

  it('has unique step ids across the paths, and the Chinese levels test the HSK lists', () => {
    const all = [...EN_PATH, ...ZH_PATH, ...KO_PATH].flatMap((l) => l.steps.map((s) => s.id))
    expect(new Set(all).size).toBe(all.length)
    expect(ZH_PATH.every((l) => l.testWords && l.testWords.length > 0)).toBe(true)
  })
})

describe('climbing the path', () => {
  it('opens only the first level to a new learner and points at its first step', () => {
    const states = pathState(EN_PATH, ctx())
    expect(states.map((s) => s.unlocked)).toEqual([true, false, false, false, false, false])
    const current = currentLevel(states)!
    expect(current.level.n).toBe(1)
    expect(nextStep(current)?.step.id).toBe('en1-words')
  })

  it('opens the next level once this one is cleared, before every step is done', () => {
    // Level 1 at 2/3 of its steps + most of the third: past the clearing mark.
    const almost = ctx({
      learnedInRange: (from, to) => (from === 0 ? to - from : 0),
      grammarPassed: (ids) => (ids.includes('to-be') ? ids.length : 0),
      storiesRead: (ids) => (ids.includes('lans-morning') ? 1 : 0),
    })
    const [one, two, three] = pathState(EN_PATH, almost)
    expect(one.ratio).toBeGreaterThanOrEqual(CLEAR_AT)
    expect(one.complete).toBe(false)
    expect(two.unlocked).toBe(true)
    expect(three.unlocked).toBe(false)
    // The first unfinished open level stays the current one.
    expect(currentLevel(pathState(EN_PATH, almost))?.level.n).toBe(1)
  })

  it('caps every step at its goal and lets a placement open higher levels', () => {
    const states = pathState(EN_PATH, everything)
    expect(states.every((s) => s.complete && s.ratio === 1)).toBe(true)
    expect(pathState(EN_PATH, ctx(), 3).map((s) => s.unlocked)).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
    ])
  })

  it('maps a placement start to the level whose words begin there', () => {
    expect(levelForPlacement(EN_PATH, 0)).toBe(1)
    expect(levelForPlacement(EN_PATH, 149)).toBe(1)
    expect(levelForPlacement(EN_PATH, 150)).toBe(2)
    expect(levelForPlacement(EN_PATH, 700)).toBe(3)
    expect(levelForPlacement(EN_PATH, 4000)).toBe(6)
  })
})
