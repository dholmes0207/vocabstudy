# Bẫy Hán Việt (09/11/2026)

**User**: "… ưu tiên tiếng Anh xong tiếng Trung… tạo hứng thú, hấp dẫn khi học".

## 1. Người học

- Âm Hán Việt là lợi thế lớn của người Việt khi học chữ Hán (trang "Âm Hán Việt", "Thành ngữ" dựa vào điều
  này). Nhưng có những từ mà âm Hán Việt dẫn sai hướng: 大家 đọc "đại gia" mà nghĩa là "mọi người", 便宜 đọc
  "tiện nghi" mà nghĩa là "rẻ", 告诉 đọc "cáo tố" mà nghĩa là "nói cho biết".
- Người học hay đoán theo âm Hán Việt rồi nhầm, nên cần một chỗ gom các "bẫy" này lại cho dễ nhớ.

## 2. Cách làm

- 20 từ thông dụng (phần lớn HSK 1–3). Mỗi từ có pinyin, âm Hán Việt từng chữ, nghĩa "bẫy" mà âm Hán Việt gợi
  ra, nghĩa thật trong tiếng Trung hiện đại, và một câu ví dụ có pinyin, nghĩa.
- **Trang** `/han-viet-traps` (chỉ gói tiếng Trung): thẻ từng từ, nghĩa bẫy gạch ngang, nghĩa thật in đậm, mở
  "Ví dụ".
- **Luyện 10 câu**: thấy từ (chữ, pinyin, Hán Việt), chọn nghĩa trong 4 phương án: nghĩa thật, nghĩa bẫy và
  nghĩa của 2 từ khác. Chọn trúng bẫy thì báo "Dính bẫy Hán Việt rồi!" và giải thích vì sao. XP như "Thành ngữ",
  ghi `hanviet-traps`.
- Lộ trình tiếng Trung cấp 3 (HSK 2) thêm bước "Bẫy Hán Việt" (2 lượt).

## 3. Dev

- Dữ liệu và logic trong `lib/hanVietTraps.ts`. Test kiểm số âm Hán Việt bằng số chữ, nghĩa bẫy khác nghĩa
  thật, ví dụ chứa từ, nghĩa không trùng; lượt chơi luôn có nghĩa bẫy và nghĩa thật trong 4 phương án khác nhau.
- Từ và câu ví dụ có trong `scripts/audio-texts/screens.json` để thu giọng.
