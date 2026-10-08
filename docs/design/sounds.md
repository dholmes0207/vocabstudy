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
