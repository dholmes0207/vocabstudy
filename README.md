# 📚 VocabStudy — Học & ôn từ vựng thông minh

Website học và ôn **từ vựng đa ngôn ngữ**, khởi đầu với **1000 từ tiếng Anh thông dụng nhất** (chuẩn Oxford & Cambridge) dành cho **người Việt học tiếng Anh**.

Ứng dụng chạy **hoàn toàn phía trình duyệt** — không cần đăng nhập, không backend, dùng được offline sau lần tải đầu, tiến độ lưu ngay trên máy bạn.

> 📄 Tài liệu kế hoạch chi tiết (theo quy trình 3 vai: Người học → BA → DEV): [`docs/PLAN.md`](docs/PLAN.md)
> 📖 Tài liệu nguồn: [`docs/Tailieu_1000_Tu_Vung_Tieng_Anh_Thong_Dung.md.pdf`](docs/Tailieu_1000_Tu_Vung_Tieng_Anh_Thong_Dung.md.pdf)

---

## ✨ Tính năng

| Nhóm | Chi tiết |
|---|---|
| 🏠 **Trang chủ** | Kế hoạch hôm nay (từ cần ôn / từ mới), vòng tiến độ, streak & XP. |
| 📖 **Học từ mới** | Thẻ lật 3D, phát âm, câu ví dụ Anh–Việt; tự đánh giá "Nhớ / Chưa". Chia **50 bộ ~20 từ**. |
| 🔁 **Ôn tập (SRS)** | Lặp lại ngắt quãng theo lịch **Ngày 1 → 2 → 5 → 14 → 30**. Mỗi ngày tự chọn danh sách cần ôn. |
| 🎯 **Kiểm tra** | 5 dạng quiz: Anh→Việt, Việt→Anh, Nghe→chọn, **Đánh vần (gõ từ ✍️)**, Điền từ vào câu. Phản hồi tức thì + âm thanh. |
| ✍️ **Đánh vần** | Nghe + nhìn nghĩa rồi **gõ lại từ** với khung gợi ý `abi__ty`, nút **"Gợi ý +1 chữ"**, chấm **từng chữ cái** — luyện nhớ mặt chữ. Nạp vào SRS. |
| 📚 **Tra cứu** | Tìm kiếm & lọc toàn bộ 1000 từ theo từ loại và trạng thái học. |
| 📈 **Thống kê** | Phân bố bậc ghi nhớ, hoạt động 14 ngày, độ chính xác, streak, XP, **huy hiệu 🏅**. |
| 🏅 **Gamification** | Streak 🔥, điểm XP ⭐, **13 huy hiệu** theo cột mốc, **pháo giấy 🎉** khi hoàn thành phiên. |
| 🤖 **Trợ lý AI** | **Bong bóng nổi** ở mọi trang (OpenAI **o4-mini**), **đọc ngữ cảnh** trang đang xem + **cá nhân hoá theo trình độ** (5 bậc). Có **guardrail** từ chối ngoài phạm vi, và **phân quyền** admin/học sinh. |
| 🎚️ **Trình độ** | Tự đánh giá 5 bậc (A1→C1) từ tiến độ; trợ lý giảng theo mức ("học 1 hiểu 2/3/5/10"). |
| ⚙️ **Cài đặt** | Giao diện sáng/tối, giọng đọc, hạn mức từ/ngày, tốc độ đọc, trình độ, quản lý AI (admin), sao lưu/khôi phục. |

**Phương pháp học** được nhúng vào sản phẩm theo đúng tài liệu gốc: *Lặp lại ngắt quãng (SRS)*, *Học theo ngữ cảnh & câu ví dụ*, *Active Recall (10–15 từ/ngày)*, *Phân loại theo từ loại/bộ*.

### 🔤 Phiên âm & cách đọc

Mỗi từ có **phiên âm IPA** (chuẩn General American, vd `/əˈbɪləˌti/`) và **gợi ý cách đọc kiểu Việt** (vd `ơ-BI-lơ-ti`, âm tiết nhấn viết HOA) — giúp người mới chưa quen ký hiệu IPA. Sinh sẵn bằng `scripts/generate_phonetics.py` (IPA từ `eng-to-ipa`, cách đọc suy ra từ CMU Pronouncing Dictionary). *Cách đọc kiểu Việt là gợi ý gần đúng — âm chuẩn vẫn là file audio Neural.*

