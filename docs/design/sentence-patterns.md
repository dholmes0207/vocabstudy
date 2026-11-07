# Cấu trúc câu (08/11/2026)

**User**: "Level học từ, xong học thì, cấu trúc câu, luyện nói, luyện nghe…" Cấu trúc câu là cấp 3 của
lộ trình theo cấp (`docs/design/learning-path.md`).

## 1. Người học

- Người Việt hay dịch từng chữ nên câu sai trật tự: "On the table has a cat", "I drink every day
  coffee", "Where you live?", "a car red".
- Bài ngữ pháp giải thích từng điểm, nhưng chưa có chỗ nào cho thấy cả khung câu một lúc.

## 2. Cách làm

- Câu được chia thành **khối** theo vai: chủ ngữ, động từ, tân ngữ, bổ ngữ, nơi chốn, thời gian, từ hỏi,
  trợ động từ, từ nối, trạng từ tần suất. Mỗi vai một màu, dùng giống nhau ở mọi nơi.
- 8 kiểu câu, mỗi kiểu có khung (dãy khối màu), 2 dòng giải thích bằng tiếng Việt kèm lỗi hay gặp, và
  4 câu luyện:
  1. Chủ ngữ + động từ + tân ngữ.
  2. Chủ ngữ + be + bổ ngữ (tiếng Việt không cần "là", tiếng Anh cần be).
  3. There is / There are + danh từ + nơi chốn.
  4. Trạng từ tần suất đứng trước động từ (sau be).
  5. Câu hỏi Wh-: từ hỏi + trợ động từ + chủ ngữ + động từ.
  6. Hai mệnh đề nối bằng and / but / because / so.
  7. Nơi chốn trước, thời gian sau.
  8. Tính từ đứng trước danh từ.
- **Luyện**: thấy nghĩa tiếng Việt và khung câu (các ô trống có tên vai và màu). Khối ở dưới để màu
  trung tính, nên người học phải tự nghĩ khối nào là chủ ngữ, khối nào là nơi chốn. Xếp đúng thì khối lắp
  vào ô và đổi màu; sai thì rung. Xếp xong câu được đọc lên. Câu không sai lần nào được ⭐ và +3 XP.
- Hai cách luyện: trộn 6 câu của 6 kiểu khác nhau, hoặc luyện riêng một kiểu.

## 3. Dev

- `public/data/patterns/en.json`, kiểm tra khi tải (`validatePatterns`, `lib/patterns.ts`); test kiểm tra
  mỗi câu đi đúng khung của kiểu câu (đúng thứ tự vai).
- Trang `/patterns` (`features/patterns/`), mục trong trang Luyện tập, chỉ cho gói tiếng Anh; service
  worker tải sẵn file. Lượt xong ghi `patterns` vào `activityStore`; cấp 3 của lộ trình thêm bước "Cấu
  trúc câu" (3 lượt). Câu luyện có trong `scripts/audio-texts/screens.json` để thu giọng.
