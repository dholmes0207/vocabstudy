# Test end-to-end (`e2e/`)

**Vì sao:** test đơn vị và test giao diện (Vitest + jsdom) chạy từng phần riêng lẻ. Chúng không
bắt được lỗi chỉ hiện ra khi các phần ghép với nhau trên trình duyệt thật:

- tiến độ lưu trong trình duyệt, tải lại trang thì còn hay mất;
- service worker cho dùng app khi mất mạng;
- lịch ôn: từ học hôm nay có quay lại vào đúng ngày sau không.

**Có gì** (`e2e/main-flow.spec.ts`, chạy trên bản build production, khổ điện thoại):

1. Người học mới chọn tiếng Anh ở trang giới thiệu, học 5 từ đầu tiên, trả lời đúng hết phần tự
   nhớ lại. Tải lại trang thì bài kế tiếp bắt đầu từ từ thứ 6. Hôm đó chưa có từ nào cần ôn; tua
   đồng hồ 3 ngày thì đúng 5 từ đó đến hạn, ôn xong thì thấy "Reviews done for today!".
2. Đã vào app một lần thì ngắt mạng vẫn mở được trang chủ và bắt đầu bài học.
3. Chuyển sang tiếng Hàn thì có trang Bảng chữ Hangul.

Test tự đọc đáp án từ `/data/en.json` mà app tải, nên không phụ thuộc vào từ cụ thể nào. Đồng hồ
được tua bằng `context.clock` của Playwright, không phải chờ thật.

**Chạy:**

```bash
npm run build
npm run e2e          # playwright test -c e2e, tự mở vite preview ở cổng 4173
```

- Lần đầu trên máy mới: `npx playwright install chromium`.
- CI chạy trong job riêng "E2E (Playwright)". Hỏng thì trace được lưu thành artifact `e2e-trace`;
  mở bằng `npx playwright show-trace <file>`.

Đã thử cố ý tắt service worker (`DISABLED = true` trong `public/sw.js`): test ngoại tuyến báo đỏ
như mong đợi.
