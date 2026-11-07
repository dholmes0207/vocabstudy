# Trò chơi "Đúng hay sai?" (08/11/2026)

**User**: "nhớ là tạo hứng thú, hấp dẫn khi học, phong cách tránh nhàm chán".

## 1. Người học

- Các bài luyện cũ cần ngồi yên vài phút. Lúc chờ xe hay giữa hai việc, người học cần một thứ chơi được
  ngay, ngắn, có điểm số để muốn chơi lại.
- "Ghép cặp" và "Xếp câu" (`docs/design/engagement-mobile.md`) đã có, nhưng chưa có trò nào chạy theo
  nhịp đếm ngược.

## 2. Cách chơi

- 60 giây. Mỗi thẻ có một từ (kèm phiên âm, pinyin… nếu gói có) và một nghĩa tiếng Việt. Khoảng một
  nửa số thẻ là nghĩa đúng, còn lại là nghĩa của một từ khác. Bấm ✓ hoặc ✗ (bàn phím: ← sai, → đúng).
- Đúng +10 điểm × hệ số. Đúng 5 câu liền thì ×2, 10 câu ×3, 15 câu trở lên ×4; hiện 🔥 và số câu liền.
- Sai: mất chuỗi, rung thẻ, trừ 3 giây, để bấm bừa không có lợi.
- Hết giờ: điểm, số câu đúng/sai, kỷ lục (lưu `gamesStore.bestBlitz`), pháo giấy khi phá kỷ lục, XP =
  điểm / 30 (ít nhất 2).
- Dùng từ người học đã gặp trước, thiếu thì lấy từ đầu giáo trình, giống "Ghép cặp"; dùng được cho mọi gói.
  Như các trò khác, không ghi vào lịch ôn SRS.

## 3. Dev

- `lib/games.ts`: `pickBlitzDeck`, `blitzMultiplier`, `blitzXp`, `BLITZ_SECONDS`, `BLITZ_PENALTY` (có test).
- `features/games/BlitzGame.tsx`, route `/games/blitz`, mục trong trang Luyện tập. Đồng hồ là một mốc
  kết thúc (`performance.now()`), nên trừ giờ chỉ là dời mốc.
