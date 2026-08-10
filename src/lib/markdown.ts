// A tiny, safe Markdown parser for the AI chat. Handles what the tutor actually
// produces: headings, bullet/numbered lists (with one nesting level), bold,
// italic, inline code, and paragraphs. No HTML injection (we only emit text +
// known inline styles), no external dependency.

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong'; v: string }
  | { t: 'em'; v: string }
  | { t: 'code'; v: string }

export type Block =
  | { type: 'h'; level: number; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; ordered: boolean; items: { text: string; depth: number }[] }

const BULLET = /^(\s*)[-*•]\s+(.*)$/
const ORDERED = /^(\s*)\d+[.)]\s+(.*)$/
const HEADING = /^(#{1,6})\s+(.*)$/

/** Split markdown into block-level nodes. */
export function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r/g, '').replace(/\*\*\*/g, '**').split('\n')
  const blocks: Block[] = []
  let i = 0

  const depthOf = (indent: string) => Math.min(2, Math.floor(indent.replace(/\t/g, '  ').length / 2))

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }

    const h = HEADING.exec(line)
    if (h) {
      blocks.push({ type: 'h', level: h[1].length, text: h[2].trim() })
      i++
      continue
    }

    if (BULLET.test(line) || ORDERED.test(line)) {
      const ordered = ORDERED.test(line) && !BULLET.test(line)
      const items: { text: string; depth: number }[] = []
      while (i < lines.length && lines[i].trim()) {
        const b = BULLET.exec(lines[i])
        const o = ORDERED.exec(lines[i])
        if (b) items.push({ text: b[2].trim(), depth: depthOf(b[1]) })
        else if (o) items.push({ text: o[2].trim(), depth: depthOf(o[1]) })
        else break
        i++
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    // Paragraph: gather consecutive plain lines (soft line breaks kept).
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !BULLET.test(lines[i]) && !ORDERED.test(lines[i]) && !HEADING.test(lines[i])) {
      para.push(lines[i].trim())
      i++
    }
    blocks.push({ type: 'p', text: para.join('\n') })
  }

  return blocks
}

// Tokenize inline markdown: bold (**), italic (* or _), and inline code (backticks).
export function parseInline(text: string): Inline[] {
  const tokens: Inline[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ t: 'text', v: text.slice(last, m.index) })
    const s = m[0]
    if (s.startsWith('**')) tokens.push({ t: 'strong', v: s.slice(2, -2) })
    else if (s.startsWith('`')) tokens.push({ t: 'code', v: s.slice(1, -1) })
    else tokens.push({ t: 'em', v: s.slice(1, -1) })
    last = m.index + s.length
  }
  if (last < text.length) tokens.push({ t: 'text', v: text.slice(last) })
  return tokens
}
