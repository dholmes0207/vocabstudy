# Âm khó cho người Việt (`/sounds`)

**User** (mất gốc): "Tôi đọc theo dòng 'cách đọc' mà người nước ngoài vẫn không hiểu.
'ship' với 'sheep' tôi nghe như nhau."

**BA**:

- Một trang gồm 12 bài ngắn về những âm người Việt hay sai: /θ/, /ð/, âm cuối, /ʃ/–/s/,
  /iː/–/ɪ/, /æ/–/e/, /ʌ/–/æ/, /uː/–/ʊ/, walk–work, /l/–/n/, /r/, trọng âm.
- Mỗi bài: cách đặt lưỡi/môi, lỗi hay gặp, từ ví dụ bấm để nghe, cặp dễ nhầm.
- "Thử tai": phát ngẫu nhiên một từ trong cặp, người học chọn từ mình nghe được, có
  khen/động viên và đếm điểm. Không lưu điểm, không ảnh hưởng lịch ôn.
- Đầu trang giải thích cách đọc dòng "cách đọc" (VIẾT HOA = trọng âm, đ/d, ph/th, âm
  cuối) và nói thẳng giới hạn của nó: có khác biệt chữ Việt không ghi được.
- Lối vào: Luyện tập → "Âm khó cho người Việt".

**Dev**: nội dung ở `src/lib/sounds.ts`. Test bắt buộc mọi từ trong bài đều có trong
gói tiếng Anh, để hai từ của một cặp luôn phát bằng cùng một giọng thu sẵn; nếu một bên
là giọng máy, khác giọng sẽ lộ đáp án.

## Tiếng Trung và tiếng Hàn

**User** (người học tiếng Trung): "买 với 卖 tôi nghe như nhau, người bán không biết tôi muốn
mua hay bán." (người học tiếng Hàn): "사다 với 싸다 trên dòng cách đọc đều là xa-đa."

**BA**

- Cùng trang `/sounds`, cùng khuôn bài, mỗi gói có bộ bài riêng về chỗ người Việt hay sai:
  - Tiếng Trung, 9 bài:
    - thanh 2 – 3, thanh 3 – 4, thanh 1 – 2 (người Việt nghe được thanh nhưng hay lẫn các
      cặp này);
    - zh/ch/sh – z/c/s, j/q/x, vần -n – -ng, n – l;
    - ü, r.
  - Tiếng Hàn, 5 bài:
    - âm cuối (발/밤/방/밥: tiếng Việt không có âm cuối "l");
    - phụ âm thường, căng, bật hơi;
    - ㅓ – ㅗ, ㅡ – ㅜ;
    - ㄹ lúc là r, lúc là l.
- Bài nào có cặp từ thì có "Thử tai".
  - Tiếng Trung: lựa chọn hiện kèm pinyin, vì chỉ nhìn chữ Hán thì không biết thanh.
  - Hai từ đọc giống nhau trên dòng cách đọc (사다 / 싸다 đều là "xa-đa") thì không hiện, để
    khỏi rối.
- Chip từ hiện IPA với tiếng Anh, pinyin với tiếng Trung, cách đọc kiểu Việt với tiếng Hàn.
  Phần "Đọc dòng cách đọc thế nào?" chỉ dành cho tiếng Anh.
- Hành trình tuần đầu vẫn đưa người học tiếng Hàn tới bảng chữ Hangul và người học tiếng
  Trung tới trang Pinyin. "Âm khó" là bước của tiếng Anh.

**Dev**

- Bài nằm trong `SOUND_LESSONS[<mã gói>]` ở `src/lib/sounds.ts`, chữ tiếng Anh ở `LESSON_EN`.
- Test bắt buộc:
  - mọi từ có trong gói tương ứng;
  - mỗi cặp thanh điệu tiếng Trung chỉ khác thanh (cùng âm tiết).
- Tiếng Hàn: gói chỉ có 253 từ nên ít cặp tối thiểu; bài nào không tìm được cặp trong gói thì
  chỉ có từ để nghe. Muốn thêm cặp thì thêm từ vào gói trước.
