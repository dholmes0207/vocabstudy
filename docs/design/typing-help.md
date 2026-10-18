# Gõ chữ Hàn, chữ Trung khi chưa có bàn phím

**User**: "Học tiếng Trung hay tiếng Hàn mà bàn phím tiếng Việt bình thường không gõ được,
thì phải làm sao?"

Người học gặp chuyện này ở 3 chỗ phải gõ:

- **Nghe – chép**: chép theo câu ví dụ, theo truyện hoặc theo bài ngữ pháp.
- **Câu "Gõ từ còn thiếu"** trong ôn tập, xuất hiện khi thẻ đã ở hộp 4 trở lên
  (`reviewModeFor`). Câu "Nghe và gõ lại từ" không xuất hiện với tiếng Hàn và tiếng Trung, vì
  `reviewModeFor` chỉ đếm chữ a–z.
- **Tự đặt câu** trên thẻ làm quen và trong Tra từ.

Trên máy tính còn một bẫy riêng: nếu Unikey/EVKey đang bật kiểu gõ Telex, bính âm bị đổi chữ
("zhongguo" thành "zhôngguo", "w" thành "ư").

**BA**

1. **Hướng dẫn thêm bàn phím, ngay dưới ô gõ.**
   - Dưới ô gõ có dòng "Chưa gõ được chữ Hàn?" (hoặc "chữ Hán"). Bấm vào sẽ mở các bước thêm
     bàn phím, cho các loại máy: Android, iPhone/iPad, Windows, Mac, Linux.
   - Mặc định mở đúng loại máy đang dùng, đoán theo user agent. iPad báo mình là Mac có màn
     cảm ứng, nên vẫn nhận ra được.
   - Kèm một dòng cho biết gõ thế nào:
     - tiếng Hàn: bàn phím tự ghép ㅎ + ㅏ + ㄴ thành 한;
     - tiếng Trung: gõ bính âm không dấu rồi chọn chữ.
   - Trên máy tính có thêm lời nhắc tắt Unikey/EVKey trước khi gõ.
   - Có ghi chú "Tên mục có thể hơi khác tuỳ phiên bản máy", vì tên menu đổi theo bản hệ
     điều hành. Các bước viết từ hiểu biết chung **[PRIOR]**, chưa đối chiếu trên từng máy.
   - Tiếng Anh không có dòng này, vì bàn phím ai cũng có đã gõ được tiếng Anh.
2. **"Làm không cần gõ"**, cạnh dòng hướng dẫn ở Nghe – chép và câu Gõ từ còn thiếu.
   - **Nghe – chép**: ô gõ đổi thành các thẻ chữ xáo trộn; người học nghe rồi chạm thẻ theo
     đúng thứ tự.
     - Dùng lại `BuildTiles`, giống phần luyện ngữ pháp và mẫu câu.
     - Câu tiếng Trung có đánh dấu ranh giới từ (U+200B, như câu truyện và câu ví dụ) được
       chia theo từ.
     - Câu ví dụ ngữ pháp tiếng Trung không đánh dấu nên được chia theo chữ. Dấu câu gắn vào
       chữ bên cạnh.
     - Mỗi lần chạm sai trừ nửa thẻ, giống một từ gõ thừa. Câu 4 thẻ nhầm 1 lần vẫn đạt (88%),
       nhầm 2 lần thì chưa đạt.
   - **Ôn tập**: câu "Gõ từ còn thiếu" đổi thành "Chọn từ hợp với chỗ trống", vẫn giữ nguyên
     câu có chỗ trống. Câu "Nghe và gõ lại từ" (nếu có) đổi thành "Chọn từ đúng với nghĩa".
     Kết quả vẫn ghi vào lịch ôn như thường.
   - Có dòng "Đang làm không cần gõ. **Gõ bằng bàn phím**" để quay lại cách gõ.
   - Lựa chọn này lưu **riêng từng ngôn ngữ, trên từng máy**: điện thoại có thể đã có bàn
     phím Hàn, còn máy tính ở cơ quan thì chưa.
   - "Tự đặt câu" chỉ có phần hướng dẫn, không có cách làm không cần gõ, vì câu tự đặt phải
     do người học gõ ra.

Không làm:

- **Bàn phím chữ Hàn trên màn hình.** Điện thoại nào cũng có sẵn bàn phím Hàn miễn phí, nên
  hướng dẫn cài là đủ.
- **Chấp nhận đáp án gõ bằng bính âm**: ban đầu chưa làm, nay đã làm. Xem `pinyin-input.md`.

**Dev**

- `lib/keyboardHelp.ts`: `deviceOf(ua, touchPoints)`, `keyboardGuide(code)` (chỉ có `ko` và
  `zh`), `VIETNAMESE_IME_NOTE`.
- `store/noTypingStore.ts`: khoá `vocab.notyping.v1`, dạng `{ langs: { ko: true } }`.
  - `useNoTyping()` chỉ trả `true` khi gói hiện tại có hướng dẫn bàn phím.
  - Khoá bắt đầu bằng `vocab.` nên nằm trong file sao lưu.
- `components/KeyboardHelp.tsx`: `KeyboardHelp({ canSkip })` và `NoTypingNote`.
- `QuizRunner`:
  - Khi `noTyping`, đổi câu `fill` thành `context` và `spell` thành `vi-to-en` bằng
    `makeQuestion`, với nguồn đáp án nhiễu là `wordsById`. Mọi chỗ gọi đều truyền cả gói từ.
  - Đổi lúc hiển thị, giống `listenPause`, nên bật giữa buổi cũng có tác dụng ngay.
- `Dictation.tsx`:
  - `dictationTiles(text)` chia câu thành thẻ.
  - `tileScore(tiles, mistakes)` tính điểm.
  - Thẻ xáo một lần cho mỗi câu (`useMemo` theo `idx`).
- Test:
  - `lib/keyboardHelp.test.ts`, `lib/dictation.test.ts`;
  - `QuizRunner.test.tsx`: tiếng Anh không có hướng dẫn; với tiếng Hàn, câu điền từ đổi thành
    câu chọn và quay lại được;
  - `features/dictation/Dictation.test.tsx`: chép bằng thẻ, nhầm 1 lần vẫn đạt.
