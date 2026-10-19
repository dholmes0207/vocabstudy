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

## Đơn vị đếm tiếng Hàn (20/10/2026)

**User**: "Tiếp tục cho mình". Hướng đã đề xuất là làm cho tiếng Hàn tương tự tiếng Trung.

Tiếng Hàn cũng có loại từ, gọi là đơn vị đếm (단위 명사): 책 두 권 = "hai quyển sách". Ý tưởng giống
lượng từ tiếng Trung, có thêm hai điểm khác: thứ tự là **danh từ + số + đơn vị**, và số là số
thuần Hàn ở **dạng rút gọn** (한, 두, 세, 네, 다섯).

**BA**

- Với gói tiếng Hàn, màn `/measure-words` hiện **"Đơn vị đếm"**: 9 đơn vị 개, 명, 마리, 권, 잔, 병, 장,
  대, 벌, mỗi đơn vị đặt cạnh loại từ tiếng Việt gần nhất, có nút nghe ("한 권"…).
- **Bài luyện 10 câu**:
  - Đề có dạng "책 두 ___", kèm nghĩa của danh từ. Không hiện cả cụm "hai quyển sách", vì chữ
    "quyển" sẽ lộ đáp án.
  - Số lượng ngẫu nhiên từ 1 đến 5, để gặp đủ 한 / 두 / 세 / 네 / 다섯.
  - Trả lời xong hiện "책 두 권", nghĩa "hai quyển sách", có nút nghe, dòng giải thích đơn vị và mẹo
    nếu có: 잔 với 병 cho đồ uống, 분 là cách đếm người lịch sự, mọi con vật kể cả cá đều đếm bằng
    마리.
- **Không bắt lỗi oan**: 우유 (잔/병), 맥주 (병/잔), 물 (병/잔), 휴대폰 (대/개), 옷 (벌/개). Đơn vị
  nào cũng đúng thì không bao giờ bị đưa vào làm phương án sai.
- Chỉ dùng danh từ đã có trong gói. Mục trong trang Luyện tập đổi thành mô tả chung cho cả hai
  ngôn ngữ.

**Dev**

- `lib/koCounters.ts`: `COUNTERS`, `COUNTER_ITEMS`, `counterPhrase`, `counterMeaning`,
  `koCounterQuiz`.
- `features/measure/KoCounters.tsx`. `MeasureWords.tsx` chọn theo gói: `ko` thì hiện `KoCounters`,
  còn lại hiện phần tiếng Trung, giữ nguyên như cũ.
- `lib/packContent.ts`: `'/measure-words': ['zh', 'ko']`.
- Test: `lib/koCounters.test.ts`, `features/measure/KoCounters.test.tsx`.
