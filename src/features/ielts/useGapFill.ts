import { useState } from 'react'
import type { GapTask } from '@/lib/ielts'

/** The state of a GapFill: which box word sits in each gap, and which gap is open. */
export function useGapFill(task: GapTask) {
  const [fills, setFills] = useState<(number | null)[]>(() => task.answers.map(() => null))
  const [chosen, setChosen] = useState<number | null>(null)
  const open = chosen ?? fills.indexOf(null)
  const put = (word: number) => {
    if (open < 0) return
    setFills((fs) => fs.map((f, i) => (i === open ? word : f === word ? null : f)))
    setChosen(null)
  }
  const tapGap = (gap: number) => {
    setFills((fs) => fs.map((f, i) => (i === gap ? null : f)))
    setChosen(gap)
  }
  return {
    fills,
    open,
    put,
    tapGap,
    right: task.answers.filter((a, i) => fills[i] === a).length,
    ready: fills.every((f) => f !== null),
  }
}

export type GapFillState = ReturnType<typeof useGapFill>
