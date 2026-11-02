import type { Word } from '@/types'
import type { Pair } from './grammar'

// "Bộ thủ" (docs/design/radicals.md): the components that recur across the
// pack's characters, each with its Sino-Vietnamese name. 氵 is "thuỷ" (water),
// so 洗, 河, 游, 泳, 酒 all have to do with water: one part remembered gives a
// hint to many characters.
//
// Hand-written: the members are the characters known to contain the component,
// as it is written in simplified Chinese. A member missing from the pack is
// simply not shown; radicalTable keeps only radicals with two members or more.

export interface Radical {
  /** The component as it appears inside a character (亻, 氵, 扌…). */
  form: string
  /** The full character the component comes from, when it differs (人, 水, 手…). */
  base?: string
  /** Sino-Vietnamese name, as Vietnamese teachers call it. */
  name: string
  meaning: Pair
  /** Characters that contain it. */
  chars: string
}

export const RADICALS: Radical[] = [
  {
    form: '亻',
    base: '人',
    name: 'nhân đứng',
    meaning: ['người', 'person'],
    chars: '你他们什做作住休体但位使候件信便借像健低',
  },
  {
    form: '氵',
    base: '水',
    name: 'ba chấm thuỷ',
    meaning: ['nước', 'water'],
    chars: '汉没洗河游泳汽酒澡清法注满漂演渴汁',
  },
  {
    form: '口',
    name: 'khẩu',
    meaning: ['miệng', 'mouth'],
    chars: '吃喝唱叫吗呢吧啊喂哪听哭号告名句右可咖啡喜员',
  },
  {
    form: '扌',
    base: '手',
    name: 'tài gảy (thủ)',
    meaning: ['tay', 'hand'],
    chars: '打找把报接搬提换担择扫护',
  },
  {
    form: '讠',
    base: '言',
    name: 'ngôn',
    meaning: ['lời nói', 'speech'],
    chars: '说话语读认识请谢让词课试谁记诉讲该议',
  },
  {
    form: '女',
    name: 'nữ',
    meaning: ['phụ nữ', 'woman'],
    chars: '妈姐妹奶她姓婚姨好如安',
  },
  {
    form: '子',
    name: 'tử',
    meaning: ['con, đứa trẻ', 'child'],
    chars: '孩学字季好',
  },
  {
    form: '木',
    name: 'mộc',
    meaning: ['cây, gỗ', 'tree, wood'],
    chars: '机树校桌椅板杯根楼极样本末条李果查相',
  },
  {
    form: '日',
    name: 'nhật',
    meaning: ['mặt trời, ngày', 'sun, day'],
    chars: '明早时晚晴星昨春是易阳普',
  },
  {
    form: '月',
    name: 'nguyệt (nhục)',
    meaning: [
      'mặt trăng; trong chữ chỉ cơ thể là bộ nhục (thịt)',
      'moon; in body words it stands for flesh',
    ],
    chars: '朋有服期脑脚腿脸胖能',
  },
  {
    form: '心',
    name: 'tâm',
    meaning: ['tim, lòng (đứng bên trái viết 忄)', 'heart, mind (written 忄 on the left)'],
    chars: '想思意忘您急感怎总息愿忙快情惯怕慢懂',
  },
  {
    form: '辶',
    name: 'sước',
    meaning: ['bước đi', 'walking'],
    chars: '这还过远近进送道边运迎通选迟遇',
  },
  {
    form: '纟',
    base: '糸',
    name: 'mịch',
    meaning: ['sợi tơ', 'silk thread'],
    chars: '红给经绍结级纸绩绿练终',
  },
  {
    form: '钅',
    base: '金',
    name: 'kim',
    meaning: ['kim loại', 'metal'],
    chars: '钱钟银错铁铅镜锻',
  },
  {
    form: '饣',
    base: '食',
    name: 'thực',
    meaning: ['ăn', 'food'],
    chars: '饭饿饱馆',
  },
  {
    form: '足',
    name: 'túc',
    meaning: ['chân', 'foot'],
    chars: '跑跳踢路跟',
  },
  {
    form: '宀',
    name: 'miên',
    meaning: ['mái nhà', 'roof'],
    chars: '家室客安字定完宜实容宾害',
  },
  {
    form: '艹',
    name: 'thảo',
    meaning: ['cỏ', 'grass'],
    chars: '茶花菜苹草葡萄蕉节药蓝',
  },
  {
    form: '雨',
    name: 'vũ',
    meaning: ['mưa', 'rain'],
    chars: '雪需',
  },
  {
    form: '门',
    name: 'môn',
    meaning: ['cửa', 'door'],
    chars: '问间闻们',
  },
  {
    form: '车',
    name: 'xa',
    meaning: ['xe', 'vehicle'],
    chars: '辆较轻',
  },
  {
    form: '马',
    name: 'mã',
    meaning: ['ngựa', 'horse'],
    chars: '骑吗妈',
  },
  {
    form: '火',
    name: 'hoả',
    meaning: ['lửa (nằm dưới chữ thì viết 灬)', 'fire (written 灬 at the bottom)'],
    chars: '炼烧灯热点照熊然',
  },
  {
    form: '土',
    name: 'thổ',
    meaning: ['đất', 'earth'],
    chars: '地场城块境坐坏在',
  },
  {
    form: '王',
    base: '玉',
    name: 'ngọc',
    meaning: ['ngọc', 'jade'],
    chars: '玩球现理班环',
  },
  {
    form: '目',
    name: 'mục',
    meaning: ['mắt', 'eye'],
    chars: '眼睛睡看相着',
  },
  {
    form: '衤',
    base: '衣',
    name: 'y',
    meaning: ['áo', 'clothing'],
    chars: '衬衫裤裙被',
  },
  {
    form: '疒',
    name: 'nạch',
    meaning: ['bệnh tật', 'sickness'],
    chars: '病疼瘦',
  },
  {
    form: '贝',
    name: 'bối',
    meaning: ['vỏ sò, tiền của', 'shell, money'],
    chars: '贵员赛',
  },
  {
    form: '刂',
    base: '刀',
    name: 'đao',
    meaning: ['dao', 'knife'],
    chars: '别到刚刻刷刮前',
  },
  {
    form: '力',
    name: 'lực',
    meaning: ['sức', 'strength'],
    chars: '动办助努加男务',
  },
  {
    form: '犭',
    base: '犬',
    name: 'khuyển',
    meaning: ['chó, con thú', 'dog, animal'],
    chars: '狗猫',
  },
  {
    form: '彳',
    name: 'xích',
    meaning: ['bước ngắn', 'step'],
    chars: '很得街行',
  },
  {
    form: '冫',
    name: 'băng',
    meaning: ['băng, lạnh', 'ice'],
    chars: '冷冰次净准决',
  },
  {
    form: '页',
    name: 'hiệt',
    meaning: ['đầu', 'head'],
    chars: '题颜顾须',
  },
  {
    form: '竹',
    name: 'trúc',
    meaning: ['tre (nằm trên đầu chữ viết ⺮)', 'bamboo (written ⺮ on top)'],
    chars: '笔笑答等第篮简筷算',
  },
  {
    form: '礻',
    base: '示',
    name: 'thị',
    meaning: ['thần, cúng bái', 'spirit, worship'],
    chars: '礼祝视',
  },
  {
    form: '米',
    name: 'mễ',
    meaning: ['gạo', 'rice'],
    chars: '糖糕数',
  },
  {
    form: '走',
    name: 'tẩu',
    meaning: ['chạy, đi', 'run, go'],
    chars: '起超越趣',
  },
  {
    form: '广',
    name: 'nghiễm',
    meaning: ['mái hiên, nhà rộng', 'shelter'],
    chars: '床店应康座',
  },
  {
    form: '田',
    name: 'điền',
    meaning: ['ruộng', 'field'],
    chars: '男界累画思',
  },
]

