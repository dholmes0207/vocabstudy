import { useData } from '@/store/dataStore'
import { targetLangNames, type TargetLangNames } from '@/lib/targetLang'

/** The language being learned, for UI sentences (lib/targetLang.ts). */
export function useTargetLang(): TargetLangNames {
  const meta = useData((s) => s.pack?.meta)
  return targetLangNames(meta)
}
