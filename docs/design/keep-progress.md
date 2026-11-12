# Giữ tiến độ của khách (việc 1.5 trong `docs/PLAN.md`)

**User:** "Không ai mất tiến độ." Khách (chưa đăng nhập) chỉ có dữ liệu trên máy. Trình duyệt có thể xoá dữ liệu
trang web khi máy đầy, và Safari trên iPhone có thể xoá dữ liệu do trang web ghi nếu trang không được mở trong một
thời gian.

## Phần 1: xin lưu trữ bền (13/11/2026)

**BA**

- Lần đầu học xong một phiên (màn "Hoàn thành!"), app xin trình duyệt giữ dữ liệu của trang (`navigator.storage.persist`).
  - Chrome và Edge tự quyết, không hỏi người học. Firefox hiện một hộp hỏi: đây là lúc người học vừa có thứ đáng giữ,
    nên câu hỏi dễ hiểu.
  - Mỗi thiết bị chỉ xin một lần. Trình duyệt từ chối thì thôi, không hỏi lại.
- Không gửi gì đi đâu, không đổi dữ liệu người học.

**Dev**

- `src/lib/persistStorage.ts` (có test): `requestPersistentStorage(navigator.storage, localStorage)`.
  - Đã giữ (`persisted()`) thì không xin nữa.
  - Đánh dấu đã xin ở khoá `vs-persist-asked`, ngoài tiền tố `vocab.`, để tệp sao lưu không mang cờ này sang máy khác.
  - Mọi lỗi (chế độ riêng tư, bộ nhớ bị chặn) đều nuốt, không thành lỗi trên trang.
- Gọi trong `SessionComplete.tsx`, cùng lúc với pháo giấy.

## Phần 2: mời tạo tài khoản (chưa làm)

Sau ngày học thứ ba hoặc 50 từ, mời tạo tài khoản một lần; từ chối thì 14 ngày sau mới hỏi lại (theo mẫu
`shouldOfferInstall` trong `src/lib/install.ts`). Nên làm sau khi mở đăng ký tự động (việc 1.4), vì hiện tài khoản
mới còn phải chờ duyệt tay.
