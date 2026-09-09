# Deploy VocabStudy — Cloudflare Pages + Supabase

Kiến trúc: **frontend tĩnh (Cloudflare Pages)** + **Supabase (Auth + Postgres + RLS)** + **Cloudflare Pages Functions** (AI proxy & admin, giữ secret server-side). Không cần server Node riêng.

```
Browser (React)
  ├── @supabase/supabase-js ──► Supabase Auth + Postgres (RLS: mỗi user chỉ dữ liệu của mình)
  └── fetch /api/* ───────────► Cloudflare Pages Functions (Workers)
                                   • /api/ai/chat   → OpenAI (key = secret)  + guardrail + level + context
                                   • /api/ai/status
                                   • /api/admin/users (service-role, chỉ admin)
```

---

## 1) Supabase

1. Tạo project tại https://supabase.com (chọn region gần VN, vd Singapore).
2. Vào **SQL Editor** → dán toàn bộ [`supabase/schema.sql`](supabase/schema.sql) → **Run**. (Tạo bảng `profiles`, `progress`, RLS, trigger “user đầu tiên = admin”.)
3. **Authentication → Providers → Email**: bật Email. Muốn đăng ký vào thẳng (không cần bấm link email) thì **tắt “Confirm email”** (Auth → Sign In / Providers). Nếu bật, người dùng phải xác nhận email trước khi đăng nhập.
4. **Authentication → URL Configuration**: đặt **Site URL** = `https://vocastudy.app` (và thêm vào Redirect URLs).
5. Lấy khoá ở **Project Settings → API**:
   - `Project URL` → dùng cho `VITE_SUPABASE_URL` và `SUPABASE_URL`.
   - `anon public` → `VITE_SUPABASE_ANON_KEY` và `SUPABASE_ANON_KEY`.
   - `service_role` (BÍ MẬT) → `SUPABASE_SERVICE_ROLE_KEY` (chỉ đặt ở Cloudflare, tuyệt đối không đưa lên client).

## 2) GitHub

Repo đã được push sẵn: **https://github.com/dholmes0207/vocabstudy** (private).

## 3) Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → chọn repo `vocabstudy`.
2. **Build settings:**
   - Framework preset: `None` (hoặc Vite)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - Node version: đặt biến `NODE_VERSION = 20` (Settings → Environment variables) nếu build cần.
3. **Environment variables** (Settings → Environment variables → thêm cho cả _Production_ và _Preview_):
   | Tên                         | Loại                 | Giá trị          |
   | --------------------------- | -------------------- | ---------------- |
   | `VITE_SUPABASE_URL`         | Plaintext            | Project URL      |
   | `VITE_SUPABASE_ANON_KEY`    | Plaintext            | anon public key  |
   | `OPENAI_API_KEY`            | **Secret (Encrypt)** | key OpenAI       |
   | `OPENAI_MODEL`              | Plaintext            | `o4-mini`        |
   | `SUPABASE_URL`              | Plaintext            | Project URL      |
   | `SUPABASE_ANON_KEY`         | Plaintext            | anon public key  |
   | `SUPABASE_SERVICE_ROLE_KEY` | **Secret (Encrypt)** | service_role key |
   > `VITE_*` được nhúng lúc **build** (phải set trước khi build). Các biến còn lại được **Pages Functions** đọc lúc chạy. Đổi biến xong nhớ **Retry deployment**.
4. **Deploy**. Pages tự nhận thư mục `functions/` làm API (route `/api/*`), phục vụ `dist/` cho phần còn lại.

## 4) Domain vocastudy.app

Pages → project → **Custom domains → Set up a domain** → nhập `vocastudy.app` (DNS đã ở Cloudflare nên nó tự tạo bản ghi + cấp SSL). Thêm `www` nếu muốn.

> ⚠️ Domain phải khớp **chính xác** với **Site URL** ở bước 1.4 của Supabase, nếu không link xác nhận email / redirect sau đăng nhập sẽ trỏ sai.

## 5) Tài khoản admin

