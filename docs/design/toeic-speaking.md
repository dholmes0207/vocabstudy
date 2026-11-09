# TOEIC Speaking (08/11/2026)

**User**: "… luyện thi chứng chỉ… luyện nói, luyện nghe, TOEIC, IELTS… ưu tiên tiếng Anh".

## 1. Người học

- Nhiều trường đại học và công ty ở Việt Nam yêu cầu TOEIC 4 kỹ năng (Nghe – Đọc và Nói – Viết). Trang TOEIC
  đã có đủ 7 Part của Nghe – Đọc; phần Nói chưa có chỗ luyện.
- Đề Nói làm trên máy, ghi âm từng câu, có giờ chuẩn bị và giờ nói cố định, nên cần quen nhịp thời gian.

## 2. Đề thi và phần đã làm

| Câu  | Dạng                               | Thời gian           | Có ở đây |
| ---- | ---------------------------------- | ------------------- | -------- |
| 1–2  | Đọc to đoạn văn                    | 45 s chuẩn bị, 45 s | ✓        |
| 3–4  | Tả tranh                           | 45 s, 30 s          | –        |
| 5–7  | Trả lời câu hỏi                    | 15 s, 15 s, 30 s    | ✓        |
| 8–10 | Trả lời dựa trên thông tin cho sẵn | 15 s, 15 s, 30 s    | ✓        |
| 11   | Nêu quan điểm                      | 45 s chuẩn bị, 60 s | ✓        |

## 3. Cách làm

- Trang `/toeic-speaking` (chỉ gói tiếng Anh), ba thẻ:
  - **Đọc to**: một lượt hai đoạn (thông báo thư viện, nhà ga, tổng đài nhà hàng, bản tin thời tiết), mỗi đoạn
    40–70 từ, ghi âm tối đa 45 giây, có nút nghe đọc mẫu và mẹo ngắt nghỉ, ngữ điệu liệt kê.
  - **Trả lời câu hỏi**: một bộ phỏng vấn qua điện thoại (mua sắm, tập thể dục, du lịch), ba câu được đọc lên,
    ghi âm 15 / 15 / 30 giây.
  - **Trả lời dựa trên thông tin** (thêm 09/11/2026): một lịch trình hiện trên màn hình (hội nghị, lịch phỏng
    vấn, tour tham quan) và lời người gọi; ba câu hỏi được đọc lên, ghi âm 15 / 15 / 30 giây. Lịch luôn nằm trên
    màn hình trong lúc trả lời; mỗi bộ có một mục bị huỷ hoặc dời để luyện cách báo tin không như ý.
  - **Nêu quan điểm**: một đề, được đọc lên, ghi âm 60 giây.
- Câu hỏi có câu trả lời mẫu gập sẵn (dùng lại `SampleAnswer` của IELTS, thêm nhãn riêng), tô một cụm đáng học.
- Không chấm điểm; xong một dạng +10 XP, ghi `toeic-speaking`. Lộ trình tiếng Anh cấp 5 (TOEIC) thêm bước
  "TOEIC Speaking" (3 lượt).

## 4. Dev

- Dữ liệu trong `lib/toeicSpeaking.ts`. Test kiểm độ dài đoạn đọc, thời gian 15/15/30, cụm tô nằm trong câu
  mẫu, mẫu nêu quan điểm từ 70 từ.
- Đoạn đọc, câu hỏi và câu mẫu có trong `scripts/audio-texts/screens.json` để thu giọng.

## 5. Tiếp theo

1. Phần Viết của TOEIC (viết câu theo tranh, trả lời email).
