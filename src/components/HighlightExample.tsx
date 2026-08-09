import { Fragment } from 'react'

interface Props {
  sentence: string
  word: string
}

/** Render a sentence with occurrences of the target word visually emphasized. */
export default function HighlightExample({ sentence, word }: Props) {
  const forms = word
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (!forms.length) return <>{sentence}</>

  const re = new RegExp(`\\b(${forms.join('|')})\\b`, 'gi')
  // split() with one capture group interleaves matches at odd indices.
  const parts = sentence.split(re)

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-brand-100 px-0.5 font-semibold text-brand-700 dark:bg-brand-900/60 dark:text-brand-200"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}
