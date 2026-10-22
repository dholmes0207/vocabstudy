// "Âm khó cho người Việt": the handful of sounds Vietnamese speakers most often
// get wrong in each language, each with how to make it, the usual slip, words
// to hear, and minimal pairs ("ship" / "sheep", 买 / 卖, 사다 / 싸다) for a quick
// ear test. Every word here is in its language pack, so both sides of a pair
// play in the same recorded voice — a different voice would give the answer away.

export interface SoundLesson {
  id: string
  title: string
  symbol: string
  /** How to make the sound. */
  how: string
  /** The typical slip for a Vietnamese speaker. */
  slip: string
  words: string[]
  /** Minimal pairs for the ear test. */
  pairs: [string, string][]
}

const EN_LESSONS: SoundLesson[] = [
  {
    id: 'th-voiceless',
    title: 'th trong "think"',
    symbol: '/θ/',
    how: 'Đặt nhẹ đầu lưỡi giữa hai hàm răng rồi thổi hơi ra. Cổ họng không rung.',
    slip: 'Đọc thành "t" hoặc "th" tiếng Việt — "three" (số ba) nghe thành "tree" (cái cây).',
    words: ['think', 'three', 'mouth', 'thank'],
    pairs: [
      ['three', 'tree'],
      ['think', 'sink'],
      ['thank', 'tank'],
    ],
  },
  {
    id: 'th-voiced',
    title: 'th trong "this"',
    symbol: '/ð/',
    how: 'Lưỡi đặt giữa hai răng như /θ/ nhưng rung cổ họng — đặt tay lên cổ sẽ thấy rung.',
    slip: 'Đọc hẳn thành "đ": "they" (họ) nghe như "day" (ngày).',
    words: ['this', 'that', 'mother', 'they'],
    pairs: [['they', 'day']],
  },
  {
    id: 'endings',
    title: 'Âm cuối',
    symbol: '/t/ /d/ /k/ /s/',
    how: 'Tiếng Anh luôn bật nhẹ âm cuối. Tập đọc chậm cho rõ âm cuối, quen rồi mới đọc nhanh.',
    slip: 'Nuốt âm cuối: "like", "light", "life" cùng thành "lai" — người nghe không biết bạn nói từ nào.',
    words: ['like', 'light', 'five', 'rice'],
    pairs: [
      ['write', 'ride'],
      ['bag', 'back'],
      ['rice', 'rise'],
    ],
  },
  {
    id: 'sh-s',
    title: '"sh" và "s"',
    symbol: '/ʃ/ – /s/',
    how: '/ʃ/: chu môi tròn ra trước như khi suỵt "shhh". /s/: môi dẹt, như đang cười nhẹ.',
    slip: 'Đọc lẫn hai âm — "she" thành "see", "ship" thành "sip".',
    words: ['she', 'ship', 'shoe'],
    pairs: [
      ['she', 'see'],
      ['ship', 'sip'],
    ],
  },
  {
    id: 'ee-i',
    title: '"i" dài và "i" ngắn',
    symbol: '/iː/ – /ɪ/',
    how: '/iː/ kéo dài, miệng cười căng (sheep). /ɪ/ ngắn và dứt khoát, miệng thả lỏng, hơi ngả về "ê" (ship).',
    slip: 'Đọc mọi chữ "i" như nhau — "sheep" (con cừu) và "ship" (con tàu) thành một. Phần "cách đọc" viết hai âm này giống nhau, nên hãy nghe kỹ giọng mẫu.',
    words: ['sheep', 'ship', 'leave', 'live'],
    pairs: [
      ['sheep', 'ship'],
      ['seat', 'sit'],
      ['leave', 'live'],
      ['heat', 'hit'],
      ['cheap', 'chip'],
    ],
  },
  {
    id: 'ae-e',
    title: '"a" bẹt và "e"',
    symbol: '/æ/ – /e/',
    how: '/æ/: hạ hàm dưới, há miệng rộng như sắp nói "a" nhưng phát ra "e" (man). /e/: miệng mở vừa (men).',
    slip: '"man" (một người) và "men" (nhiều người) nghe y hệt nhau.',
    words: ['cat', 'man', 'bad', 'hat'],
    pairs: [
      ['man', 'men'],
      ['bad', 'bed'],
      ['pan', 'pen'],
    ],
  },
  {
    id: 'uh-ae',
    title: '"ơ" ngắn và "a" bẹt',
    symbol: '/ʌ/ – /æ/',
    how: '/ʌ/: ngắn, miệng mở vừa, gần như "ơ" tiếng Việt (cup). /æ/: há rộng, môi kéo ngang (cap).',
    slip: 'Nhìn chữ "u" mà đọc thành "u": "cup" thành "cúp", "cut" thành "cút".',
    words: ['cup', 'cut', 'run'],
    pairs: [
      ['cup', 'cap'],
      ['cut', 'cat'],
    ],
  },
  {
    id: 'oo-u',
    title: '"u" dài và "u" ngắn',
    symbol: '/uː/ – /ʊ/',
    how: '/uː/: chu môi tròn và kéo dài (pool). /ʊ/: ngắn, môi thả lỏng hơn (pull).',
    slip: '"pool" (hồ bơi) và "pull" (kéo) đọc như nhau.',
    words: ['pool', 'pull', 'full'],
    pairs: [
      ['pool', 'pull'],
      ['fool', 'full'],
    ],
  },
  {
    id: 'walk-work',
    title: '"walk" và "work"',
    symbol: '/ɔ/ – /ɝ/',
    how: 'walk: môi tròn, không có âm "r" (chữ "l" câm). work: lưỡi cong lên như "ơ" + r.',
    slip: 'Hai từ dùng hằng ngày mà hay bị đọc giống nhau — "I walk" thành "I work".',
    words: ['walk', 'work'],
    pairs: [['walk', 'work']],
  },
  {
    id: 'l-n',
    title: '"l" và "n"',
    symbol: '/l/ – /n/',
    how: '/l/: đầu lưỡi chạm sau răng cửa trên, hơi đi ra hai bên lưỡi. /n/: hơi đi qua mũi.',
    slip: 'Ở một số vùng hay lẫn l/n — "light" (ánh sáng) thành "night" (ban đêm).',
    words: ['light', 'night', 'low', 'no'],
    pairs: [
      ['light', 'night'],
      ['low', 'no'],
      ['lead', 'need'],
    ],
  },
  {
    id: 'r',
    title: '"r" đầu từ',
    symbol: '/r/',
    how: 'Cong đầu lưỡi lên nhưng không chạm vòm miệng, môi hơi tròn. Không rung lưỡi.',
    slip: 'Đọc "r" thành "d/gi" kiểu giọng Bắc, hoặc rung lưỡi — "rice" thành "zai".',
    words: ['rice', 'red', 'run', 'right'],
    pairs: [],
  },
  {
    id: 'stress',
    title: 'Trọng âm',
    symbol: 'ˈ',
    how: 'Âm tiết VIẾT HOA trong phần "cách đọc" là âm nhấn: đọc to hơn, dài hơn, cao hơn. Các âm còn lại lướt nhẹ, thường thành "ơ".',
    slip: 'Đọc đều từng âm như tiếng Việt — "computer" thành "com-piu-tơ" ba tiếng bằng nhau.',
    words: ['computer', 'coffee', 'mother', 'important'],
    pairs: [],
  },
]

