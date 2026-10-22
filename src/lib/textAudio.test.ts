import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Sentence clips are recorded by scripts/generate_text_audio.py from the texts
// it collects; the app asks for them with textAudio(). This checks the two see
// the same sentences, so nothing the app plays is left out of the recording.

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const read = (path: string) => {
  try {
    return json(path)
  } catch {
    return null
  }
}

/** What the screens pass to textAudio(): collocations, grammar, stories, pack pages. */
function spoken(code: string): string[] {
  const texts = new Set<string>()
  for (const w of json(`public/data/${code}.json`).words)
    for (const c of w.collocations ?? []) texts.add(c.en)
  for (const u of read(`public/data/grammar/${code}.json`)?.units ?? []) {
    for (const ex of u.examples) texts.add(ex.en)
    for (const q of u.exercises) if (q.type === 'order') texts.add(q.en)
  }
  for (const s of read(`public/data/reading/${code}.json`)?.stories ?? [])
    for (const line of s.sentences) texts.add(line.en)
  // The pack pages, listed from the code by screenTexts.test.ts.
  for (const t of json('scripts/audio-texts/screens.json')[code] ?? []) texts.add(t)
  return [...texts].filter((t) => t.trim()).sort()
}

const python = (() => {
  try {
    execFileSync('python3', ['--version'])
    return true
  } catch {
    return false
  }
})()

describe.runIf(python)('sentence clips (scripts/generate_text_audio.py)', () => {
  it('names clips as the app does', () => {
    expect(() =>
      execFileSync('python3', ['scripts/generate_text_audio.py', '--self-check'])
    ).not.toThrow()
  })

  it.each(['en', 'ko', 'zh'])('records every sentence the %s screens play', (code) => {
    const listed = JSON.parse(
      execFileSync('python3', ['scripts/generate_text_audio.py', '--list', '--code', code], {
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
      })
    ) as string[]
    // Python sorts by code point, JavaScript by UTF-16 unit: compare as sets.
    expect(new Set(listed)).toEqual(new Set(spoken(code)))
  })
})
