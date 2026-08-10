// Learner ability levels (1..5). The level personalizes how deep the AI tutor
// teaches ("học 1 hiểu N") and which questions it suggests. It can be computed
// automatically from progress, or overridden by the learner.

export interface LevelInfo {
  level: number
  name: string
  /** Short badge label. */
  tag: string
  /** One-line description for the UI. */
  blurb: string
  /** Instruction appended to the AI system prompt to set teaching depth. */
  aiInstruction: string
}

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    name: 'Mới bắt đầu',
    tag: 'A1',
    blurb: 'Học nghĩa & mặt chữ cơ bản',
    aiInstruction:
      'Người học MỚI BẮT ĐẦU, gần như mất gốc. Chỉ cần: nói NGHĨA bằng tiếng Việt thật đơn giản + đúng 1 ví dụ ngắn, đời thường (kèm nghĩa tiếng Việt). Dùng từ dễ nhất, KHÔNG thuật ngữ, KHÔNG liệt kê nhiều. Có thể thêm cách đọc gần đúng kiểu Việt để bạn ấy đọc theo.',
  },
  {
    level: 2,
    name: 'Sơ cấp',
    tag: 'A2',
    blurb: 'Nghĩa + ví dụ + từ liên quan cơ bản',
    aiInstruction:
      'Trình độ SƠ CẤP. Nói nghĩa + 1–2 ví dụ đời thường (kèm dịch) + 1 từ gần nghĩa hoặc trái nghĩa (giới thiệu mộc mạc, ví dụ "gần nghĩa với…", "ngược với…"). Vẫn thật dễ hiểu và khích lệ.',
  },
  {
    level: 3,
    name: 'Trung cấp',
    tag: 'B1',
    blurb: '“Học 1 hiểu 3”: từ hay đi chung, từ cùng gốc',
    aiInstruction:
      'Trình độ TRUNG CẤP — "học 1 hiểu 3". Ngoài nghĩa & ví dụ, thêm (diễn đạt thuần Việt, mỗi ý một dòng): 1–2 "từ/cụm hay đi chung với nó", vài "từ cùng gốc" (danh từ/động từ/tính từ liên quan), và so sánh ngắn với 1 từ dễ nhầm. Không dùng thuật ngữ.',
  },
  {
    level: 4,
    name: 'Trung cao',
    tag: 'B2',
    blurb: '“Học 1 hiểu 5”: sắc thái, trang trọng/thân mật, thành ngữ',
    aiInstruction:
      'Trình độ TRUNG CAO — "học 1 hiểu 5". Thêm: sắc thái nghĩa; khi nào dùng trong tình huống trang trọng, khi nào thân mật; 1–2 cụm động từ/thành ngữ liên quan (kèm nghĩa); và 2–3 ví dụ ở các tình huống khác nhau. Giải thích khác biệt bằng lời thường, có ví dụ minh hoạ, KHÔNG liệt kê khô khan.',
  },
  {
    level: 5,
    name: 'Nâng cao',
    tag: 'C1',
    blurb: '“Học 1 hiểu 10”: gốc từ, mở rộng sâu',
    aiInstruction:
      'Trình độ NÂNG CAO — "học 1 hiểu 10". Đào sâu nhưng vẫn GIẢNG rõ ràng và có ví dụ: gốc của từ (nếu thú vị & giúp nhớ), các từ cùng gốc mở rộng, cách dùng trong văn viết/học thuật, và phân biệt tinh tế giữa vài từ gần nghĩa (nói rõ khi nào dùng từ nào). Tránh viết như từ điển; kết bằng 1 câu hỏi mở để bạn ấy luyện tư duy.',
  },
]

export function levelInfo(level: number): LevelInfo {
  const l = Math.max(1, Math.min(LEVELS.length, Math.round(level)))
  return LEVELS[l - 1]
}

/** Auto-estimate the learner's level from their progress. */
export function computeLevel(input: {
  mastered: number
  learned: number
  accuracy: number
}): number {
  const { mastered, learned, accuracy } = input
  if (learned < 25) return 1
  if (mastered < 30) return 2
  if (mastered < 120) return accuracy >= 85 ? 4 : 3
  if (mastered < 350) return 4
  return 5
}
