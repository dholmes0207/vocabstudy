// "Câu nói líu lưỡi" (docs/design/tongue-twisters.md): short tongue twisters
// that drill the sounds Vietnamese speakers find hardest: s / sh, r / l and
// th in English; s / sh, n / l, h / f and the four tones in Chinese. Hear
// one slowly, then at speed, record yourself and play it back. Pure; data
// inline like lib/confusables.ts.

export type Pair = [vi: string, en: string]

export interface TongueTwister {
  text: string
  /** Pinyin, for Chinese. */
  reading?: string
  vi: string
  /** The sounds it drills. */
  focus: Pair
}

const tw = (text: string, vi: string, focus: Pair, reading?: string): TongueTwister => ({
  text,
  vi,
  focus,
  ...(reading ? { reading } : {}),
})

export const TWISTERS: Record<'en' | 'zh', TongueTwister[]> = {
  en: [
    tw('She sells seashells by the seashore.', 'Cô ấy bán vỏ sò bên bờ biển.', [
      's và sh: "she" chu môi, "sea" nhe răng.',
      's and sh: round the lips for "she", smile for "sea".',
    ]),
    tw('Red lorry, yellow lorry.', 'Xe tải đỏ, xe tải vàng.', [
      'r và l: r cong lưỡi không chạm, l chạm đầu lưỡi lên lợi.',
      'r and l: r curls without touching, l touches the ridge.',
    ]),
    tw('Three free throws.', 'Ba quả ném phạt.', [
      'th và f: th đặt lưỡi giữa hai răng, f cắn môi dưới.',
      'th and f: tongue between the teeth for th, top teeth on the lip for f.',
    ]),
    tw('Peter Piper picked a peck of pickled peppers.', 'Peter Piper hái một đấu ớt ngâm.', [
      'p bật hơi mạnh, và âm cuối -ed, -s.',
      'A strong puff on p, and the endings -ed and -s.',
    ]),
    tw('I saw a kitten eating chicken in the kitchen.', 'Tôi thấy chú mèo con ăn gà trong bếp.', [
      'kitten / chicken / kitchen: t và ch ở giữa từ, âm cuối n.',
      'kitten / chicken / kitchen: t or ch in the middle, a final n.',
    ]),
    tw(
      'How can a clam cram in a clean cream can?',
      'Làm sao con nghêu nhét vừa vào lon kem sạch?',
      ['cl và cr, âm cuối m và n.', 'cl and cr, and final m and n.']
    ),
  ],
  zh: [
    tw(
      '四是四，十是十，十四是十四，四十是四十。',
      'Bốn là bốn, mười là mười, mười bốn là mười bốn, bốn mươi là bốn mươi.',
      ['s và sh, thanh 4 và thanh 2.', 's and sh, fourth and second tones.'],
      'Sì shì sì, shí shì shí, shísì shì shísì, sìshí shì sìshí.'
    ),
    tw(
      '吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮。',
      'Ăn nho không nhả vỏ nho, không ăn nho lại nhả vỏ nho.',
      ['p bật hơi, ch uốn lưỡi.', 'An aspirated p, a curled ch.'],
      'Chī pútao bù tǔ pútao pí, bù chī pútao dào tǔ pútao pí.'
    ),
    tw(
      '妈妈骑马，马慢，妈妈骂马。',
      'Mẹ cưỡi ngựa, ngựa chậm, mẹ mắng ngựa.',
      ['Bốn thanh của ma: mā, má, mǎ, mà.', 'The four tones of ma: mā, má, mǎ, mà.'],
      'Māma qí mǎ, mǎ màn, māma mà mǎ.'
    ),
    tw(
      '红凤凰，黄凤凰，粉红凤凰花凤凰。',
      'Phượng hoàng đỏ, phượng hoàng vàng, phượng hoàng hồng, phượng hoàng hoa.',
      ['h và f.', 'h and f.'],
      'Hóng fènghuáng, huáng fènghuáng, fěnhóng fènghuáng huā fènghuáng.'
    ),
    tw(
      '牛郎恋刘娘，刘娘念牛郎。',
      'Chàng chăn trâu thương cô Lưu, cô Lưu nhớ chàng chăn trâu.',
      ['n và l, lỗi người miền Bắc hay gặp.', 'n and l, which many Vietnamese speakers mix up.'],
      'Niúláng liàn Liú niáng, Liú niáng niàn Niúláng.'
    ),
  ],
}

/** XP for the first recording of a twister in a visit. */
export const TWISTER_XP = 2

/** Rate for "hear it slowly". */
export const SLOW_RATE = 0.7
