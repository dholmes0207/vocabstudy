import { Fragment } from 'react'
import type { PosCategory } from '@/types'
import { findAllInSentence } from '@/lib/wordForms'

interface Props {
  sentence: string
  word: string
  /** Part of speech, so "it" is not highlighted inside "its". */
  pos?: PosCategory
}

/**
 * Render a sentence with the target word visually emphasized — in whatever
 * form the sentence uses it ("hands", "went"), not only the headword.
 */
export default function HighlightExample({ sentence, word, pos }: Props) {
  const hits = findAllInSentence(word, sentence, pos)
  if (!hits.length) return <>{sentence}</>

  const parts: React.ReactNode[] = []
  let at = 0
  hits.forEach((h, i) => {
    if (h.start > at) parts.push(<Fragment key={`t${i}`}>{sentence.slice(at, h.start)}</Fragment>)
    parts.push(
      <mark
        key={`m${i}`}
        className="rounded bg-brand-100 px-0.5 font-semibold text-brand-700 dark:bg-brand-900/60 dark:text-brand-200"
      >
        {h.surface}
      </mark>
    )
    at = h.end
  })
  if (at < sentence.length) parts.push(<Fragment key="end">{sentence.slice(at)}</Fragment>)
  return <>{parts}</>
}
