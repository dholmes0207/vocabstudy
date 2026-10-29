# Độ trễ khi mở app (29/10/2026)

**User**: "Cải thiện độ trễ, để người dùng cảm nhận tốt nhất."

## Cách đo

Playwright mở `/home` như một người học tiếng Anh đã quay lại (đã chọn ngôn ngữ). Điện thoại tầm trung
(Pixel 7), mạng 4G chậm (độ trễ 150 ms, tải xuống 1,6 Mbps), CPU chậm 4 lần. "Dùng được" là lúc nút
học trên Dashboard hiện ra. Mỗi số là trung vị của 3 lần, đo trên Cloudflare thật (có nén brotli),
không đo trên `vite preview` vì máy chủ đó không nén.

## Trước khi sửa

|                       | Dashboard dùng được | Vẽ lần đầu |
| --------------------- | ------------------- | ---------- |
| Lần đầu vào           | 7,7 s               | 2,9 s      |
| Vào lại (đã có cache) | 2,5 s               | 0,8 s      |

- `en.json` nén là 566 KB, mất 4,2 s tải. Trong đó cụm từ đi kèm (34%), mẹo nhớ (18%) và họ từ (8%)
  chỉ hiện khi mở một thẻ.
- Các bước nối tiếp nhau: code Dashboard chỉ bắt đầu tải khi gói xong; manifest giọng đọc
  (`/audio/<code>/index.json`) chỉ tải sau gói.
- Profile CPU lúc vào lại: React vẽ Dashboard khoảng 400 ms, đọc `en.json` (JSON.parse + kiểm tra)
  khoảng 280 ms, dựng bầu trời sao khoảng 190 ms, chen đúng lúc Dashboard đang vẽ.

## Đã làm

- **Tách chi tiết từ** (`src/lib/packDetails.ts`, plugin `minify-language-packs` trong
  `vite.config.ts`): lúc build, `collocations`, `tip`, `family` sang `data/<code>.details.json`.
  `en.json` còn 282 KB nén. `public/data` không đổi: script soạn từ và test vẫn dùng như cũ, dev
  server phục vụ gói nguyên vẹn.
  - App tải file chi tiết ngay sau khi gói sẵn sàng (`dataStore.details`). `WordInsight` và
    `WordOfDay` đọc qua `useWordDetails`; trường còn nằm trong từ (dev, test) được ưu tiên.
  - Không ghép chi tiết vào lại gói: thay mảng từ sẽ làm các màn dùng `pack.words` dựng lại bài đang
    học.
  - Service worker tải trước file chi tiết cùng gói, để thẻ vẫn đủ khi offline.
- **Bớt chờ nối tiếp**: manifest giọng đọc tải cùng lúc với gói; ở `/home`, code Dashboard tải ngay
  khi app mở.
- **Bầu trời sao khởi động khi trình duyệt rảnh** (`requestIdleCallback`, muộn nhất 1,5 s). Nền
  gradient CSS có từ đầu, sao hiện dần.

## Sau khi sửa

|                       | Dashboard dùng được | Vẽ lần đầu |
| --------------------- | ------------------- | ---------- |
| Lần đầu vào           | 4,7 s (−40%)        | 2,6 s      |
| Vào lại (đã có cache) | 1,6 s (−35%)        | 0,7 s      |

## Chưa làm

- **Supabase trong bundle chính**: khoảng 57 KB nén trong 97 KB, gồm cả storage, realtime,
  functions mà app không dùng. Hoãn tải nó sẽ bớt thêm khoảng nửa giây ở lần vẽ đầu trên máy yếu,
  nhưng phải đổi cách đăng nhập và đồng bộ dùng client (5 file), nên để sau.
