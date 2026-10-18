# Chữ Hán qua âm Hán Việt

**User**: "Cải thiện thêm phần học tiếng Trung."

Thẻ từ đã có mục "Cùng chữ Hán Việt" (`chinese.md`): học 学生 thì thấy 学 còn có trong 学校 và
学习. Nhưng mục đó chỉ hiện khi người học đang xem đúng một từ. Chưa có chỗ nào cho thấy toàn bộ
"chìa khoá": những chữ dùng chung nhiều nhất trong gói, và chúng đọc thế nào theo âm Hán Việt.

**BA**

- Màn mới **"Chữ Hán qua âm Hán Việt"** (`/han-viet`) nằm trong trang Luyện tập.
  - Với gói tiếng Hàn, màn đổi tên thành **"Gốc Hán qua âm Hán Việt"**: 학 là "học" trong 학생 và
    학교.
- Danh sách gồm mọi chữ (với tiếng Hàn là khối âm tiết) xuất hiện trong **ít nhất hai từ** của
  gói và có cùng âm Hán Việt.
  - Chữ dùng trong nhiều từ nhất đứng đầu.
  - Mỗi thẻ có chữ (chạm để nghe), âm Hán Việt viết hoa, số từ, và các từ chứa chữ đó: chữ, cách
    đọc, nghĩa, âm Hán Việt cả từ. Chạm một từ để nghe.
- **Tìm kiếm**:
  - theo chữ (学);
  - theo âm Hán Việt, có dấu hay không dấu đều được (học, hoc, HỌC), kể cả khi mới gõ phần đầu;
  - theo một từ (gõ 学校 thì ra thẻ 学).
- Không thêm dữ liệu mới: danh sách dựng hoàn toàn từ trường `hanViet` của các từ, giống mục "Cùng
  chữ Hán Việt". Gói càng có nhiều từ thì danh sách càng dài.

**Dev**

- `lib/hanVietFamily.ts` thêm:
  - `hanVietTable(words, min = 2)`, dùng lại `familyIndex` (có cache);
  - `searchHanViet(table, query)`;
  - `foldVi()` (bỏ dấu, đổi `đ` thành `d`).
- `features/hanviet/HanVietTable.tsx`.
- `lib/packContent.ts`: `'/han-viet': ['zh', 'ko']`. Mục trong trang Luyện tập nằm ở
  `features/practice/entries.ts`.
- Test: `lib/hanVietFamily.test.ts`, `features/hanviet/HanVietTable.test.tsx`.

## Đoán nghĩa nhờ Hán Việt (19/10/2026)

Danh sách cho người học xem các "chìa khoá". Phần này cho họ **dùng** chìa khoá để mở một từ mới.

**BA**

- Trên trang có nút **"Đoán nghĩa nhờ Hán Việt (10 câu)"**.
- Mỗi câu:
  - Hiện một từ, ví dụ 学校, kèm âm Hán Việt của cả từ (HỌC HIỆU).
  - Với mỗi chữ cũng có trong một từ khác, hiện một gợi ý, ví dụ "学 = học, như trong 学生 (học
    sinh, sinh viên)".
  - Chọn nghĩa đúng trong 4 nghĩa. Trả lời xong thì đọc từ đó lên và hiện cách đọc cùng nghĩa.
- Chỉ hỏi những từ có từ hai chữ trở lên, trong đó ít nhất một chữ dùng chung với từ khác, để lúc
  nào cũng có đường suy luận.
- Cuối lượt cộng XP như các phần luyện nhanh khác. Kết quả không ghi vào lịch ôn.
- Gói tiếng Hàn cũng dùng được, với khối âm tiết (학 = học, như trong 학생).

**Dev**

- `lib/hanVietFamily.ts`: `hanVietQuiz(words, count)` trả về `{ word, clues, options, answer }`;
  `clues` lấy từ `familyIndex`.
- `features/hanviet/HanVietTable.tsx`: `GuessRound` dùng `GameShell` và `GameResult`.
