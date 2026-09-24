# Điện thoại mượt hơn, học vui hơn, vượt 1000 từ

> Quy trình 3 vai như mọi đợt: Người học → BA → Dev. Ngày 24–25/09/2026.

## 1. Người học (dùng Android, học lúc chờ xe)

- "Cái bong bóng AI tròn tròn cứ đè lên nút **Tiếp** với nút loa. Bấm trượt hoài."
- "Thanh dưới có 6 nút chữ bé xíu. Còn Thống kê với Cài đặt thì mình tìm mãi mới thấy."
- "Đang học mà thẻ dài quá, phải kéo xuống tận dưới mới bấm được **Tiếp** — cầm một tay mỏi lắm."
- "Bấm vào thẻ bộ từ xong nó cứ 'nổi' lên như đang được chọn."
- "Công tắc trong Cài đặt nhỏ quá."
- "Học xong 1000 từ rồi thì sao? Mình muốn học tiếp."
- "Ngày nào cũng chỉ lật thẻ với trắc nghiệm, được một tuần là chán. Có trò gì vui vui không, kiểu ghép cặp hay xếp câu?"
- "Mình muốn cài app ra màn hình chính như app thật."

## 2. BA

| Vấn đề (đo trên 360×800, giả lập Android)                               | Mức |
| ----------------------------------------------------------------------- | --- |
| Nút AI nổi (56px, góc phải) che nút hành động ở Học/Ôn/Kiểm tra/Tra cứu | P0  |
| Thanh dưới 6 mục × 60px; Thống kê/Cài đặt chỉ nằm trong menu            | P0  |
| Nút hành động chính nằm cuối thẻ dài → phải cuộn mỗi thẻ                | P0  |
| Hiệu ứng hover bị "dính" sau khi chạm (thiết bị cảm ứng)                | P1  |
| Công tắc 48×28px (dưới chuẩn 44px vùng chạm)                            | P1  |
| Không cài được như app (thiếu web app manifest)                         | P1  |
| Chưa có gì ngoài 1000 từ; phiên học lặp lại một kiểu                    | P1  |

**User stories**

- **M1 — Chế độ tập trung trên điện thoại:** đang trong phiên Học/Ôn/Kiểm tra thì ẩn thanh dưới; nút hành động chính luôn dính ở đáy màn hình, chừa vùng an toàn và bàn phím ảo.
- **M2 — Điều hướng 5 mục:** Trang chủ · Học · Ôn tập · **Luyện tập** (trung tâm gồm Kiểm tra, Trò chơi, Luyện nói) · Tra cứu. Nút AI chuyển lên thanh tiêu đề trên điện thoại.
- **M3 — Cài lên màn hình chính** (manifest, biểu tượng, màu thanh trạng thái).
- **G1 — Trò chơi "Ghép cặp":** 6 cặp Anh–Việt, tính giờ, lưu kỷ lục; sai thì rung/nháy đỏ, không trừ điểm.
- **G2 — Trò chơi "Xếp câu":** xếp các mảnh thành câu ví dụ đúng — luyện trật tự từ và ngữ cảnh.
- **G3 — Từ của ngày** trên Trang chủ; **combo** khi trả lời đúng liên tiếp.
- **E1 — Vượt 1000 từ:** gói từ có "chặng" (Cơ bản A1–A2 → Mở rộng B1); từ 1001 trở đi có đủ nghĩa, ví dụ, cụm đi kèm, mẹo, phiên âm, audio.

Trò chơi **không** ghi vào lịch SRS: chạm nhầm một ô khi đang đua giờ không có nghĩa là đã quên từ, nên lịch ôn chỉ phản ánh việc nhớ lại thật. Đổi lại, chơi vẫn được **cộng XP và tính vào chuỗi ngày học** — chơi cũng là học.

## 3. Dev

- `uiStore.immersive` + hook `useImmersive()`: phiên học bật cờ khi mount. `Layout` ẩn thanh dưới và nút AI nổi trên màn nhỏ. Thanh hành động dùng lớp `session-actions` (sticky, `env(safe-area-inset-bottom)`). Thẻ viewport có `interactive-widget=resizes-content` để bàn phím Android đẩy thanh hành động lên.
- Tailwind `future.hoverOnlyWhenSupported`; `-webkit-tap-highlight-color: transparent`.
- `/practice` (trung tâm luyện tập), `/games/match`, `/games/order`. Phần lõi thuần nằm trong `lib/games.ts` (chọn cặp, chia mảnh câu, chấm), có test.
- `public/manifest.webmanifest` + icon PNG 192/512 (maskable).
- Mở rộng: `Word.stage?: 1 | 2`, test dataset chấp nhận ≥ 1000 từ với id liên tục; chữ "1000 từ" lấy từ `pack.meta.count`.
- `studyStore.addPlayXp(code, xp)`: cộng XP và cập nhật chuỗi ngày, không đụng thẻ SRS; `mergeProgress` vẫn lấy giá trị lớn nhất nên đồng bộ không cần đổi.
