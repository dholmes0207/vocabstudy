import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { scoreSentence, speechUnits, unitFor } from './sentenceScore'

const missedText = (r: ReturnType<typeof scoreSentence>) =>
  r.pieces.filter((p) => p.missed).map((p) => p.text)

describe('unitFor', () => {
  it('compares English by word, Korean by syllable, Chinese by character', () => {
    expect(['en-US', 'ko-KR', 'zh-CN', 'ja-JP'].map(unitFor)).toEqual([
      'words',
      'syllables',
      'chars',
      'chars',
    ])
  })
})

describe('English sentences', () => {
  it('gives full marks for the same words, ignoring case and punctuation', () => {
    const r = scoreSentence('I am a student.', ['i am a student'], 'en-US')
    expect(r).toMatchObject({ score: 100, verdict: 'great' })
    expect(missedText(r)).toEqual([])
  })

  it('treats contractions and their long forms alike', () => {
    expect(scoreSentence("He doesn't eat meat.", ['he does not eat meat'], 'en-US').score).toBe(100)
    expect(scoreSentence('I am a student.', ["I'm a student"], 'en-US').score).toBe(100)
  })

  it('treats digits and number words alike', () => {
    expect(scoreSentence('She is 20 years old.', ['she is twenty years old'], 'en-US').score).toBe(
      100
    )
    expect(speechUnits('twenty five', 'words')).toEqual(['25'])
  })

  it('marks the words that were not heard', () => {
    const r = scoreSentence('I drink coffee every morning.', ['I drink coffee morning'], 'en-US')
    expect(missedText(r)).toEqual(['every'])
    expect(r.verdict).toBe('good')
  })

  it('takes the most charitable alternative and reports it', () => {
    const r = scoreSentence('We are at home.', ['we are a tom', 'we are at home'], 'en-US')
    expect(r).toMatchObject({ score: 100, heard: 'we are at home' })
  })

  it('asks to retry a different sentence, and survives an empty result', () => {
    expect(scoreSentence('We are at home.', ['the weather is nice'], 'en-US').verdict).toBe('retry')
    expect(scoreSentence('We are at home.', [], 'en-US')).toMatchObject({
      score: 0,
      verdict: 'retry',
    })
  })
})

describe('Korean sentences', () => {
  it('ignores how the recognizer spaces the syllables', () => {
    expect(scoreSentence('저는 학생이에요.', ['저는학생이에요'], 'ko-KR').score).toBe(100)
    expect(scoreSentence('이 사람은 제 친구예요.', ['이사람은 제친구 예요'], 'ko-KR').score).toBe(
      100
    )
  })

  it('marks a missing particle syllable', () => {
    const r = scoreSentence('저는 학생이에요.', ['저 학생이에요'], 'ko-KR')
    expect(missedText(r)).toEqual(['는'])
  })
})

describe('Chinese sentences', () => {
  it('compares characters and reads digits as Chinese numbers', () => {
    expect(scoreSentence('我是学生。', ['我是学生'], 'zh-CN').score).toBe(100)
    expect(scoreSentence('我有三本书。', ['我有3本书'], 'zh-CN').score).toBe(100)
    expect(speechUnits('25', 'chars')).toEqual(['二', '十', '五'])
  })

  it('marks a missing character', () => {
    const r = scoreSentence('她不是医生。', ['她是医生'], 'zh-CN')
    expect(missedText(r)).toEqual(['不'])
  })
})

describe('a Chinese story line', () => {
  it('ignores the invisible word breaks the stories carry', () => {
    const zh = JSON.parse(readFileSync('public/data/reading/zh.json', 'utf8'))
    const line: string = zh.stories[0].sentences[0].en
    expect(line).toContain('\u200b')
    const r = scoreSentence(line, [line.replace(/[\u200b，。！？]/g, '')], 'zh-CN')
    expect(r.score).toBe(100)
    expect(r.pieces.some((p) => p.missed)).toBe(false)
  })
})
