# Quay lại mỗi ngày (cho người mất gốc, dễ nản)

## User → BA → Dev

**Người học:** "Lỡ một hôm là mất chuỗi, thấy mình thất bại nên bỏ luôn." · "Mở app thấy nhiều việc quá, ngại." · "Học mãi không biết mình tiến tới đâu."

**BA — tiêu chí chấp nhận:**

1. **Khiên giữ chuỗi:** cứ 7 ngày liên tục được 1 khiên (tối đa 2). Lỡ đúng 1 ngày → khiên giữ chuỗi, lần mở sau có lời nhắn "khiên đã giữ chuỗi giúp bạn". Lỡ ≥ 2 ngày thì chuỗi bắt đầu lại, nhưng **kỷ lục** vẫn được nhớ.
2. **Mục tiêu nhỏ mỗi ngày:** chọn 5/10/20/40 câu (mặc định 10) trong Cài đặt → Học tập. Vòng tiến độ trên Trang chủ; đạt mục tiêu thì bầu trời ăn mừng (một lần mỗi ngày).
3. **Học nhanh 2 phút:** một nút → ôn từ đến hạn, hoặc nếu không có thì học 5 từ mới (`/learn?quick=1` chọn sẵn 5 từ).
4. **Chào khi quay lại:** nghỉ ≥ 2 ngày → lời chào ấm áp, không trách móc, kèm nút 2 phút. Biến mất ngay khi học lại.
5. **Bầu trời của bạn:** mỗi từ đã học thắp một ngôi sao (từ thành thạo thành sao vàng), ước tính "hiểu khoảng X% số từ trong một đoạn tiếng Anh thường ngày" và thanh tiến tới mốc tiếp theo (10, 25, 50, 100, 200…).

**Dev:**

- `src/lib/motivation.ts` (+ test): `nextStreak` (khiên, kỷ lục), `welcomeBack`, `goalProgress`, `coverageEstimate` (bảng tần suất ước lượng, nội suy log — chỉ để khích lệ), `nextMilestone`, `quickStartPath`.
- `StudyStats` thêm `shields`, `bestStreak`, `shieldUsedDay` (tuỳ chọn); `normalizeProgress` và `sync.ts` (chuẩn hoá + gộp: kỷ lục lấy max, khiên theo thiết bị học gần nhất) giữ các trường này.
- `Settings.dailyGoal`; Trang chủ: `features/dashboard/Motivation.tsx` (`WelcomeBack`, `DailyGoal`, `MySky`).

## Quà mỗi ngày (nhãn dán)

**User**: "Đạt mục tiêu rồi thì sao? Mai lại y như hôm nay."

**BA**: đạt mục tiêu nhỏ mở một "quà" — nhãn dán ngẫu nhiên cho bộ sưu tập 48 nhãn
(4 bộ × 12: Bầu trời, Động vật, Món ngon, Du lịch). Mỗi nhãn là một từ tiếng Anh kèm
nghĩa và nút nghe. Không bao giờ trùng cho tới khi đủ bộ. Album ở Thống kê, ô chưa mở
hiện "?" để gợi tò mò.

**Dev**: `src/lib/stickers.ts` (thuần, có test). `stats.stickers` = ngày → chỉ số
nhãn; `claimSticker(code, day)` chỉ ghi một lần mỗi ngày. Đồng bộ: hợp hai album theo
ngày, trùng ngày giữ chỉ số nhỏ hơn (cho kết quả như nhau theo cả hai chiều gộp).

## Hành trình 7 ngày đầu

**User**: "Mở app ra không biết hôm nay nên làm gì; làm mãi một kiểu thì chán."

**BA**: thẻ trên trang chủ từ ngày học thứ nhất tới hết ngày thứ bảy: 7 ô, mỗi ngày học
xong một ô sáng lên; mỗi ngày gợi ý một nhiệm vụ nhỏ và giới thiệu thêm một cách học
(học nhanh → ôn → Ghép cặp → Nghe thụ động → Âm khó → Luyện nói → mục tiêu nhỏ). Ngày
nào có học cũng tính là xong, nhiệm vụ chỉ là gợi ý. Về đích: chúc mừng và pháo sáng
cả bầu trời một lần, rồi thẻ tự ẩn.

**Dev**: `src/lib/journey.ts` (thuần, có test), `Journey` trong `Motivation.tsx`.

## Một chuỗi ngày duy nhất (26/11/2026, việc 2.3 trong `docs/PLAN.md`)

**User**: Thẻ "Thử thách hôm nay" có chuỗi riêng, về 0 khi lỡ một ngày, trong khi đầu trang hiện chuỗi học
có khiên. Hai con số khác nhau làm người học rối, và chuỗi riêng không tha ngày nào.

**BA**

- Chỉ còn **một chuỗi học**. Câu trả lời trong thử thách vốn đã tính vào chuỗi này; thẻ thử thách và màn
  xong thử thách giờ hiện đúng con số đó ("Chuỗi học N ngày").
- Mọi chỗ (đầu trang, trang chủ, Thống kê, thử thách) hiện **chuỗi hiện tại**: chuỗi đã đứt hiện 0 ngay,
  không còn hiện số cũ cho tới lần học sau. Lỡ đúng một ngày mà còn khiên thì chuỗi vẫn hiện, vì học hôm nay
  là khiên giữ chuỗi.

**Dev**

- `liveStreak(stats, day)` trong `src/lib/motivation.ts` (có test), dùng ở `Layout.tsx`, `Dashboard.tsx`,
  `Motivation.tsx`, `Stats.tsx`, `DailyChallenge.tsx`, `Challenge.tsx`.
- `src/lib/dailyChallenge.ts` bỏ `currentStreak` và trường `streak` của kết quả thử thách. Kết quả cũ đã lưu
  có trường này vẫn đọc được (trường thừa bị bỏ qua).
