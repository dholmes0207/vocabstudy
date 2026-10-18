// "Chưa gõ được chữ Hàn / chữ Trung?" (docs/design/typing-help.md): a
// Vietnamese keyboard types English fine, but Hangul and Chinese need the
// system's own input method. These are the steps to add it, per device.

export type Pair = [vi: string, en: string]

export type Device = 'android' | 'ios' | 'windows' | 'mac' | 'linux'

export const DEVICES: { id: Device; label: string }[] = [
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iPhone / iPad' },
  { id: 'windows', label: 'Windows' },
  { id: 'mac', label: 'Mac' },
  { id: 'linux', label: 'Linux' },
]

/** Best guess from the user agent. iPadOS reports itself as a Mac with touch. */
export function deviceOf(ua: string, touchPoints = 0): Device {
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Macintosh/i.test(ua)) return touchPoints > 1 ? 'ios' : 'mac'
  if (/Windows/i.test(ua)) return 'windows'
  return 'linux'
}

export interface KeyboardGuide {
  /** "chữ Hàn" / "Hangul" — what the learner cannot type yet. */
  script: Pair
  steps: Record<Device, Pair[]>
  /** How typing works once the keyboard is there. */
  howTo: Pair
}

const GUIDES: Record<string, KeyboardGuide> = {
  ko: {
    script: ['chữ Hàn', 'Hangul'],
    steps: {
      android: [
        [
          'Mở Cài đặt Gboard (chạm biểu tượng ⚙ trên bàn phím) → Ngôn ngữ → Thêm bàn phím.',
          'Open Gboard settings (tap ⚙ on the keyboard) → Languages → Add keyboard.',
        ],
        ['Chọn "Tiếng Hàn", rồi bấm Xong.', 'Pick "Korean", then tap Done.'],
        [
          'Khi gõ, chạm nút 🌐 (hoặc giữ phím cách) để đổi sang bàn phím Hàn.',
          'While typing, tap 🌐 (or hold the space bar) to switch to Korean.',
        ],
      ],
      ios: [
        [
          'Cài đặt → Cài đặt chung → Bàn phím → Bàn phím → Thêm bàn phím mới.',
          'Settings → General → Keyboard → Keyboards → Add New Keyboard.',
        ],
        ['Chọn "Tiếng Hàn" → "Tiêu chuẩn".', 'Pick "Korean" → "Standard".'],
        ['Khi gõ, chạm nút 🌐 để đổi bàn phím.', 'While typing, tap 🌐 to switch keyboards.'],
      ],
      windows: [
        [
          'Cài đặt → Thời gian & ngôn ngữ → Ngôn ngữ & khu vực → Thêm ngôn ngữ → "한국어 (Korean)".',
          'Settings → Time & language → Language & region → Add a language → "한국어 (Korean)".',
        ],
        [
          'Đổi bàn phím bằng Win + Space. Bàn phím Hàn mở ra ở chế độ chữ Latin: bấm Alt phải để chuyển sang chữ Hàn.',
          'Switch keyboards with Win + Space. The Korean keyboard starts in Latin mode: press Right Alt for Hangul.',
        ],
      ],
      mac: [
        [
          'Cài đặt hệ thống → Bàn phím → Nguồn đầu vào → Sửa → dấu + → Tiếng Hàn → "2-Set Korean".',
          'System Settings → Keyboard → Input Sources → Edit → + → Korean → "2-Set Korean".',
        ],
        [
          'Đổi bàn phím bằng Ctrl + Space (hoặc phím 🌐).',
          'Switch with Ctrl + Space (or the 🌐 key).',
        ],
      ],
      linux: [
        [
          'Cài bộ gõ tiếng Hàn của bộ gõ bạn đang dùng (fcitx5-hangul hoặc ibus-hangul).',
          'Install the Korean engine for your input framework (fcitx5-hangul or ibus-hangul).',
        ],
        [
          'Thêm "Hangul" vào danh sách bộ gõ, rồi đổi bằng phím tắt của bộ gõ.',
          'Add "Hangul" to your input methods and switch with its shortcut.',
        ],
      ],
    },
    howTo: [
      'Mỗi phím là một chữ cái (ㄱ, ㅏ…); bàn phím tự ghép thành khối chữ: ㅎ + ㅏ + ㄴ → 한.',
      'Each key is one letter (ㄱ, ㅏ…); the keyboard builds the blocks itself: ㅎ + ㅏ + ㄴ → 한.',
    ],
  },
  zh: {
    script: ['chữ Hán', 'Chinese characters'],
    steps: {
      android: [
        [
          'Mở Cài đặt Gboard (chạm biểu tượng ⚙ trên bàn phím) → Ngôn ngữ → Thêm bàn phím.',
          'Open Gboard settings (tap ⚙ on the keyboard) → Languages → Add keyboard.',
        ],
        [
          'Chọn "Tiếng Trung (Giản thể)" → kiểu "Bính âm", rồi bấm Xong.',
          'Pick "Chinese (Simplified)" → "Pinyin", then tap Done.',
        ],
        [
          'Khi gõ, chạm nút 🌐 (hoặc giữ phím cách) để đổi bàn phím.',
          'While typing, tap 🌐 (or hold the space bar) to switch keyboards.',
        ],
      ],
      ios: [
        [
          'Cài đặt → Cài đặt chung → Bàn phím → Bàn phím → Thêm bàn phím mới.',
          'Settings → General → Keyboard → Keyboards → Add New Keyboard.',
        ],
        [
          'Chọn "Tiếng Trung, giản thể" → "Bính âm – QWERTY".',
          'Pick "Chinese, Simplified" → "Pinyin – QWERTY".',
        ],
        ['Khi gõ, chạm nút 🌐 để đổi bàn phím.', 'While typing, tap 🌐 to switch keyboards.'],
      ],
      windows: [
        [
          'Cài đặt → Thời gian & ngôn ngữ → Ngôn ngữ & khu vực → Thêm ngôn ngữ → "中文(简体) Chinese (Simplified)". Bàn phím Microsoft Pinyin đi kèm.',
          'Settings → Time & language → Language & region → Add a language → "中文(简体) Chinese (Simplified)". Microsoft Pinyin comes with it.',
        ],
        [
          'Đổi bàn phím bằng Win + Space; phím Shift chuyển qua lại giữa chữ Hán và chữ Latin.',
          'Switch keyboards with Win + Space; Shift toggles between Chinese and Latin.',
        ],
      ],
      mac: [
        [
          'Cài đặt hệ thống → Bàn phím → Nguồn đầu vào → Sửa → dấu + → Tiếng Trung, giản thể → "Bính âm – Giản thể".',
          'System Settings → Keyboard → Input Sources → Edit → + → Chinese, Simplified → "Pinyin – Simplified".',
        ],
        [
          'Đổi bàn phím bằng Ctrl + Space (hoặc phím 🌐).',
          'Switch with Ctrl + Space (or the 🌐 key).',
        ],
      ],
      linux: [
        [
          'Cài bộ gõ bính âm của bộ gõ bạn đang dùng (fcitx5-chinese-addons hoặc ibus-libpinyin).',
          'Install the pinyin engine for your input framework (fcitx5-chinese-addons or ibus-libpinyin).',
        ],
        [
          'Thêm "Pinyin" vào danh sách bộ gõ, rồi đổi bằng phím tắt của bộ gõ.',
          'Add "Pinyin" to your input methods and switch with its shortcut.',
        ],
      ],
    },
    howTo: [
      'Gõ bính âm không dấu (wo shi → 我是), rồi chọn chữ đúng trong hàng gợi ý; phím cách chọn chữ đầu tiên.',
      'Type pinyin without tones (wo shi → 我是), then pick the right characters from the suggestions; space takes the first one.',
    ],
  },
}

/** The guide for a pack whose script a Vietnamese keyboard cannot type, if any. */
export function keyboardGuide(code: string): KeyboardGuide | null {
  return GUIDES[code] ?? null
}

/** On a computer, a Vietnamese input tool left on rewrites what the new keyboard sends. */
export const VIETNAMESE_IME_NOTE: Pair = [
  'Trên máy tính, tắt Unikey/EVKey trước khi gõ (phím tắt thường là Ctrl + Shift hoặc Alt + Z), không thì bộ gõ tiếng Việt có thể đổi chữ: "oo" thành "ô", "w" thành "ư".',
  'On a computer, turn off Unikey/EVKey first (usually Ctrl + Shift or Alt + Z), or the Vietnamese input tool may rewrite letters: "oo" into "ô", "w" into "ư".',
]
