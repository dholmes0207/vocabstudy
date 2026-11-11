# CI tiết kiệm phút GitHub Actions (09/11/2026)

**User**: "làm PR tối ưu CI trước đi" (sau khi Actions dừng vì hết phút miễn phí của tháng).

## 1. Chuyện gì đã xảy ra

- Repo để private, nên GitHub Actions chỉ miễn phí 2.000 phút mỗi tháng. Từ 01/11 tới 09/11 có 451 lần chạy:
  CI 341 lần (khoảng 1.630 phút chạy thực), thu giọng câu 98 lần (khoảng 250 phút), còn lại vài phút. Phút tính
  tiền còn cao hơn vì mỗi job làm tròn lên phút và CI có hai job song song.
- Mỗi lần CI tốn khoảng 10 phút tính tiền: job kiểm tra 5,3 phút (6), job E2E 3,3 phút (4). 57 lần là chạy lại
  trên `main` sau khi merge.
- Hết phút thì mọi workflow đều không chạy: CI, thu giọng câu mới, và tác vụ giữ Supabase thức
  (`keepalive.md`). Web vẫn chạy vì Cloudflare Pages tự build.

## 2. Thay đổi

- **Chỉ chạy cho pull request.** PR được squash-merge nên `main` nhận đúng cây đã kiểm. Bỏ lần chạy lại sau
  merge. Vẫn chạy tay được bằng "Run workflow" (`workflow_dispatch`).
- **PR chỉ sửa tài liệu thì bỏ qua** (`docs/**`, `*.md`). PR có cả code lẫn tài liệu vẫn chạy.
- **Gộp hai job làm một**: checkout, `npm ci`, build chỉ làm một lần; E2E dùng luôn bản build vừa dựng. Mỗi
  lần chạy còn khoảng 8 phút tính tiền thay vì 10, và mỗi lần merge không tốn thêm 10 phút.
- **`timeout-minutes: 20`** để một lần chạy bị treo không ăn hết phút.
- Đã thử đổi pool của Vitest (forks → threads): không nhanh hơn (48,5 so với 48,8 giây trên máy 4 nhân), nên
  giữ nguyên. Phần lớn thời gian test là dựng jsdom và import cho từng file.

## 3. Đánh đổi

- Hai PR merge sát nhau có thể chưa từng được kiểm chung. Khi nghi ngờ, bấm "Run workflow" trên `main`.
- Thời gian chờ một lần CI dài hơn một chút (các bước chạy nối tiếp thay vì hai job song song), đổi lại ít phút
  hơn.

## 4. Cập nhật phụ thuộc tự động (11/11/2026)

- `.github/dependabot.yml`: mỗi sáng thứ Hai, Dependabot mở PR cập nhật thư viện npm và các action của GitHub.
  - Bản minor và patch được gộp: một PR cho thư viện chạy trên máy người học (`runtime`), một PR cho công cụ build,
    lint, test (`tooling`), một PR cho action. Bản major đi riêng từng PR, đọc ghi chú phát hành rồi mới merge.
  - Mỗi PR chạy CI như mọi PR khác; tối đa 5 PR npm mở cùng lúc.
  - React 19 bị bỏ qua: đã thử ngày 07/11/2026, chạy được mà không sửa dòng code nào, nhưng gói JS chính tăng khoảng
    23 kB (gzip) trong khi app chưa dùng tính năng mới nào. Xem lại khi React 18 hết được hỗ trợ hoặc khi cần tính năng
    của bản 19.
  - Tiêu đề PR do Dependabot đặt bằng tiếng Anh, có tiền tố `chore(deps)` hoặc `chore(ci)`.
- `.github/SECURITY.md`: cách báo lỗ hổng qua email, không mở issue công khai. Cần vì repo đã công khai.

## 5. Tiếp theo

1. Nếu vẫn thiếu phút: chuyển thu giọng câu (`text-audio.yml`) sang chạy mỗi ngày một lần thay vì mỗi lần merge.
