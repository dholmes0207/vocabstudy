# Người học quay lại (trang Admin)

**User** (người làm sản phẩm): "Mỗi ngày có người đăng ký, nhưng không biết họ học một lần
rồi bỏ, hay quay lại. Không có con số này thì không biết thay đổi nào có tác dụng."

**BA**

- Bảng "Người học quay lại" ở đầu trang Admin:
  - số người học, số người học hôm nay và trong 7 ngày qua;
  - **Quay lại hôm sau**: trong những người đã qua ngày đầu, bao nhiêu người học tiếp vào
    ngày kế tiếp;
  - **Quay lại trong tuần đầu**: trong những người đã qua đủ 7 ngày, bao nhiêu người học lại
    ít nhất một lần trong 7 ngày sau ngày đầu;
  - bảng 8 tuần gần nhất, chia theo tuần bắt đầu học (tuần tính từ thứ Hai).
- Tỉ lệ kèm số đếm (`40% (4/10)`), vì với vài chục người, một người đã làm tỉ lệ nhảy mạnh.
- Người mới hôm nay chưa được tính vào "hôm sau", người mới tuần này chưa được tính vào
  "trong tuần đầu": họ chưa có cơ hội quay lại, tính vào sẽ kéo tỉ lệ xuống sai. Tuần chưa ai
  đủ điều kiện thì hiện "—".
- Ngày đầu là ngày đầu tiên có trả lời bất kỳ hay học từ mới, ở bất kỳ ngôn ngữ nào.

**Giới hạn**

- Chỉ tính người đã đăng nhập: tiến độ chỉ lên server khi đồng bộ. Người học không tài khoản
  không có trong số liệu. App không dùng công cụ phân tích bên thứ ba, nên đây là nguồn duy
  nhất.
- Ngày theo giờ Việt Nam, cùng cách đếm ngày của app (`epochDay`).
- Người học xoá dữ liệu trên máy rồi đăng nhập lại thì ngày cũ vẫn còn, vì tiến độ được gộp
  với bản trên server.

**Dev**

- `functions/api/admin/retention.ts` (chỉ admin):
  - đọc bảng `progress` bằng service role, mỗi lần 1.000 dòng;
  - chỉ lấy `data->stats->reviewsByDay` và `data->stats->newByDay`, không kéo cả thẻ ôn tập.
- `src/lib/retention.ts`: phần tính thuần, có test (`retention.test.ts`). Bảng ở
  `RetentionPanel` trong `src/features/admin/AdminPage.tsx`.
- Không cần bảng hay migration mới.