### 🔊 Phát âm bằng giọng Neural

Mỗi từ và câu ví dụ đều có **file MP3 giọng Neural bản xứ** (chất lượng như người thật), tạo sẵn bằng thư viện **`edge-tts`** (giọng Microsoft Edge, miễn phí, không cần API key) và đặt trong `public/audio/en/`. App phát file tĩnh (chỉnh tốc độ qua `playbackRate`), tự động **fallback sang Web Speech API** của trình duyệt nếu thiếu file. Có thể chọn giọng fallback trong *Cài đặt → Phát âm*.

---

## 🤖 Trợ lý AI (có Guardrail)

Màn **Trợ lý** (`/tutor`) là gia sư hỏi–đáp dùng **OpenAI o4-mini**, được **khóa chặt trong phạm vi học từ vựng tiếng Anh** qua nhiều lớp guardrail:

- **GR-1 Định vị phạm vi** — system prompt (`src/lib/ai/systemPrompt.ts`) liệt kê rõ việc được phép (nghĩa, cách dùng, ví dụ, phân biệt từ, phát âm, mẹo nhớ, quiz từ vựng…) và bị cấm (code, toán, chính trị, y tế/pháp lý/tài chính, chat chit, ngôn ngữ khác, nội dung hại…).
- **GR-2 Từ chối chuẩn** — ngoài phạm vi thì từ chối lịch sự bằng tiếng Việt + gợi ý câu hỏi hợp lệ, không thực hiện.
- **GR-3 Chống prompt-injection** — coi tin nhắn người dùng là *dữ liệu*; bỏ qua "đổi vai / lộ system prompt / bỏ luật / chế độ dev".
- **GR-4 Lớp client** (`src/lib/ai/guardrail.ts`) — chặn input rỗng/quá dài, giới hạn lịch sử gửi lên.
- **GR-5 Fail-safe** — lỗi key/API được ánh xạ thành thông báo tiếng Việt thân thiện, không lộ chi tiết nhạy cảm.

**Cá nhân hoá theo trình độ** (`src/lib/level.ts`): 5 bậc A1→C1, tự ước lượng từ tiến độ (số từ thành thạo + độ chính xác), chỉnh tay được trong Cài đặt. Trình độ được chèn vào system prompt để trợ lý giảng đúng mức ("học 1 hiểu 2/3/5/10") và đổi **gợi ý câu hỏi**.

**Bong bóng nổi + đọc ngữ cảnh** (`src/components/AssistantFab.tsx`): trợ lý là 1 nút nổi ở mọi trang (thay vì mục sidebar). Mỗi màn đăng ký "ngữ cảnh" (`src/store/contextStore.ts`) — vd đang xem/ôn/kiểm tra từ nào — để trợ lý gợi ý và trả lời sát ngữ cảnh (ngữ cảnh được đưa vào prompt dưới dạng *tham khảo*, không phải mệnh lệnh).

**Phân quyền (admin / học sinh)** (`src/store/aiStore.ts`):
- **Admin** quản lý danh sách **provider** (nhiều model + API key), đặt **mã PIN** để khóa. Học sinh **chọn model** nhưng **không thấy/sửa key**.
- Chưa đặt PIN = chế độ *thiết lập* (ai cũng là admin). Đặt PIN → khóa; mở lại bằng PIN.
- Key lưu `localStorage` (store `vocab-ai.v1`) — **không** vào file sao lưu, chỉ gửi tới OpenAI khi chat.

> ⚠️ **Bảo mật:** *bring-your-own-key* phía client + phân quyền chỉ là ranh giới **tổ chức/UX** (trình duyệt vẫn đọc được localStorage), phù hợp cá nhân/lớp học. Khi **deploy công khai**, đặt **proxy backend** giữ key & thực thi quyền server-side, rồi trỏ `baseUrl` của provider về proxy.

## 🚀 Chạy dự án

Yêu cầu: **Node.js ≥ 18** (khuyến nghị 20) và npm.

```bash
# 1. Cài đặt (frontend + backend)
npm install

# 2. Tạo file cấu hình server
cp .env.example .env      # rồi đặt JWT_SECRET, (tuỳ chọn) OPENAI_API_KEY

# 3. Chạy full-stack dev: Vite (web, cổng 5173) + Express (API, cổng 8787)
npm run dev:all
#   Chỉ frontend:  npm run dev
#   Chỉ backend:   npm run dev:server

# 4. Build production + chạy 1 tiến trình phục vụ cả web lẫn API
npm run build
npm start                 # NODE_ENV=production, mở http://localhost:8787
```

