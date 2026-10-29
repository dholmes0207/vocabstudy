import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { DETAIL_FIELDS, splitPack } from './packDetails'

const pack = (code: string) =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as LanguagePack

describe('splitPack', () => {
  const en = pack('en')
  const { core, details } = splitPack(en)

  it('leaves the details out of the core pack', () => {
    for (const w of core.words) for (const f of DETAIL_FIELDS) expect(w[f], w.word).toBeUndefined()
    expect(core.meta).toEqual(en.meta)
  })

  it('loses nothing: core plus details is the pack again', () => {
    const back = core.words.map((w) => ({ ...w, ...details[w.id] }))
    expect(back).toEqual(en.words)
  })

  it('halves what the English learner downloads before the first screen', () => {
    expect(JSON.stringify(core).length).toBeLessThan(JSON.stringify(en).length * 0.6)
  })

  it('gives a pack without details an empty file', () => {
    expect(
      splitPack({
        words: [{ ...en.words[0], collocations: undefined, tip: undefined, family: undefined }],
      }).details
    ).toEqual({})
  })
})
