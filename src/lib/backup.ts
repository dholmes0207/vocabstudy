// Export/import all VocabStudy data (progress + settings) as a JSON file.
// Everything lives under the "vocab." localStorage prefix.

const PREFIX = 'vocab.'
const APP_TAG = 'vocab-study-backup'

export interface BackupFile {
  app: string
  exportedAt: string
  data: Record<string, unknown>
}

export function exportBackup(): string {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX)) {
      try {
        data[k] = JSON.parse(localStorage.getItem(k) as string)
      } catch {
        /* skip corrupt entries */
      }
    }
  }
  const file: BackupFile = { app: APP_TAG, exportedAt: new Date().toISOString(), data }
  return JSON.stringify(file, null, 2)
}

/** Trigger a browser download of the current backup. */
export function downloadBackup(): void {
  const blob = new Blob([exportBackup()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `vocabstudy-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Parse and apply a backup file's contents to localStorage. Returns key count. */
export function importBackup(json: string): number {
  const parsed = JSON.parse(json) as BackupFile
  if (parsed.app !== APP_TAG || typeof parsed.data !== 'object') {
    throw new Error('File sao lưu không hợp lệ.')
  }
  let n = 0
  for (const [k, v] of Object.entries(parsed.data)) {
    if (k.startsWith(PREFIX)) {
      localStorage.setItem(k, JSON.stringify(v))
      n++
    }
  }
  return n
}
