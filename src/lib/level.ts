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
      'Người học MỚI BẮT ĐẦU. Giải thích nghĩa thật đơn giản bằng tiếng Việt, chỉ 1 ví dụ ngắn dễ hiểu (kèm dịch). Tập trung giúp NHỚ MẶT CHỮ và NGHĨA cơ bản. Tránh thuật ngữ ngôn ngữ học, tránh liệt kê dài.',
  },
  {
    level: 2,
    name: 'Sơ cấp',
    tag: 'A2',
    blurb: 'Nghĩa + ví dụ + từ liên quan cơ bản',
    aiInstruction:
      'Trình độ SƠ CẤP. Cho nghĩa + 1–2 ví dụ (kèm dịch) + 1 từ đồng nghĩa hoặc trái nghĩa cơ bản. Ngôn ngữ vẫn đơn giản, khích lệ.',
  },
  {
    level: 3,
    name: 'Trung cấp',
    tag: 'B1',
    blurb: '“Học 1 hiểu 3”: collocation, họ từ',
    aiInstruction:
      'Trình độ TRUNG CẤP — dạy theo tinh thần "học 1 hiểu 3": ngoài nghĩa & ví dụ, bổ sung 1–2 collocation phổ biến, word family (danh/động/tính từ liên quan), và phân biệt ngắn gọn với 1 từ gần nghĩa.',
  },
  {
    level: 4,
    name: 'Trung cao',
    tag: 'B2',
    blurb: '“Học 1 hiểu 5”: sắc thái, ngữ vực, idiom',
    aiInstruction:
      'Trình độ TRUNG CAO — "học 1 hiểu 5": thêm sắc thái nghĩa, ngữ vực (trang trọng/thân mật), phrasal verb/idiom liên quan, và 2–3 ví dụ ở các ngữ cảnh khác nhau. Có thể hỏi lại để thử thách người học.',
  },
  {
    level: 5,
    name: 'Nâng cao',
    tag: 'C1',
    blurb: '“Học 1 hiểu 10”: gốc từ, mở rộng sâu',
    aiInstruction:
      'Trình độ NÂNG CAO — "học 1 hiểu 10": khai thác gốc từ (etymology) khi hữu ích, họ từ mở rộng, collocation nâng cao, cách dùng học thuật/chuyên ngành, và nuance tinh tế giữa các từ gần nghĩa. Khuyến khích tư duy, đặt câu hỏi mở.',
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
