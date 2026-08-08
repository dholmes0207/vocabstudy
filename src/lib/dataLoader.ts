import type { DataManifest, LanguagePack } from '@/types'

// Loads the manifest and language packs from /public/data. Uses BASE_URL so it
// works whether the site is hosted at a domain root or a sub-path.

const base = import.meta.env.BASE_URL

export async function loadManifest(): Promise<DataManifest> {
  const res = await fetch(`${base}data/index.json`)
  if (!res.ok) throw new Error(`Không tải được manifest (${res.status})`)
  return (await res.json()) as DataManifest
}

export async function loadPack(code: string): Promise<LanguagePack> {
  const res = await fetch(`${base}data/${code}.json`)
  if (!res.ok) throw new Error(`Không tải được gói ngôn ngữ "${code}" (${res.status})`)
  const pack = (await res.json()) as LanguagePack
  validatePack(pack, code)
  return pack
}

function validatePack(pack: LanguagePack, code: string): void {
  if (!pack?.meta || !Array.isArray(pack.words)) {
    throw new Error(`Gói "${code}" sai định dạng`)
  }
  if (pack.meta.code !== code) {
    throw new Error(`Gói "${code}" có meta.code không khớp (${pack.meta.code})`)
  }
  const ids = new Set<number>()
  for (const w of pack.words) {
    if (ids.has(w.id)) throw new Error(`Gói "${code}" có id trùng: ${w.id}`)
    ids.add(w.id)
  }
}
