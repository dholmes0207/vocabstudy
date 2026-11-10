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

- 24 cụm ban đầu, chia 4 chủ đề (6 cụm mỗi chủ đề): đời sống hằng ngày, học hành thi cử, công việc tiền bạc, xã hội
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

## 4. Tiếng Trung (09/11/2026)

- Người Việt cũng dịch từng chữ sang tiếng Trung, nhất là động từ đi với danh từ: "uống thuốc" → 喝药 (đúng là
  吃药), "đội mũ" → 穿帽子 (đúng là 戴帽子), "kiếm tiền" → 找钱 (找钱 là "thối tiền", đúng là 挣钱), "đánh đàn" → 打吉他
  (đúng là 弹吉他), "tham gia kỳ thi" → 加入考试 (đúng là 参加考试).
- 17 cụm, 3 chủ đề: đời sống, học tập và công việc, sở thích và thể thao. Mỗi cụm có pinyin của cách đúng, câu chữ
  Hán có chỗ trống, lý do bằng tiếng Việt. Phương án sai đầu tiên là cách dịch từng chữ.
- Cùng trang `/collocations`, dữ liệu theo gói (`COLLOCATION_PACKS` trong `lib/collocations.ts`). Lộ trình tiếng
  Trung, cấp 3 (HSK 2) thêm bước "Kết hợp từ" sau "Bẫy Hán Việt".
- Chỗ dễ nhập nhằng đã tránh: 喝药 vẫn dùng cho thuốc nước nên câu hỏi nói rõ thuốc viên (每次两片); 玩 không dùng
  làm phương án cho bóng rổ, ghi-ta vì văn nói vẫn có người nói vậy.

## 5. Thêm chủ đề sức khoẻ, công nghệ, du lịch (09/11/2026)

- Tiếng Anh thêm 18 cụm, lên 42 cụm trong 7 chủ đề. Mỗi chủ đề đều nhắm vào lỗi dịch từng chữ quen thuộc: bị cảm →
  "I was cold" (đúng: caught a cold), thức khuya → "wake up late" (nghĩa ngược hẳn: dậy muộn), up ảnh → "up a photo"
  (đúng: post a photo), hết pin → "out of pin", bắt wifi → "catch the wifi", ngồi xe buýt → "sit the bus" (đúng:
  take the bus), trả phòng → "return the room" (đúng: check out).
- Những từ cũng đúng không được đưa vào phương án: start the computer, sit up late, ride the bus, join a network.

## 6. Dạng "Câu nào tự nhiên hơn?" (10/11/2026)

- Lượt luyện xen kẽ hai dạng. Câu lẻ vẫn là điền chỗ trống (1 trong 3 từ). Câu chẵn hiện hai câu đầy đủ: một câu dùng
  từ đúng, một câu dùng cách dịch từng chữ (bẫy đầu tiên), ví dụ "Can you turn on the light?" và "Can you open
  the light?". Người học chọn câu nghe tự nhiên, giống lúc tự soát bài viết hoặc nghe người khác nói.
- Không thêm dữ liệu: câu sai dựng từ câu ví dụ và `traps[0]`. Áp dụng cho cả tiếng Anh lẫn tiếng Trung.
- Test kiểm hai dạng xen kẽ, câu đúng là câu ví dụ đã điền, câu còn lại là câu có bẫy dịch từng chữ.

## 7. Tiếp theo

1. Thêm cụm cho chủ đề còn ít (IELTS, sở thích tiếng Trung) khi có câu ví dụ chắc chắn, không bịa.