// Tones are what a Vietnamese ear hears best and still mixes up: the pairs that
// end the same way (2 and 3 both rise at the end) or that Vietnamese has no
// match for (the sharp falling 4th).
const ZH_LESSONS: SoundLesson[] = [
  {
    id: 'zh-tone-2-3',
    title: 'Thanh 2 và thanh 3',
    symbol: 'á – ǎ',
    how: 'Thanh 2 đi thẳng lên, gọn như thanh sắc. Thanh 3 xuống thật trầm rồi mới hơi nhích lên, như thanh hỏi kéo dài; đứng trước chữ khác thì chỉ còn phần trầm.',
    slip: 'Hai thanh đều kết thúc đi lên nên hay bị đọc như nhau: 白 bái (trắng) thành 百 bǎi (trăm).',
    words: ['白', '百', '元', '远'],
    pairs: [
      ['白', '百'],
      ['离', '里'],
      ['元', '远'],
      ['晴', '请'],
      ['完', '晚'],
    ],
  },
  {
    id: 'zh-tone-3-4',
    title: 'Thanh 3 và thanh 4',
    symbol: 'ǎ – à',
    how: 'Thanh 4 rơi mạnh từ cao xuống thấp, ngắn và dứt khoát như khi quát "đi!". Thanh 3 bắt đầu thấp và trầm.',
    slip: 'Đọc thanh 4 nhẹ như thanh huyền, nên lẫn với thanh 3: 买 mǎi (mua) và 卖 mài (bán) thành một.',
    words: ['买', '卖', '好', '号'],
    pairs: [
      ['买', '卖'],
      ['好', '号'],
      ['小', '笑'],
      ['想', '向'],
      ['九', '就'],
    ],
  },
  {
    id: 'zh-tone-1-2',
    title: 'Thanh 1 và thanh 2',
    symbol: 'ā – á',
    how: 'Thanh 1 cao và đều, giữ nguyên một độ cao như hát một nốt. Thanh 2 bắt đầu ở giữa rồi đi lên.',
    slip: 'Đọc thanh 1 thấp như thanh ngang tiếng Việt, nghe gần thanh 2: 千 qiān (nghìn) thành 钱 qián (tiền).',
    words: ['千', '钱', '喝', '和'],
    pairs: [
      ['千', '钱'],
      ['穿', '船'],
      ['踢', '题'],
      ['喝', '和'],
    ],
  },
  {
    id: 'zh-retroflex',
    title: 'zh, ch, sh và z, c, s',
    symbol: 'zh – z',
    how: 'zh, ch, sh: uốn đầu lưỡi lên, chạm phía sau lợi trên. z, c, s: lưỡi phẳng, đầu lưỡi đặt sau răng cửa dưới. ch và c bật mạnh hơi.',
    slip: 'Không uốn lưỡi, hoặc đọc theo chữ Việt: 是 shì (là) thành 四 sì (bốn), 吃 chī đọc như "chi".',
    words: ['是', '四', '吃', '次'],
    pairs: [
      ['是', '四'],
      ['水', '岁'],
      ['吃', '次'],
      ['只', '字'],
    ],
  },
  {
    id: 'zh-jqx',
    title: 'j, q, x',
    symbol: 'j q x',
    how: 'Mặt lưỡi áp lên vòm miệng, đầu lưỡi chạm sau răng cửa dưới, môi dẹt như đang cười. q là j bật hơi, x là âm xát nhẹ.',
    slip: 'Đọc theo chữ Việt: q thành "qu", x thành "x". Cũng hay lẫn j với zh: 几 jǐ (mấy) thành 只 zhī.',
    words: ['七', '洗', '几', '请'],
    pairs: [
      ['七', '洗'],
      ['请', '姓'],
      ['几', '只'],
    ],
  },
  {
    id: 'zh-n-ng',
    title: 'Vần -n và -ng',
    symbol: '-n – -ng',
    how: '-n: kết thúc bằng đầu lưỡi chạm lợi trên, như "an" tiếng Việt. -ng: lưỡi lùi về sau, như "ang".',
    slip: 'Giọng miền Nam đọc -n và -ng gần như nhau: 慢 màn (chậm) và 忙 máng (bận) thành một.',
    words: ['慢', '忙', '新', '姓'],
    pairs: [
      ['慢', '忙'],
      ['新', '姓'],
    ],
  },
  {
    id: 'zh-n-l',
    title: 'n và l',
    symbol: 'n – l',
    how: 'n: hơi đi qua mũi. l: đầu lưỡi chạm lợi trên, hơi đi ra hai bên lưỡi, không qua mũi.',
    slip: 'Một số vùng lẫn l và n: 冷 lěng (lạnh) thành 能 néng (có thể).',
    words: ['你', '离', '能', '冷'],
    pairs: [
      ['你', '离'],
      ['能', '冷'],
      ['呢', '了'],
    ],
  },
  {
    id: 'zh-u-umlaut',
    title: 'Âm ü',
    symbol: 'ü',
    how: 'Đặt lưỡi như khi đọc "i" rồi chu tròn môi. Sau j, q, x, y, chữ ü viết thành u nhưng vẫn đọc là ü: 去 qù, 鱼 yú.',
    slip: 'Đọc thành "u" hay "uy" tiếng Việt: 去 qù thành "chu".',
    words: ['去', '鱼'],
    pairs: [],
  },
  {
    id: 'zh-r',
    title: 'Âm r',
    symbol: 'r',
    how: 'Uốn lưỡi như khi đọc sh nhưng rung dây thanh. Lưỡi không rung.',
    slip: 'Rung lưỡi như "r" tiếng Việt, hoặc đọc thành "d/gi" giọng Bắc: 热 rè (nóng) thành "dơ".',
    words: ['热', '人', '让', '认识'],
    pairs: [],
  },
]

