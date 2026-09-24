import { beforeEach, describe, expect, it } from 'vitest'
import { useUi } from './uiStore'

// Focus mode hides the phone's bottom bar during a session. It is a counter so
// that one session unmounting while another mounts (Learn → practice rounds)
// never flashes the bar back on, and never leaves it hidden for good.

beforeEach(() => useUi.setState({ immersiveCount: 0 }))

describe('immersive mode', () => {
  it('stays on while any session is mounted', () => {
    const { enterImmersive, leaveImmersive } = useUi.getState()
    enterImmersive()
    enterImmersive()
    leaveImmersive()
    expect(useUi.getState().immersiveCount).toBe(1)
    leaveImmersive()
    expect(useUi.getState().immersiveCount).toBe(0)
  })

  it('never goes negative, so an extra unmount cannot hide the bar forever', () => {
    useUi.getState().leaveImmersive()
    useUi.getState().enterImmersive()
    expect(useUi.getState().immersiveCount).toBe(1)
  })
})
