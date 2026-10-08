// "Âm khó cho người Việt": the handful of English sounds Vietnamese speakers
// most often get wrong, each with how to make it, the usual slip, words to
// hear, and minimal pairs ("ship" / "sheep") for a quick ear test. Every word
// here is in the English pack, so both sides of a pair play in the same
// recorded voice — a different voice would give the answer away.

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

export const SOUND_LESSONS: SoundLesson[] = [
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

/** Every word the lessons need (for checking the pack has them all). */
export function lessonWords(lessons = SOUND_LESSONS): string[] {
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
