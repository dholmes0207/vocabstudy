# Tự động ghi nhận lỗi (không dùng dịch vụ bên thứ ba)

**User**: "Bắt lỗi trước khi người dùng báo." Sentry làm được việc này nhưng cần tài
khoản, thêm một bên nhận dữ liệu và thêm thư viện vào app.

**BA**

- Khi app gặp lỗi trên máy học viên, trình duyệt tự gửi một mô tả lỗi ngắn về **máy chủ
  của chính VocaStudy**.
  - Các trường hợp được gửi: màn hình bị sập, lỗi không ai bắt, promise bị từ chối.
  - Không thêm bên thứ ba: Cloudflare và Supabase vốn đã là bên xử lý dữ liệu.
- Mô tả lỗi **không chứa thông tin cá nhân**.
  - Bị lược bỏ: email, mã đăng nhập (JWT), khoá API, phần sau `?` và `#` trong địa chỉ
    web, dãy số dài.
  - Chỉ gửi: thông báo lỗi, stack, đường dẫn trang, phiên bản app (commit) và loại lỗi.
  - Không gửi: tài khoản, email, nội dung học.
- Trang Admin có thẻ "Lỗi gần đây":
  - lỗi giống nhau được gộp lại và đếm số lần;
  - bấm vào một lỗi để xem stack;
  - lưu tối đa 30 ngày và 500 loại lỗi.
- Chính sách bảo mật có thêm mục "Báo lỗi kỹ thuật" và lý do "Tìm và sửa lỗi".
  - Vì đây không phải dữ liệu cá nhân, việc này không thuộc cam kết "xin xác nhận trước"
    ở mục 9, nên không tăng `POLICY_VERSION`.
  - Ngày "Cập nhật" trên trang (`LAST_UPDATED`) được tách riêng khỏi `POLICY_VERSION`.
- **Cần chủ dự án:** chạy lại `supabase/schema.sql` để tạo bảng. Trước khi chạy, lỗi vẫn
  được ghi vào nhật ký Cloudflare Pages Functions (dòng `[client-error]`).

**Dev**

- `lib/errorReport.ts` (thuần, có test, dùng chung cho trình duyệt và Function):
  - `scrub` lược bỏ thông tin nhạy cảm;
  - `isNoise` bỏ qua lỗi không phải của app (Script error., ResizeObserver, AbortError,
    lỗi từ tiện ích trình duyệt);
  - `buildReport` tạo mô tả lỗi; `sanitizeReport` kiểm tra lại phía server;
  - `signature` (FNV-1a) tạo khoá gộp lỗi từ message và frame đầu tiên của stack.
- `lib/reportError.ts`:
  - chỉ chạy ở bản production;
  - tối đa 5 báo cáo mỗi lần tải trang, mỗi lỗi chỉ gửi một lần;
  - gửi bằng `sendBeacon`, nếu không được thì dùng `fetch` với keepalive.
  - `installErrorReporting()` được gọi trong `main.tsx`; `ErrorBoundary` gọi
    `reportError(error, 'render')`.
- `__BUILD_ID__` lấy từ biến `CF_PAGES_COMMIT_SHA` lúc build (`vite.config.ts` `define`).
- `functions/api/errors.ts` (`POST`):
  - chặn yêu cầu có Origin lạ; body tối đa 8 KB;
  - luôn ghi `console.error('[client-error] …')`;
  - gọi RPC `report_client_error` (security definer, chỉ cho `service_role`) để gộp lỗi,
    xoá bản ghi quá 30 ngày và giữ tối đa 500 dòng;
  - luôn trả 204. Nếu bảng chưa có (404), dòng nhật ký vẫn còn đó.
- `functions/api/admin/errors.ts` (`GET`, chỉ admin): trả `{ enabled, errors }`.
  `enabled: false` khi bảng chưa tồn tại.
- Sửa thêm trong `schema.sql`: `bump_ai_usage` trước đây ai có anon key cũng gọi được
  (Supabase mặc định cấp quyền EXECUTE cho anon và authenticated). Giờ chỉ
  `service_role` được gọi.
