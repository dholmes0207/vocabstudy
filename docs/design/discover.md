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
  ghi "chưa thử" hay đếm số còn lại.

## 3. Trang Luyện tập chia nhóm (26/11/2026, việc 2.4 trong `docs/PLAN.md`)

- 36 mục xếp thành 7 nhóm theo kỹ năng: Luyện thi, Nghe, Nói, Đọc và viết, Từ và cụm từ, Chữ và âm, Trò chơi
  (`GROUPS`, `GROUP_OF` trong `features/practice/entries.ts`; test kiểm mọi mục đều có nhóm). Nhóm nào không có mục
  cho gói hiện tại thì ẩn.
- Đầu trang có mục **"Gợi ý cho bạn hôm nay"**: đúng trang mà thẻ trên trang chủ gợi ý (`pickDiscovery`). Trang này
  không lặp lại trong nhóm của nó.
- Nhãn trên từng thẻ:
  - **"N lượt"** khi trang có bộ đếm phiên đã xong (`KIND_OF` → `activityStore`). Bộ đếm này có từ trước sổ trang đã
    mở, nên cũng che được phần lớn trường hợp người dùng cũ đã dùng trang trước 08/11.
  - **"Mới"** cho trang chưa mở, chỉ khi người học đã thử từ 5 trang trở lên: với người mới thì trang nào cũng mới,
    gắn nhãn cả loạt chỉ thành nhiễu.
- Không ghi "chưa thử" ở mục gợi ý, vì lý do ở mục 2.