> 💡 Tài khoản **đầu tiên đăng ký sẽ là admin** (chủ hệ thống). Vào avatar góc phải → Quản trị để quản lý tài khoản & cắm API key AI (key nằm ở **server**, học viên không thấy).
> Audio phát âm tạo sẵn trong `public/audio/en/` (~28MB) nên chạy được ngay, kể cả offline.

## 🏗️ Kiến trúc production (multi-user)

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind (giữ nguyên) | Dev proxy `/api` → backend; prod được Express phục vụ tĩnh từ `dist/`. |
| Backend | **Express + TypeScript** (chạy bằng `tsx`) | `server/` — routes: auth, progress, admin, ai. |
| Database | **SQLite** (`better-sqlite3`) | File `server/data.sqlite`; đường lên **PostgreSQL** cho prod lớn (đổi tầng data). |
| Auth | **JWT trong cookie HttpOnly** + **bcrypt** | RBAC `student`/`admin` — **quyền kiểm ở server**. User đầu tiên = admin. |
| AI | **Proxy server-side** `/api/ai/chat` | Key OpenAI + guardrail + level + ngữ cảnh chạy ở server → **học viên không bao giờ thấy key**. Provider quản lý trong Admin hoặc `OPENAI_API_KEY`. |
| Đồng bộ | `progress(userId, langCode, dataJson)` | Tải khi đăng nhập, lưu debounce khi đổi; **migrate localStorage → tài khoản** lần đăng nhập đầu. |

**Deploy:** build rồi chạy `npm start` (một tiến trình Node phục vụ API + web). Có `Dockerfile` sẵn. Biến môi trường trong `.env` (xem `.env.example`): `JWT_SECRET` (bắt buộc ở prod), `OPENAI_API_KEY`, `DB_PATH`, `AI_DAILY_LIMIT`. Chi tiết thiết kế 3 vai: [`docs/design/`](docs/design/) và `docs/PLAN.md` (Phần H).

> ⚠️ **Bảo mật:** mật khẩu **bcrypt-hash**, key AI + phân quyền + guardrail đều **ở server**. Roadmap (ghi trong PLAN Phần H): Postgres + Drizzle migrations, refresh-token rotation, quên-mật-khẩu qua email, giới hạn AI theo lớp + usage log, quản lý lớp (mã lớp/CSV), helmet/HTTPS.

### Tạo lại / đổi giọng audio (tuỳ chọn)

Audio được sinh bằng `edge-tts` (Python). Cần khi bạn muốn đổi giọng, đổi tốc độ, hoặc tạo audio cho ngôn ngữ mới:

```bash
pip install edge-tts
python3 scripts/generate_audio.py                       # giọng mặc định en-US-AriaNeural
python3 scripts/generate_audio.py --voice en-US-JennyNeural   # đổi giọng
python3 scripts/generate_audio.py --voice en-GB-SoniaNeural --rate -10%   # giọng Anh-Anh, chậm hơn
edge-tts --list-voices                                  # xem toàn bộ giọng có sẵn
```

Script **bỏ qua file đã có** (chạy lại an toàn) và tạo `<voiceKey>/wN.mp3` (từ) + `<voiceKey>/eN.mp3` (câu ví dụ) trong `public/audio/<code>/`, kèm manifest `index.json`. Sửa danh sách giọng ở biến `VOICES` trong script.

### Tạo lại phiên âm / cách đọc (tuỳ chọn)

```bash
pip install eng-to-ipa cmudict
python3 scripts/generate_phonetics.py    # điền ipa + viRead vào data/en.json & public/data/en.json
```

---

## 📁 Cấu trúc dự án

