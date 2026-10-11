# Production hoá — Vai Solution Architect / Full-stack

Đã khảo sát xong codebase hiện tại (React 18 + Vite 5 + TS 5.6 + Tailwind 3 + zustand 4, HashRouter; stores `vocab.progress.v1` / `vocab.settings.v1` / `vocab-ai.v1`; AI client-side qua `src/lib/ai/openai.ts` + `systemPrompt.ts` + `guardrail.ts`; data packs ở `public/data`). Dưới đây là thiết kế kỹ thuật production, viết để dev code theo, có bám sát các file thật đang có.

---

# VocaStudy — Thiết Kế Kỹ Thuật Production (Multi-user)

> Mục tiêu: giữ nguyên frontend React/Vite hiện có, bổ sung backend + DB + auth + admin + AI proxy server-side, deploy được, test được, ưu tiên chạy local không cần dịch vụ ngoài.

---

## 1. Lựa chọn stack & lý do

| Lớp                       | Công nghệ chọn                                                                                   | Lý do                                                                                                                                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                  | **Giữ nguyên** React 18 + Vite 5 + TS + Tailwind + zustand + react-router (HashRouter)           | Ràng buộc bắt buộc. Không viết lại. Chỉ thêm `authStore`, guard route, màn Login/Register/Admin và đổi lớp gọi AI.                                                                                                                                                                                          |
| Backend                   | **Node + Express 4 + TypeScript**                                                                | Express đơn giản, hệ sinh thái middleware lớn (helmet, cors, express-rate-limit), dev đã quen. Fastify nhanh hơn nhưng lợi thế không đáng kể ở quy mô lớp học/vài nghìn user; Express giảm rủi ro và thời gian.                                                                                             |
| DB (dev)                  | **SQLite qua `better-sqlite3`**                                                                  | Zero-config, chạy local 1 file `data/app.db`, đồng bộ (sync API) nên code đơn giản, test nhanh, không cần Docker/dịch vụ ngoài.                                                                                                                                                                             |
| DB (prod)                 | **PostgreSQL**                                                                                   | Đa kết nối, bền, có managed service (Render/Railway/Fly/Neon/Supabase). Đường di: đổi driver + `DATABASE_URL`, giữ nguyên schema/logic.                                                                                                                                                                     |
| Data layer / ORM          | **Drizzle ORM + drizzle-kit**                                                                    | TypeScript-first, "gần SQL", **hỗ trợ cùng lúc `better-sqlite3` và `pg`** với schema định nghĩa một lần → chuyển SQLite→Postgres ít ma sát nhất. Migration bằng `drizzle-kit generate/migrate`. (Prisma là phương án thay thế; loại vì engine nặng và trải nghiệm SQLite→PG kém mượt hơn cho use-case này.) |
| Auth                      | **JWT ký server, phát qua cookie HttpOnly** (access 15', refresh 30 ngày có xoay vòng + thu hồi) | Xem giải thích bên dưới.                                                                                                                                                                                                                                                                                    |
| Băm mật khẩu              | **bcrypt** (cost 12)                                                                             | Chuẩn công nghiệp, có salt sẵn, chịu brute-force. (argon2 tốt hơn nhưng bcrypt đủ và dễ build đa nền.)                                                                                                                                                                                                      |
| Validate                  | **zod**                                                                                          | Kiểm input mọi endpoint, suy ra type TS luôn.                                                                                                                                                                                                                                                               |
| Mã hoá API key khi lưu DB | **AES-256-GCM** (`node:crypto`) với `ENCRYPTION_KEY` từ env                                      | Không lưu key nhà cung cấp AI dạng plaintext.                                                                                                                                                                                                                                                               |

### Quyết định Auth: JWT-trong-cookie-HttpOnly (KHÔNG dùng localStorage)

Chọn **JWT ký ở server nhưng lưu trong cookie `HttpOnly; Secure; SameSite=Lax`**, kết hợp refresh token có thu hồi. Lý do:

- **Chống XSS trộm token:** token trong `HttpOnly` cookie thì JS (kể cả script chèn độc) không đọc được. Nếu để JWT trong `localStorage` (như key AI hiện tại), một lỗ hổng XSS là lộ phiên đăng nhập.
- **Vẫn có thu hồi:** access token JWT ngắn hạn (15') stateless để verify rẻ; **refresh token** lưu **hash** trong bảng `refresh_tokens`, xoay vòng mỗi lần refresh, cho phép admin/khóa tài khoản đá phiên ra ngay (điều mà JWT thuần không làm được).
- **So với server-session thuần:** không cần session store riêng cho verify từng request; access token tự chứng thực.
- **CSRF:** vì dùng cookie nên bật `SameSite=Lax` + yêu cầu header `X-Requested-With`/double-submit token cho các request thay đổi trạng thái. Vì SPA cùng origin với API ở prod (1 process serve cả dist), rủi ro CSRF thấp và xử lý gọn.

---

## 2. Kiến trúc tổng thể

```
                         ┌───────────────────────────────────────────────┐
                         │                  BROWSER (SPA)                  │
                         │  React + Vite build (dist/)  •  HashRouter      │
                         │  authStore · studyStore · aiStore(no key)       │
                         └───────────────┬───────────────────────────────┘
                                         │  fetch(credentials:'include')
                    ┌────────────────────┼─────────────────────┐
     DEV: Vite :5173│  proxy /api ─────► │◄──── PROD: cùng origin (Node serve dist + /api)
                    └────────────────────┼─────────────────────┘
                                         ▼
                         ┌───────────────────────────────────────────────┐
                         │            NODE + EXPRESS  (:8080)              │
                         │  helmet · cors · cookie-parser · rate-limit     │
                         │                                                 │
                         │  /api/auth/*     requireAuth (verify JWT cookie)│
                         │  /api/progress/* ─┐                             │
                         │  /api/admin/*     ├─ requireRole('admin')       │
                         │  /api/ai/chat  ───┘                             │
                         │        │            (giữ KEY + GUARDRAIL +      │
                         │        │             level + context + quyền)   │
                         │        ▼                                        │
                         │   AI PROXY  ──HTTPS(Bearer OPENAI_API_KEY)──►  OpenAI o4-mini
                         │        │                                        │
                         │   Data layer (Drizzle)                          │
                         └────────┬────────────────────────────────────────┘
                                  ▼
                    ┌────────────────────────────┐
                    │  DB  SQLite(dev) / PG(prod) │
                    │  users · progress ·         │
                    │  ai_providers · refresh_    │
                    │  tokens · usage_logs        │
                    └────────────────────────────┘

PROD static serving: Express phục vụ dist/ cho mọi route KHÔNG bắt đầu bằng /api
                     (SPA fallback → index.html). Frontend vẫn dùng HashRouter nên fallback đơn giản.
```

**Điểm cốt lõi:** API key OpenAI và toàn bộ guardrail/level/kiểm-quyền chuyển vào server. Browser **không bao giờ** thấy key. `aiStore` client bỏ trường `apiKey`, chỉ còn chọn provider theo `label` (admin quản lý danh sách ở server).

---

## 3. Lược đồ Database (DDL)

DDL viết cho **SQLite (dev)**; ghi chú delta cho Postgres ngay dưới.

```sql
-- ========== users ==========
CREATE TABLE users (
  id            TEXT PRIMARY KEY,                    -- uuid v4
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE, -- so khớp không phân biệt hoa/thường
  password_hash TEXT NOT NULL,                       -- bcrypt
  name          TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student','admin')),
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','suspended','deleted')),
  level         INTEGER NOT NULL DEFAULT 1,          -- 1..5 (tự đánh giá), đồng bộ Settings
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_users_status ON users(status);

-- ========== progress ==========  (blob JSON tiến độ theo user + ngôn ngữ)
CREATE TABLE progress (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lang_code  TEXT NOT NULL,                          -- 'en', ...
  data_json  TEXT NOT NULL,                          -- LanguageProgress serialized (cards + stats)
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, lang_code)
);

-- ========== ai_providers ==========  (admin quản lý; student không thấy key)
CREATE TABLE ai_providers (
  id          TEXT PRIMARY KEY,                      -- uuid
  label       TEXT NOT NULL,                         -- "GPT o4-mini (lớp)"
  model       TEXT NOT NULL DEFAULT 'o4-mini',
  api_key_enc TEXT,                                  -- AES-256-GCM: base64(iv|tag|ciphertext); NULL = dùng OPENAI_API_KEY từ env
  base_url    TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
  is_active   INTEGER NOT NULL DEFAULT 1,            -- 0/1 (boolean)
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ========== refresh_tokens ==========  (cho phép thu hồi phiên / khóa user)
CREATE TABLE refresh_tokens (
  id          TEXT PRIMARY KEY,                      -- uuid = jti
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,                         -- sha256 của refresh token (không lưu plaintext)
  expires_at  TEXT NOT NULL,
  revoked_at  TEXT,                                  -- NULL = còn hiệu lực
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);

-- ========== usage_logs (tuỳ chọn) ==========
CREATE TABLE usage_logs (
  id           TEXT PRIMARY KEY,
  user_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  provider_id  TEXT,
  prompt_tokens     INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens      INTEGER NOT NULL DEFAULT 0,
  blocked      INTEGER NOT NULL DEFAULT 0,           -- 1 nếu bị guardrail chặn
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_usage_user_time ON usage_logs(user_id, created_at);
```

**Delta cho PostgreSQL:**

- `id TEXT PRIMARY KEY` → `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (extension `pgcrypto`).
- `datetime('now')` → `now()`; kiểu thời gian → `TIMESTAMPTZ`.
- `is_active INTEGER 0/1` → `BOOLEAN`.
- `COLLATE NOCASE` → dùng `CITEXT` hoặc index trên `lower(email)`.
- `data_json TEXT` → `JSONB` (query được nếu cần sau này).

> Với Drizzle, định nghĩa schema 2 dialect (`schema.sqlite.ts` / `schema.pg.ts`) hoặc dùng biến `DB_DRIVER` để chọn — logic repository giữ nguyên vì thao tác qua ORM.

---

## 4. Hợp đồng API (REST)

Tiền tố `/api`. Content-Type `application/json`. Auth qua **cookie HttpOnly** (`access_token`, `refresh_token`) — client gọi `fetch(..., { credentials: 'include' })`. Không truyền token qua URL.

### Middleware

- `requireAuth`: đọc `access_token` cookie → verify JWT (`JWT_SECRET`). Fail → `401`. Gắn `req.user = { id, role }`.
- `requireRole('admin')`: sau `requireAuth`, kiểm `req.user.role === 'admin'`, nếu không → `403`.
- `validate(zodSchema)`: parse `body`/`params`; fail → `400` `{ error, issues }`.
- `authLimiter`: rate-limit `/auth/login` + `/auth/register` (vd 10 req / 15 phút / IP).

### Mã lỗi chuẩn

`400` validate/thiếu field · `401` chưa/hết đăng nhập · `403` sai vai/`status!=active` · `404` không thấy · `409` email trùng · `429` quá nhiều request · `502` lỗi upstream OpenAI · `500` lỗi server. Body lỗi: `{ "error": "<mã máy>", "message": "<mô tả tiếng Việt>" }`.

### Auth

```http
POST /api/auth/register
Body: { "email": string, "password": string(>=8), "name"?: string }
201  Set-Cookie: access_token; refresh_token
     { "user": { "id","email","name","role","level" } }
409  { "error":"email_taken", "message":"Email đã được đăng ký." }

POST /api/auth/login          (authLimiter)
Body: { "email": string, "password": string }
200  Set-Cookie: access_token; refresh_token
     { "user": {...} }
401  { "error":"invalid_credentials" }        # cùng thông điệp cho sai email/mật khẩu
403  { "error":"account_suspended" }           # status=suspended

POST /api/auth/refresh
Cookie: refresh_token
200  Set-Cookie: access_token (mới) + refresh_token (mới, xoay vòng)   # {}
401  { "error":"invalid_refresh" }             # hết hạn/đã thu hồi

POST /api/auth/logout
200  Xoá cookie + revoke refresh_token hiện tại. {}

GET  /api/auth/me
200  { "user": {...} }
401
```

### Progress (đồng bộ tiến độ học)

```http
GET  /api/progress/:lang        (requireAuth)
200  { "lang":"en", "data": <LanguageProgress|null>, "updatedAt": string|null }

PUT  /api/progress/:lang        (requireAuth)
Body: { "data": <LanguageProgress>, "baseUpdatedAt"?: string }   # LanguageProgress = { cards, stats }
200  { "updatedAt": string }
409  { "error":"stale", "serverUpdatedAt": string, "data": <LanguageProgress> }
     # nếu baseUpdatedAt < serverUpdatedAt → client merge rồi PUT lại (chống mất dữ liệu đa thiết bị)
```

> Ghi chú: `LanguageProgress` bám đúng type hiện có trong `src/types/index.ts` (`{ cards: Record<number,SRSCard>, stats: StudyStats }`). Server chỉ lưu blob, không diễn giải — nhẹ và bất biến với thay đổi SRS sau này.

### Admin — quản lý tài khoản

```http
GET    /api/admin/users?query=&role=&status=&page=1&pageSize=20   (requireRole admin)
200    { "items":[{id,email,name,role,status,level,createdAt}], "total":N }

PATCH  /api/admin/users/:id     (requireRole admin)
Body: { "role"?: "student"|"admin", "status"?: "active"|"suspended", "level"?: 1..5 }
200    { "user": {...} }
       # side-effect: đổi status→suspended ⇒ revoke toàn bộ refresh_tokens của user đó
403    { "error":"cannot_demote_self" }   # chặn admin tự hạ vai / tự khóa mình

DELETE /api/admin/users/:id     (requireRole admin)
200    # soft delete: status='deleted' + revoke tokens (KHÔNG hard-delete để giữ toàn vẹn dữ liệu)
```

### Admin — AI providers

```http
GET    /api/admin/ai-providers        (admin)
200    [{ id,label,model,baseUrl,isActive,hasKey:boolean }]   # KHÔNG trả api_key

POST   /api/admin/ai-providers        (admin)
Body: { label, model?, apiKey?, baseUrl? }     # apiKey được mã hoá AES-GCM trước khi lưu
201    { id,label,model,baseUrl,isActive,hasKey }

PATCH  /api/admin/ai-providers/:id    (admin)
Body: { label?, model?, apiKey?, baseUrl?, isActive? }
200    {...}                                   # apiKey rỗng ⇒ giữ nguyên; gửi apiKey mới ⇒ mã hoá & thay

DELETE /api/admin/ai-providers/:id    (admin)  → 200
```

### AI proxy (giữ key + guardrail + level + context server-side)

```http
POST /api/ai/chat        (requireAuth)
Body: {
  "providerId"?: string,            // nếu bỏ trống: provider is_active đầu tiên
  "messages": [{ "role":"user"|"assistant", "content": string }],  // KHÔNG nhận role 'system' từ client
  "context"?: { "title": string, "word"?: { word,meaning,ipa?,pos?,exampleEn? } },
  "level"?: 1..5                    // server vẫn kẹp/kiểm lại theo users.level
}
200  { "reply": string, "usage"?: { promptTokens,completionTokens,totalTokens } }
400  { "error":"input_too_long" }   // preCheckInput: > MAX_INPUT_CHARS (1000)
403  { "error":"account_suspended" }
502  { "error":"upstream_error", "message":"Máy chủ OpenAI đang gặp sự cố..." }
```

**Server phải làm (di từ client sang, tái dùng logic đã có):**

1. `preCheckInput` (rỗng / quá dài) — port `src/lib/ai/guardrail.ts`.
2. Ép `messages` chỉ gồm `user|assistant`; **loại mọi role `system` do client gửi** (chống prompt-injection).
3. `buildMessages(history, { levelInstruction, contextText })` — port `src/lib/ai/systemPrompt.ts` (guardrail SYSTEM_PROMPT luôn ở server, client không đọc được).
4. Lấy key: `ai_providers.api_key_enc` (giải mã) hoặc fallback `process.env.OPENAI_API_KEY`.
5. Gọi OpenAI với đúng tham số o4-mini hiện dùng: `max_completion_tokens: 2000`, `reasoning_effort: 'low'`, **không** gửi `temperature`.
6. Map lỗi HTTP → thông điệp tiếng Việt (port `mapError` trong `openai.ts`); ghi `usage_logs`.

---

## 5. Bảo mật

- **Mật khẩu:** bcrypt cost 12, không bao giờ log/trả hash. Thông điệp login sai email vs sai mật khẩu **giống nhau** (chống dò email).
- **JWT:** ký HS256 bằng `JWT_SECRET` (≥ 32 bytes ngẫu nhiên). Access 15', refresh 30 ngày. Refresh **xoay vòng** + lưu **sha256(token)**; `/refresh` phát cái mới và revoke cái cũ; phát hiện tái dùng token đã revoke ⇒ revoke cả cây (nghi lộ token).
- **Cookie:** `HttpOnly; Secure(prod); SameSite=Lax; Path=/`. Access & refresh riêng cookie; refresh chỉ gửi tới `/api/auth`.
- **Middleware:** `requireAuth` / `requireRole('admin')` như mục 4. Mỗi request kiểm lại `users.status==='active'`.
- **Validate:** zod cho mọi body/param (email format, password ≥ 8, role/status enum, level 1..5, `messages` schema).
- **Rate limit:** `express-rate-limit` cho `/auth/login`, `/auth/register`, và `/ai/chat` (vd 30 req/phút/user) chống lạm dụng token OpenAI.
- **Mã hoá api key:** AES-256-GCM (`node:crypto`), khoá `ENCRYPTION_KEY` (32 bytes hex/base64) từ env; lưu `base64(iv | authTag | ciphertext)`. Mặc định đơn giản có thể chỉ dùng `OPENAI_API_KEY` env (không lưu key vào DB). API **không bao giờ** trả `api_key` ra client (chỉ `hasKey: boolean`).
- **CORS:** dev cho phép `http://localhost:5173` + `credentials: true`; prod cùng origin nên có thể tắt CORS chéo. Whitelist origin qua `CORS_ORIGIN`.
- **helmet:** bật security headers + CSP (script/style self; connect-src self + `api.openai.com` nếu cần). Tắt cache cho `/api`.
- **Không lộ key:** guardrail + key + kiểm quyền chỉ tồn tại ở server; loại bỏ hoàn toàn `apiKey` khỏi `aiStore` client và khỏi backup JSON.
- **Chống CSRF:** `SameSite=Lax` + với thao tác đổi trạng thái yêu cầu header `X-Requested-With: fetch` (đặt ở fetch wrapper).
- **Bảo vệ admin:** không cho tự hạ vai/tự khóa; ghi log hành động admin (có thể vào `usage_logs` mở rộng).

---

## 6. Tích hợp Frontend

Giữ toàn bộ UI hiện có; thêm/đổi:

- **`src/lib/api.ts`** — fetch wrapper: `credentials:'include'`, tự gọi `/api/auth/refresh` một lần khi gặp 401 rồi retry; gắn header `X-Requested-With`.
- **`src/store/authStore.ts`** (zustand, **không persist**): `{ user, status:'loading'|'authed'|'guest', login(), register(), logout(), fetchMe() }`. Gọi `fetchMe()` khi app mount.
- **Route guard trong `src/App.tsx`:** thêm `<Route>` cho `/login`, `/register`; bọc các route học tập bằng `<RequireAuth>` (chưa auth → điều hướng `/login`); bọc `/admin` bằng `<RequireRole role="admin">`. HashRouter giữ nguyên.
- **Màn `features/auth/Login.tsx` + `Register.tsx`** — form Tailwind, validate, hiển thị lỗi tiếng Việt.
- **Đồng bộ tiến độ:**
  - Khi login: `GET /api/progress/en` → nếu có, đổ vào `useStudy.replaceAll({ en: data })` (đã có sẵn `replaceAll` trong `studyStore.ts`).
  - Khi `useStudy` đổi: **debounce 2–3s** rồi `PUT /api/progress/:lang` gói `{ data: progress[lang], baseUpdatedAt }`. Gặp `409 stale` → merge (mục 9) rồi PUT lại.
  - `settings.level` đồng bộ hai chiều với `users.level` (PATCH me hoặc field trong `/auth/me`).
- **AI:** `TutorChat.tsx` + `src/lib/ai/openai.ts` client đổi sang gọi `POST /api/ai/chat` với `{ messages, context, level, providerId }` — **bỏ `apiKey`**. `aiStore` client rút gọn: chỉ giữ danh sách provider (label/model, `hasKey`) tải từ `GET /api/admin/ai-providers` (student thấy label để chọn), bỏ `apiKey`, bỏ PIN djb2 (thay bằng vai `admin` thật từ server). `guardrail.preCheckInput` có thể giữ ở client như UX sớm, nhưng **nguồn chân lý là server**.
- **Màn `features/admin/AdminUsers.tsx`** + **`AdminProviders.tsx`** — bảng user (tìm/lọc/phân trang, đổi vai, khóa/mở, xóa mềm) và quản lý provider AI (nhập key, key không hiển thị lại).
- **`AISettings.tsx` hiện tại:** phần nhập key chuyển thành khu vực chỉ-admin gọi API server; student chỉ chọn provider theo label.

---

## 7. Cấu trúc thư mục (monorepo) & biến môi trường

```
VocaStudy/
├─ package.json                # workspaces: ["server"]  (frontend ở root, giữ nguyên)
├─ index.html  vite.config.ts  tsconfig*.json  tailwind.config.js
├─ src/                        # FRONTEND (giữ nguyên) + thêm:
│  ├─ lib/api.ts               #   fetch wrapper (credentials, refresh, X-Requested-With)
│  ├─ store/authStore.ts
│  ├─ features/auth/{Login,Register}.tsx
│  └─ features/admin/{AdminUsers,AdminProviders}.tsx
├─ public/data/{index.json,en.json}     # data packs (giữ nguyên)
├─ dist/                       # build FE (Express serve ở prod)
├─ server/                     # BACKEND (mới)
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ drizzle.config.ts
│  ├─ .env  .env.example
│  └─ src/
│     ├─ index.ts              # tạo app, listen; PROD: static dist + SPA fallback
│     ├─ app.ts                # helmet, cors, cookie-parser, rate-limit, mount routes
│     ├─ env.ts                # đọc & validate env bằng zod
│     ├─ db/
│     │  ├─ client.ts          # chọn better-sqlite3 | pg theo DB_DRIVER
│     │  ├─ schema.ts          # Drizzle schema (users, progress, ai_providers, refresh_tokens, usage_logs)
│     │  └─ migrations/        # drizzle-kit
│     ├─ middleware/{requireAuth,requireRole,validate,rateLimit,error}.ts
│     ├─ lib/{jwt,password,crypto,cookies}.ts   # jwt sign/verify, bcrypt, AES-GCM, set/clear cookie
│     ├─ modules/
│     │  ├─ auth/{routes,service}.ts
│     │  ├─ progress/{routes,service}.ts
│     │  ├─ admin/{users.routes,providers.routes}.ts
│     │  └─ ai/{routes,service}.ts             # AI proxy
│     └─ ai/                   # GUARDRAIL server-side (port từ src/lib/ai/)
│        ├─ systemPrompt.ts    # SYSTEM_PROMPT + buildMessages
│        ├─ guardrail.ts       # preCheckInput, MAX_INPUT_CHARS
│        ├─ level.ts           # levelInfo(level).aiInstruction
│        └─ openai.ts          # gọi OpenAI (max_completion_tokens, reasoning_effort)
├─ Dockerfile
├─ .dockerignore
└─ docker-compose.yml          # tuỳ chọn: app + postgres cho thử prod local
```

> Có thể chia sẻ type bằng cách import `../src/types` từ server, hoặc tách `packages/shared`. Tối giản: server tự khai lại vài type (`LanguageProgress`, `SRSCard`, `StudyStats`) hoặc dùng path alias tới `src/types`.

**`server/.env.example`:**

```dotenv
NODE_ENV=development
PORT=8080
DB_DRIVER=sqlite                 # sqlite | pg
DATABASE_URL=./data/app.db       # sqlite: đường file; pg: postgres://user:pass@host:5432/db
JWT_SECRET=thay_bang_chuoi_ngau_nhien_>=32_bytes
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
ENCRYPTION_KEY=base64_32_bytes   # dùng khi lưu api key AI vào DB
OPENAI_API_KEY=sk-...            # fallback khi provider không có key riêng
OPENAI_BASE_URL=https://api.openai.com/v1
CORS_ORIGIN=http://localhost:5173
COOKIE_SECURE=false              # true ở prod (HTTPS)
```

**Vite dev proxy** (thêm vào `vite.config.ts` hiện có — không phá `base:'./'`):

```ts
server: { proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } } }
```

Dev chạy song song: `vite` (FE :5173) + `server` (:8080), FE gọi `/api` được proxy sang server → cookie cùng "origin ảo".

---

## 8. Deploy

**Nguyên tắc:** prod chạy **1 process Node** vừa serve `dist/` (static + SPA fallback) vừa phục vụ `/api`. Cùng origin ⇒ cookie HttpOnly hoạt động mượt, không cần CORS chéo.

`server/src/index.ts` (prod):

```ts
if (env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('dist')))
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.resolve('dist/index.html')))
}
```

**Dockerfile (multi-stage):**

```dockerfile
# 1) build frontend
FROM node:20-alpine AS fe
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build            # → dist/

# 2) build backend
FROM node:20-alpine AS be
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build            # tsc → server/dist

# 3) runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=be /app/server/node_modules ./server/node_modules
COPY --from=be /app/server/dist        ./server/dist
COPY --from=be /app/server/package.json ./server/
COPY --from=fe /app/dist                ./dist
EXPOSE 8080
CMD ["node", "server/dist/index.js"]
```

**Chạy prod local để test:**

```bash
docker build -t vocabstudy .
docker run -p 8080:8080 --env-file server/.env vocabstudy
# mở http://localhost:8080
```

**Đường lên PostgreSQL:** đổi `DB_DRIVER=pg` + `DATABASE_URL=postgres://...`, chạy `drizzle-kit migrate`. Không đổi code nghiệp vụ. `docker-compose.yml` có thể thêm service `postgres:16` để thử prod-like local.

**Chọn nền tảng:**

- **Render / Railway** — dễ nhất: 1 web service từ Dockerfile + 1 managed Postgres, set env, tự HTTPS. Khuyến nghị cho bắt đầu.
- **Fly.io** — Docker-first, có Postgres, edge, phù hợp mở rộng.
- **VPS (Ubuntu)** — `docker run` sau Nginx/Caddy reverse-proxy + TLS; toàn quyền, rẻ, tự lo backup/monitoring.

Đặt `COOKIE_SECURE=true` + đứng sau HTTPS ở mọi phương án.

---

## 9. Kế hoạch migration localStorage → tài khoản

Hiện dữ liệu ở `localStorage`: `vocab.progress.v1` (tiến độ, shape `Record<lang, LanguageProgress>`) và `vocab.settings.v1`. Khi user **đăng nhập lần đầu**:

1. FE đọc `useStudy.getState().progress` (từ localStorage đã hydrate).
2. `GET /api/progress/:lang` lấy dữ liệu server (có thể rỗng nếu user mới).
3. **Merge per-card** (không đè mù) rồi `PUT`:

```ts
function mergeProgress(local?: LanguageProgress, server?: LanguageProgress): LanguageProgress {
  if (!server) return local ?? { cards: {}, stats: emptyStats() }
  if (!local) return server
  const cards: Record<number, SRSCard> = { ...server.cards }
  for (const [id, lc] of Object.entries(local.cards)) {
    const sc = cards[+id]
    // giữ card "học sâu hơn": box cao hơn, hoặc lastReviewedDay mới hơn
    if (
      !sc ||
      lc.box > sc.box ||
      (lc.box === sc.box && (lc.lastReviewedDay ?? -1) > (sc.lastReviewedDay ?? -1))
    ) {
      cards[+id] = lc
    }
  }
  const stats: StudyStats = {
    // cộng dồn an toàn, lấy max cho streak/xp
    totalReviews: local.stats.totalReviews + server.stats.totalReviews,
    totalCorrect: local.stats.totalCorrect + server.stats.totalCorrect,
    xp: Math.max(local.stats.xp, server.stats.xp),
    streak: Math.max(local.stats.streak, server.stats.streak),
    lastStudyDay: Math.max(local.stats.lastStudyDay ?? 0, server.stats.lastStudyDay ?? 0) || null,
    newByDay: mergeCounts(local.stats.newByDay, server.stats.newByDay),
    reviewsByDay: mergeCounts(local.stats.reviewsByDay, server.stats.reviewsByDay),
  }
  return { cards, stats }
}
```

4. Sau merge: `useStudy.replaceAll({ [lang]: merged })` + `PUT /api/progress/:lang`.
5. **Đánh dấu đã migrate** (`localStorage['vocab.migratedAt']`) để không chạy lại; từ đó server là nguồn chân lý, localStorage chỉ là cache offline.
6. `settings.level` → đẩy lên `users.level`. Key AI cũ trong `vocab-ai.v1`: **xóa khỏi client** (không đẩy lên, không lưu) — key giờ chỉ ở server.
7. UX: hiện hộp thoại "Đồng bộ tiến độ học sẵn có trên máy này vào tài khoản?" trước khi merge (tôn trọng lựa chọn người dùng nếu máy dùng chung).

> `backup.ts` hiện có vẫn dùng được cho export/import offline; sau migration nên bổ sung nút "Đồng bộ lên tài khoản".

---

## 10. Definition of Done + Checklist bảo mật

### Definition of Done (kỹ thuật)

- [ ] `npm run dev` (FE :5173) + `server` (:8080) chạy song song, proxy `/api` hoạt động.
- [ ] Register → Login → `GET /me` → Logout hoạt động; access hết hạn tự refresh qua cookie.
- [ ] Progress: học vài từ → reload/đăng nhập máy khác thấy tiến độ; xử lý `409 stale` bằng merge, không mất dữ liệu.
- [ ] Admin: liệt kê/tìm/lọc user; đổi vai; khóa (`suspended`) → user bị đá phiên ngay; xóa mềm; không thể tự hạ vai/tự khóa.
- [ ] AI: `POST /api/ai/chat` trả lời đúng phạm vi; câu hỏi ngoài phạm vi bị guardrail từ chối; **DevTools/network của client tuyệt đối không thấy `OPENAI_API_KEY`**; input > 1000 ký tự bị chặn `400`.
- [ ] `aiStore` client không còn field `apiKey`; PIN djb2 bị loại; vai admin lấy từ server.
- [ ] `drizzle-kit migrate` chạy sạch trên **cả** SQLite và Postgres từ cùng schema.
- [ ] `docker build` + `docker run` → mở `http://localhost:8080` chạy full app (FE + API 1 process).
- [ ] Đổi `DB_DRIVER=pg` + `DATABASE_URL` là lên Postgres, không sửa code nghiệp vụ.
- [ ] Test: unit cho `password`, `jwt`, `crypto`, `mergeProgress`, `preCheckInput`; integration (supertest) cho auth + progress + admin role + ai proxy (mock OpenAI); FE build `tsc -b` sạch.

### Checklist bảo mật

- [ ] Mật khẩu **bcrypt** (cost ≥ 12); không log/trả hash; login sai email≡sai mật khẩu.
- [ ] JWT trong cookie **HttpOnly; Secure(prod); SameSite=Lax**; access ngắn, refresh xoay vòng + lưu **hash** + thu hồi được; phát hiện tái dùng refresh ⇒ revoke cả cây.
- [ ] `requireAuth` + `requireRole('admin')` phủ mọi endpoint nhạy cảm; mỗi request kiểm `status==='active'`.
- [ ] **zod** validate mọi input; enum role/status/level được kẹp.
- [ ] **Rate limit** login/register/ai-chat.
- [ ] API key AI mã hoá **AES-256-GCM** khi lưu DB (hoặc chỉ ở env); endpoint không bao giờ trả key (`hasKey` boolean).
- [ ] **helmet** + CSP; CORS whitelist origin + `credentials`; `/api` no-cache.
- [ ] Guardrail (SYSTEM_PROMPT + preCheck) chạy **server-side**; client không gửi được role `system`.
- [ ] Không có secret trong repo/bundle FE; `.env` trong `.gitignore`; `.env.example` không chứa giá trị thật.
- [ ] Xóa user là **soft-delete** (giữ toàn vẹn tham chiếu); không hard-delete tự động.
- [ ] Ghi `usage_logs` (token + blocked) để giám sát lạm dụng chi phí OpenAI.

---

Các file thật cần bám khi triển khai (đường dẫn tuyệt đối):

- `/home/dholmes/Project_personal/Vocabulary-Study/src/lib/ai/openai.ts`, `/home/dholmes/Project_personal/Vocabulary-Study/src/lib/ai/systemPrompt.ts`, `/home/dholmes/Project_personal/Vocabulary-Study/src/lib/ai/guardrail.ts` → **port sang `server/src/ai/`** (đây là nơi guardrail + key phải nằm).
- `/home/dholmes/Project_personal/Vocabulary-Study/src/store/aiStore.ts` → rút gọn (bỏ `apiKey`, bỏ PIN djb2).
- `/home/dholmes/Project_personal/Vocabulary-Study/src/store/studyStore.ts` (đã có `replaceAll` cho đồng bộ) và `/home/dholmes/Project_personal/Vocabulary-Study/src/types/index.ts` (`LanguageProgress`/`SRSCard`/`StudyStats` = shape của `data_json`).
- `/home/dholmes/Project_personal/Vocabulary-Study/src/App.tsx` (thêm guard + route auth/admin), `/home/dholmes/Project_personal/Vocabulary-Study/vite.config.ts` (thêm dev proxy `/api`).
