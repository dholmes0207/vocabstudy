// "Chữ dễ nhầm" (docs/design/confusables.md): Chinese characters a Vietnamese
// learner mixes up because they sound alike (在/再, 的/得/地, 他/她/它) or
// look alike (买/卖, 已/以), and English words that one Vietnamese word
// covers (make/do, say/tell, borrow/lend — lib/confusablesEn.ts). Each group
// says how to tell them apart; the practice puts one in a sentence gap and
// asks which. Pure; data inline like lib/measureWords.ts.

import { EN_CONFUSABLES } from './confusablesEn'

export type Pair = [vi: string, en: string]

export interface ConfusableChar {
  /** The character, or the English word. */
  ch: string
  /** Pinyin; none for English. */
  reading?: string
  /** Its meaning or job, in a few words. */
  vi: string
}

export interface ConfusableSentence {
  /** The sentence with ＿ where the character goes. */
  text: string
  answer: string
  /** Pinyin of the whole sentence; none for English. */
  reading?: string
  vi: string
}

export interface ConfusableGroup {
  id: string
  emoji: string
  chars: ConfusableChar[]
  /** How to tell them apart. */
  rule: Pair
  sentences: ConfusableSentence[]
}

export const GAP = '＿'

const s = (text: string, answer: string, reading: string, vi: string): ConfusableSentence => ({
  text,
  answer,
  reading,
  vi,
})

