# Bật "Tiếp tục với Google"

Code đã có sẵn. Nút "Tiếp tục với Google" ở trang đăng nhập **tự hiện ra** ngay khi
Google được bật trong Supabase, không cần deploy lại (xem `docs/design/google-login.md`).
Bạn chỉ cần làm hai việc: tạo OAuth client trên Google Cloud và dán nó vào Supabase.

## 1. Google Cloud: màn hình xin quyền (OAuth consent screen)

1. Vào https://console.cloud.google.com, tạo project mới, ví dụ `VocaStudy`.
2. Mở **Google Auth Platform → Branding** (giao diện cũ là _APIs & Services → OAuth
   consent screen_) và điền:
   - App name: `VocaStudy`
   - User support email: email của bạn
   - App logo: không bắt buộc. Nếu tải logo lên, Google có thể yêu cầu xác minh thương
     hiệu.
   - Application home page: `https://vocastudy.app`
   - Privacy policy: `https://vocastudy.app/privacy`
   - Terms of service: `https://vocastudy.app/terms`
   - Authorized domains: `vocastudy.app` và `<mã-project>.supabase.co`. Mã project là
     phần đầu trong Supabase URL của bạn.
   - Developer contact: email của bạn.
3. **Audience** (loại người dùng): chọn **External**, rồi bấm **Publish app** để chuyển
   sang _In production_. Nếu để ở chế độ _Testing_, chỉ những "test users" bạn tự thêm
   mới đăng nhập được.
4. **Data access** (scopes): không cần thêm gì. App chỉ dùng `openid`, `email` và
   `profile`, đều là quyền cơ bản nên không cần Google xét duyệt.

## 2. Google Cloud: tạo OAuth client

1. Mở **Clients** (hoặc _Credentials_), chọn **Create client**, loại **Web application**,
   đặt tên `VocaStudy web`.
2. **Authorized JavaScript origins**:
   - `https://vocastudy.app`
   - `http://localhost:5199` (để thử ở máy, có thể bỏ qua)
3. **Authorized redirect URIs**: dán đúng địa chỉ **Callback URL** mà Supabase hiển thị ở
   bước 3. Địa chỉ này có dạng `https://<mã-project>.supabase.co/auth/v1/callback`.
4. Bấm Create, rồi chép **Client ID** và **Client secret**.

## 3. Supabase: bật Google

1. Mở **Authentication → Sign In / Providers → Google**.
2. Bật **Enable**, dán **Client ID** (vào ô _Client IDs_) và **Client secret**, rồi bấm
   Save.
3. Mở **Authentication → URL Configuration → Redirect URLs** và kiểm tra đã có
   `https://vocastudy.app/**`. Bước này giống phần email, nếu đã thêm thì bỏ qua.

## 4. Kiểm tra

1. Mở `vocastudy.app/login` rồi tải lại trang. Nút **Continue with Google** phải hiện ra.
2. Đăng nhập bằng một tài khoản Google chưa từng dùng VocaStudy. Bạn sẽ quay về app và
   thấy thông báo **"You're on the beta waitlist"**.
3. Mở trang **Admin → Danh sách chờ beta** và duyệt tài khoản đó.
4. Đăng nhập lại bằng Google. Lần này phải vào app được.

## Cần biết

- **Tài khoản trùng email:** nếu email Google trùng với một tài khoản đã đăng ký bằng
  email, Supabase gộp hai cách đăng nhập vào cùng một tài khoản. Tiến độ học vẫn giữ
  nguyên.
- **Dòng chữ trên màn hình của Google:** Google sẽ ghi "to continue to
  `<mã-project>.supabase.co`". Muốn dòng này hiện `vocastudy.app` thì phải dùng tên miền
  riêng cho Supabase, là gói trả phí.
- **Muốn tắt:** chỉ cần tắt Google trong Supabase, nút sẽ tự biến mất.
