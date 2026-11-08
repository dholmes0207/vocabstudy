# Thành ngữ tiếng Anh (08/11/2026)

**User**: "đi sâu vào tính năng học tập… luyện thi chứng chỉ… ưu tiên tiếng Anh… tạo hứng thú, hấp dẫn
khi học".

## 1. Người học

- Thành ngữ ("a piece of cake", "break the ice") làm câu nói tự nhiên; tiêu chí Lexical Resource của IELTS
  Speaking chấm điểm cho cách dùng từ thành ngữ đúng chỗ. Nhưng dịch từng chữ thì sai nghĩa hoàn toàn.
- Nhiều câu có cặp tiếng Việt tương đương ("kill two birds with one stone" = một công đôi việc, "a blessing
  in disguise" = trong cái rủi có cái may), so sánh như vậy vừa vui vừa dễ nhớ.

## 2. Cách làm

- 20 thành ngữ thông dụng. Mỗi câu có nghĩa đen (dịch từng chữ, cho vui), nghĩa thật hoặc câu tiếng Việt
  tương đương, nghĩa tiếng Anh đơn giản và một câu ví dụ có bản dịch.
- **Trang** `/idioms` (chỉ gói tiếng Anh): thẻ từng câu với nút nghe, nghĩa đen, nghĩa thật, mở "Ví dụ".
- **Luyện 10 câu**, xen kẽ: _nghĩa là gì?_ (thấy câu và nghĩa đen, chọn 1 trong 4 nghĩa) và _từ nào còn
  thiếu?_ (một từ khoá bị che, có nghĩa làm gợi ý, chọn 1 trong 4 từ). XP như "Thành ngữ" tiếng Trung, ghi
  `idioms`.
- Lộ trình tiếng Anh, cấp 6 (IELTS) thêm bước "Thành ngữ tiếng Anh" (2 lượt).

## 3. Dev

- Dữ liệu và logic trong `lib/idiomsEn.ts`. Test kiểm từ khoá xuất hiện đúng một lần trong câu, câu ví dụ
  chứa thành ngữ (động từ đầu có thể đổi dạng), không trùng câu, từ khoá, nghĩa; lượt chơi không lặp câu.
- Thành ngữ và câu ví dụ có trong `scripts/audio-texts/screens.json` để thu giọng.
