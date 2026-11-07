import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadHskBank, validateHskBank } from './hskBank'

const raw = () => JSON.parse(readFileSync('public/data/hsk/zh.json', 'utf8'))

describe('the HSK bank file', () => {
  it('passes its own check, with every part filled', () => {
    const bank = validateHskBank(raw())
    for (const level of ['hsk2', 'hsk3'])
      expect(bank.dialogues.some((d) => d.level === level)).toBe(true)
    expect(bank.pictureDialogues.length).toBeGreaterThan(0)
    for (const level of ['hsk1', 'hsk2', 'hsk3'] as const)
      expect(bank.pairs[level].length).toBeGreaterThan(0)
    expect(bank.readings.length).toBeGreaterThan(0)
  })

  it('turns down a broken edit instead of showing a broken question', () => {
    const broken = (edit: (b: ReturnType<typeof raw>) => void) => {
      const b = raw()
      edit(b)
      return () => validateHskBank(b)
    }
    expect(() => validateHskBank(null)).toThrow(/not an object/)
    expect(broken((b) => delete b.readings)).toThrow(/"readings" is missing/)
    expect(broken((b) => delete b.pairs)).toThrow(/"pairs" is missing/)
    expect(broken((b) => (b.pairs.hsk2 = b.pairs.hsk2.slice(0, 3)))).toThrow(/four pairs/)
    expect(broken((b) => (b.pairs.hsk1[1].id = b.pairs.hsk1[0].id))).toThrow(/repeated/)
    expect(broken((b) => (b.pairs.hsk3[0].aVi = ''))).toThrow(/incomplete/)
    expect(broken((b) => (b.dialogues[0].level = 'hsk1'))).toThrow(/not HSK 2 or 3/)
    expect(broken((b) => (b.dialogues[0].lines[0].speaker = 'N'))).toThrow(/bad line/)
    expect(broken((b) => b.dialogues[0].options.pop())).toThrow(/three options/)
    expect(broken((b) => (b.readings[0].options[2] = b.readings[0].options[0]))).toThrow(
      /repeats an option/
    )
    expect(broken((b) => (b.readings[0].why = ''))).toThrow(/no explanation/)
    expect(broken((b) => (b.pictureDialogues[0].picture = ''))).toThrow(/no picture/)
  })
})

describe('loading the bank', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('fetches the file once, checked', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => raw() })
    vi.stubGlobal('fetch', fetch)
    const bank = await loadHskBank()
    expect(await loadHskBank()).toBe(bank)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('/data/hsk/zh.json')
  })
})
