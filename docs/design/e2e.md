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

`e2e/exam-practice.spec.ts`, phần luyện thi:

1. Bài thi nhỏ TOEIC chạy hết 7 Part (đủ 26 câu) tới trang kết quả có khoảng điểm Nghe và Đọc.
2. Mở trang Luyện thi HSK khi đang học tiếng Anh, bấm "Switch to Chinese", làm bài thi nhỏ HSK 1
   (đủ 20 câu) tới dòng điểm ước lượng.
3. Đã vào app một lần thì ngắt mạng vẫn luyện được Part 7 TOEIC.

`e2e/learning-path.spec.ts`, lộ trình theo cấp:

1. Người mới vào lộ trình từ thẻ ở trang chủ, thấy cấp 1 với nút "Làm tiếp" mở bài từ đầu tiên, 5 cấp còn
   khoá; chơi thử thách cấp 1 tới màn kết quả rồi quay về lộ trình.
2. Gói tiếng Trung có lộ trình riêng, bắt đầu bằng Pinyin & thanh điệu, tới cấp HSK 3.

`e2e/practice-pages.spec.ts`, các trang luyện thêm cùng lộ trình (08/11/2026):

1. "Đúng hay sai?": bấm bắt đầu, trả lời vài thẻ, thấy điểm và đồng hồ.
2. Nhập vai: danh sách có cảnh gắn nhãn TOEIC; cảnh gọi cà phê đọc câu người bán rồi tới lượt mình.
3. IELTS Task 1: trang IELTS không rộng hơn màn điện thoại (trước đây danh sách đề Task 2 cắt chữ bằng `…`
   làm cột lưới giãn tới ~1200px và Chrome di động thu nhỏ cả trang); biểu đồ hiện và cũng không làm trang
   rộng ra (bảng số liệu ẩn cho trình đọc màn hình từng làm vậy: `sr-only` đặt thẳng lên `<table>` không có
   tác dụng vì bảng bỏ qua `width: 1px`, nay đặt lên thẻ bọc ngoài); chọn câu tổng quan, sang bước điền từ.
4. Tiếng Trung: chữ dễ nhầm trả lời một câu; cấu trúc câu có vai "cụm giới từ" và vào được lượt trộn.
5. Tiếng Hàn có lộ trình riêng, bắt đầu bằng Hangul, tới cấp 3.

Hai test bài thi nhỏ không kiểm tra đáp án (test đơn vị đã làm), chỉ kiểm tra mọi phần ghép lại chạy
được trên trình duyệt thật và đủ số câu.

Test tự đọc đáp án từ `/data/en.json` mà app tải, nên không phụ thuộc vào từ cụ thể nào. Đồng hồ
được tua bằng `context.clock` của Playwright, không phải chờ thật.

**Chạy:**

```bash
npm run build
npm run e2e          # playwright test -c e2e, tự mở vite preview ở cổng 4173
```

- Lần đầu trên máy mới: `npx playwright install chromium`.
- CI chạy E2E ở cuối job duy nhất, dùng lại bản build vừa dựng (`ci.md`). Hỏng thì trace được lưu thành artifact `e2e-trace`;
  mở bằng `npx playwright show-trace <file>`.

Đã thử cố ý tắt service worker (`DISABLED = true` trong `public/sw.js`): test ngoại tuyến báo đỏ
như mong đợi.

## Kiểm tra truy cập tự động (13/11/2026, việc 2.8 trong `docs/PLAN.md`)

- `e2e/accessibility.spec.ts` chạy axe-core (`@axe-core/playwright`) trên 7 màn: trang giới thiệu, trang chủ, Học, Ôn,
  Luyện tập, Thống kê, Cài đặt. Luật WCAG 2.0 và 2.1 mức A và AA, trên khổ điện thoại như các test khác.
- Lỗi mức **serious** hoặc **critical** làm test đỏ; thông báo liệt kê luật và phần tử đầu tiên vi phạm.
- Trước khi quét, test chờ mọi hiệu ứng có hồi kết chạy xong. Nội dung hiện dần (`animate-fade-in`), nên quét giữa
  chừng thì chữ trông nhạt hơn thật và axe báo nhầm lỗi tương phản.
- Lần chạy đầu đã sửa:
  - thẻ hành động bị khoá ở trang chủ: chữ không còn mờ cả khối (`opacity-60` làm tương phản dưới 4,5:1), chỉ biểu
    tượng mờ, chữ dùng màu xám đủ đậm;
  - ba nút có tên đọc không chứa chữ hiển thị (WCAG 2.5.3): nút đổi ngôn ngữ giao diện ("EN"/"VI"), nút thử thách hôm
    nay ("Làm ngay"/"Go"), nút nghe thử trong Cài đặt ("Try it").
- Tiếp theo: quét cả giao diện tối, và các màn luyện tập khi đang làm bài.
