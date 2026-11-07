import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadToeicBank, validateToeicBank } from './toeicBank'

const raw = () => JSON.parse(readFileSync('public/data/toeic/en.json', 'utf8'))

describe('the TOEIC bank file', () => {
  it('passes its own check, with every part filled', () => {
    const bank = validateToeicBank(raw())
    expect(bank.part1.length).toBeGreaterThan(0)
    expect(bank.part2.length).toBeGreaterThan(0)
    expect(bank.part5.length).toBeGreaterThan(0)
    for (const part of [6, 7]) expect(bank.reading.some((s) => s.part === part)).toBe(true)
    for (const part of [3, 4]) expect(bank.talks.some((s) => s.part === part)).toBe(true)
  })

  it('turns down a broken edit instead of showing a broken question', () => {
    const broken = (edit: (b: ReturnType<typeof raw>) => void) => {
      const b = raw()
      edit(b)
      return () => validateToeicBank(b)
    }
    expect(() => validateToeicBank(null)).toThrow(/not an object/)
    expect(broken((b) => delete b.talks)).toThrow(/"talks" is missing/)
    expect(broken((b) => b.part1[0].statements.pop())).toThrow(/four statements/)
    expect(broken((b) => (b.part2[0].why = ' '))).toThrow(/no explanation/)
    expect(broken((b) => (b.part5[0].answer = 4))).toThrow(/bad answer/)
    expect(broken((b) => (b.part5[0].kind = 'spelling'))).toThrow(/unknown kind/)
    expect(broken((b) => (b.part5[0].sentence = 'No gap here.'))).toThrow(/no gap/)
    expect(broken((b) => (b.reading[1].id = b.reading[0].id))).toThrow(/repeated/)
    expect(broken((b) => (b.reading[0].part = 5))).toThrow(/not Part 6 or 7/)
    expect(
      broken((b) => (b.reading[0].questions[0].options[1] = b.reading[0].questions[0].options[0]))
    ).toThrow(/repeats an option/)
    expect(broken((b) => (b.talks[0].lines[0].speaker = 'X'))).toThrow(/bad line/)
    expect(broken((b) => (b.talks[0].questions = []))).toThrow(/no questions/)
  })
})

describe('loading the bank', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('asks again after a failed fetch, then keeps the bank it got', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValue({ ok: true, json: async () => raw() })
    vi.stubGlobal('fetch', fetch)
    await expect(loadToeicBank()).rejects.toThrow(/503/)
    const bank = await loadToeicBank()
    expect(bank.part2.length).toBeGreaterThan(0)
    expect(await loadToeicBank()).toBe(bank)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith('/data/toeic/en.json')
  })
})
