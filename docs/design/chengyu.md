# Thành ngữ tiếng Trung (成语, 08/11/2026)

**User**: "đi sâu vào tính năng học tập… luyện thi chứng chỉ… ưu tiên tiếng Anh xong tiếng Trung… tạo
hứng thú, hấp dẫn khi học".

## 1. Người học

- Thành ngữ bốn chữ có mặt khắp nơi trong tiếng Trung (phim, báo, bài đọc HSK 3 trở lên) và khó đoán với
  người học nước khác. Người Việt thì có lợi thế: nhiều câu đã quen qua âm Hán Việt (半信半疑 = bán tín bán
  nghi, 一举两得 = nhất cử lưỡng đắc), số khác có câu tiếng Việt tương đương (守株待兔 = ôm cây đợi thỏ).
- Các câu có chuyện kể đằng sau (vẽ rắn thêm chân, đàn gảy tai trâu, ếch ngồi đáy giếng) dễ nhớ và vui.

## 2. Cách làm

- 23 thành ngữ thông dụng. Mỗi câu có pinyin (đã đổi thanh của 一 và 不), âm Hán Việt từng chữ, nghĩa hoặc
  câu tiếng Việt tương đương, một câu ví dụ có pinyin và nghĩa; 6 câu có chuyện kể ngắn.
- **Trang**: thẻ từng thành ngữ với nút nghe, âm Hán Việt tô màu, mở "Ví dụ & chuyện kể".
- **Luyện 10 câu**, xen kẽ hai dạng, mỗi câu một thành ngữ khác nhau:
  - _Nghĩa là gì?_ Thấy chữ, pinyin, âm Hán Việt; chọn 1 trong 4 nghĩa.
  - _Chữ nào còn thiếu?_ Một chữ bị che cùng âm Hán Việt của nó (守株待＿ · thủ chu đãi ＿), có nghĩa
    làm gợi ý; chọn 1 trong 4 chữ, mỗi chữ kèm âm Hán Việt. Chữ sai lấy từ các thành ngữ khác, không trùng
    chữ nào của câu đang hỏi.
  - Trả lời xong hiện cả câu, nút nghe, ví dụ và chuyện kể. XP như "Chữ dễ nhầm"; đúng hết thì pháo giấy.
- Lộ trình tiếng Trung, cấp 4 (HSK 3) thêm bước "Thành ngữ bốn chữ" (2 lượt, ghi `chengyu`).

## 3. Dev

- Dữ liệu và logic trong `lib/chengyu.ts` (như `lib/confusables.ts`). Test kiểm mỗi câu đủ 4 chữ, 4 âm
  pinyin và 4 âm Hán Việt, ví dụ có chứa thành ngữ, nghĩa không trùng nhau; lượt chơi không lặp thành ngữ
  và phương án sai không trùng chữ của câu hỏi.
- Trang `/chengyu` (`features/chengyu/`), chỉ cho gói tiếng Trung, mục trong trang Luyện tập. Thành ngữ
  và câu ví dụ có trong `scripts/audio-texts/screens.json` để thu giọng. E2E ở `e2e/practice-pages.spec.ts`.

## 4. Tiếp theo

1. Thêm thành ngữ mức HSK 4–5 và dạng "chọn thành ngữ hợp với câu".
