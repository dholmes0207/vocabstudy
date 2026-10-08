// Words said after an answer. A beginner who keeps reading "wrong" quits; one
// who reads "mistakes are how memory works" tries again. Picked by a seed so a
// given question always shows the same line (no flicker on re-render).

export const PRAISE = ['Chính xác!', 'Tuyệt!', 'Giỏi quá!', 'Đúng rồi!', 'Xuất sắc!'] as const

export const NUDGES = [
  'không sao, sai là cách não ghi nhớ — xem lại nhé:',
  'gần rồi! Nhìn kỹ lại nhé:',
  'không sao cả, lần sau bạn sẽ nhớ:',
  'bình thường thôi — ai học cũng sai vài lần:',
  'mỗi lần sai là một lần nhớ sâu hơn:',
  'chẳng sao, mình xem lại cùng nhau:',
] as const

function pick<T>(list: readonly T[], seed: number): T {
  const i = ((Math.floor(seed) % list.length) + list.length) % list.length
  return list[i]
}

export const praise = (seed: number) => pick(PRAISE, seed)
export const nudge = (seed: number) => pick(NUDGES, seed)