// Korean splits b/p, d/t, g/k, j/ch and s three ways or two, where Vietnamese
// has two at most; and it ends syllables in ㄹ, which Vietnamese never does.
const KO_LESSONS: SoundLesson[] = [
  {
    id: 'ko-finals',
    title: 'Âm cuối (받침)',
    symbol: 'ㄹ ㅁ ㅇ ㅂ ㄴ',
    how: 'Âm cuối giữ nguyên khẩu hình, không bật hơi ra: ㅁ ngậm môi (밤), ㅂ ngậm môi và tắc lại (밥), ㅇ như "ng" (방), ㄴ như "n" (문), ㄹ cong đầu lưỡi chạm lợi trên rồi giữ nguyên (발).',
    slip: 'Tiếng Việt không có âm cuối "l" nên 발 (bàn chân) hay bị đọc thành "ban" hay "ba". Giọng miền Nam còn dễ lẫn ㄴ với ㅇ.',
    words: ['발', '밤', '방', '밥'],
    pairs: [
      ['발', '밤'],
      ['밤', '방'],
      ['밥', '발'],
      ['산', '삼'],
      ['물', '문'],
      ['일', '입'],
    ],
  },
  {
    id: 'ko-tense',
    title: 'Phụ âm thường, căng và bật hơi',
    symbol: 'ㅂ ㅃ ㅍ',
    how: 'Thường (ㅂ ㄷ ㄱ ㅈ ㅅ): nhẹ, hơi ra vừa phải. Căng (ㅃ ㄸ ㄲ ㅉ ㅆ): siết cổ họng, gần như không ra hơi, giọng hơi cao lên. Bật hơi (ㅍ ㅌ ㅋ ㅊ): bật mạnh một luồng hơi, để tờ giấy trước miệng sẽ thấy rung.',
    slip: 'Tiếng Việt chỉ phân biệt hai loại nên phụ âm căng hay bị đọc như thường: 싸다 (rẻ) thành 사다 (mua), 빵 (bánh mì) thành 방 (căn phòng). Dòng "cách đọc" cũng không ghi được khác biệt này, nên hãy nghe giọng mẫu.',
    words: ['방', '빵', '팔다', '사다', '싸다'],
    pairs: [
      ['사다', '싸다'],
      ['방', '빵'],
    ],
  },
  {
    id: 'ko-eo-o',
    title: 'ㅓ và ㅗ',
    symbol: 'ㅓ – ㅗ',
    how: 'ㅓ: miệng mở rộng, môi không tròn, nằm giữa "ơ" và "o" của tiếng Việt. ㅗ: chu tròn môi như "ô".',
    slip: 'Đọc ㅓ quá hẹp hoặc tròn môi, nghe lẫn sang ㅗ: 어디 (ở đâu) thành "ô-đi".',
    words: ['어제', '오다', '먹다', '보다'],
    pairs: [],
  },
  {
    id: 'ko-eu-u',
    title: 'ㅡ và ㅜ',
    symbol: 'ㅡ – ㅜ',
    how: 'ㅡ: môi dẹt, kéo ngang như "ư". ㅜ: chu tròn môi như "u".',
    slip: 'Thấy phiên âm Latin "eu" thì đọc thành "ê-u", trong khi ㅡ chỉ là "ư": 크다 là "khư-đa".',
    words: ['크다', '쓰다', '주다', '우유'],
    pairs: [],
  },
  {
    id: 'ko-rieul',
    title: 'ㄹ: lúc r, lúc l',
    symbol: 'ㄹ',
    how: 'Giữa hai nguyên âm, ㄹ là một cái chạm lưỡi rất nhanh, nghe gần "r" nhẹ (이름 i-rưm). Ở cuối âm tiết, ㄹ là "l" (물, 얼마).',
    slip: 'Rung lưỡi như "r" tiếng Việt, hoặc đọc ㄹ cuối thành "n".',
    words: ['이름', '여름', '물', '얼마'],
    pairs: [],
  },
]

