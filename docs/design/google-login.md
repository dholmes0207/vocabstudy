# Đăng nhập bằng Google

**User**

- "Không muốn nhớ thêm một mật khẩu nữa. Bấm Google là xong."
- "Đăng ký bằng email mà không thấy email xác nhận tới." (Dự án đang bật xác nhận email,
  trong khi SMTP mặc định của Supabase chỉ gửi được cho thành viên project.)

**BA**

- **Nút "Tiếp tục với Google"**:
  - có ở cả hai tab Đăng nhập và Đăng ký;
  - chỉ hiện khi Google đã được bật trong Supabase, nên bật hay tắt đều không cần deploy;
  - email Google đã được Google xác minh, nên không cần chờ email xác nhận.
- **Sự đồng ý**:
  - ngay dưới nút có dòng "Tiếp tục với Google nghĩa là bạn đồng ý với Điều khoản sử
    dụng và Chính sách bảo mật, gồm việc lưu trữ dữ liệu ở nước ngoài…";
  - hành động bấm nút chính là sự đồng ý, không có gì được chọn sẵn;
  - khi quay về từ Google, app ghi phiên bản chính sách, thời điểm đồng ý và cách đồng ý
    (`google`), giống bản ghi của form email.
  - **Câu hỏi cho người rà soát pháp lý:** cách đồng ý bằng cú bấm này đã đủ chưa, hay
    cần thêm ô tích như form email?
- **Danh sách chờ**:
  - tài khoản Google mới cũng phải chờ duyệt;
  - khi quay về, app hiện thông báo "Bạn đang trong danh sách chờ beta…". Không có
    thông báo này thì người dùng chỉ thấy mình bị đăng xuất mà không rõ vì sao.
- **Tài khoản chỉ đăng nhập bằng Google**:
  - không có mật khẩu, nên khi xoá tài khoản sẽ xác nhận bằng cách gõ lại email;
  - mục "Đổi mật khẩu" đổi thành "Tạo mật khẩu", để có thể đăng nhập thêm bằng email.
- **Chính sách và điều khoản**:
  - ghi rõ Google gửi email, tên và ảnh đại diện;
  - VocaStudy chỉ dùng email và tên, không nhận mật khẩu Google;
  - thêm Google vào danh sách đối tác xử lý dữ liệu.

**Dev**

- Đọc cấu hình:
  - `lib/supabase.ts` có `fetchAuthSettings()` gọi `GET /auth/v1/settings` bằng anon key
    (endpoint công khai);
  - `lib/authProviders.ts` `parseProviders` đọc `external.google`.
- Ghi nhận sự đồng ý qua chuyến đi tới Google:
  - trước khi rời app, `savePendingConsent` lưu sự đồng ý vào `sessionStorage`, có hạn 15
    phút;
  - khi quay về, `recordGoogleConsent` (trong `authStore`) ghi `consent_version`,
    `consented_at` và `consent_method` bằng `updateUser`;
  - bước này chạy **trước** `admit`, vì tài khoản đang chờ duyệt bị đăng xuất ngay sau
    đó;
  - chỉ ghi khi user có identity `google` và phiên bản đồng ý chưa được ghi.
- `signInWithOAuth` dùng `redirectTo: <origin>/home`. Nếu địa chỉ này chưa có trong
  Redirect URLs, Supabase quay về Site URL và trang `/` tự chuyển tiếp fragment
  `#access_token` tới `/home` (`authCallbackPath`).
- Lý do bị chặn: khi `bootstrap` hoặc listener chặn một phiên (chờ duyệt hoặc bị khoá),
  thông điệp được lưu vào `notice` và `components/AuthNotice.tsx` hiển thị nó trong app.
- `AuthUser.hasPassword` lấy từ `hasPasswordLogin(user.identities)`: nếu không có
  identity `email` thì là `false`; không đọc được thì coi là `true`.
  - `deleteAccount(confirmation)` so khớp email khi `hasPassword === false`, ngược lại
    kiểm tra lại bằng mật khẩu.
  - Sau khi tài khoản Google tạo mật khẩu, `updatePassword` đặt `hasPassword` thành
    `true`.
- Hướng dẫn cấu hình cho chủ dự án nằm ở `supabase/google-login.md`.

## Sửa sau khi chạy thật (14/10/2026)

**User**

- "Đăng nhập tài khoản admin mà khung 'You're on the beta waitlist' vẫn còn."
- "Tạo tài khoản bằng Google thì không có chỗ nhập tên hiển thị."

**BA**

- Thông báo danh sách chờ chỉ dành cho lần đăng nhập bị chặn vừa rồi. Ai đăng nhập thành
  công (kể cả một tài khoản khác) thì thông báo phải biến mất.
- Thông báo phải theo ngôn ngữ giao diện hiện tại, không phải ngôn ngữ lúc bị chặn.
- Tên hiển thị:
  - với tài khoản Google, tên được lấy sẵn từ Google (ví dụ "Danh Vo");
  - mọi tài khoản đều sửa được tên trong Cài đặt → Tài khoản → Tên hiển thị;
  - tối đa 50 ký tự; để trống thì app hiện "Người học".

**Dev**

- `authStore.notice` lưu trạng thái (`'pending' | 'locked'`) thay vì chuỗi đã dịch.
  `AuthNotice` dịch trạng thái đó bằng `accountBlockMessage(notice, lang)` lúc hiển thị.
- `admit` xoá `notice` mỗi khi cho một hồ sơ vào app. `login` và `signInWithGoogle` cũng
  xoá `notice` ngay từ đầu.
- Đổi tên đi qua `PATCH /api/account` (`functions/api/account.ts`), dùng service role và
  chỉ ghi cột `name` của chính người gọi.
  - Bảng `profiles` cố ý **không** có policy UPDATE cho người dùng, để không ai tự nâng
    quyền của mình.
  - Cách này không cần chạy lại `schema.sql`.
- `lib/displayName.ts` `cleanDisplayName` dùng chung cho trình duyệt và Function:
  - gộp khoảng trắng;
  - bỏ ký tự điều khiển;
  - tối đa 50 ký tự.
