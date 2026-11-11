# Cụm động từ tiếng Anh (phrasal verbs, 08/11/2026)

**User**: "đi sâu vào tính năng học tập… luyện thi chứng chỉ… ưu tiên tiếng Anh… tạo hứng thú, hấp dẫn
khi học".

## 1. Người học

- Cụm động từ (give up, turn off, pick up…) xuất hiện dày đặc trong hội thoại và đề TOEIC, IELTS, nhưng người
  học hay học vẹt từng cụm như từ mới riêng lẻ.
- Mẹo dễ nhớ hơn: tiểu từ phía sau có nghĩa riêng (up = lên, tới cùng; off = rời đi, tắt; back = trở lại).
  Nắm nghĩa tiểu từ thì đoán được cả cụm, kể cả cụm chưa gặp.

## 2. Cách làm

- 6 tiểu từ ban đầu: up, out, off, on, down, back (đợt 2 thêm over, away). Mỗi tiểu từ có một dòng "nghĩa thường thêm vào" và 5 cụm, mỗi cụm có
  nghĩa tiếng Việt, nghĩa tiếng Anh đơn giản, một câu có chỗ trống và bản dịch.
- Câu được viết để chỉ một tiểu từ trong 6 là hợp (ví dụ "It’s so dark in here — can you turn ＿ the light?"
  chỉ hợp với on), tránh các câu mà tiểu từ khác cũng đúng (put off / put back, call back / call up).
- **Luyện**: thấy câu và bản dịch, chọn 1 trong 6 tiểu từ. Trả lời xong có nút nghe cả câu, cụm và nghĩa, cùng
  nghĩa của tiểu từ. Trộn 12 câu (đều 2 câu mỗi tiểu từ) hoặc luyện riêng một tiểu từ. XP như "Chữ dễ nhầm".
- Lộ trình tiếng Anh, cấp 4 (A2–B1) thêm bước "Cụm động từ" (3 lượt, ghi `phrasal`).

## 3. Dev

- Dữ liệu và logic trong `lib/phrasalVerbs.ts` (như `lib/confusables.ts`). Test kiểm mỗi câu có đúng một chỗ
  trống, tiểu từ của cụm khớp nhóm, cụm không trùng, lượt trộn chia đều các tiểu từ.
- Trang `/phrasal-verbs` (`features/phrasal/`), chỉ cho gói tiếng Anh, mục trong trang Luyện tập. Câu đã điền
  tiểu từ có trong `scripts/audio-texts/screens.json` để thu giọng.

## 4. Đợt 2: thêm over, away (10/11/2026)

- Thêm 2 tiểu từ hay gặp trong TOEIC Part 5–6, mỗi tiểu từ 5 cụm: **over** (take over, look over, get over, think
  over, go over) và **away** (give away, throw away, run away, pass away, put away). Tổng cộng 8 tiểu từ, 40 cụm.
- Nhiều tiểu từ hơn thì dễ có câu điền được hai đáp án: "turn ＿ your phones" nhận cả off lẫn over, "throw ＿
  those boxes" nhận cả away lẫn out. Mỗi cụm nay có `alsoFits` ghi các tiểu từ khác cũng đúng ở câu đó; các
  tiểu từ này không bao giờ được đưa ra làm phương án sai.
- Mỗi câu chỉ đưa 4 phương án (đáp án và 3 tiểu từ chắc chắn sai) thay vì tất cả, gọn hơn trên điện thoại. Test
  kiểm 4 phương án khác nhau, có đáp án và không chứa tiểu từ nào trong `alsoFits`.

## 5. Tiếp theo

1. Thêm tiểu từ in, through khi viết được câu chỉ nhận đúng một tiểu từ (in hay trùng nghĩa với out, on: fill
   in/out, give in/up).
