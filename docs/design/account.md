# Tài khoản tự phục vụ và danh sách chờ beta

**User**

- "Quên mật khẩu thì phải nhắn admin, chờ người ta đặt lại giúp. App nào cũng có nút
  'Quên mật khẩu'."
- "Muốn xoá tài khoản cũng phải gửi email, nghe không chuyên nghiệp."
- "Đăng ký xong báo 'chờ quản trị viên duyệt', nghe như bị nghi ngờ."

**BA**

- **Quên mật khẩu**:
  - Ở trang đăng nhập có link "Quên mật khẩu?". Người dùng nhập email, hệ thống gửi link đặt
    lại.
  - Câu trả lời luôn giống nhau dù email có tồn tại hay không, để không lộ ai đã đăng ký.
  - Link mở `/reset-password`: nhập mật khẩu mới hai lần, xong thì vào app.
  - Link hết hạn hoặc đã dùng: báo rõ và có nút gửi link mới.
  - Gửi email thất bại: chỉ tới contact@vocastudy.app, không im lặng.
- **Đổi mật khẩu**: Cài đặt → Tài khoản → nhập mật khẩu mới hai lần.
- **Xoá tài khoản**:
  - Vào Cài đặt → Vùng nguy hiểm, nhập lại mật khẩu để xác nhận (phòng khi máy đang mở
    trong tay người khác).
  - Xoá ngay tài khoản và mọi dữ liệu đồng bộ: hồ sơ, tiến độ, lượt dùng AI.
  - Tiến độ trên máy vẫn còn; người dùng tự đặt lại nếu muốn.
  - Admin không tự xoá được, để không bao giờ mất người duyệt tài khoản.
  - Chính sách bảo mật và điều khoản cập nhật theo.
- **Danh sách chờ beta**: đổi giọng văn của việc duyệt tài khoản. Cơ chế giữ nguyên
  (`pending` → admin duyệt).
  - Đăng ký nghĩa là "vào danh sách chờ bản beta". Nói thật là tài khoản được duyệt thủ
    công; không hứa thời gian và không hứa sẽ gửi email báo, vì app chưa gửi email đó.
  - Trang admin gọi mục này là "Danh sách chờ beta".
- **Cần chủ dự án tự làm** (cần tài khoản của bạn):
  - SMTP riêng: email gửi từ `@vocastudy.app`. SMTP mặc định của Supabase chỉ gửi tới
    thành viên của project, nên quên mật khẩu chỉ chạy cho người dùng thật sau khi cấu hình.
  - Mẫu email có thương hiệu: `supabase/email-templates/`.
  - Thêm Redirect URLs.
  - Đăng nhập bằng Google.

**Dev**

- `authStore`:
  - `requestPasswordReset(email)` gọi `resetPasswordForEmail` với
    `redirectTo: <origin>/reset-password`;
  - `updatePassword(pw)` gọi `updateUser`;
  - `deleteAccount(password)` xác thực lại bằng `signInWithPassword`, gọi
    `DELETE /api/account`, rồi đăng xuất cục bộ.
- `functions/api/account.ts`:
  - dùng `requireUser` (chỉ tài khoản đang hoạt động), từ chối admin;
  - xoá user bằng `DELETE /auth/v1/admin/users/:id`;
  - `profiles`, `progress`, `ai_usage` tự xoá theo nhờ `on delete cascade` trong
    `supabase/schema.sql`.
- `lib/entry.ts`:
  - `authCallbackPath` đưa fragment có `type=recovery` tới `/reset-password`, các
    fragment xác thực khác tới `/home`;
  - fragment được giữ nguyên để supabase-js đọc;
  - dùng khi Supabase quay về Site URL vì `/reset-password` chưa có trong Redirect URLs.
- Giao diện:
  - `features/auth/AuthShell.tsx` là khung chung cho trang đăng nhập và trang đặt lại
    mật khẩu;
  - `PasswordFields` kiểm tra độ dài tối thiểu 6 và hai ô phải khớp.
