import { readFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Word } from '@/types'
import { proverbOfDay } from './proverbs'
import { ALL_STICKERS } from './stickers'
import {
  COMPOUND_VOWELS,
  CONSONANTS,
  FINAL_SOUNDS,
  INITIALS as HANGUL_INITIALS,
  MEDIALS,
  SOUND_CHANGES,
  TENSE,
  VOWELS,
  compose,
} from './hangul'
import { INITIALS as PINYIN_INITIALS, SANDHI, TONES, TRICKY_FINALS } from './pinyin'
import { MEASURES, MEASURE_ITEMS, phrase } from './measureWords'
import { COUNTERS, COUNTER_ITEMS, counterPhrase } from './koCounters'
import { itemFor as koNumber } from './koNumbers'
import { itemFor as zhNumber } from './zhNumbers'
import { validateToeicBank } from './toeicBank'
import { familySlots, WORD_FAMILIES } from './wordFamilies'
import { validateHskBank } from './hskBank'
import { validateIeltsBank } from './ielts'
import { sentenceText, validatePatterns } from './patterns'
import { hanVietTable } from './hanVietFamily'
import { CONFUSABLES, filled } from './confusables'
import { CHENGYU } from './chengyu'
import { PARTICLES, filled as phrasalFilled } from './phrasalVerbs'
import { validateRoleplay } from './roleplay'

// What the pack pages read aloud beyond words and sentences of public/data:
// Hangul and Pinyin letters, measure words, the number rounds, the Hán Việt
// table, the saying of the day, the day's sticker, the TOEIC listening parts
// (public/data/toeic/en.json), the IELTS speaking questions
// (public/data/ielts/en.json), the HSK dialogues, pairs and passages
// (public/data/hsk/zh.json) and word families. The script that records the
// clips does not read any of these, so this test lists them into
// scripts/audio-texts/screens.json, which scripts/generate_text_audio.py
// records. After changing any of it, rewrite the file with:  WRITE_SCREEN_TEXTS=1 npx vitest run src/lib/screenTexts.test.ts

const FILE = 'scripts/audio-texts/screens.json'
const words = (code: string): Word[] =>
  JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')).words

/** Every saying a pack can show, one per day in turn. */
function proverbs(code: string): string[] {
  const out = new Set<string>()
  for (let day = 0; day < 1000; day++) {
    const p = proverbOfDay(day, code)
    if (p) out.add(p.text)
  }
  return [...out]
}

const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
const MINUTES = [0, 5, 10, 15, 20, 30, 40, 45, 50]
const clock = () => range(1, 12).flatMap((h) => MINUTES.map((m) => [h, m]))
const calendar = () => range(1, 12).flatMap((mo) => range(1, 28).map((d) => [mo, d]))

/** "Luyện thi TOEIC": the listening parts and the word-family forms. */
function toeic(): string[] {
  const bank = validateToeicBank(JSON.parse(readFileSync('public/data/toeic/en.json', 'utf8')))
  return [
    ...bank.part1.flatMap((it) => it.statements),
    ...bank.part2.flatMap((it) => [it.prompt, ...it.responses]),
    ...bank.talks.flatMap((set) => set.lines.map((l) => l.text)),
    ...WORD_FAMILIES.flatMap((fam) => familySlots(fam).map((s) => s.en)),
  ]
}

/** "Luyện IELTS": the examiner's questions and the listening recordings. */
function ielts(): string[] {
  const { speaking, listening, listeningChoice } = validateIeltsBank(
    JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8'))
  )
  return [
    ...speaking.part1.flatMap((tp) => [...tp.questions, ...tp.samples.map((x) => x.a)]),
    ...speaking.part2.flatMap((c) => c.part3),
    ...listening.flatMap((l) => l.lines.map((x) => x.text)),
    ...listeningChoice.flatMap((l) => l.lines.map((x) => x.text)),
  ]
}

/** "Nhập vai hội thoại": every line of every scene, in a woman's or a man's voice. */
function roleplay(code: 'en' | 'zh'): string[] {
  const { scenes } = validateRoleplay(
    JSON.parse(readFileSync(`public/data/roleplay/${code}.json`, 'utf8'))
  )
  return scenes.flatMap((s) => s.lines.map((l) => l.text))
}

/** "Cấu trúc câu": each sentence is read once it is built. */
function patterns(code: 'en' | 'zh'): string[] {
  const { patterns } = validatePatterns(
    JSON.parse(readFileSync(`public/data/patterns/${code}.json`, 'utf8'))
  )
  const joiner = code === 'zh' ? '' : ' '
  return patterns.flatMap((p) => p.sentences.map((s) => sentenceText(s, joiner)))
}

