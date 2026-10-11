// Words said after an answer. A beginner who keeps reading "wrong" quits; one
// who reads "mistakes are how memory works" tries again. Picked by a seed so a
// given question always shows the same line (no flicker on re-render).

import type { UiLang } from '@/types'

export const PRAISE = ['Chính xác!', 'Tuyệt!', 'Giỏi quá!', 'Đúng rồi!', 'Xuất sắc!'] as const

export const NUDGES = [
  'không sao, sai là cách não ghi nhớ — xem lại nhé:',
  'gần rồi! Nhìn kỹ lại nhé:',
  'không sao cả, lần sau bạn sẽ nhớ:',
  'bình thường thôi — ai học cũng sai vài lần:',
  'mỗi lần sai là một lần nhớ sâu hơn:',
  'chẳng sao, mình xem lại cùng nhau:',
] as const

export const PRAISE_EN = ['Correct!', 'Great!', 'Nice one!', "That's right!", 'Excellent!'] as const

export const NUDGES_EN = [
  "that's fine — mistakes are how the brain remembers. Have a look:",
  'so close! Look again:',
  "no worries, you'll remember it next time:",
  'totally normal — everyone gets a few wrong:',
  'every miss makes the memory deeper:',
  "no problem, let's look at it together:",
] as const

function pick<T>(list: readonly T[], seed: number): T {
  const i = ((Math.floor(seed) % list.length) + list.length) % list.length
  return list[i]
}

export const praise = (seed: number, lang: UiLang = 'vi'): string =>
  pick(lang === 'en' ? PRAISE_EN : PRAISE, seed)
export const nudge = (seed: number, lang: UiLang = 'vi'): string =>
  pick(lang === 'en' ? NUDGES_EN : NUDGES, seed)
