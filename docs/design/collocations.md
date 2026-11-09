# Kết hợp từ tiếng Anh (Collocations, 09/11/2026)

**User**: "đi sâu vào tính năng học tập… luyện thi chứng chỉ… ưu tiên tiếng Anh xong tiếng Trung… tạo
hứng thú, hấp dẫn khi học".

## 1. Người học

- Người Việt hay dịch từng chữ khi nói và viết tiếng Anh: "mở đèn" → open the light, "uống thuốc" → drink
  medicine, "giá đắt" → expensive price, "tiếp thu kiến thức" → learn knowledge. Câu vẫn hiểu được nhưng lộ
  ngay là không tự nhiên.
- IELTS chấm phần này trong tiêu chí Lexical Resource: dùng đúng collocation (raise awareness, pose a threat,
  play a role) là dấu hiệu của band 7.
- Trang "Từ dễ nhầm" đã có make/do, say/tell; trang này rộng hơn: từ nào đi với từ nào theo chủ đề.

## 2. Cách làm

- 24 cụm, chia 4 chủ đề (6 cụm mỗi chủ đề): đời sống hằng ngày, học hành thi cử, công việc tiền bạc, xã hội
  môi trường (IELTS). Mỗi cụm có cụm tiếng Việt, cách nói đúng, cách dịch từng chữ (gạch đi), một câu có chỗ
  trống và lý do bằng tiếng Việt.
- **Trang**: theo chủ đề, mỗi thẻ có nút nghe cụm đúng, ✓ cách đúng, ✗ cách dịch từng chữ.
- **Luyện**: 10 câu trộn mọi chủ đề, hoặc luyện riêng một chủ đề. Thấy cụm tiếng Việt và câu có chỗ trống,
  chọn 1 trong 3 từ: từ đúng, từ dịch từng chữ (bẫy chính), và một từ sai khác. Trả lời xong: câu đầy đủ (nghe
  được), ✓/✗, lý do. XP như "Thành ngữ tiếng Anh"; đúng hết thì pháo giấy.
- Phương án sai phải chắc chắn sai trong câu đó. Khi một từ khác cũng đúng (make money bên cạnh earn money,
  solve bên cạnh tackle), từ đó không được đưa vào phương án và lý do nhắc tới nó.
- Lộ trình tiếng Anh, cấp 4 (A2–B1) thêm bước "Kết hợp từ" (2 lượt, ghi `collocations`) sau "Cụm động từ".

## 3. Dev

- Dữ liệu và logic trong `lib/collocations.ts` (như `lib/idiomsEn.ts`). Test kiểm mỗi chủ đề có ít nhất 5 cụm,
  câu có đúng một chỗ trống, 3 phương án khác nhau, cụm tiếng Việt không trùng; lượt chơi không lặp, đáp án
  luôn nằm trong phương án; lọc theo chủ đề.
- Trang `/collocations` (`features/collocations/`), chỉ cho gói tiếng Anh, mục trong trang Luyện tập. Cụm đúng
  và câu đã điền có trong `scripts/audio-texts/screens.json` để thu giọng. E2E ở `e2e/practice-pages.spec.ts`.

## 4. Tiếp theo

1. Thêm chủ đề: sức khoẻ, công nghệ, du lịch (mỗi chủ đề 6 cụm).
2. Dạng ngược: thấy câu tiếng Anh có collocation sai, tìm và sửa.
