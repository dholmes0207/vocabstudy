// Where a card tilts and where its glare sits for a pointer at (x, y), given
// as fractions of the card (0,0 = top-left). The card leans toward the
// pointer: pointing at the top edge tips the top away from the viewer.

export interface Tilt {
  /** rotateX in degrees (positive = top edge away). */
  rx: number
  /** rotateY in degrees (positive = right edge toward the viewer). */
  ry: number
  /** Glare centre as percentages of the card. */
  gx: number
  gy: number
}

export function tiltFor(x: number, y: number, max: number): Tilt {
  const cx = Math.min(1, Math.max(0, x))
  const cy = Math.min(1, Math.max(0, y))
  return {
    rx: round2((0.5 - cy) * max),
    ry: round2((cx - 0.5) * max),
    gx: round2(cx * 100),
    gy: round2(cy * 100),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100 + 0
}
