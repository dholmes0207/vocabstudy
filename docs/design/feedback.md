# Góp ý trong app và cảm nhận người học có thật

**User**

- "Nút Góp ý chỉ mở email, mà nhiều người không dùng app email trên điện thoại."
- "Muốn có testimonial, nhưng chỉ dùng phản hồi thật."

**BA**

- Bấm "Góp ý" (trong menu tài khoản, trang "Có gì mới" hoặc footer) mở một form ngay
  trong app. Form gồm:
  - chấm sao 1–5 (tuỳ chọn);
  - nội dung, từ 10 đến 1.000 ký tự;
  - tên (tuỳ chọn, điền sẵn tên tài khoản);
  - ô **"Cho phép trích dẫn góp ý này kèm tên của tôi trên trang giới thiệu"**. Ô này
    không được tích sẵn và chỉ tích được khi đã nhập tên.
- Khách chưa có tài khoản cũng gửi được góp ý.
- Một góp ý chỉ hiện công khai khi đủ hai điều kiện:
  - người viết đã cho phép trích dẫn;
  - quản trị viên chọn hiện nó.
  - Không bao giờ dùng lời nhận xét tự bịa.
- Nếu chưa lưu được (chưa chạy lại `schema.sql`, hoặc máy chủ lỗi), form hiện nút gửi
  email thay thế.
- Chính sách bảo mật thêm hai chỗ:
  - mục dữ liệu "Góp ý bạn gửi trong app": cách trích dẫn và cách yêu cầu gỡ;
  - lý do sử dụng: đọc góp ý và trích dẫn khi người viết cho phép.
- Xoá tài khoản thì xoá luôn các góp ý gắn với tài khoản đó (cascade).
- **Đã có thêm:**
  - thẻ "Góp ý của học viên" trên trang Admin, có nút "Hiện trên trang chủ". Nút này chỉ
    hiện với góp ý mà người viết đã cho phép trích dẫn;
  - API công khai `GET /api/testimonials`;
  - mục "Người học nói gì" trên trang giới thiệu, **không hiện gì** cho tới khi có ít
    nhất một cảm nhận được chọn.

**Dev**

- `lib/feedback.ts` `checkFeedback` (thuần, có test) dùng chung cho trình duyệt và
  Function.
  - Chỉ cho phép trích dẫn khi có tên.
  - Điểm đánh giá ngoài 1–5 bị bỏ.
  - Đường dẫn trang không giữ query.
- `functions/api/feedback.ts` (`POST`):
  - chặn Origin lạ, body tối đa 4 KB;
  - gắn tài khoản nếu request có token;
  - gọi RPC `submit_feedback` (chỉ `service_role`; từ chối khi có hơn 30 góp ý trong 10
    phút để chống spam);
  - trả 503 `not_ready` khi bảng chưa có.
- `store/feedbackStore.ts` lưu trạng thái mở/đóng; `components/FeedbackDialog.tsx` được
  gắn ở `App`.
- `schema.sql`: bảng `feedback` bật RLS, không có policy nào.
- `functions/api/admin/feedback.ts`:
  - `GET` trả 50 góp ý mới nhất;
  - `PATCH` đổi trạng thái `featured`. Khi bật lên, câu lệnh có thêm điều kiện
    `allow_quote=eq.true`, nên server tự chặn góp ý chưa được phép trích dẫn.
- `functions/api/testimonials.ts` chỉ trả góp ý vừa `featured` vừa `allow_quote` (tối đa 6),
  cache 5 phút.
- `lib/testimonials.ts` `parseTestimonials`; `features/marketing/Testimonials.tsx`.
