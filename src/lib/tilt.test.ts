import { describe, expect, it } from 'vitest'
import { tiltFor } from './tilt'

describe('tiltFor', () => {
  it('is flat with the glare in the middle at the centre', () => {
    expect(tiltFor(0.5, 0.5, 8)).toEqual({ rx: 0, ry: 0, gx: 50, gy: 50 })
  })

  it('leans toward the pointer, up to the maximum at the edges', () => {
    expect(tiltFor(1, 0.5, 8)).toMatchObject({ ry: 4, rx: 0 })
    expect(tiltFor(0, 0.5, 8)).toMatchObject({ ry: -4 })
    expect(tiltFor(0.5, 0, 8)).toMatchObject({ rx: 4 })
    expect(tiltFor(0.5, 1, 8)).toMatchObject({ rx: -4 })
  })

  it('clamps a pointer that strays outside the card', () => {
    expect(tiltFor(3, -2, 8)).toEqual(tiltFor(1, 0, 8))
  })

  it('moves the glare with the pointer', () => {
    expect(tiltFor(0.25, 0.75, 8)).toMatchObject({ gx: 25, gy: 75 })
  })
})