/** The lessons for each pack (lib/packContent.ts opens /sounds for these). */
export const SOUND_LESSONS: Record<string, SoundLesson[]> = {
  en: EN_LESSONS,
  zh: ZH_LESSONS,
  ko: KO_LESSONS,
}

/** Every word the lessons need (for checking the pack has them all). */
export function lessonWords(lessons: SoundLesson[]): string[] {
  const all = lessons.flatMap((l) => [...l.words, ...l.pairs.flat()])
  return [...new Set(all)]
}

export interface EarRound {
  pair: [string, string]
  /** Index into `pair` of the word that is played. */
  answer: 0 | 1
}

/** One ear-test question: a random pair, a random side of it. */
export function earRound(pairs: [string, string][], rand: () => number = Math.random): EarRound {
  const pair = pairs[Math.floor(rand() * pairs.length)]
  return { pair, answer: rand() < 0.5 ? 0 : 1 }
}

/** English wording for each lesson, by id (the Vietnamese lives on the lesson). */
const LESSON_EN: Record<string, { title: string; how: string; slip: string }> = {
  'th-voiceless': {
    title: 'th in "think"',
    how: 'Rest the tip of your tongue lightly between your teeth and blow air out. No voice.',
    slip: 'Saying "t" or a Vietnamese "th" — "three" (3) comes out as "tree".',
  },
  'th-voiced': {
    title: 'th in "this"',
    how: 'Tongue between the teeth as for /θ/, but with your voice on — put a hand on your throat to feel it buzz.',
    slip: 'Turning it into a full "đ": "they" sounds like "day".',
  },
  endings: {
    title: 'Final sounds',
    how: 'English always releases the last sound lightly. Practise slowly so the ending is clear, then speed up.',
    slip: 'Swallowing the ending: "like", "light" and "life" all become "lai" — the listener cannot tell which you mean.',
  },
  'sh-s': {
    title: '"sh" and "s"',
    how: '/ʃ/: round your lips forward as in "shhh". /s/: lips flat, as if smiling.',
    slip: 'Mixing them up — "she" becomes "see", "ship" becomes "sip".',
  },
  'ee-i': {
    title: 'Long "ee" and short "i"',
    how: '/iː/ is long with a tight smile (sheep). /ɪ/ is short and crisp with relaxed lips, leaning towards "ê" (ship).',
    slip: 'Saying every "i" the same — "sheep" and "ship" merge. The respelling cannot show this difference, so listen to the model voice.',
  },
  'ae-e': {
    title: 'Flat "a" and "e"',
    how: '/æ/: drop your jaw and open wide as if saying "a", but make an "e" (man). /e/: mouth half open (men).',
    slip: '"man" (one person) and "men" (several) sound exactly alike.',
  },
  'uh-ae': {
    title: 'Short "uh" and flat "a"',
    how: '/ʌ/: short, mouth half open, close to the Vietnamese "ơ" (cup). /æ/: open wide, lips spread (cap).',
    slip: 'Reading the letter "u" as "u": "cup" becomes "cúp", "cut" becomes "cút".',
  },
  'oo-u': {
    title: 'Long "oo" and short "u"',
    how: '/uː/: round your lips and hold it (pool). /ʊ/: short, lips more relaxed (pull).',
    slip: '"pool" (swimming pool) and "pull" (to drag) sound the same.',
  },
  'walk-work': {
    title: '"walk" and "work"',
    how: 'walk: rounded lips, no "r" sound (the "l" is silent). work: tongue curls up like "ơ" + r.',
    slip: 'Two everyday words that often sound identical — "I walk" becomes "I work".',
  },
  'l-n': {
    title: '"l" and "n"',
    how: '/l/: tongue tip behind the upper front teeth, air flows around the sides. /n/: air goes through the nose.',
    slip: 'In some regions l and n get mixed — "light" becomes "night".',
  },
  r: {
    title: 'Initial "r"',
    how: 'Curl the tongue tip up without touching the roof of the mouth, lips slightly rounded. Do not roll it.',
    slip: 'Saying "r" like a Northern "d/gi", or rolling it — "rice" becomes "zai".',
  },
  'zh-tone-2-3': {
    title: '2nd and 3rd tones',
    how: 'The 2nd tone goes straight up, short and crisp. The 3rd tone dips low and only then rises a little; before another syllable only the low part is left.',
    slip: 'Both end rising, so they get mixed up: 白 bái (white) becomes 百 bǎi (hundred).',
  },
  'zh-tone-3-4': {
    title: '3rd and 4th tones',
    how: 'The 4th tone falls hard from high to low, short as a command. The 3rd tone starts low and deep.',
    slip: 'A 4th tone said softly like the Vietnamese huyền gets mixed up with the 3rd: 买 mǎi (buy) and 卖 mài (sell) become one.',
  },
  'zh-tone-1-2': {
    title: '1st and 2nd tones',
    how: 'The 1st tone is high and level, like holding one sung note. The 2nd starts in the middle and rises.',
    slip: 'A 1st tone said low like the Vietnamese level tone sounds close to the 2nd: 千 qiān (thousand) becomes 钱 qián (money).',
  },
  'zh-retroflex': {
    title: 'zh, ch, sh and z, c, s',
    how: 'zh, ch, sh: curl the tongue tip up behind the upper gum. z, c, s: tongue flat, tip behind the lower front teeth. ch and c come with a strong puff of air.',
    slip: 'No curl, or reading them as Vietnamese letters: 是 shì (to be) becomes 四 sì (four), 吃 chī is read like "chi".',
  },
  'zh-jqx': {
    title: 'j, q, x',
    how: 'Press the middle of the tongue to the palate, tip behind the lower teeth, lips spread as in a smile. q is j with a puff of air, x a soft hiss.',
    slip: 'Reading them as Vietnamese letters: q as "qu", x as "x". j also gets mixed up with zh: 几 jǐ (how many) becomes 只 zhī.',
  },
  'zh-n-ng': {
    title: 'Finals -n and -ng',
    how: '-n: end with the tongue tip on the upper gum, as in Vietnamese "an". -ng: the tongue pulls back, as in "ang".',
    slip: 'Southern Vietnamese says -n and -ng almost alike: 慢 màn (slow) and 忙 máng (busy) merge.',
  },
  'zh-n-l': {
    title: 'n and l',
    how: 'n: air goes through the nose. l: tongue tip on the upper gum, air flows around the sides, not through the nose.',
    slip: 'In some regions l and n get mixed: 冷 lěng (cold) becomes 能 néng (can).',
  },
  'zh-u-umlaut': {
    title: 'The ü sound',
    how: 'Hold your tongue as for "i", then round your lips. After j, q, x and y it is written u but still said ü: 去 qù, 鱼 yú.',
    slip: 'Saying a Vietnamese "u" or "uy": 去 qù comes out as "chu".',
  },
  'zh-r': {
    title: 'The r sound',
    how: 'Curl the tongue as for sh, but with your voice on. The tongue does not trill.',
    slip: 'Trilling it like a Vietnamese "r", or saying a Northern "d/gi": 热 rè (hot) becomes "dơ".',
  },
  'ko-finals': {
    title: 'Final consonants (받침)',
    how: 'Hold the mouth still at the end, no puff of air: ㅁ lips closed (밤), ㅂ lips closed and stopped (밥), ㅇ like "ng" (방), ㄴ like "n" (문), ㄹ tongue tip curled onto the upper gum and held (발).',
    slip: 'Vietnamese never ends a syllable in "l", so 발 (foot) comes out as "ban" or "ba". Southern speakers also mix up ㄴ and ㅇ.',
  },
  'ko-tense': {
    title: 'Plain, tense and aspirated consonants',
    how: 'Plain (ㅂ ㄷ ㄱ ㅈ ㅅ): light, a little air. Tense (ㅃ ㄸ ㄲ ㅉ ㅆ): tighten the throat, almost no air, pitch a little higher. Aspirated (ㅍ ㅌ ㅋ ㅊ): a strong puff of air that makes a sheet of paper flutter.',
    slip: 'Vietnamese has only two kinds, so tense ones get said as plain: 싸다 (cheap) becomes 사다 (to buy), 빵 (bread) becomes 방 (room). The Vietnamese-style reading cannot show this either, so listen to the model voice.',
  },
  'ko-eo-o': {
    title: 'ㅓ and ㅗ',
    how: 'ㅓ: mouth open, lips not rounded, between the Vietnamese "ơ" and "o". ㅗ: lips rounded as in "ô".',
    slip: 'Saying ㅓ too closed or rounded, so it drifts towards ㅗ: 어디 (where) becomes "ô-đi".',
  },
  'ko-eu-u': {
    title: 'ㅡ and ㅜ',
    how: 'ㅡ: lips flat and spread, like "ư". ㅜ: lips rounded, like "u".',
    slip: 'Reading the romanised "eu" as "ê-u", when ㅡ is just "ư": 크다 is "khư-đa".',
  },
  'ko-rieul': {
    title: 'ㄹ: sometimes r, sometimes l',
    how: 'Between two vowels ㄹ is one very quick tap of the tongue, close to a light "r" (이름 i-rưm). At the end of a syllable it is "l" (물, 얼마).',
    slip: 'Trilling it like a Vietnamese "r", or turning a final ㄹ into "n".',
  },
  stress: {
    title: 'Word stress',
    how: 'The CAPITALISED syllable in the respelling is stressed: louder, longer, higher. The others are quick and light, often "uh".',
    slip: 'Giving every syllable equal weight like Vietnamese — "computer" as three even beats "com-piu-tơ".',
  },
}

/** A lesson's title, how-to and usual slip in the interface language. */
export function lessonText(
  lesson: SoundLesson,
  lang: 'vi' | 'en'
): { title: string; how: string; slip: string } {
  const en = lang === 'en' ? LESSON_EN[lesson.id] : undefined
  return en ?? { title: lesson.title, how: lesson.how, slip: lesson.slip }
}