export const CONFUSABLES: ConfusableGroup[] = [
  {
    id: 'zai',
    emoji: '📍',
    chars: [
      { ch: '在', reading: 'zài', vi: 'ở; đang' },
      { ch: '再', reading: 'zài', vi: 'lại, nữa (sau này)' },
    ],
    rule: [
      '在: ở đâu, hoặc đang làm gì. 再: làm lại / làm thêm, việc chưa xảy ra (再见 = hẹn gặp lại).',
      '在: at a place, or in the middle of doing. 再: again / once more, still to come (再见 = see you again).',
    ],
    sentences: [
      s('我＿家吃饭。', '在', 'Wǒ zài jiā chī fàn.', 'Tôi ăn cơm ở nhà.'),
      s('请你＿说一遍。', '再', 'Qǐng nǐ zài shuō yí biàn.', 'Mời bạn nói lại một lần.'),
      s('他＿看书呢。', '在', 'Tā zài kàn shū ne.', 'Anh ấy đang đọc sách.'),
      s('明天＿见！', '再', 'Míngtiān zàijiàn!', 'Mai gặp lại!'),
      s('我想＿喝一杯茶。', '再', 'Wǒ xiǎng zài hē yì bēi chá.', 'Tôi muốn uống thêm một cốc trà.'),
    ],
  },
  {
    id: 'de',
    emoji: '🔗',
    chars: [
      { ch: '的', reading: 'de', vi: 'của / … mà (trước danh từ)' },
      { ch: '得', reading: 'de', vi: 'sau động từ, trước lời nhận xét' },
      { ch: '地', reading: 'de', vi: 'trước động từ: làm một cách…' },
    ],
    rule: [
      'Nhìn từ đứng SAU: danh từ → 的 (我的书); sau động từ là lời nhận xét → 得 (跑得快); trước động từ, tả cách làm → 地 (高兴地说).',
      'Look at what comes AFTER: a noun → 的 (我的书); a comment after a verb → 得 (跑得快); before a verb, saying how → 地 (高兴地说).',
    ],
    sentences: [
      s('这是我＿书。', '的', 'Zhè shì wǒ de shū.', 'Đây là sách của tôi.'),
      s('他跑＿很快。', '得', 'Tā pǎo de hěn kuài.', 'Anh ấy chạy rất nhanh.'),
      s(
        '她高兴＿说：“谢谢！”',
        '地',
        'Tā gāoxìng de shuō: “Xièxie!”',
        'Cô ấy vui vẻ nói: "Cảm ơn!"'
      ),
      s('你说＿对。', '得', 'Nǐ shuō de duì.', 'Bạn nói đúng.'),
      s('我喜欢红色＿衣服。', '的', 'Wǒ xǐhuan hóngsè de yīfu.', 'Tôi thích quần áo màu đỏ.'),
      s(
        '我们要认真＿学习。',
        '地',
        'Wǒmen yào rènzhēn de xuéxí.',
        'Chúng ta phải học hành chăm chỉ.'
      ),
    ],
  },
  {
    id: 'ta',
    emoji: '👥',
    chars: [
      { ch: '他', reading: 'tā', vi: 'anh ấy (nam)' },
      { ch: '她', reading: 'tā', vi: 'cô ấy (nữ)' },
      { ch: '它', reading: 'tā', vi: 'nó (con vật, đồ vật)' },
    ],
    rule: [
      'Cùng đọc tā. Bộ nhân 亻 cho người nam (hoặc chưa rõ), bộ nữ 女 cho người nữ, 它 cho con vật và đồ vật.',
      'All read tā. The person radical 亻 for a man (or anyone), the woman radical 女 for a woman, 它 for animals and things.',
    ],
    sentences: [
      s(
        '我妹妹很漂亮，＿今年十岁。',
        '她',
        'Wǒ mèimei hěn piàoliang, tā jīnnián shí suì.',
        'Em gái tôi rất xinh, năm nay mười tuổi.'
      ),
      s(
        '我哥哥喜欢踢足球，＿踢得很好。',
        '他',
        'Wǒ gēge xǐhuan tī zúqiú, tā tī de hěn hǎo.',
        'Anh trai tôi thích đá bóng, anh ấy đá rất giỏi.'
      ),
      s(
        '我有一只小狗，＿很可爱。',
        '它',
        'Wǒ yǒu yì zhī xiǎo gǒu, tā hěn kě’ài.',
        'Tôi có một chú chó nhỏ, nó rất đáng yêu.'
      ),
      s(
        '王老师是我妈妈，＿教汉语。',
        '她',
        'Wáng lǎoshī shì wǒ māma, tā jiāo Hànyǔ.',
        'Cô Vương là mẹ tôi, cô ấy dạy tiếng Trung.'
      ),
      s(
        '这本书很有意思，你看过＿吗？',
        '它',
        'Zhè běn shū hěn yǒu yìsi, nǐ kànguo tā ma?',
        'Cuốn sách này rất hay, bạn đọc nó chưa?'
      ),
    ],
  },
  {
    id: 'zuo',
    emoji: '🪑',
    chars: [
      { ch: '做', reading: 'zuò', vi: 'làm' },
      { ch: '坐', reading: 'zuò', vi: 'ngồi; đi (xe, tàu, máy bay)' },
    ],
    rule: [
      '做: làm (做饭, 做作业). 坐: ngồi, và đi bằng phương tiện mình ngồi trên đó (坐飞机, 坐车). Mẹo: 坐 có hai người 人 ngồi trên đất 土.',
      '做: do or make (做饭, 做作业). 坐: sit, and ride something you sit in (坐飞机, 坐车). Hint: 坐 is two people 人 sitting on the ground 土.',
    ],
    sentences: [
      s('你在＿什么？', '做', 'Nǐ zài zuò shénme?', 'Bạn đang làm gì?'),
      s('请＿！', '坐', 'Qǐng zuò!', 'Mời ngồi!'),
      s(
        '我们＿飞机去北京。',
        '坐',
        'Wǒmen zuò fēijī qù Běijīng.',
        'Chúng tôi đi máy bay tới Bắc Kinh.'
      ),
      s('妈妈在厨房＿饭。', '做', 'Māma zài chúfáng zuò fàn.', 'Mẹ đang nấu cơm trong bếp.'),
      s(
        '我每天＿公共汽车上班。',
        '坐',
        'Wǒ měitiān zuò gōnggòng qìchē shàngbān.',
        'Ngày nào tôi cũng đi xe buýt đi làm.'
      ),
    ],
  },
  {
    id: 'hui',
    emoji: '🔁',
    chars: [
      { ch: '会', reading: 'huì', vi: 'biết (làm); sẽ' },
      { ch: '回', reading: 'huí', vi: 'về, quay lại' },
    ],
    rule: [
      'Gần âm nhưng khác thanh: 会 huì (thanh 4) là biết làm / sẽ; 回 huí (thanh 2) là quay về (回家, 回来).',
      'Close in sound, different tones: 会 huì (4th) is can / will; 回 huí (2nd) is go back (回家, 回来).',
    ],
    sentences: [
      s('我＿说汉语。', '会', 'Wǒ huì shuō Hànyǔ.', 'Tôi biết nói tiếng Trung.'),
      s('我们几点＿家？', '回', 'Wǒmen jǐ diǎn huí jiā?', 'Mấy giờ chúng ta về nhà?'),
      s('明天＿下雨吗？', '会', 'Míngtiān huì xià yǔ ma?', 'Mai trời có mưa không?'),
      s('爸爸下午＿来。', '回', 'Bàba xiàwǔ huílai.', 'Chiều bố về.'),
    ],
  },
  {
    id: 'mai',
    emoji: '🛒',
    chars: [
      { ch: '买', reading: 'mǎi', vi: 'mua' },
      { ch: '卖', reading: 'mài', vi: 'bán' },
    ],
    rule: [
      '卖 = 十 + 买: có thêm 十 ở trên là bán. Thanh cũng khác: mǎi (mua, thanh 3), mài (bán, thanh 4).',
      '卖 = 十 + 买: the extra 十 on top means sell. The tones differ too: mǎi (buy, 3rd), mài (sell, 4th).',
    ],
    sentences: [
      s('我想＿一件衣服。', '买', 'Wǒ xiǎng mǎi yí jiàn yīfu.', 'Tôi muốn mua một bộ quần áo.'),
      s('这个商店＿水果。', '卖', 'Zhège shāngdiàn mài shuǐguǒ.', 'Cửa hàng này bán hoa quả.'),
      s(
        '你的手机是在哪儿＿的？',
        '买',
        'Nǐ de shǒujī shì zài nǎr mǎi de?',
        'Điện thoại của bạn mua ở đâu?'
      ),
      s('他把旧车＿了。', '卖', 'Tā bǎ jiù chē mài le.', 'Anh ấy bán chiếc xe cũ rồi.'),
    ],
  },
  {
    id: 'jin',
    emoji: '🚪',
    chars: [
      { ch: '进', reading: 'jìn', vi: 'vào' },
      { ch: '近', reading: 'jìn', vi: 'gần' },
    ],
    rule: [
      'Cùng đọc jìn và cùng bộ 辶 (đi). 进 là đi vào (进来, 请进); 近 là gần, trái nghĩa với 远.',
      'Both jìn, both with the walking radical 辶. 进 is go in (进来, 请进); 近 is near, the opposite of 远.',
    ],
    sentences: [
      s('请＿！', '进', 'Qǐng jìn!', 'Mời vào!'),
      s('我家离学校很＿。', '近', 'Wǒ jiā lí xuéxiào hěn jìn.', 'Nhà tôi rất gần trường.'),
      s('他走＿了教室。', '进', 'Tā zǒu jìn le jiàoshì.', 'Anh ấy đi vào lớp học.'),
      s('医院不远，很＿。', '近', 'Yīyuàn bù yuǎn, hěn jìn.', 'Bệnh viện không xa, rất gần.'),
    ],
  },
  {
    id: 'yi',
    emoji: '⏳',
    chars: [
      { ch: '已', reading: 'yǐ', vi: 'đã (已经)' },
      { ch: '以', reading: 'yǐ', vi: 'trong 可以, 以后, 以前' },
    ],
    rule: [
      '已 gần như chỉ gặp trong 已经 (đã rồi). 以 đi trong 可以 (có thể), 以后 (sau này), 以前 (trước đây).',
      '已 is almost always 已经 (already). 以 is in 可以 (may, can), 以后 (later), 以前 (before).',
    ],
    sentences: [
      s('我＿经吃饭了。', '已', 'Wǒ yǐjīng chī fàn le.', 'Tôi ăn cơm rồi.'),
      s(
        '你可＿用我的电脑。',
        '以',
        'Nǐ kěyǐ yòng wǒ de diànnǎo.',
        'Bạn có thể dùng máy tính của tôi.'
      ),
      s('＿后我想当医生。', '以', 'Yǐhòu wǒ xiǎng dāng yīshēng.', 'Sau này tôi muốn làm bác sĩ.'),
      s('他＿经回家了。', '已', 'Tā yǐjīng huí jiā le.', 'Anh ấy về nhà rồi.'),
    ],
  },
]

