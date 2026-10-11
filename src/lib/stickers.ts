// "Quà mỗi ngày": reaching the small daily goal opens a gift — a sticker for
// the album, each one an English word with its meaning. A surprise at the end
// of the day's work, a collection to complete, and one more word on the way.
// Pure; the store records which sticker each day gave (day → sticker index).

export interface Sticker {
  emoji: string
  en: string
  vi: string
}

export interface StickerSet {
  name: string
  nameEn: string
  stickers: Sticker[]
}

const s = (emoji: string, en: string, vi: string): Sticker => ({ emoji, en, vi })

export const STICKER_SETS: StickerSet[] = [
  {
    name: 'Bầu trời',
    nameEn: 'Sky',
    stickers: [
      s('☀️', 'sun', 'mặt trời'),
      s('🌙', 'moon', 'mặt trăng'),
      s('⭐', 'star', 'ngôi sao'),
      s('🌈', 'rainbow', 'cầu vồng'),
      s('☁️', 'cloud', 'đám mây'),
      s('⚡', 'lightning', 'tia chớp'),
      s('❄️', 'snowflake', 'bông tuyết'),
      s('🌪️', 'tornado', 'lốc xoáy'),
      s('☄️', 'comet', 'sao chổi'),
      s('🪐', 'planet', 'hành tinh'),
      s('🌋', 'volcano', 'núi lửa'),
      s('🌊', 'wave', 'con sóng'),
    ],
  },
  {
    name: 'Động vật',
    nameEn: 'Animals',
    stickers: [
      s('🐼', 'panda', 'gấu trúc'),
      s('🦊', 'fox', 'con cáo'),
      s('🐯', 'tiger', 'con hổ'),
      s('🦁', 'lion', 'sư tử'),
      s('🐸', 'frog', 'con ếch'),
      s('🐵', 'monkey', 'con khỉ'),
      s('🐧', 'penguin', 'chim cánh cụt'),
      s('🦉', 'owl', 'cú mèo'),
      s('🐢', 'turtle', 'con rùa'),
      s('🐬', 'dolphin', 'cá heo'),
      s('🦋', 'butterfly', 'con bướm'),
      s('🐘', 'elephant', 'con voi'),
    ],
  },
  {
    name: 'Món ngon',
    nameEn: 'Good food',
    stickers: [
      s('🍜', 'noodles', 'mì, phở'),
      s('🥖', 'baguette', 'bánh mì'),
      s('🍚', 'rice', 'cơm'),
      s('🥟', 'dumpling', 'bánh bao, há cảo'),
      s('🍤', 'shrimp', 'con tôm'),
      s('🥭', 'mango', 'quả xoài'),
      s('🍉', 'watermelon', 'dưa hấu'),
      s('🥥', 'coconut', 'quả dừa'),
      s('☕', 'coffee', 'cà phê'),
      s('🧋', 'bubble tea', 'trà sữa'),
      s('🍦', 'ice cream', 'kem'),
      s('🍰', 'cake', 'bánh ngọt'),
    ],
  },
  {
    name: 'Du lịch',
    nameEn: 'Travel',
    stickers: [
      s('🏰', 'castle', 'lâu đài'),
      s('🗼', 'tower', 'tòa tháp'),
      s('🗽', 'statue', 'bức tượng'),
      s('🏝️', 'island', 'hòn đảo'),
      s('⛰️', 'mountain', 'ngọn núi'),
      s('🚂', 'train', 'tàu hỏa'),
      s('✈️', 'airplane', 'máy bay'),
      s('🚀', 'rocket', 'tên lửa'),
      s('🛶', 'canoe', 'xuồng'),
      s('🏕️', 'campsite', 'khu cắm trại'),
      s('🎡', 'Ferris wheel', 'vòng đu quay'),
      s('🧭', 'compass', 'la bàn'),
    ],
  },
]

export const ALL_STICKERS: Sticker[] = STICKER_SETS.flatMap((set) => set.stickers)

/** Integer hash of a day number, so the gift is a surprise but stable for that day. */
function hashDay(day: number): number {
  let h = (day ^ 0x9e3779b9) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}

/** Indices of the stickers already in the album. */
export function collected(owned: Record<number, number>): Set<number> {
  return new Set(Object.values(owned).filter((i) => i >= 0 && i < ALL_STICKERS.length))
}

/**
 * The sticker a day gives: always a new one while the album has gaps (no
 * disappointing duplicates), any one once it is complete.
 */
export function pickSticker(owned: Record<number, number>, day: number): number {
  const have = collected(owned)
  const all = ALL_STICKERS.map((_, i) => i)
  const free = all.filter((i) => !have.has(i))
  const pool = free.length ? free : all
  return pool[hashDay(day) % pool.length]
}

/** Two devices' albums together; a day gifted differently on each keeps the lower index. */
export function mergeStickers(
  a: Record<number, number>,
  b: Record<number, number>
): Record<number, number> {
  const out: Record<number, number> = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const day = Number(k)
    out[day] = day in out ? Math.min(out[day], v) : v
  }
  return out
}
