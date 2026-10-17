# Nhận diện thương hiệu

**User**: "Icon trên tab là emoji 📚, ảnh xem trước khi gửi link chỉ là một icon nhỏ. Nhìn
không giống một sản phẩm thật."

**BA**

- Logo gồm:
  - một khung chat trắng (giao tiếp, nói được);
  - bên trong có chữ V dạng dấu tích (VocaStudy, "đúng rồi");
  - nền gradient xanh → tím của app;
  - một ngôi sao vàng nhỏ, cùng chất liệu với bầu trời ở trang chủ.
- Tên viết "Voca**Study**", chữ "Study" tô gradient.
- Dùng một hình duy nhất ở mọi nơi: header app, header trang giới thiệu, trang đăng nhập,
  favicon, icon cài đặt, ảnh xem trước link.
- Ảnh xem trước link (1200×630) gồm:
  - bầu trời đêm;
  - logo và lời hứa "Speak a new language, with confidence, every day.", kèm dòng tiếng
    Việt "Tự tin nói ngoại ngữ — mỗi ngày một chút." (đổi ngày 17/10/2026; trước đó là
    "Speak English with confidence");
  - các nhãn English · Korean · Chinese · 4,700+ words · Free.
  - `index.html` trỏ tới `og-image.png?v=2`. Mỗi lần vẽ lại ảnh thì tăng số `v`, nếu
    không Zalo/Facebook sẽ giữ ảnh cũ trong bộ nhớ đệm.

**Dev**

- `src/components/Logo.tsx`:
  - `LogoMark` là SVG trên lưới 64;
  - `Logo` gồm logo, tên và khẩu hiệu tuỳ chọn;
  - ngôi sao nhấp nháy bằng `.logo-spark` và tắt khi bật giảm chuyển động.
- `scripts/make_brand_assets.mjs` vẽ lại toàn bộ file từ đúng hình học đó:
  - `public/favicon.svg`;
  - `icons/icon-192.png`, `icon-512.png`;
  - `maskable-512.png` (tràn viền, hình thu vào vùng an toàn 78%);
  - `apple-touch-icon.png` (180, 86%);
  - `public/og-image.png`.
  - Đổi logo thì sửa cả hai nơi rồi chạy lại:
    `npm i --no-save @resvg/resvg-js && node scripts/make_brand_assets.mjs`.
  - Thư viện vẽ không nằm trong dependencies vì chỉ cần khi đổi logo.
  - Font của ảnh xem trước là Noto Sans của hệ thống.
- `index.html`:
  - `og:image` có kích thước và `alt`;
  - `twitter:card=summary_large_image`;
  - favicon SVG, kèm PNG 192 dự phòng.
- Facebook/Zalo lưu ảnh xem trước cũ trong bộ nhớ đệm. Sau khi deploy, dùng Facebook
  Sharing Debugger ("Scrape Again") để làm mới.
