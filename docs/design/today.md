# Trang chủ "Hôm nay" (26/11/2026, việc 2.1 trong `docs/PLAN.md`)

**User**: Trang chủ có nhiều khối ngang nhau (kế hoạch hôm nay hai thẻ, tổng quan tiến độ, chơi mà học, mẫu câu,
thử thách…), người học không biết bấm vào đâu trước.

## Người học

- Mở app là thấy **một thẻ "Hôm nay"** với **một nút chính**, đổi theo tình trạng:
  1. còn từ đến hạn: "Ôn N từ đến hạn" → `/review`;
  2. còn suất từ mới hôm nay: "Học 5 từ mới" → `/learn?quick=1`;
  3. còn bước luyện trên lộ trình: tên bước đó → trang của bước;
  4. không còn gì: "Xong hôm nay! 🎉", nút phụ "Luyện thêm" → `/practice`.
- Người mới (chưa học từ nào) thấy thẻ "Bắt đầu thật dễ" như trước; người quay lại sau ít nhất 2 ngày thấy thẻ chào
  mừng. Khi hai thẻ đó hiện thì thẻ "Hôm nay" ẩn, để luôn chỉ có một nút chính.
- Ba vùng:
  - **Hôm nay:** thẻ trên, mục tiêu nhỏ và bầu trời;
  - **Lộ trình của bạn:** thẻ lộ trình, "Hôm nay thử gì mới?";
  - **Khám phá:** "Tổng quan tiến độ" và "Chơi mà học" được gập lại, vì đã có ở `/stats` và `/practice`.
- Khối "Kế hoạch hôm nay" hai thẻ (Ôn tập, Học từ mới) bỏ đi, vì thẻ "Hôm nay" đã thay.

## Dev

- `src/lib/todayPlan.ts` (thuần, có test): `todayPlan({ due, newLeft, pathStep })`.
- `src/features/dashboard/TodayCard.tsx`: lấy bước lộ trình bằng `practiceSuggestion` (`lib/learningPath.ts`).
- `Dashboard.tsx`: thêm `TodayCard`, bỏ `ActionCard`, gói hai khối cuối trong `<details>`. Test trong `Dashboard.test.tsx`.
