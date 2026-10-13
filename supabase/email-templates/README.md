# Email có thương hiệu và cấu hình gửi email

Mã nguồn đã sẵn sàng cho "Quên mật khẩu" (`docs/design/account.md`). Phần còn lại chỉ chủ
dự án làm được vì cần đăng nhập Supabase và DNS. Làm theo thứ tự dưới đây.

## 1. SMTP riêng (bắt buộc để email tới được người dùng thật)

SMTP mặc định của Supabase chỉ gửi tới thành viên trong project và bị giới hạn vài email
mỗi giờ. Muốn người dùng thật nhận được email đặt lại mật khẩu hay xác nhận đăng ký, cần
một dịch vụ gửi mail. Ví dụ dùng Resend (gói miễn phí 3.000 email/tháng):

1. Tạo tài khoản Resend.
2. Vào Domains → Add `vocastudy.app`.
3. Thêm các bản ghi DNS (SPF, DKIM) mà Resend đưa ra vào Cloudflare DNS, rồi chờ trạng
   thái Verified.
4. Vào API Keys → tạo key.
5. Mở Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP và điền:
   - Host `smtp.resend.com`, port `465`;
   - user `resend`, password là API key vừa tạo;
   - Sender email `no-reply@vocastudy.app`, Sender name `VocaStudy`.
6. Mở Authentication → Rate Limits và nâng "emails per hour" lên mức hợp lý, ví dụ 30.

## 2. Địa chỉ quay về

Mở Supabase → Authentication → URL Configuration:

- **Site URL**: `https://vocastudy.app`
- **Redirect URLs**: thêm `https://vocastudy.app/**`. Nếu muốn thử ở máy cục bộ, thêm cả
  `http://localhost:5199/**`.

Nếu thiếu Redirect URLs, link trong email sẽ quay về Site URL. App vẫn tự chuyển link đặt
lại mật khẩu tới `/reset-password`, nhưng tốt nhất vẫn nên thêm.

## 3. Mẫu email

Mở Supabase → Authentication → Emails → Templates:

| Mẫu            | Tiêu đề                                            | Nội dung              |
| -------------- | -------------------------------------------------- | --------------------- |
| Reset password | `Reset your VocaStudy password · Đặt lại mật khẩu` | `reset-password.html` |
| Confirm signup | `Confirm your email · Xác nhận email VocaStudy`    | `confirm-signup.html` |

Dán toàn bộ nội dung file, kể cả dòng chú thích đầu file. Cả hai mẫu đều song ngữ và lấy
logo từ `https://vocastudy.app/icons/icon-192.png`.

## 4. Kiểm tra

1. Trên `vocastudy.app/login`, bấm "Forgot password?" và nhập email của một tài khoản thử.
2. Mở email, bấm nút trong email. Trang "Set a new password" phải hiện ra.
3. Đặt mật khẩu mới, rồi đăng nhập lại bằng mật khẩu đó.
