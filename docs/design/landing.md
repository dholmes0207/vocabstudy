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
  2. "Bạn muốn học ngôn ngữ nào?" (`LanguagePicker`, thêm ngày 17/10/2026).
     - Mỗi ngôn ngữ có trong `public/data/index.json` là một thẻ: cờ, tên, số từ, nhãn beta.
       Bấm vào thẻ là mở `/home?lang=…`. Ô cuối mời người học gửi email gợi ý ngôn ngữ.
     - Danh sách sinh từ manifest, nên thêm gói mới thì thẻ tự hiện, không phải sửa trang.
     - Trang giới thiệu tự tải manifest và không ghi gì vào `dataStore`. Tải lỗi thì mục này
       ẩn đi, còn app không bị chuyển sang trạng thái lỗi.
     - Lý do: Busuu, Babbel, Clozemaster, Cake đều hỏi câu này ngay đầu trang (xem
       `docs/research/2026-10-17-language-apps.md`).
  3. Số liệu thật.
  4. 6 tính năng.
  5. 3 bước học.
  6. "Dành cho người Việt".
  7. Hỏi đáp.
  8. Lời mời cuối trang.
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
  - Từ 17/10/2026, trang giới thiệu VocaStudy là **nơi học nhiều ngoại ngữ** cho người Việt,
    không phải app tiếng Anh. User: "không chỉ học 1, 2 hay 3 ngôn ngữ, mà hướng tới là học
    nhiều ngôn ngữ".
  - Phần "Một cách học, cho mọi ngôn ngữ" gồm một thẻ cho mỗi ngôn ngữ đang có, mỗi thẻ có
    link `/home?lang=…`. Cuối danh sách là ô "Ngôn ngữ tiếp theo", mời người học gửi email
    gợi ý.
  - Không nêu tên ngôn ngữ sắp làm và không ghi số liệu, vì số liệu đổi theo từng đợt nội
    dung; số liệu chỉ nằm trên trang chủ và đã có test.
  - `About.test.tsx` đọc `public/data/index.json`: thêm ngôn ngữ mới mà quên thẻ trên trang
    About thì test báo lỗi.
  - Câu giới thiệu ở chân trang cũng không nhắc riêng tiếng Anh.
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

## Cập nhật pháp lý ngày 14/10/2026

**User** (chủ dự án, sau khi nhờ người rà soát pháp lý): "Trang pháp lý vẫn dẫn Nghị định
13/2023, mà nghị định này đã bị thay thế."

**BA**

- Căn cứ mới:
  - Luật Bảo vệ dữ liệu cá nhân 2025 (91/2025/QH15, hiệu lực 01/01/2026);
  - Nghị định 356/2025/NĐ-CP (thay Nghị định 13/2023);
  - Luật Trí tuệ nhân tạo 2025 (134/2025/QH15, hiệu lực 01/03/2026).
- Áp dụng bản rà soát, nhưng **không đưa vào câu nào sai với hệ thống**. Cụ thể:
  - không có Cloudflare Web Analytics (đã kiểm tra trên production; chủ dự án chọn không
    bật);
  - không dùng IndexedDB;
  - Google Calendar chỉ là link mở trang tạo sự kiện, không có kết nối OAuth;
  - câu tự đặt và tiến độ mẫu câu không được đồng bộ;
  - đơn vị vận hành: Hà Nội (chủ dự án xác nhận).
- Thời hạn cam kết: phản hồi trong 02 ngày làm việc, xoá xong trong 20 ngày. Đây là mốc
  chặt nhất trong Nghị định 356 cho yêu cầu xoá. **Chủ dự án phải theo dõi hộp thư
  contact@ để giữ đúng cam kết này.**
- Minh bạch AI:
  - giọng đọc là giọng AI (edge-tts), nên mọi chỗ ghi "giọng bản xứ / native audio" đổi
    thành "giọng đọc AI chuẩn Mỹ / natural AI voices", kể cả ảnh xem trước link;
  - Điều khoản ghi rõ một phần nội dung học được soạn với sự hỗ trợ của AI.
- Đồng ý khi đăng ký:
  - ô tích không chọn sẵn và bắt buộc;
  - link Điều khoản/Chính sách mở tab mới để không mất form đang điền;
  - phiên bản chính sách và thời điểm đồng ý được lưu vào metadata của user để làm bằng
    chứng.
- Chính sách hứa "thay đổi quan trọng sẽ được thông báo trong ứng dụng", nên giờ đã có thẻ
  thông báo trong app.

**Dev**

- `POLICY_VERSION` trong `lib/site.ts` là nguồn duy nhất cho ngày của chính sách. Ngày
  này được dùng ở ba chỗ:
  - ngày hiển thị trên trang (`legal.ts` `LAST_UPDATED`);
  - giá trị `consent_version` lưu khi đăng ký (`authStore.register`);
  - thông báo trong chuông (`lib/notifications.ts`, `components/NotificationBell.tsx`,
    xem `docs/design/notifications.md`). Thẻ thông báo cũ đã được thay bằng chuông.
- Chỉ tăng `POLICY_VERSION` khi có thay đổi quan trọng.
- Người mới không thấy thông báo cũ: chuông đánh dấu tất cả là đã đọc ở lần vào app đầu
  tiên.
- `LegalSection.lead` được hiển thị trước danh sách, `paras` sau danh sách. Trước đây
  câu dẫn của mục 4 bị đẩy xuống cuối danh sách.
- Sửa lần hai (cùng ngày, theo góp ý thứ hai của người rà soát):
  - Điều khoản mục 6 đổi thành "Lưu ý trong giai đoạn thử nghiệm": bỏ mức trần bồi thường
    0 đồng, thay bằng lời dặn sao lưu và cách báo lỗi;
  - Chính sách mục 9 bỏ câu "tiếp tục sử dụng đồng nghĩa với đồng ý". Thay vào đó cam kết:
    thay đổi về cách **thu thập hoặc xử lý** dữ liệu phải được người dùng xác nhận trong
    app **trước khi áp dụng**.
  - Thẻ thông báo hiện tại chỉ báo tin, đủ cho lần cập nhật này vì không đổi luồng dữ
    liệu. Lần sau nếu đổi luồng dữ liệu thì phải làm bước xin xác nhận trước (ghi chú ở
    `POLICY_VERSION`).
  - Điều khoản mục 9 vẫn giữ câu "tiếp tục sử dụng" vì đó là hợp đồng dịch vụ, không phải
    sự đồng ý xử lý dữ liệu.

## Cập nhật 15/10/2026: thêm tính năng mới vào trang chủ

- Mục Tính năng có thêm 2 ô, tổng cộng 8 ô, xếp 4 cột trên máy tính:
  - "Đọc truyện, ngữ pháp, chủ đề": 14 truyện, 12 bài, 19 bộ từ;
  - "Thêm tiếng Hàn (beta)": bảng chữ Hangul, 182 từ, 4 truyện. Ghi rõ là đọc bằng giọng
    của trình duyệt, không phải giọng thu sẵn.
- `src/features/marketing/landingClaims.test.ts` so mọi con số trên trang với file dữ liệu
  mà nó đếm. Thêm một truyện hay một bộ từ thì test báo đỏ, cho đến khi trang chủ được sửa
  theo. Như vậy trang chủ không thể nói sai về sản phẩm.
