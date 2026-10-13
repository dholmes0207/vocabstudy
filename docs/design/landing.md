# Trang giới thiệu, đường dẫn sạch và trang pháp lý

Mục tiêu: người lần đầu nghe tên VocaStudy mở `vocastudy.app` thấy ngay đây là sản phẩm của
một nhóm làm nghiêm túc, không phải một trang demo.

**User**

- Người mới: "Mở link thấy ngay màn hình học, chưa hiểu app này là gì, có mất phí không,
  dữ liệu của mình đi đâu."
- Người đã học: "Mình vào để học, đừng bắt mình xem trang quảng cáo mỗi lần."
- Người chia sẻ link: "Gửi qua Zalo/Messenger chỉ hiện một icon nhỏ, nhìn không đáng tin."

**BA**

- `/` là trang giới thiệu, gồm các phần:
  1. Hero: lời hứa, hai nút "Học miễn phí" và "Xem cách học", hình minh hoạ dựng bằng HTML
     từ chính giao diện thẻ.
  2. Số liệu thật.
  3. 6 tính năng.
  4. 3 bước học.
  5. "Dành cho người Việt".
  6. Hỏi đáp.
  7. Lời mời cuối trang.
- Mọi con số và tính năng phải có thật trong app:
  - 4.440 từ trong `data/en.json`;
  - 100 mẫu câu;
  - 2 giọng đọc (aria, guy).
  - Không có lời chứng thực, logo báo chí hay số người dùng bịa ra.
- Trang học chuyển từ `/` sang `/home`.
  - Ai đã dùng app trên máy này (đã mở app, đã đăng nhập hoặc đã có tiến độ) mà gõ thẳng
    `vocastudy.app` thì được đưa vào `/home`.
  - Bấm "Tính năng" hay logo từ một trang giới thiệu khác vẫn ở lại trang giới thiệu.
- Link xác nhận email của Supabase luôn đi vào app, giữ nguyên `#access_token…`.
- Trang `/about`: sứ mệnh, câu chuyện, giá trị, liên hệ. Không bịa ra đội ngũ.
- Trang `/privacy` và `/terms`:
  - viết đúng theo luồng dữ liệu thật (Supabase, Cloudflare, OpenAI, Google Fonts, Google
    Calendar khi người dùng bật, nhận dạng giọng nói của trình duyệt);
  - không quảng cáo, không công cụ theo dõi;
  - nhắc tới Nghị định 13/2023;
  - xoá dữ liệu qua email trong 30 ngày.
  - **Cần người có chuyên môn pháp lý đọc lại trước khi coi là bản chính thức.**
- Đường dẫn sạch, ví dụ `vocastudy.app/phrases/food` thay cho `vocastudy.app/#/phrases/food`.
  Link cũ có `#/` vẫn chạy.

**Dev**

- Đổi `HashRouter` sang `BrowserRouter`; `vite.config.ts` đặt `base: '/'`.
  - Mọi đường dẫn trong `index.html` và manifest đều là đường dẫn tuyệt đối.
- Cloudflare Pages tự trả `index.html` cho đường dẫn lạ vì repo không có `404.html` ở gốc.
  Đừng thêm file này, nếu không mọi link sâu sẽ trả 404.
  - `/api/*` (Functions), `/audio`, `/data` không bị ảnh hưởng.
- `src/lib/entry.ts` là phần thuần, có test:
  - `hashToPath` chuyển `#/x` thành `/x` (và `#/` thành `/home`); chạy trong `main.tsx`
    trước khi render;
  - `isAuthCallback` nhận diện fragment/`?code=` của Supabase;
  - `hasUsedApp` / `markEntered` dùng khoá `vocab.app.entered`, được ghi khi `Layout` mở.
- `signUp` gửi `emailRedirectTo: <origin>/home`.
  - Supabase chỉ dùng URL này nếu nó nằm trong Auth → URL Configuration → Redirect URLs.
  - Nếu không, nó quay về Site URL và `/` tự chuyển tiếp vào app.
- Phần giới thiệu nằm trong `src/features/marketing/`:
  - `MarketingLayout` (header, menu điện thoại, footer 4 cột);
  - `Home` (chọn giữa trang giới thiệu và chuyển hướng);
  - `Landing`, `About`;
  - `LegalPage` dùng nội dung trong `legal.ts`.
  - Tất cả tải lười: trang học không phải tải thêm byte nào.
- `useDocumentTitle` đặt tiêu đề tab cho từng trang.
- `public/robots.txt` chặn `/admin`; `public/sitemap.xml` liệt kê các trang công khai.
- Service worker lên `v3`. Khi offline, mọi đường dẫn đều trả shell `/` đã lưu sẵn.
