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

## Tiếng Hàn (20/10/2026)

**User**: "Tiếp tục cho mình". Hướng đã đề xuất là làm cho tiếng Hàn tương tự tiếng Trung, bắt đầu
từ chỗ người học hay nhầm nhất.

Tiếng Hàn có **hai bộ số**, và dùng bộ nào là tuỳ thứ đi kèm. Đây là chỗ khó nhất với người mới,
và các câu hỏi về giờ, giá tiền, tuổi trong đề TOPIK đều dựa trên nó.

**BA**

- Màn "Nghe số" (`/numbers`) dùng được cho cả gói tiếng Hàn, với 4 quy tắc riêng:
  - hai bộ số: Hán Hàn (일, 이, 삼…) và thuần Hàn (하나, 둘, 셋…);
  - giờ dùng thuần Hàn, phút dùng Hán Hàn: 세 시 이십 분; 30 phút là 반;
  - tiền và ngày tháng dùng Hán Hàn: 오천 원, 삼월 십이일; tháng 6 là 유월, tháng 10 là 시월;
    10.000 là 만, không nói 일만;
  - đồ vật và tuổi dùng thuần Hàn, rút gọn trước danh từ: 한/두/세/네 개, 스무 살.
- Một lượt 10 câu, xáo trộn: 2 câu giá tiền (500–49.500 won), 2 câu giờ, 2 câu ngày tháng, 1 câu
  thứ trong tuần, 2 câu đếm đồ vật (1–20 cái) và 1 câu tuổi (10–59).
- Luôn có phương án dễ nhầm nhất:
  - 3.500 với 35.000 won (삼천오백 / 삼만 오천);
  - giờ chẵn với giờ rưỡi;
  - ngày và tháng đổi chỗ;
  - 유월 với tháng 7, 시월 với tháng 4;
  - 14 với 41.
- Trả lời xong hiện câu bằng chữ Hangul. Không có dòng phiên âm, vì app chưa có cách đọc kiểu Việt
  tự sinh cho câu số tiếng Hàn.

**Dev**

- `lib/koNumbers.ts`:
  - `sinoNumber` (0–99.999, bỏ 일 trước 십/백/천/만, cách sau nhóm 만);
  - `nativeNumber(n, counted)` (1–99, rút gọn 한/두/세/네/스무);
  - `monthName`, `itemFor`, `koNumberQuiz`.
- `features/numbers/Numbers.tsx` chọn bộ cấu hình (`KITS`) theo gói: câu hỏi, dòng phiên âm (chỉ
  tiếng Trung có), lời giới thiệu và các quy tắc.
- `lib/packContent.ts`: `'/numbers': ['zh', 'ko']`.
- Test: `lib/koNumbers.test.ts` (từng quy tắc), `features/numbers/Numbers.test.tsx`.
