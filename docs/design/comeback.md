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
