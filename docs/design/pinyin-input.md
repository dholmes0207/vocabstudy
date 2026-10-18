# Gõ bính âm thay chữ Hán

**User**: "Học tiếng Trung mà máy chưa có bàn phím chữ Hán thì không gõ được."
`typing-help.md` đã có hướng dẫn thêm bàn phím và chế độ "Làm không cần gõ". Còn thiếu một
cách ở giữa: bàn phím nào cũng gõ được chữ Latin, nên cho người học viết đáp án bằng bính âm.

**BA**

- **Nghe – chép tiếng Trung**: ô gõ nhận chữ Hán hoặc bính âm. Gợi ý trong ô ghi rõ "chữ Hán
  hoặc bính âm".
  - Câu gõ chỉ có chữ Latin (không có chữ Hán) thì chấm theo bính âm của câu (`read`).
  - Cách ghép từ là tuỳ ý: "wo shi xuesheng", "woshixuesheng" và "wo3 shi4 xue2sheng"
    đều đúng.
  - Không tính dấu thanh, vì bàn phím tiếng Việt không gõ được ǎ. "ü" gõ bằng "v" hay "u"
    đều được.
  - Chấm theo từng từ bính âm. Từ gõ sai hiện màu vàng (thiếu), chữ gõ thừa bị gạch đi,
    giống khi chép tiếng Anh.
  - Dưới kết quả có dòng "Chấm theo bính âm, không tính dấu thanh. Gõ bằng chữ Hán để luyện
    cả mặt chữ."
  - Nếu đã mở gợi ý bính âm, mà gợi ý đó chính là đáp án, thì câu đúng cũng **không tính đạt**.
    App nói rõ lý do.
- **Câu "Gõ từ còn thiếu"** (ôn tập): gõ bính âm không dấu của từ là đúng, ví dụ `xiexie`
  cho 谢谢.
  - Sau khi trả lời, dòng khen kèm "Viết bằng chữ Hán: 谢谢", để mặt chữ vẫn hiện ra.
  - Chỉ áp dụng cho từ có chữ Hán. Cách đọc kiểu Việt của tiếng Hàn ("xa-ram") không được
    nhận là đáp án.

Giới hạn, nói thẳng với người học:

- Gõ bính âm chỉ chứng tỏ người học nghe ra âm, chưa chứng tỏ họ nhận ra mặt chữ.
- Không phân biệt được thanh điệu, cũng như từ đồng âm (shì 是/事). Câu điền từ có ngữ cảnh
  nên ít lẫn, và đáp án luôn hiện chữ Hán.

**Dev**

- `lib/pinyinInput.ts`:
  - `acceptsPinyin(code)` chỉ trả đúng với `zh`.
  - `isPinyinAnswer`: có chữ Latin, không có chữ Hán.
  - `plainPinyin`: bỏ dấu thanh, số thanh và mọi ký tự không phải chữ cái; đổi `v` và `ü`
    thành `u`.
  - `diffPinyin(read, typed)`: quy hoạch động (dãy con chung dài nhất), mỗi lần khớp ăn đúng
    số chữ cái của một từ bính âm. Chữ thừa liền nhau gộp thành một phần `extra`. Điểm tính
    bằng `dictationScore`, như khi chép thường.
  - `matchesPinyin(input, pinyin)` dùng cho câu điền từ.
- `lib/quiz.ts` `checkFillAnswer`: dạng chữ không khớp thì thử bính âm (`viRead`), chỉ khi
  từ có chữ Hán.
- `Dictation.tsx`: `result.pinyin = { peeked }`. Câu tính đạt khi điểm ≥ `DICTATION_PASS`
  và chưa xem gợi ý bính âm.
- Test: `lib/pinyinInput.test.ts`, `lib/quiz.test.ts`, `features/dictation/Dictation.test.tsx`.

**Bổ sung (19/10/2026)**: người học cần biết là có cách này.

- Màn mở đầu Nghe – chép tiếng Trung có dòng "Chưa có bàn phím chữ Hán? Gõ bính âm không dấu cũng
  được chấm."
- Phần hướng dẫn bàn phím chữ Hán (`KeyboardHelp`, trường `noKeyboard` của hướng dẫn tiếng Trung)
  có dòng: chưa cài được bàn phím thì cứ gõ bính âm không dấu vào ô.
- Tiếng Hàn chưa có cách tương tự, nên không có dòng này.