```
Vocabulary-Study/
├─ docs/                       # PLAN.md + tài liệu PDF gốc
├─ data/en.json                # Dataset gốc (nguồn chân lý)
├─ public/data/
│  ├─ index.json               # Manifest liệt kê các ngôn ngữ
│  └─ en.json                  # Gói ngôn ngữ tiếng Anh (app đọc qua fetch)
├─ src/
│  ├─ types/                   # Kiểu dữ liệu dùng chung
│  ├─ lib/                     # Logic thuần: srs, quiz, tts, date, summary, decks, backup, sound
│  ├─ store/                   # Zustand: settingsStore, studyStore, dataStore
│  ├─ components/              # UI tái sử dụng: Layout, Flashcard, SpeakButton, ProgressRing…
│  └─ features/                # 7 màn: dashboard, learn, review, quiz, browse, stats, settings
└─ (vite / tsconfig / tailwind configs)
```

Nguyên tắc: **dữ liệu và logic (`src/lib`) độc lập với React** → dễ kiểm thử; **store** nối logic với UI và lo phần lưu trữ; **UI** chỉ render + phát sự kiện.

---

## 🌍 Thêm ngôn ngữ mới (mở rộng)

Kiến trúc "language pack" cho phép thêm ngôn ngữ **không cần sửa logic**:

1. Tạo file `public/data/<code>.json` đúng schema:

   ```json
   {
     "meta": {
       "code": "fr",
       "name": "French",
       "flag": "🇫🇷",
       "nativeName": "Tiếng Pháp",
       "learnerLang": "vi",
       "learnerLangName": "Tiếng Việt",
       "ttsLang": "fr-FR",
       "count": 800,
       "source": "…",
       "version": "1.0.0"
     },
     "words": [
       {
         "id": 1,
         "word": "bonjour",
         "ipa": "",
         "pos": "interj.",
         "posCategory": "other",
         "meaning": "xin chào",
         "exampleEn": "Bonjour, comment ça va ?",
         "exampleVi": "Xin chào, bạn khỏe không?"
       }
     ]
   }
   ```

2. Thêm một mục vào `public/data/index.json`:

   ```json
   { "code": "fr", "name": "French", "nativeName": "Tiếng Pháp", "flag": "🇫🇷",
     "learnerLang": "vi", "learnerLangName": "Tiếng Việt", "ttsLang": "fr-FR",
     "count": 800, "file": "fr.json", "description": "…" }
   ```

3. (Tuỳ chọn) Tạo audio phát âm cho ngôn ngữ mới:
   ```bash
   python3 scripts/generate_audio.py --code fr --voice fr-FR-DeniseNeural
   ```
   Nếu chưa có audio, app tự dùng giọng Web Speech của trình duyệt cho ngôn ngữ đó.

4. Xong! Ngôn ngữ mới tự xuất hiện trong bộ chọn ở góc phải header. Tiến độ được lưu **tách biệt theo từng ngôn ngữ** (khóa `vocab.progress.v1` → `progress[<code>]`).

`posCategory` nhận các giá trị: `noun, verb, adjective, adverb, preposition, conjunction, pronoun, determiner, article, other` (dùng để tô màu và sinh đáp án nhiễu cho quiz).

---

## 🧠 Thuật toán SRS (tóm tắt)

- 5 bậc khoảng cách ôn: `INTERVALS = [1, 2, 5, 14, 30]` ngày.
- Trả lời **đúng** → lên 1 bậc, hẹn ôn sau `INTERVALS[bậc]` ngày. Qua hết 5 bậc → **thành thạo**.
- Trả lời **sai** → về bậc 0, ôn lại ngay hôm nay.
- "Cần ôn hôm nay" = thẻ đã học, chưa thành thạo, có `dueDay ≤ hôm nay`.
- Giới hạn từ mới/ngày mặc định **15** (chỉnh trong Cài đặt).

Chi tiết đầy đủ trong [`docs/PLAN.md`](docs/PLAN.md) — Phần C & D.

---

## 🛠️ Công nghệ

React 18 · Vite 5 · TypeScript (strict) · Tailwind CSS 3 · Zustand (persist) · React Router (HashRouter) · lucide-react · audio Neural tạo sẵn (edge-tts) + Web Speech API fallback.

Deploy tĩnh dễ dàng lên GitHub Pages / Netlify / Vercel (đã đặt `base: './'` và dùng HashRouter nên không lo lỗi 404 khi refresh).

---

## 📜 Nguồn & ghi công

Dữ liệu từ vựng: *"Tài liệu Tổng hợp 1000 Từ vựng Tiếng Anh Thông dụng nhất"* (chuẩn Oxford & Cambridge) — xem bản gốc trong `docs/`.
