// A rough score for the TOEIC mini test (docs/design/toeic.md). The real test
// scales each section from 5 to 495 by equating, which a short practice set
// cannot do: this maps the share of right answers onto the scale and widens
// it into a range, so the page never shows one number as if it were a score.

export type Section = 'listening' | 'reading'

/** ETS's minimum scores for each CEFR level (Mapping the TOEIC tests on the CEFR). */
export const CEFR_CUTS: Record<Section, [level: string, min: number][]> = {
  listening: [
    ['C1', 490],
    ['B2', 400],
    ['B1', 275],
    ['A2', 110],
    ['A1', 60],
  ],
  reading: [
    ['C1', 455],
    ['B2', 385],
    ['B1', 275],
    ['A2', 115],
    ['A1', 60],
  ],
}

/** How far either side of the estimate the range goes. */
const SPREAD = 60

const toStep = (n: number) => Math.round(n / 5) * 5
const clamp = (n: number) => Math.min(495, Math.max(5, n))

/** The estimated range for a section, in steps of 5 like real scores. */
export function estimateSection(correct: number, total: number): { low: number; high: number } {
  const mid = total > 0 ? 5 + (490 * correct) / total : 5
  return { low: clamp(toStep(mid - SPREAD)), high: clamp(toStep(mid + SPREAD)) }
}

/** The CEFR level a section score reaches, or null below A1. */
export function cefrFor(section: Section, score: number): string | null {
  return CEFR_CUTS[section].find(([, min]) => score >= min)?.[0] ?? null
}
