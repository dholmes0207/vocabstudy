# Chữ dễ nhầm (tiếng Trung, 08/11/2026)

**User**: "đi sâu vào tính năng học tập… luyện thi chứng chỉ… ưu tiên tiếng Anh xong tiếng Trung".

## 1. Người học

- Tiếng Trung có nhiều chữ đọc y hệt nhau (在/再 đều là zài, 的/得/地 đều là de, 他/她/它 đều là tā) hoặc
  nhìn gần giống (买/卖, 已/以). Nghe không phân biệt được, nên người học hay viết nhầm, nhất là ở phần
  viết của HSK 3.
- Các bài ngữ pháp có nhắc từng chữ, nhưng chưa có chỗ đặt các chữ dễ nhầm cạnh nhau để so.

## 2. Cách làm

- 8 nhóm: 在/再, 的/得/地, 他/她/它, 做/坐, 会/回, 买/卖, 进/近, 已/以. Mỗi nhóm có pinyin và nghĩa từng chữ,
  một mẹo phân biệt (nhìn từ đứng sau, nhìn bộ thủ, nhớ từ ghép…), và 4–6 câu có một chỗ trống.
- **Luyện**: thấy câu có chỗ trống và nghĩa tiếng Việt, chọn chữ trong nhóm. Trả lời xong hiện cả câu, pinyin,
  nút nghe, nghĩa từng chữ và mẹo của nhóm. Trộn 10 câu (đủ các nhóm trước khi lặp nhóm) hoặc luyện riêng
  một nhóm. XP như bài lượng từ; đúng hết thì pháo giấy.
- Lộ trình tiếng Trung, cấp 4 (HSK 3) thêm bước "Chữ dễ nhầm" (3 lượt, ghi `confusables`).

## 3. Dev

- Dữ liệu và logic trong `lib/confusables.ts` (như `lib/measureWords.ts`, không cần tải file). Test kiểm
  tra mỗi chữ trong nhóm có ít nhất một câu, mỗi câu có đúng một chỗ trống, chữ đều có trong gói tiếng Trung.
- Trang `/confusables` (`features/confusables/`), chỉ cho gói tiếng Trung, mục trong trang Luyện tập.
  Câu đã điền chữ có trong `scripts/audio-texts/screens.json` để thu giọng.

## 4. Tiếng Anh: từ dễ nhầm (08/11/2026)

- Người Việt hay nhầm các cặp tiếng Anh mà tiếng Việt chỉ có một từ: "làm" (make/do), "nói" (say/tell),
  "mượn" (borrow/lend), "mang" (bring/take), "mất/lỡ" (lose/miss), "chán" (bored/boring), "nghe"
  (hear/listen), "vui" (fun/funny).
- Cùng trang `/confusables`, gói tiếng Anh có tên "Từ dễ nhầm" với 8 cặp trên (`lib/confusablesEn.ts`). Câu
  dùng dạng nguyên thể để chỗ trống nhận đúng từ trong cặp; viết để chỉ một từ là hợp. Không có dòng phiên âm.
- Dữ liệu chung một kiểu: câu là `text`, phiên âm `reading` chỉ có ở tiếng Trung. `CONFUSABLE_PACKS` chọn
  nhóm theo gói; `confusableRound` nhận nhóm của gói.
- Lộ trình tiếng Anh, cấp 3 thêm bước "Từ dễ nhầm" (2 lượt, ghi `confusables`).
