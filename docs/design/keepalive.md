# Giữ Supabase luôn chạy và kiểm tra sức khoẻ hằng ngày

**User**: "Làm sao để Supabase không bị dừng khi 7 ngày không ai truy cập? Mình không muốn
phải tự bật lại."

**BA**

- Gói miễn phí của Supabase tạm dừng project sau 7 ngày không có hoạt động. Khi đó đăng
  nhập, đồng bộ và trợ lý AI đều ngừng chạy cho đến khi chủ dự án vào bấm "Restore".
- Mỗi ngày một lần, một tác vụ tự động gọi app. App chạy một truy vấn rất nhỏ vào cơ sở
  dữ liệu, đủ để Supabase tính là có hoạt động. Bạn không phải làm gì thêm.
- Truy vấn này cũng là phép kiểm tra sức khoẻ: nếu app không với tới được cơ sở dữ liệu
  thì tác vụ báo lỗi và GitHub gửi email cho chủ repo.

**Dev**

- `functions/api/health.ts` (`GET /api/health`):
  - dùng service role đọc 1 id trong `profiles` rồi bỏ đi;
  - trả `{ ok, db, ms }`, header `Cache-Control: no-store`;
  - trả 503 nếu không truy vấn được.
  - Không lộ dữ liệu người dùng.
- `.github/workflows/keepalive.yml`:
  - chạy theo lịch hằng ngày lúc 03:17 UTC, có thêm `workflow_dispatch` để chạy tay;
  - thử lại 3 lần, mỗi lần cách 30 giây;
  - `permissions: {}`, không cần secret nào.
- Repo là **public** từ tháng 11/2026, nên Actions không còn tính phút. Đổi lại, GitHub tự
  tắt lịch chạy khi repo public không có hoạt động trong 60 ngày. Nếu việc phát triển tạm
  nghỉ lâu, lịch này sẽ ngừng và Supabase bị tạm dừng 7 ngày sau đó.
  - Cách giảm: một dịch vụ giám sát bên ngoài gọi `/api/health` mỗi giờ (việc 0.6 trong
    Phần 0 của `docs/PLAN.md`); workflow này giữ làm lớp thứ hai.
  - Khi GitHub tắt lịch, chủ repo nhận email và bật lại ở tab Actions.
