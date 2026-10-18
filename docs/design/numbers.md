# Nghe số (tiếng Trung)

**User**: "Cải thiện thêm phần học tiếng Trung."

Phần nghe của HSK 1–2 hỏi liên tục về giá tiền, giờ giấc, ngày tháng và thứ trong tuần. Người mới
hay nghe nhầm 十四 (14) với 四十 (40), quên 两 thay cho 二, và không quen thứ tự "tháng trước, ngày
sau". App đã có bộ từ "Số đếm & mua sắm", nhưng chưa có bài luyện nghe số.

**BA**

- Màn mới **"Nghe số"** (`/numbers`), chỉ có ở gói tiếng Trung, nằm trong trang Luyện tập.
- Trước khi luyện có 4 quy tắc ngắn:
  - 十四 khác 四十;
  - "hai cái gì đó" dùng 两 (两块, 两点), nhưng 十二 và 二十 vẫn là 二;
  - số 0 ở giữa đọc là 零 (一百零五); 30 phút là 半 (七点半);
  - ngày tháng nói tháng trước: 三月十二号 = 12/3; Chủ nhật là 星期天.
- Một lượt có 10 câu: 3 câu số (2–199), 2 câu giá tiền, 2 câu giờ, 2 câu ngày tháng và 1 câu thứ
  trong tuần, xáo trộn.
  - Câu tự phát. Bấm nút loa để nghe lại.
  - Chọn 1 trong 4 đáp án. Đáp án ghi theo ngôn ngữ giao diện: "25 tệ" / "25 yuan", "Thứ Tư" /
    "Wednesday", "12/3" / "12 Mar".
  - Luôn có **phương án dễ nhầm nhất**: chữ số đảo (14 / 41), giờ chẵn với giờ rưỡi (7:30 / 7:00),
    ngày và tháng đổi chỗ (3/12 / 12/3). Các phương án còn lại lấy ngẫu nhiên trong số những phương
    án gần đúng.
  - Trả lời xong thì hiện chữ Hán và pinyin của câu vừa nghe.
  - Cuối lượt cộng XP như các phần luyện nhanh khác.
- Câu hỏi sinh tự động từ quy tắc đọc số, không có dữ liệu soạn tay. Đúng sai nằm ở các quy tắc
  trong `lib/zhNumbers.ts`, và mọi quy tắc đều có test.

**Dev**

- `lib/zhNumbers.ts`:
  - `hanNumber(0–999)` (110 → 一百一十, 105 → 一百零五);
  - `itemFor(kind, a, b)`;
  - `numberPinyin` (一 đọc yì trước 百);
  - `numberQuiz()`, `numbersXp()`.
- `features/numbers/Numbers.tsx` dùng `GameShell` và `GameResult`.
- `lib/packContent.ts`: `'/numbers': ['zh']`. Mục trong trang Luyện tập nằm ở
  `features/practice/entries.ts`.
- Test: `lib/zhNumbers.test.ts`, `features/numbers/Numbers.test.tsx`.
