# Lượng từ tiếng Trung

**User**: "Cải thiện thêm phần học tiếng Trung."

Bài ngữ pháp `zh-measure` đã giải thích 个, 本, 杯, 只, nhưng chỉ có vài câu luyện. Lượng từ lại
là chỗ người học phải nhớ từng cặp danh từ – lượng từ. Người Việt có lợi thế vì tiếng Việt cũng
có loại từ ("một **quyển** sách", "một **con** mèo"): chỉ cần đặt hai bên cạnh nhau.

**BA**

- Màn mới **"Lượng từ"** (`/measure-words`), chỉ có ở gói tiếng Trung. Màn nằm trong trang
  Luyện tập, ngay sau "Pinyin & thanh điệu".
- **Bảng tra** gồm 9 lượng từ: 个, 本, 杯, 件, 只, 条, 张, 块, 口.
  - Mỗi dòng có pinyin, loại từ tiếng Việt gần nhất và thứ nó dùng để đếm.
  - Có nút nghe, ví dụ đọc "一本".
- **Bài luyện 10 câu**:
  - Đề có dạng "一 ___ 书", kèm pinyin và nghĩa của danh từ; chọn 1 trong 4 lượng từ.
  - Trả lời xong thì hiện cả cụm: 一本书, yì běn shū, "một quyển sách". Có nút nghe, dòng giải
    thích lượng từ và mẹo nếu có.
    - Mẹo phân biệt cái cốc với cốc trà: 一个杯子 so với 一杯茶.
    - Người trong nhà đếm bằng 口: 我家有三口人.
  - Cuối lượt cộng XP như các phần luyện nhanh khác (pinyin, Hangul). Kết quả không ghi vào lịch
    ôn.
- **Không bắt lỗi oan**: lượng từ nào người bản xứ cũng chấp nhận thì không bao giờ được đưa vào
  làm đáp án sai.
  - Ví dụ: 狗 dùng được cả 只 lẫn 条, 鱼 cả 条 lẫn 只, 手表 cả 块 lẫn 只, 人 trong nhà cả 口 lẫn 个.
  - Những danh từ có nhiều lượng từ phổ biến khác (手机, 电脑, 椅子…) chưa được đưa vào đề.
- 一 được đọc theo thanh của chữ đứng sau: 一个 yí gè, 一本 yì běn.

**Dev**

- `lib/measureWords.ts`:
  - dữ liệu `MEASURES`, `MEASURE_ITEMS` (`also`: các lượng từ cũng đúng; `frame`: câu khung
    khi không đếm bằng 一);
  - `phrase()`, `yiBefore()`, `measureQuiz()`, `measureXp()`.
- `features/measure/MeasureWords.tsx` dùng `GameShell` và `GameResult` của phần trò chơi.
- `lib/packContent.ts`: `'/measure-words': ['zh']`. Mục trong trang Luyện tập nằm ở
  `features/practice/entries.ts`.
- Test:
  - `lib/measureWords.test.ts`: danh từ có trong gói, mọi lượng từ đều được hỏi, đáp án sai không
    bao giờ là lượng từ cũng đúng, 一 đọc đúng thanh;
  - `features/measure/MeasureWords.test.tsx`.

**Bổ sung (19/10/2026)**: thêm 6 danh từ của gói mới để đề đa dạng hơn: 票 và 报纸 (张), 事情 (件,
kèm mẹo "件 đếm cả việc"), 孩子 và 房间 (个), 船 (条; 只 cũng đúng nên không bao giờ là phương án
sai). Danh sách hỏi có 27 danh từ.