/** The groups for a pack: Chinese characters, or English words. */
export const CONFUSABLE_PACKS: Record<string, readonly ConfusableGroup[]> = {
  zh: CONFUSABLES,
  en: EN_CONFUSABLES,
}

export interface ConfusableQuestion {
  group: ConfusableGroup
  sentence: ConfusableSentence
}

/** The whole sentence, gap filled. */
export const filled = (s: ConfusableSentence): string => s.text.replace(GAP, s.answer)

/**
 * A round: `size` sentences, from one group or from all (spread over the
 * groups, then shuffled), so every group comes up before any repeats.
 */
export function confusableRound(
  size = 10,
  only?: string,
  rand: () => number = Math.random,
  pool: readonly ConfusableGroup[] = CONFUSABLES
): ConfusableQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const groups = pool.filter((g) => !only || g.id === only)
  const decks = groups.map((group) =>
    shuffle(group.sentences).map((sentence) => ({ group, sentence }))
  )
  const out: ConfusableQuestion[] = []
  for (let layer = 0; out.length < size && decks.some((d) => d.length > layer); layer++)
    for (const d of shuffle(decks)) if (d[layer] && out.length < size) out.push(d[layer])
  return shuffle(out)
}

/** XP for a round, as for measure words. */
export const confusableXp = (correct: number, total: number): number =>
  5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
