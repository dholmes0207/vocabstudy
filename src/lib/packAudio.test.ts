import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'

// Pre-recorded audio (scripts/generate_audio.py, generate_phrase_audio.py). A pack
// either has none — the app reads it with the browser's voice — or has a voice
// manifest at public/audio/<code>/index.json, and then every clip must be there
// and say what the card shows: a rewritten example with its old clip is worse
// than no clip, because the learner hears one sentence while reading another.

interface VoiceManifest {
  default: string
  voices: { key: string; label: string; voice: string }[]
}

const json = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
const codes = json<{ languages: { code: string }[] }>('public/data/index.json').languages.map(
  (l) => l.code
)
const withAudio = codes.filter((c) => existsSync(`public/audio/${c}/index.json`))
const manifestOf = (code: string) => json<VoiceManifest>(`public/audio/${code}/index.json`)

describe('pre-recorded audio', () => {
  it('exists for English, the pack every learner starts with', () => {
    expect(withAudio).toContain('en')
  })

  it('gives every pack its own voices, so a saved choice never crosses languages', () => {
    const keys = withAudio.flatMap((c) => manifestOf(c).voices.map((v) => v.key))
    expect(new Set(keys).size).toBe(keys.length)
    for (const code of withAudio) {
      const m = manifestOf(code)
      expect(
        m.voices.map((v) => v.key),
        code
      ).toContain(m.default)
    }
  })

  describe.each(withAudio)('pack %s', (code) => {
    const pack = json<LanguagePack>(`public/data/${code}.json`)
    const { voices } = manifestOf(code)

    it('has a headword and an example clip for every word, in every voice', () => {
      const missing: string[] = []
      for (const v of voices)
        for (const w of pack.words)
          for (const kind of ['w', 'e'])
            if (!existsSync(`public/audio/${code}/${v.key}/${kind}${w.id}.mp3`))
              missing.push(`${v.key}/${kind}${w.id}.mp3 (${w.word})`)
      expect(missing.slice(0, 20), `thiếu ${missing.length} file audio`).toEqual([])
    })

    it('records each example from the sentence the card shows', () => {
      const recorded = json<Record<string, string>>(`scripts/audio-texts/${code}.json`)
      const stale = pack.words
        .filter((w) => recorded[String(w.id)] !== w.exampleEn)
        .map((w) => `${w.id}:${w.word}`)
      expect(stale, `chạy lại scripts/generate_audio.py --code ${code}`).toEqual([])
    })

    const phrasesFile = `public/data/phrases/${code}.json`
    it.runIf(existsSync(phrasesFile))('has a clip for every phrase, made from its text', () => {
      const topics = json<{ topics: { phrases: { id: number; en: string }[] }[] }>(phrasesFile)
      const recorded = json<Record<string, string>>(`scripts/audio-texts/phrases-${code}.json`)
      const problems: string[] = []
      for (const p of topics.topics.flatMap((t) => t.phrases)) {
        if (recorded[p.id] !== p.en) problems.push(`${p.id}: stale text`)
        for (const v of voices)
          if (!existsSync(`public/audio/${code}/${v.key}/p${p.id}.mp3`))
            problems.push(`${p.id}: ${v.key}`)
      }
      expect(
        problems.slice(0, 20),
        `chạy lại scripts/generate_phrase_audio.py --code ${code}`
      ).toEqual([])
    })
  })
})
