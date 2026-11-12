import { describe, expect, it, vi } from 'vitest'
import { PERSIST_ASKED_KEY, requestPersistentStorage } from './persistStorage'

function memory() {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
  }
}

describe('requestPersistentStorage', () => {
  it('asks the browser once per device', async () => {
    const kv = memory()
    const persist = vi.fn().mockResolvedValue(true)
    const storage = { persisted: vi.fn().mockResolvedValue(false), persist }
    expect(await requestPersistentStorage(storage, kv)).toBe(true)
    expect(await requestPersistentStorage(storage, kv)).toBe(false)
    expect(persist).toHaveBeenCalledTimes(1)
    expect(kv.getItem(PERSIST_ASKED_KEY)).toBe('1')
  })

  it('does not ask again when the data is already kept', async () => {
    const persist = vi.fn()
    const storage = { persisted: vi.fn().mockResolvedValue(true), persist }
    expect(await requestPersistentStorage(storage, memory())).toBe(true)
    expect(persist).not.toHaveBeenCalled()
  })

  it('reports a refusal, a missing API or a throwing browser as false', async () => {
    expect(
      await requestPersistentStorage({ persist: vi.fn().mockResolvedValue(false) }, memory())
    ).toBe(false)
    expect(await requestPersistentStorage(undefined, memory())).toBe(false)
    expect(await requestPersistentStorage({}, memory())).toBe(false)
    expect(
      await requestPersistentStorage(
        { persist: vi.fn().mockRejectedValue(new Error('no')) },
        memory()
      )
    ).toBe(false)
  })

  it('stays outside the vocab. prefix, so a backup does not carry it to another device', () => {
    expect(PERSIST_ASKED_KEY.startsWith('vocab.')).toBe(false)
  })
})
