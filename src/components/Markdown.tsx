import { Fragment } from 'react'
import { parseBlocks, parseInline } from '@/lib/markdown'

// Renders the tutor's Markdown as clean, readable React (bold, lists, headings)
// — no raw ** or - showing, no HTML injection.

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((tok, i) => {
        if (tok.t === 'strong') return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{withBreaks(tok.v)}</strong>
        if (tok.t === 'em') return <em key={i}>{withBreaks(tok.v)}</em>
        if (tok.t === 'code')
          return (
            <code key={i} className="rounded bg-slate-200/70 px-1 py-0.5 font-mono text-[0.85em] dark:bg-slate-700/70">
              {tok.v}
            </code>
          )
        return <Fragment key={i}>{withBreaks(tok.v)}</Fragment>
      })}
    </>
  )
}

/** Keep soft line breaks inside a block. */
function withBreaks(text: string) {
  const parts = text.split('\n')
  return parts.map((p, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {p}
    </Fragment>
  ))
}

export default function Markdown({ content }: { content: string }) {
  const blocks = parseBlocks(content)
  return (
    <div className="space-y-2 text-[15px] leading-relaxed">
      {blocks.map((b, i) => {
        if (b.type === 'h') {
          return (
            <p key={i} className={`${b.level <= 2 ? 'text-[15px] font-bold' : 'text-sm font-semibold'} mt-1 text-slate-800 dark:text-slate-100`}>
              <Inline text={b.text} />
            </p>
          )
        }
        if (b.type === 'p') {
          return (
            <p key={i}>
              <Inline text={b.text} />
            </p>
          )
        }
        // list
        let n = 0
        return (
          <ul key={i} className="space-y-1.5">
            {b.items.map((it, j) => {
              if (it.depth === 0 && b.ordered) n++
              return (
                <li key={j} className="flex gap-2" style={{ paddingLeft: it.depth * 16 }}>
                  {b.ordered && it.depth === 0 ? (
                    <span className="min-w-[1.15em] shrink-0 font-semibold text-brand-500">{n}.</span>
                  ) : (
                    <span className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  )}
                  <span className="min-w-0 flex-1">
                    <Inline text={it.text} />
                  </span>
                </li>
              )
            })}
          </ul>
        )
      })}
    </div>
  )
}
