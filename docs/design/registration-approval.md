# Header tức thì + đăng ký cần admin duyệt

**User**: "Vào web thì avatar hiện chậm, không bấm được Đăng nhập / Đăng ký / Thống kê /
Cài đặt. Và ai cũng tự đăng ký được — phải để admin duyệt chứ."

## 1. Header, avatar và menu dùng được ngay

**Nguyên nhân** (đo trên vocastudy.app):

- Toàn bộ khung app (header, avatar, menu, thanh điều hướng) nằm _bên trong_ `DataGate`,
  nên phải chờ gói từ `en.json` (~2 MB) tải và phân tích xong mới hiện. Trên điện thoại,
  mạng chậm thì mất vài giây chỉ thấy vòng xoay.
- Sau đó `UserMenu` còn hiện một ô xám nhấp nháy _không bấm được_ cho tới khi Supabase
  trả lời phiên đăng nhập.
- `onAuthStateChange` gọi `await loadProfile()` ngay trong callback. supabase-js chạy
  callback khi đang giữ khoá auth, nên lời gọi lồng nhau chờ đúng cái khoá đó và mọi
  request sau (đồng bộ, đăng nhập) có thể treo mãi.

**Sửa**:

- `DataGate` (`src/components/DataGate.tsx`) chỉ bọc nội dung màn hình trong `Layout`, kèm
  một `Suspense` riêng. Header và điều hướng hiện từ khung hình đầu tiên.
- Người dùng đã xác nhận lần trước được lưu trên máy (`src/lib/authCache.ts`,
  `vocab.auth.user.v1`), nên avatar hiện ngay. Bản lưu chỉ để hiển thị: mọi API vẫn kiểm
  token ở server.
- `bootstrap()` luôn kết thúc ở `ready`: có giới hạn 8 giây và `try/finally`. Callback
  `onAuthStateChange` hoãn bằng `setTimeout`, rồi kiểm tra lại phiên trước khi áp dụng.

## 2. Đăng ký cần admin duyệt

**BA**:

- Tài khoản mới có `status = 'pending'`; riêng người dùng đầu tiên vẫn là admin `active`.
- Tài khoản pending không đăng nhập được. App báo "đang chờ quản trị viên duyệt" và nói rõ
  rằng trong lúc chờ vẫn học được ở chế độ khách; tiến độ sẽ gộp lên khi được duyệt.
- Chặn ở server, không chỉ ở giao diện:
  - RLS bảng `progress` yêu cầu `public.is_active_user()`, nên tài khoản pending hoặc bị
    khoá không đồng bộ được dù có token.
  - Các Functions (`accessDecision`) trả 403 cho cả `pending`.
  - Bảng `profiles` không có policy UPDATE, nên người dùng không tự đổi trạng thái được.
- Trang Quản trị có mục **Đăng ký chờ duyệt** ở đầu trang (Duyệt → `active`, Từ chối →
  xoá). Avatar của admin hiện chấm đỏ, mục "Quản trị" ghi số người đang chờ.

**Dev — cần chạy SQL một lần**: mở Supabase → SQL editor, chạy lại toàn bộ
`supabase/schema.sql`. File chạy lại an toàn: tài khoản cũ giữ nguyên trạng thái, chỉ tài
khoản đăng ký _sau đó_ mới phải chờ duyệt. Trước khi chạy SQL, app vẫn hoạt động như cũ
(đăng ký vào thẳng).
