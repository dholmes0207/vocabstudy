// The language being learned, as words to put in a sentence: "tiếng Anh" /
// "English" today, "tiếng Hàn" / "Korean" for a Korean pack. UI text says
// this instead of hard-coding English, so a new pack reads right everywhere.

export interface TargetLangNames {
  /** Lower-case, mid-sentence Vietnamese: "tiếng Anh". */
  vi: string
  /** English name: "English". */
  en: string
}

export function targetLangNames(
  meta?: { name?: string; nativeName?: string } | null
): TargetLangNames {
  const native = meta?.nativeName?.trim()
  return {
    vi: native ? native.charAt(0).toLowerCase() + native.slice(1) : 'tiếng Anh',
    en: meta?.name?.trim() || 'English',
  }
}
