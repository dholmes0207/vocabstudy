// Ask the browser to keep this site's data (docs/design/keep-progress.md).
// Without it, a browser may clear a guest's progress when space runs low, and
// Safari can clear script-written data of a site not opened for a while. Asked
// once per device, after the first finished session: the moment there is
// something worth keeping, and when Firefox's permission prompt makes sense.

/** Device-only flag, outside the `vocab.` prefix so a backup file never carries it. */
export const PERSIST_ASKED_KEY = 'vs-persist-asked'

interface StorageManagerLike {
  persisted?: () => Promise<boolean>
  persist?: () => Promise<boolean>
}

interface KeyValue {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/**
 * Ask once. Resolves to true when the data is (now) kept, false when the
 * browser said no, cannot do it, or we already asked on this device.
 */
export async function requestPersistentStorage(
  storage: StorageManagerLike | undefined,
  kv: KeyValue
): Promise<boolean> {
  try {
    if (!storage?.persist || kv.getItem(PERSIST_ASKED_KEY)) return false
    kv.setItem(PERSIST_ASKED_KEY, '1')
    if (await storage.persisted?.()) return true
    return await storage.persist()
  } catch {
    // Private mode, blocked storage: nothing to keep, nothing to report.
    return false
  }
}
