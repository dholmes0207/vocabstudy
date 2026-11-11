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

## 2b. Tiếng Trung (08/11/2026)

- Người Việt học tiếng Trung hay giữ trật tự tiếng Việt: "我去北京明天", "我学习在学校", "天气是冷",
  "你哪儿去", "他比我很高", "我把作业做".
- 7 khung câu HSK 1–3, mỗi khung 4 câu, mỗi câu có pinyin (hiện khi xếp xong) và nghĩa tiếng Việt:
  1. Thời gian đứng trước động từ.
  2. 在 + nơi chốn trước động từ.
  3. Tính từ làm vị ngữ với 很/太/非常, không dùng 是.
  4. Từ để hỏi giữ đúng chỗ câu trả lời, không thêm 吗.
  5. 想/会/能 + động từ.
  6. So sánh A 比 B + tính từ (không thêm 很).
  7. Câu chữ 把: sau động từ phải có kết quả.
- Hai vai mới: **cụm giới từ** (在学校, 比我, 把作业) và **phó từ** (很, 太, 非常). Chú thích màu chỉ
  hiện các vai mà gói đó dùng.
- Câu ghép không dấu cách, đọc bằng giọng tiếng Trung. Lộ trình tiếng Trung, cấp 3 (HSK 2) thêm bước
  "Cấu trúc câu" (3 lượt).

## 3. Dev

- `public/data/patterns/en.json` và `zh.json`, kiểm tra khi tải (`validatePatterns`, `lib/patterns.ts`;
  `PATTERN_PACKS` giữ đường dẫn, giọng đọc và cách ghép khối của từng gói); test kiểm tra mỗi câu đi đúng
  khung (đúng thứ tự vai), câu tiếng Trung chỉ có chữ Hán và có pinyin, thời gian/cụm giới từ đứng trước
  động từ, câu 把 có phần sau động từ.
- Trang `/patterns` (`features/patterns/`), mục trong trang Luyện tập, cho gói tiếng Anh và tiếng Trung; service
  worker tải sẵn file. Lượt xong ghi `patterns` vào `activityStore`; cấp 3 của lộ trình thêm bước "Cấu
  trúc câu" (3 lượt). Câu luyện có trong `scripts/audio-texts/screens.json` để thu giọng.
