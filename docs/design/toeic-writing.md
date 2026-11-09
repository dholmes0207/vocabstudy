# TOEIC Writing: trả lời email (09/11/2026)

**User**: "… luyện thi chứng chỉ… TOEIC, IELTS… ưu tiên tiếng Anh".

## 1. Người học

- Phần Viết của TOEIC 4 kỹ năng có 8 câu: viết câu theo tranh (1–5), trả lời email (6–7), bài luận nêu quan điểm
  (8). Trả lời email dễ mất điểm nhất vì người học viết trôi chảy nhưng quên một yêu cầu của đề ("hỏi HAI câu").
- Bài luận nêu quan điểm đã luyện được ở trang IELTS Task 2 (cùng dạng), nên làm trước phần email.

## 2. Cách làm

- Trang `/toeic-writing` (chỉ gói tiếng Anh): 3 email (phòng tập, cửa hàng điện tử, phòng nhân sự), mỗi email có
  phần hướng dẫn như đề thật (ask TWO questions and make ONE suggestion…) và một dòng nhắc yêu cầu bằng tiếng
  Việt.
- Khi viết, checklist tự đánh dấu: lời chào (Dear…), đủ số câu hỏi đề yêu cầu (đếm dấu ?), ít nhất 50 từ, lời kết
  (Best regards…). Những yêu cầu không đếm được bằng máy (đề xuất, vấn đề) hiện thành dòng nhắc để tự kiểm.
- Nộp thư (+10 XP, ghi `toeic-writing`) thì thư mẫu hiện ra để so; có thể xem thư mẫu trước nếu cần.
- Lộ trình tiếng Anh cấp 5 (TOEIC) thêm bước "TOEIC Writing: email" (2 lượt).

## 3. Dev

- Dữ liệu và `checkEmail` trong `lib/toeicWriting.ts` (dùng lại `wordCount` của IELTS). Test kiểm mọi thư mẫu
  qua checklist của chính nó.

## 4. Tiếp theo

1. Câu 1–5: viết một câu theo tranh với hai từ cho sẵn.
