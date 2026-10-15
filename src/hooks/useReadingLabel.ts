import { useData } from '@/store/dataStore'
import { useT } from '@/lib/i18n'

/**
 * The label in front of a word's reading: the screen's own wording ("đọc gần
 * giống", "cách đọc:") for a Vietnamese-style respelling, or the pack's name
 * for a standard romanisation ("pinyin:"), keeping a trailing colon if the
 * screen's wording had one.
 */
export function useReadingLabel(vi: string, en: string): string {
  const t = useT()
  const label = useData((s) => s.pack?.meta.readingLabel)
  if (!label) return t(vi, en)
  return t(...label) + (vi.endsWith(':') ? ':' : '')
}
