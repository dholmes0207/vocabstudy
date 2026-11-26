# Đo ẩn danh số người học quay lại (không dùng dịch vụ bên thứ ba)

**User** (việc 1.1 trong `docs/PLAN.md`): "Đo ẩn danh tự làm, gửi về máy chủ của chính VocaStudy, không dùng bên
thứ ba." Hiện bảng "Người học quay lại" ở trang Quản trị chỉ tính người đã đăng nhập, không biết gì về khách.

**BA**

- Mỗi ngày một thiết bị có học, app gửi **một tín hiệu nhỏ** về máy chủ của chính VocaStudy (Cloudflare Pages
  Functions và Supabase, vốn đã là bên xử lý dữ liệu). Tín hiệu gồm:
  - mã thiết bị ngẫu nhiên tạo trên máy, không gắn với tài khoản;
  - ngày (theo lịch của người học) và gói ngôn ngữ đang học;
  - số câu trả lời và số từ mới trong ngày, **chỉ gửi khoảng** chứ không gửi số đúng:
    câu trả lời 0, 1–9, 10–29, 30–99, từ 100; từ mới 0, 1–4, 5–9, 10–19, từ 20;
  - ba cờ: đã học xong nhóm 5 từ đầu tiên, đang đăng nhập, đang chạy như app đã cài.
- **Không lưu:** địa chỉ IP, email, mã tài khoản, từ đã học, câu trả lời, đường dẫn trang.
- Chỉ gửi vào ngày có học (có câu trả lời hoặc từ mới). Cùng ngày chỉ gửi lại khi có thêm thông tin (khoảng cao
  hơn hoặc một cờ mới bật); máy chủ giữ giá trị cao nhất.
- **Hỏi trước, đồng ý mới gửi** (việc 1.2, chốt ngày 26/11/2026): mục 9 của chính sách hứa người học được xác
  nhận trước khi đổi cách thu thập dữ liệu, và luật dữ liệu cá nhân đòi sự đồng ý. App hỏi **một lần** ở cuối phiên học
  đầu tiên ("Giúp VocaStudy tốt hơn?", nút Đồng ý / Không, cảm ơn). Trả lời gì cũng không hỏi lại; đổi được trong
  Cài đặt → Dữ liệu & sao lưu. Trình duyệt bật Global Privacy Control thì không hỏi và không gửi gì.
- Lưu 400 ngày, đủ để so cùng kỳ năm trước.
- Chính sách bảo mật có mục "Số liệu ẩn danh" (mục 1, 2, 3); `POLICY_VERSION` lên `2026-11-26` nên chuông thông
  báo báo cho người học.
- **Cần chủ dự án:** chạy lại `supabase/schema.sql` để tạo bảng. Trước khi chạy, máy chủ nhận tín hiệu rồi bỏ qua.

**Dev**

- `src/lib/usagePing.ts` (thuần, có test, dùng chung cho trình duyệt và Function):
  - `bucket` đổi số đếm thành chỉ số khoảng; `buildPing` dựng tín hiệu, trả `null` cho ngày không học;
  - `shouldSend` so khoá của tín hiệu với khoá đã gửi: khác thì gửi;
  - `pingAllowed` tôn trọng công tắc và Global Privacy Control;
  - `sanitizePing` là kiểm tra phía máy chủ: đúng khuôn, ngày cách ngày của máy chủ không quá 1, bỏ mọi trường lạ;
  - `newDeviceId` tạo 22 ký tự ngẫu nhiên (128 bit). Mã lưu ở khoá `vs-device-id`, ngoài tiền tố `vocab.`, để tệp
    sao lưu (`src/lib/backup.ts`) không chép nó sang máy khác.
- `functions/api/ping.ts`: `POST /api/ping`, chỉ nhận từ chính trang của mình (Origin), 20 lần một phút mỗi địa
  chỉ (`WindowLimiter`, IP chỉ dùng trong bộ nhớ, không ghi log, không lưu), thân tối đa 1 KB, luôn trả 204.
- `supabase/schema.sql`: bảng `usage_days` (khoá chính thiết bị + ngày, RLS bật, không có policy) và hàm
  `record_usage_day` (security definer, chỉ service role gọi được):
  - gộp bằng `greatest` và `or`, nên tín hiệu đến muộn không làm giảm số liệu;
  - quá 2.000 cặp thiết bị–ngày mới trong 10 phút thì chỉ nhận thiết bị đã có trong ngày, chống script bơm dữ liệu;
  - xoá dòng cũ hơn 400 ngày.

- Gắn vào app (26/11/2026):
  - `src/lib/usageClient.ts` (thuần, có test): lựa chọn đồng ý (`vs-usage-consent`), mã thiết bị, `nextPing` dựng tín
    hiệu từ số liệu trong ngày và chỉ trả về khi đã đồng ý, có học, và có thông tin mới; `postPing` gửi bằng
    `sendBeacon`. Mọi khoá nằm ngoài tiền tố `vocab.`.
  - `src/hooks/useUsageConsent.ts`: `sendUsageToday` đọc store (số câu và từ mới hôm nay, số từ đã bắt đầu, đăng
    nhập, app đã cài) và gửi; gọi ở `SessionComplete` mỗi khi xong một phiên.
  - `src/components/UsageConsent.tsx`: thẻ hỏi một lần trong `SessionComplete`; công tắc trong `SettingsPage`.

**Tiếp theo**

1. Chủ dự án chạy lại `supabase/schema.sql` để tạo bảng; trước đó máy chủ nhận rồi bỏ qua.
2. ~~Việc 1.3: bảng phễu cho mọi thiết bị ở trang Quản trị~~: xong, xem mục dưới.

## Bảng phễu cho mọi thiết bị (việc 1.3)

- Thẻ "Người học quay lại" ở trang Quản trị có thêm phần **Mọi thiết bị (số liệu ẩn danh)**, đọc từ `usage_days`.
  Phần cũ (chỉ người đã đăng nhập) giữ nguyên để so.
- Bốn bước:
  1. thiết bị có học (ít nhất một ngày có tín hiệu);
  2. xong nhóm 5 từ đầu tiên ngay ngày đầu (cờ `first_lesson` của ngày đầu tiên);
  3. quay lại hôm sau, tính như phần người đã đăng nhập;
  4. học từ 3 ngày khác nhau trong 7 ngày đầu, chỉ tính khi tuần đầu đã qua.
- Phần tính nằm trong `src/lib/retention.ts` (`daysByDevice`, `deviceReport`, có test), dùng lại `retentionReport`.
- `GET /api/admin/retention` trả thêm trường `devices`; trường này là `null` khi chưa có bảng, và thẻ hiện lời nhắc
  chạy `supabase/schema.sql`.
- Đọc cả bảng theo trang 1.000 dòng. Khi số dòng lớn (hàng trăm nghìn), chuyển phần đếm vào một hàm SQL.
