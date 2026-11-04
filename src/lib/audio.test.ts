import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// pronounce() after prefetchAudio(): a clip warmed ahead plays on the element
// made for it (no new <audio> at the tap), and a clip the server does not have
// goes straight to the browser's voice instead of waiting for a 404.

const { speak } = vi.hoisted(() => ({ speak: vi.fn() }))
vi.mock('./tts', () => ({ speak, stopSpeaking: () => {} }))

class FakeAudio {
  static made: FakeAudio[] = []
  preload = ''
  currentTime = 0
  playbackRate = 1
  private listeners = new Map<string, Set<() => void>>()
  constructor(public src: string) {
    FakeAudio.made.push(this)
  }
  addEventListener(type: string, fn: () => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(fn)
  }
  removeEventListener(type: string, fn: () => void) {
    this.listeners.get(type)?.delete(fn)
  }
  emit(type: string) {
    for (const fn of [...(this.listeners.get(type) ?? [])]) fn()
  }
  play() {
    return Promise.resolve()
  }
  pause() {}
}

const flush = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  vi.resetModules()
  FakeAudio.made = []
  vi.stubGlobal('Audio', FakeAudio)
})
afterEach(() => {
  vi.unstubAllGlobals()
  speak.mockReset()
})

describe('prefetchAudio + pronounce', () => {
  it('plays a warmed clip on its ready element, and again on the next tap', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 200 }))
    )
    const { prefetchAudio, pronounce } = await import('./audio')
    prefetchAudio(['/audio/en/aria/w1.mp3'])
    await flush()
    expect(FakeAudio.made).toHaveLength(1)
    expect(FakeAudio.made[0].preload).toBe('auto')

    const onStart = vi.fn()
    pronounce({ audioSrc: '/audio/en/aria/w1.mp3', text: 'one', lang: 'en-US', onStart })
    expect(FakeAudio.made).toHaveLength(1)
    FakeAudio.made[0].emit('playing')
    expect(onStart).toHaveBeenCalledTimes(1)
    FakeAudio.made[0].emit('ended')

    pronounce({ audioSrc: '/audio/en/aria/w1.mp3', text: 'one', lang: 'en-US', onStart })
    expect(FakeAudio.made).toHaveLength(1)
    expect(speak).not.toHaveBeenCalled()
  })

  it('reads a clip the server does not have with the browser voice at once', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 404 }))
    )
    const { prefetchAudio, pronounce } = await import('./audio')
    prefetchAudio(['/audio/en/aria/t/abc-def.mp3'])
    await flush()
    pronounce({ audioSrc: '/audio/en/aria/t/abc-def.mp3', text: 'Hello there.', lang: 'en-US' })
    expect(FakeAudio.made).toHaveLength(0)
    expect(speak).toHaveBeenCalledWith('Hello there.', expect.objectContaining({ lang: 'en-US' }))
  })

  it('fetches nothing ahead when the learner saves data', async () => {
    const fetch = vi.fn(async () => new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetch)
    vi.stubGlobal('navigator', { connection: { saveData: true } })
    const { prefetchAudio } = await import('./audio')
    prefetchAudio(['/audio/en/aria/w2.mp3'])
    await flush()
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('textAudio with a speaker', () => {
  it('keeps the chosen voice when it matches, else takes one of that gender', async () => {
    const audio = await import('./audio')
    audio.setAudioVoices(['aria', 'guy'], 'aria', { aria: 'female', guy: 'male' })
    expect(audio.textAudio('Hello.', 'female')).toContain('/aria/t/')
    expect(audio.textAudio('Hello.', 'male')).toContain('/guy/t/')
    expect(audio.textAudio('Hello.')).toContain('/aria/t/')
    audio.setAudioVoiceKey('guy')
    expect(audio.textAudio('Hello.', 'male')).toContain('/guy/t/')
    expect(audio.textAudio('Hello.', 'female')).toContain('/aria/t/')
    // A pack whose voices say nothing about gender: the learner's voice.
    audio.setAudioVoices(['aria', 'guy'], 'aria')
    expect(audio.textAudio('Hello.', 'male')).toContain('/guy/t/')
    audio.setAudioVoiceKey(null)
    expect(audio.textAudio('Hello.', 'male')).toContain('/aria/t/')
  })
})
