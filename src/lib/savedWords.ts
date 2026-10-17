import type { SRSCard, Word } from '@/types'
import { phaseOf } from '@/lib/srs'

// "Lưu để học" (docs/design/saved-words.md): the saved words still waiting for
// a Learn session — not started in SRS yet — in the order they were saved.
// Ids no longer in the pack are skipped.
export function pendingSaved(
  ids: readonly number[],
  words: readonly Word[],
  cards: Readonly<Record<number, SRSCard>>
): Word[] {
  const byId = new Map(words.map((w) => [w.id, w]))
  return ids.flatMap((id) => {
    const w = byId.get(id)
    return w && phaseOf(cards[id]) === 'new' ? [w] : []
  })
}
