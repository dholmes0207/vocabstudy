import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listenOnce, type ListenOptions } from './speech'

// listenOnce with `accept`: a full match heard in an interim result is graded
// once it has held for a moment, without waiting for the recognizer's final
// result; anything short of that still waits for the final n-best list.

class FakeRecognition {
  static last: FakeRecognition
  lang = ''
  continuous = true
  interimResults = false
  maxAlternatives = 1
  stopped = false
  onresult: ((e: unknown) => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  onend: (() => void) | null = null
  onaudiostart: (() => void) | null = null
  constructor() {
    FakeRecognition.last = this
  }
  start() {}
  stop() {
    this.stopped = true
  }
  abort() {}
  /** One result per array: its alternatives, best first. */
  hear(isFinal: boolean, ...results: string[][]) {
    const list = results.map((alts, i) =>
      Object.assign(
        alts.map((transcript) => ({ transcript, confidence: 0.9 })),
        { isFinal: i < results.length - 1 || isFinal }
      )
    )
    this.onresult?.({ results: list, resultIndex: 0 })
  }
}

function listen(extra: Partial<ListenOptions> = {}) {
  const onResult = vi.fn()
  const onError = vi.fn()
  const onEnd = vi.fn()
  listenOnce({ lang: 'en-US', onResult, onError, onEnd, ...extra })
  return { rec: FakeRecognition.last, onResult, onError, onEnd }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('window', { webkitSpeechRecognition: FakeRecognition })
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('listenOnce', () => {
  it('waits for the final result when nothing can grade early', () => {
    const { rec, onResult } = listen()
    expect(rec.interimResults).toBe(false)
    rec.hear(true, ['ability', 'a bility'])
    expect(onResult).toHaveBeenCalledWith(['ability', 'a bility'])
  })

  it('grades a full match early once it has held, and stops listening', () => {
    const { rec, onResult } = listen({ accept: ([h]) => h.trim() === 'ability' })
    expect(rec.interimResults).toBe(true)
    rec.hear(false, ['abil'])
    rec.hear(false, ['ability'])
    vi.advanceTimersByTime(299)
    expect(onResult).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onResult).toHaveBeenCalledWith(['ability'])
    expect(rec.stopped).toBe(true)
  })

  it('drops an early match the next guess replaces', () => {
    const { rec, onResult } = listen({ accept: ([h]) => h.trim() === 'cat' })
    rec.hear(false, ['cat'])
    vi.advanceTimersByTime(200)
    rec.hear(false, ['category'])
    vi.advanceTimersByTime(1000)
    expect(onResult).not.toHaveBeenCalled()
    rec.hear(true, ['category', 'cat agree'])
    expect(onResult).toHaveBeenCalledWith(['category', 'cat agree'])
  })

  it('joins the words of an utterance split over several results', () => {
    const accept = vi.fn(([h]: string[]) => h === 'I like tea')
    const { rec, onResult } = listen({ accept })
    rec.hear(false, ['I like'], [' tea'])
    vi.advanceTimersByTime(300)
    expect(onResult).toHaveBeenCalledWith(['I like tea'])
  })

  it('keeps an early match when the session ends before it has held', () => {
    const { rec, onResult, onError, onEnd } = listen({ accept: ([h]) => h === '你好' })
    rec.hear(false, ['你好'])
    rec.onend?.()
    expect(onResult).toHaveBeenCalledWith(['你好'])
    expect(onError).not.toHaveBeenCalled()
    expect(onEnd).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1000)
    expect(onResult).toHaveBeenCalledTimes(1)
  })
})
