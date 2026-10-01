/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { SKY_EVENT, skyBurstAt, skyCelebrate, type SkyEventDetail } from './skyEvents'

const seen: SkyEventDetail[] = []
const listen = (e: Event) => seen.push((e as CustomEvent<SkyEventDetail>).detail)
window.addEventListener(SKY_EVENT, listen)

afterEach(() => {
  seen.length = 0
})

describe('skyEvents', () => {
  it('bursts from the centre of the element', () => {
    const el = document.createElement('button')
    el.getBoundingClientRect = () => ({ left: 100, top: 40, width: 80, height: 20 }) as DOMRect
    skyBurstAt(el, 1.3)
    expect(seen).toEqual([{ kind: 'burst', x: 140, y: 50, power: 1.3 }])
  })

  it('does nothing without an element', () => {
    skyBurstAt(null)
    skyBurstAt(undefined)
    expect(seen).toEqual([])
  })

  it('celebrates with a strength', () => {
    skyCelebrate()
    skyCelebrate(1.4)
    expect(seen).toEqual([
      { kind: 'celebrate', power: 1 },
      { kind: 'celebrate', power: 1.4 },
    ])
  })
})
