# Bộ thủ

**User**: "Thêm vài ý tưởng cho tiếng Trung."

Người Việt học chữ Hán có hai chìa khoá: âm Hán Việt (đã có ở `/han-viet`) và bộ thủ. Biết 氵 là
bộ "thuỷ" (nước) thì đoán được 洗 (rửa), 河 (sông), 游泳 (bơi), 酒 (rượu) đều dính tới nước. Biết
讠 là "ngôn" (lời nói) thì 说, 话, 语, 读 đều liên quan tới nói, đọc.

**BA**

- Màn mới **"Bộ thủ"** (`/radicals`), chỉ cho gói tiếng Trung, nằm trong trang Luyện tập.
- 41 bộ thủ hay gặp. Mỗi thẻ có:
  - bộ thủ như khi nằm trong chữ (亻, 氵, 扌…), kèm chữ gốc nếu khác (人, 水, 手…);
  - tên Hán Việt theo cách giáo viên Việt gọi (nhân đứng, ba chấm thuỷ, tài gảy…) và nghĩa;
  - các chữ trong gói chứa bộ đó. Mỗi chữ hiện kèm từ ngắn nhất dùng nó; chạm để nghe từ đó.
- Nút **"Đoán bộ thủ (10 câu)"**: hiện một chữ (và từ chứa nó), chọn bộ thủ đúng trong 4. Trả lời
  xong đọc từ lên, hiện tên và nghĩa của bộ. Cuối lượt cộng XP như các phần luyện nhanh khác.
  - Phương án sai không bao giờ là một bộ mà chữ đó cũng chứa (好 có cả 女 lẫn 子).

**Dev**

- `lib/radicals.ts`:
  - `RADICALS`: dữ liệu ghi tay. Mỗi bộ liệt kê các chữ chứa nó (giản thể); chữ không có trong gói
    thì không hiện.
  - `radicalTable(words, min = 2)`, `radicalQuiz(words, count, rand)`.
- Bộ 竹 ghi là 竹 chứ không ghi ⺮: ⺮ nằm trong khối "CJK Radicals Supplement", nhiều phông điện
  thoại không có nên hiện thành ô vuông. Cách viết ⺮ ghi trong phần nghĩa. 灬 gộp vào 火 vì là một
  bộ, tách ra thì bài đoán sẽ có hai đáp án đúng.
- `features/radicals/Radicals.tsx`; `lib/packContent.ts`: `'/radicals': ['zh']`; mục Luyện tập ở
  `features/practice/entries.ts`.
- Test: `lib/radicals.test.ts` (mỗi bộ có ít nhất 2 chữ trong gói tiếng Trung, không trùng, bài đoán
  chỉ có một đáp án đúng), `features/radicals/Radicals.test.tsx`.