/** A character of the pack with the shortest word that uses it. */
export interface RadicalMember {
  char: string
  word: Word
}

export interface RadicalEntry {
  radical: Radical
  members: RadicalMember[]
}

const isHan = (ch: string) => /\p{Script=Han}/u.test(ch)

/** Each Han character of the pack → the shortest word containing it (the character alone wins). */
function exampleWords(words: Word[]): Map<string, Word> {
  const best = new Map<string, Word>()
  for (const w of words) {
    for (const ch of new Set(w.word)) {
      if (!isHan(ch)) continue
      const cur = best.get(ch)
      if (!cur || [...w.word].length < [...cur.word].length) best.set(ch, w)
    }
  }
  return best
}

/** The radicals with at least `min` members in the pack, in the order of RADICALS. */
export function radicalTable(words: Word[], min = 2): RadicalEntry[] {
  const example = exampleWords(words)
  return RADICALS.map((radical) => ({
    radical,
    members: [...radical.chars].flatMap((char) => {
      const word = example.get(char)
      return word ? [{ char, word }] : []
    }),
  })).filter((e) => e.members.length >= min)
}

export interface RadicalQuestion {
  char: string
  word: Word
  /** Four radicals, one of which the character contains. */
  options: Radical[]
  answer: number
}

/**
 * "Đoán bộ thủ": a character of the pack, and four radicals to choose from.
 * A wrong option is never a radical the character also contains (好 has both
 * 女 and 子).
 */
export function radicalQuiz(
  words: Word[],
  count: number,
  rand: () => number = Math.random
): RadicalQuestion[] {
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const table = radicalTable(words)
  const pool = table.flatMap((e) => e.members.map((m) => ({ ...m, radical: e.radical })))
  const seen = new Set<string>()
  const questions: RadicalQuestion[] = []
  for (const m of shuffle(pool)) {
    if (questions.length >= count) break
    if (seen.has(m.char)) continue
    seen.add(m.char)
    const wrong = shuffle(
      table.map((e) => e.radical).filter((r) => r !== m.radical && !r.chars.includes(m.char))
    ).slice(0, 3)
    const options = shuffle([m.radical, ...wrong])
    questions.push({ char: m.char, word: m.word, options, answer: options.indexOf(m.radical) })
  }
  return questions
}
