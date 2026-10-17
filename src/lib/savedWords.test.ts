import { beforeEach, describe, expect, it } from 'vitest'
import type { SRSCard, Word } from '@/types'
import { pendingSaved } from './savedWords'
import { useSavedWords } from '@/store/savedWordsStore'

const word = (id: number): Word => ({ id, word: `w${id}` }) as Word
const words = [1, 2, 3, 4].map(word)
const started = (id: number): SRSCard => ({ id, box: 1, dueDay: 0, lastReviewedDay: 0 }) as SRSCard

describe('pendingSaved', () => {
  it('keeps the saved order and drops words already in the review schedule', () => {
    expect(pendingSaved([3, 1, 2], words, { 1: started(1) }).map((w) => w.id)).toEqual([3, 2])
  })

  it('skips ids that are no longer in the pack', () => {
    expect(pendingSaved([99, 4], words, {}).map((w) => w.id)).toEqual([4])
  })
})

describe('saved words store', () => {
  beforeEach(() => useSavedWords.setState({ saved: {} }))

  it('toggles a word per language, oldest first', () => {
    const { toggle } = useSavedWords.getState()
    toggle('en', 5)
    toggle('en', 7)
    toggle('ko', 5)
    toggle('en', 5)
    expect(useSavedWords.getState().saved).toEqual({ en: [7], ko: [5] })
  })

  it('removes several words at once and leaves the state alone when none match', () => {
    useSavedWords.setState({ saved: { en: [1, 2, 3] } })
    const before = useSavedWords.getState().saved
    useSavedWords.getState().remove('en', [9])
    expect(useSavedWords.getState().saved).toBe(before)
    useSavedWords.getState().remove('en', [1, 3])
    expect(useSavedWords.getState().saved).toEqual({ en: [2] })
  })

  it('adds several words at once, keeping order and skipping ones already saved', () => {
    useSavedWords.setState({ saved: { zh: [3] } })
    useSavedWords.getState().add('zh', [5, 3, 5, 8])
    expect(useSavedWords.getState().saved.zh).toEqual([3, 5, 8])
  })
})
