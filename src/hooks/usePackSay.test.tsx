/** @vitest-environment jsdom */
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LanguagePack } from '@/types'

// usePrefetchPackSay warms the same clip usePackSay will play: the word clip
// for a pack word, the screen's recorded text clip for anything else. A page
// re-rendering with the same texts must not ask again.

const { prefetchAudio } = vi.hoisted(() => ({ prefetchAudio: vi.fn() }))
vi.mock('@/lib/audio', () => ({
  prefetchAudio,
  pronounce: () => {},
  textAudio: (text: string) => `t:${text}`,
  wordAudio: (id: number) => `w:${id}`,
}))

import { useData } from '@/store/dataStore'
import { usePrefetchPackSay } from './usePackSay'

afterEach(() => {
  cleanup()
  prefetchAudio.mockReset()
})

describe('usePrefetchPackSay', () => {
  it('warms word clips for pack words and text clips for the rest, once', () => {
    useData.setState({
      pack: {
        meta: { ttsLang: 'zh-CN' },
        words: [{ id: 7, word: '妈' }],
      } as unknown as LanguagePack,
    })
    const { rerender } = renderHook(({ texts }) => usePrefetchPackSay(texts), {
      initialProps: { texts: ['妈', '麻', undefined] as (string | undefined)[] },
    })
    expect(prefetchAudio).toHaveBeenCalledTimes(1)
    expect(prefetchAudio).toHaveBeenCalledWith(['w:7', 't:麻'])

    rerender({ texts: ['妈', '麻', undefined] })
    expect(prefetchAudio).toHaveBeenCalledTimes(1)

    rerender({ texts: ['马'] })
    expect(prefetchAudio).toHaveBeenLastCalledWith(['t:马'])
  })
})
