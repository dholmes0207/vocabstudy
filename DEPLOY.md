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
3. **Environment variables** (Settings → Environment variables → thêm cho cả *Production* và *Preview*):
   | Tên | Loại | Giá trị |
   |---|---|---|
   | `VITE_SUPABASE_URL` | Plaintext | Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Plaintext | anon public key |
   | `OPENAI_API_KEY` | **Secret (Encrypt)** | key OpenAI |
   | `OPENAI_MODEL` | Plaintext | `o4-mini` |
   | `SUPABASE_URL` | Plaintext | Project URL |
   | `SUPABASE_ANON_KEY` | Plaintext | anon public key |
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

## Roadmap
Giới hạn lượt AI/học sinh + usage log (Cloudflare KV/Supabase), quản lý lớp (mã lớp, tạo hàng loạt, xuất CSV), quên-mật-khẩu qua email (Supabase built-in), rate-limit Functions, phân trang danh sách user.