**Người đầu tiên đăng ký** (ở `/#/login` → Đăng ký) sẽ tự động là **admin** (trigger trong schema). Đăng nhập → avatar góc phải → **Quản trị** để quản lý tài khoản. Đổi key/model AI = sửa `OPENAI_API_KEY`/`OPENAI_MODEL` trên Cloudflare.

---

## Chạy & thử ở local

```bash
npm install
cp .env.example .env          # điền VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev                   # web + Supabase (auth, đồng bộ). AI/admin cần Functions:

cp .dev.vars.example .dev.vars  # điền OPENAI_API_KEY + SUPABASE_* (secret local)
npm run build && npm run pages:dev   # chạy đầy đủ Functions + static bằng wrangler
```

- `npm run dev` (Vite): phần học + đăng nhập + đồng bộ chạy được; `/api/*` (AI, admin) **chỉ** hoạt động khi chạy `pages:dev` (hoặc trên Cloudflare).
- Chưa cấu hình Supabase? App vẫn chạy ở **chế độ khách** (tiến độ lưu localStorage), chỉ ẩn đăng nhập/AI.

## Bảo mật (đã áp dụng)

- Mật khẩu do **Supabase Auth** quản lý (băm chuẩn), có thể bật xác nhận email.
- **RLS**: mỗi user chỉ đọc/ghi `progress` + `profiles` của mình; không tự đổi được `role`.
- **Key OpenAI + service-role** chỉ nằm ở Cloudflare (secret) → học viên không bao giờ thấy; guardrail chạy ở Function.
- Thao tác admin kiểm quyền ở **server** (Function + service role), không phải chỉ ẩn nút.
- **Fail-closed**: nếu không kiểm tra được hồ sơ (Supabase lỗi) thì từ chối kèm 503 chứ không cho qua — trước đây một cú trục trặc là tài khoản đã khoá vẫn vào được.
- Mọi id gửi lên endpoint admin phải **đúng dạng UUID** trước khi chạm tới truy vấn PostgREST.
- Trợ lý AI có **hạn mức `AI_DAILY_LIMIT` lượt/học sinh/ngày** (mặc định 30). Cần chạy `supabase/schema.sql` để tạo `ai_usage` + `bump_ai_usage`; chưa chạy thì trợ lý vẫn hoạt động, chỉ là chưa bị chặn.

## Service worker (offline)

`public/sw.js` cho phép học khi mất mạng. Nguyên tắc:

| Loại                        | Chiến lược         | Vì sao                                                          |
| --------------------------- | ------------------ | --------------------------------------------------------------- |
| Tài liệu, JS, CSS           | **network-first**  | Deploy mới luôn thắng — không bao giờ kẹt người học ở bản cũ    |
| `/audio/*`, `/data/*`       | **cache-first**    | Nặng, gần như không đổi, và đây chính là thứ cần có khi offline |
| `/api/*` và mọi origin khác | **không đụng tới** | Trả lời của AI và Supabase không được cache                     |

Lúc cài đặt, worker precache vỏ app (đọc `asset-manifest.json` do Vite sinh, nên
gồm cả các chunk lazy) + gói từ vựng ≈ **875 KB**. **Không** precache audio (57 MB)
— audio chỉ được cache khi người học đã nghe qua.

**Kill switch:** nếu service worker gây sự cố, sửa `DISABLED = false` thành `true`
trong `public/sw.js` rồi deploy. Lần vào tiếp theo worker sẽ tự gỡ đăng ký và xoá
sạch cache của mình, trả mọi người về hành vi online bình thường — không ai phải
tự xoá dữ liệu trang. Đổi `VERSION` để ép làm mới toàn bộ cache (ví dụ sau khi
dựng lại audio).

## Roadmap

Quản lý lớp (mã lớp, tạo hàng loạt, xuất CSV), quên-mật-khẩu qua email (Supabase built-in), rate-limit theo IP cho Functions, phân trang danh sách user, hiển thị số lượt AI còn lại cho học sinh.
