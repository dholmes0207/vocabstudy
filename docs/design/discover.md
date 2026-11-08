# "Hôm nay thử gì mới?" (08/11/2026)

**User**: "tạo hứng thú, hấp dẫn khi học, phong cách tránh nhàm chán".

## 1. Người học

- Trang Luyện tập đã có gần 20 kiểu luyện (nhập vai, "Đúng hay sai?", cấu trúc câu, chữ dễ nhầm, IELTS,
  TOEIC…). Người học hay quay lại vài trang quen và không biết còn những trang khác.

## 2. Cách làm

- App nhớ các trang luyện tập đã mở trên máy này (`store/visitedStore.ts`, `vocab.visited.v1`); việc ghi
  diễn ra ở `Layout` khi đường dẫn khớp một mục trong trang Luyện tập.
- Trang chủ, ngay dưới thẻ lộ trình, có thẻ **"Hôm nay thử gì mới?"**: một trang luyện của gói hiện tại mà
  máy này chưa mở, mỗi ngày một trang khác (`lib/discover.ts`, `pickDiscovery`). Mở hết rồi thì thẻ biến mất.
- Chỉ đếm từ khi có tính năng này, nên người dùng cũ có thể được gợi ý trang đã từng dùng; vì vậy thẻ không
  ghi "chưa thử" hay đếm số còn lại, và trang Luyện tập không gắn nhãn "Mới".
