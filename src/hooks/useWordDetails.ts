import { useData } from '@/store/dataStore'
import type { Word } from '@/types'
import type { WordDetails } from '@/lib/packDetails'

/**
 * A word's collocations, tip and family. Fields still inline in the word (the
 * dev server ships packs whole) win; otherwise they come from the details file,
 * and are undefined until it has arrived.
 */
export function useWordDetails(word: Word): WordDetails {
  const d = useData((s) => s.details?.[word.id])
  return {
    collocations: word.collocations ?? d?.collocations,
    tip: word.tip ?? d?.tip,
    family: word.family ?? d?.family,
  }
}