function english(): string[] {
  return [
    ...proverbs('en'),
    ...ALL_STICKERS.map((s) => s.en),
    ...toeic(),
    ...ielts(),
    ...patterns('en'),
    ...roleplay('en'),
    // "Cụm động từ": each sentence with its particle back in place.
    ...PARTICLES.flatMap((particle) =>
      particle.verbs.map((item) => phrasalFilled({ particle, item }))
    ),
  ]
}

function korean(): string[] {
  const letters = [...VOWELS, ...CONSONANTS, ...TENSE, ...COMPOUND_VOWELS].flatMap((j) =>
    j.word ? [j.sample, j.word] : [j.sample]
  )
  // "Tự ghép chữ": every block with no final or one of the seven final sounds.
  const blocks = HANGUL_INITIALS.flatMap((i) =>
    MEDIALS.flatMap((m) =>
      ['', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'].map((f) => compose(i, m, f))
    )
  )
  // "Nghe số": every item a round can ask (lib/koNumbers.ts, makeQuestion).
  const numbers = [
    ...range(1, 99).map((k) => koNumber('price', k * 500)),
    ...clock().map(([h, m]) => koNumber('time', h, m)),
    ...calendar().map(([mo, d]) => koNumber('date', mo, d)),
    ...range(0, 6).map((w) => koNumber('weekday', w)),
    ...range(1, 20).map((n) => koNumber('count', n)),
    ...range(10, 59).map((n) => koNumber('age', n)),
  ].map((item) => item.han)
  return [
    ...proverbs('ko'),
    ...letters,
    ...(blocks.filter(Boolean) as string[]),
    ...FINAL_SOUNDS.map((f) => f.word),
    ...SOUND_CHANGES.flatMap((s) => s.examples.map((e) => e.word)),
    ...COUNTERS.map((c) => `한 ${c.ch}`),
    ...COUNTER_ITEMS.flatMap((item) => range(1, 5).map((n) => counterPhrase({ item, n }))),
    ...numbers,
    ...hanVietTable(words('ko')).map((e) => e.char),
  ]
}

function chinese(): string[] {
  const hsk = validateHskBank(JSON.parse(readFileSync('public/data/hsk/zh.json', 'utf8')))
  const sounds = [...PINYIN_INITIALS, ...TRICKY_FINALS].flatMap((s) =>
    s.word ? [s.char, s.word] : [s.char]
  )
  // "Nghe số": every item a round can ask (lib/zhNumbers.ts, makeQuestion).
  const numbers = [
    ...range(2, 199).map((n) => zhNumber('number', n)),
    ...range(2, 99).map((n) => zhNumber('price', n)),
    ...clock().map(([h, m]) => zhNumber('time', h, m)),
    ...calendar().map(([mo, d]) => zhNumber('date', mo, d)),
    ...range(0, 6).map((w) => zhNumber('weekday', w)),
  ].map((item) => item.han)
  return [
    ...proverbs('zh'),
    ...TONES.map((t) => t.char),
    ...sounds,
    ...SANDHI.map((s) => s.example),
    ...MEASURES.map((m) => `一${m.ch}`),
    ...MEASURE_ITEMS.map((item) => phrase(item, '').zh),
    ...numbers,
    ...hanVietTable(words('zh')).map((e) => e.char),
    ...hsk.dialogues.flatMap((d) => [...d.lines.map((l) => l.zh), d.q]),
    ...hsk.pictureDialogues.flatMap((d) => d.lines.map((l) => l.zh)),
    ...[...hsk.pairs.hsk1, ...hsk.pairs.hsk2, ...hsk.pairs.hsk3].flatMap((p) => [p.q, p.a]),
    ...hsk.readings.map((r) => r.text),
    ...patterns('zh'),
    ...roleplay('zh'),
    // "Chữ dễ nhầm": each sentence is read with its gap filled.
    ...CONFUSABLES.flatMap((g) => g.sentences.map(filled)),
    // "Thành ngữ": each idiom and its example sentence.
    ...CHENGYU.flatMap((it) => [it.zh, it.example.zh]),
  ]
}

const tidy = (texts: string[]) => [...new Set(texts.filter((t) => t.trim()))].sort()
const current = { en: tidy(english()), ko: tidy(korean()), zh: tidy(chinese()) }

describe('screen texts (scripts/audio-texts/screens.json)', () => {
  if (process.env.WRITE_SCREEN_TEXTS)
    writeFileSync(FILE, JSON.stringify(current, null, 2) + '\n', 'utf8')

  it('lists everything the pack pages read aloud, so it gets recorded', () => {
    const saved = JSON.parse(readFileSync(FILE, 'utf8'))
    expect(saved, `out of date: WRITE_SCREEN_TEXTS=1 npx vitest run ${__filename}`).toEqual(current)
  })
})
