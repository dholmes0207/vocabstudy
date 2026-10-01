# Bầu trời sống động (ambient sky)

## User → BA → Dev

**Người học:** "Mở web ra thấy đẹp, có tuyết rơi, có sao, rê chuột thấy nó phản hồi — học cho có hứng."

**BA chốt tiêu chí chấp nhận:**

1. Có bầu trời ở mọi màn hình: đêm (tối) có sao lấp lánh, trăng, cực quang, sao băng; ngày (sáng) là trời mùa đông nhạt, mây trôi.
2. Tuyết rơi; chuột/ngón tay **gạt tuyết sang bên**.
3. Theo chuột: các lớp sao **trôi ngược chiều chuột (parallax)**, quầng sáng đi theo con trỏ, **sao gần con trỏ nối thành chòm sao**, vệt lấp lánh khi di chuột, **bung sao khi bấm/chạm** — kể cả khi bấm lên thẻ.
4. Thẻ ở Trang chủ và Luyện tập **nghiêng 3D theo chuột** có vệt sáng.
5. Không được làm hại việc học: chữ luôn đọc rõ (thẻ đục, hiệu ứng nằm sau nội dung trừ lấp lánh); **dịu đi khi đang học** (phiên học/ôn/quiz).
6. Không được làm hại máy: không tốn CPU khi tab ẩn; điện thoại/máy yếu/Data Saver tự dùng mức nhẹ; khung hình chậm thì tự hạ mức; người bật **Giảm chuyển động** chỉ thấy một khung tĩnh.
7. Tắt/chỉnh được trong **Cài đặt → Giao diện**: Tự động / Đầy đủ / Nhẹ / Tắt, Tuyết rơi, Lấp lánh theo chuột.

**Dev:**

- `src/lib/sky.ts` — toán thuần, có test (`sky.test.ts`): chọn mức chất lượng, ngân sách hạt theo diện tích màn hình, sao (twinkle, parallax, chòm sao), tuyết (rơi, lắc, gió, bị đẩy), lấp lánh, sao băng. RNG có seed nên chòm sao của mỗi người cố định qua các lần mở.
- `src/lib/skyRenderer.ts` — canvas + vòng lặp `requestAnimationFrame`, sprite vẽ sẵn (rẻ hơn tạo gradient cho hàng trăm chấm mỗi khung), DPR bị chặn, dừng khi `document.hidden`, đổi bảng màu theo `html.dark`, đo trung vị thời gian khung hình và hạ `full → lite` nếu > 26 ms.
- `src/components/SkyBackdrop.tsx` — hai canvas: một sau trang (`.sky`, z-index −1), một trên trang cho lấp lánh (`.sky-fx`, z-index 45, `pointer-events: none`).
- `src/hooks/useTilt.ts` + `src/lib/tilt.ts` — nghiêng thẻ bằng biến CSS (không re-render), chỉ với chuột; CSS tắt khi `hover: none` hoặc giảm chuyển động.
- Header, sidebar, thanh điều hướng dưới chuyển sang kính mờ để bầu trời lộ ra.

## Ngân sách (mỗi khung)

| Mức    | Sao      | Tuyết    | Lấp lánh tối đa | Sao băng | DPR tối đa |
| ------ | -------- | -------- | --------------- | -------- | ---------- |
| full   | 60 – 320 | 40 – 180 | 160             | 4–9 s    | 2          |
| lite   | 40 – 170 | 18 – 80  | 60              | 9–18 s   | 1.5        |
| static | 40 – 280 | 0        | 0               | —        | 2          |
