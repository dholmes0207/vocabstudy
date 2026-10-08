# Nhắc học mỗi ngày

**User**: "Tôi không lười, tôi chỉ quên. Tối về là quên mất phải mở app."

**BA**: không có máy chủ gửi thông báo đẩy, và thông báo của trình duyệt không reo khi
web đã đóng. Thứ reo đáng tin trên mọi điện thoại là **lịch** của chính máy. Vì vậy:

- Chọn giờ (mặc định 20:00) → "Lịch Google" (link tạo sẵn sự kiện) hoặc
  "iPhone / lịch khác (.ics)" (tải tệp, ứng dụng Lịch hỏi "Thêm").
- Sự kiện 10 phút, lặp mỗi ngày, có chuông đúng giờ, kèm link mở app.
- Giờ "trôi" theo máy (floating time): 20:00 vẫn là 20:00 khi đổi múi giờ.
- Trang chủ: thẻ Mục tiêu nhỏ có mục gập "🔔 Hay quên mở app?" cho tới khi người học
  đặt nhắc lần đầu; sau đó chỉnh lại ở Cài đặt → Học tập.

**Dev**: `src/lib/reminder.ts` (thuần, có test: RFC 5545, gập dòng 75 octet không cắt
chữ tiếng Việt, qua nửa đêm), `src/components/ReminderSetup.tsx`. Giờ đã đặt lưu ở
`localStorage['vocab.reminder']` — chỉ để biết đã đặt, không cần đồng bộ.
