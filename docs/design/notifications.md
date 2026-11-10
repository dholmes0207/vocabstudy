# Chuông thông báo

**User**: "Thông báo cập nhật chính sách hiện to đùng trên đầu mọi trang. Hãy cho nó vào một
nút thông báo cạnh nút đổi ngôn ngữ và giao diện, bấm vào mới hiện chi tiết."

**BA**

- Nút chuông nằm trên header của app, cạnh nút đổi ngôn ngữ.
  - Có thông báo chưa đọc thì chuông hiện chấm đỏ kèm số.
  - Bấm chuông mở danh sách thông báo; bấm một thông báo mới hiện chi tiết và tính là đã
    đọc.
  - Có nút "Đánh dấu đã đọc hết".
- Nội dung chuông:
  - cập nhật Chính sách và Điều khoản (theo `POLICY_VERSION`);
  - 4 bản cập nhật gần nhất trong "Có gì mới", kèm link tới `/changelog`.
  - Nhờ vậy chuông vừa là thông báo bắt buộc theo chính sách, vừa cho thấy sản phẩm được
    cải tiến đều đặn.
- Người mới vào lần đầu thấy chuông yên lặng, vì họ đang xem bản mới nhất rồi.
- Người đã đóng thẻ thông báo cũ thì thông báo chính sách được tính là đã đọc.
- Điện thoại 360 px:
  - header chỉ hiện biểu tượng logo, không hiện chữ "VocaStudy";
  - nút sáng/tối chuyển vào menu tài khoản.
  - Trước đây header rộng 415 px trên màn hình 375 px, đẩy nút menu ra ngoài màn hình.

**Dev**

- `lib/notifications.ts` (thuần, có test):
  - `buildNotifications(RELEASES, POLICY_VERSION)` tạo danh sách thông báo;
  - `readIds`, `markRead`, `unreadCount` xử lý trạng thái đã đọc.
  - Trạng thái đã đọc lưu ở `vocab.notifications.read`, chỉ giữ id còn trong danh sách.
  - Hàm cũng đọc khoá cũ `vocab.policy.seen`.
- `components/NotificationBell.tsx`:
  - trên điện thoại, bảng thông báo dùng vị trí `fixed`, cách hai mép 16 px; từ `sm` trở
    lên thì thả xuống từ chuông;
  - đóng bảng khi bấm ra ngoài, khi nhấn Esc hoặc khi chuyển trang.
- Đã xoá `PolicyNotice` và `lib/policyNotice.ts`.

## Tải sau trang (10/11/2026)

- Chuông chỉ hiện 4 bản phát hành mới nhất nhưng trước đây nhập cả `releases.ts`, tức toàn bộ trang `/changelog`
  (khoảng 37 KB nén), vào gói JS chính mà trang nào cũng tải. Nay chuông `import()` file này sau khi trang hiện
  xong; trong lúc chờ (thường chưa tới một khung hình) chuông chỉ có thông báo chính sách.
- Gói chính giảm từ khoảng 141 KB xuống 104 KB (nén gzip). Người mới vẫn có chuông im lặng: khi danh sách phát
  hành tải xong, tất cả được đánh dấu đã đọc.
- Cách thêm bản phát hành không đổi: vẫn ghi vào `src/features/marketing/releases.ts`.
