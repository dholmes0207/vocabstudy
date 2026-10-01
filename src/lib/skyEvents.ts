// Let any screen make the sky react — a burst of sparkles where the learner
// got something right, a meteor shower when a session is done — without
// importing the renderer. skyRenderer.ts listens for these; with the sky
// switched off (or no sparkles) they simply go nowhere.

export const SKY_EVENT = 'vocab:sky'

export type SkyEventDetail =
  { kind: 'burst'; x: number; y: number; power: number } | { kind: 'celebrate'; power: number }

function send(detail: SkyEventDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<SkyEventDetail>(SKY_EVENT, { detail }))
}

/** Sparkles bursting from the centre of `el` (e.g. the answer just chosen). */
export function skyBurstAt(el: Element | null | undefined, power = 1): void {
  if (!el) return
  const r = el.getBoundingClientRect()
  send({ kind: 'burst', x: r.left + r.width / 2, y: r.top + r.height / 2, power })
}

/** A shower of shooting stars and sparkles across the sky. */
export function skyCelebrate(power = 1): void {
  send({ kind: 'celebrate', power })
}
