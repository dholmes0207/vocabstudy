import { describe, expect, it } from 'vitest'
import { audioContentType, audioKey, byteSpan } from './audioServe'

describe('audioKey', () => {
  it('maps a clip or a voice manifest to its bucket key', () => {
    expect(audioKey('/audio/ko/sunhi/w12.mp3')).toBe('ko/sunhi/w12.mp3')
    expect(audioKey('/audio/en/aria/e1.mp3')).toBe('en/aria/e1.mp3')
    expect(audioKey('/audio/ko/injoon/p2001.mp3')).toBe('ko/injoon/p2001.mp3')
    expect(audioKey('/audio/zh/index.json')).toBe('zh/index.json')
    expect(audioKey('/audio/en/aria/t/1ucfe6k-lk5ak1.mp3')).toBe('en/aria/t/1ucfe6k-lk5ak1.mp3')
  })

  it('refuses anything else, so the bucket is never asked for odd keys', () => {
    for (const path of [
      '/audio/',
      '/audio/ko/sunhi/',
      '/audio/ko/sunhi/x1.mp3',
      '/audio/ko/sunhi/w1.wav',
      '/audio/../secrets',
      '/audio/ko/../../x/w1.mp3',
      '/audio/KO/sunhi/w1.mp3',
      '/data/ko.json',
      '/audio/ko/sunhi/w1.mp3/extra',
      '/audio/en/aria/t/abc.mp3',
      '/audio/en/aria/t/../w1.mp3',
      '/audio/en/aria/t/ABC-def.mp3',
    ])
      expect(audioKey(path), path).toBeNull()
  })

  it('names the content type browsers need to play or parse it', () => {
    expect(audioContentType('ko/sunhi/w1.mp3')).toBe('audio/mpeg')
    expect(audioContentType('ko/index.json')).toBe('application/json')
  })
})

describe('byteSpan', () => {
  it('reads every shape of range R2 returns', () => {
    expect(byteSpan({ offset: 0, length: 100 }, 1000)).toEqual({ start: 0, end: 99 })
    expect(byteSpan({ offset: 500 }, 1000)).toEqual({ start: 500, end: 999 })
    expect(byteSpan({ suffix: 200 }, 1000)).toEqual({ start: 800, end: 999 })
    expect(byteSpan({ length: 100 }, 1000)).toEqual({ start: 0, end: 99 })
  })

  it('never reaches past the end of the object', () => {
    expect(byteSpan({ offset: 900, length: 500 }, 1000)).toEqual({ start: 900, end: 999 })
    expect(byteSpan({ suffix: 5000 }, 1000)).toEqual({ start: 0, end: 999 })
  })

  it('reads an open-ended range whose suffix key holds undefined', () => {
    // What R2 returned for "bytes=0-": it became "bytes NaN-999/1000", a 206
    // the player rejects, so a clip's first play fell back to the robot voice.
    expect(byteSpan({ offset: 0, suffix: undefined }, 1000)).toEqual({ start: 0, end: 999 })
    expect(byteSpan({ suffix: undefined }, 1000)).toEqual({ start: 0, end: 999 })
    expect(byteSpan({ offset: 300, length: undefined, suffix: undefined }, 1000)).toEqual({
      start: 300,
      end: 999,
    })
  })

  it('is null without a range', () => {
    expect(byteSpan(undefined, 1000)).toBeNull()
  })
})
