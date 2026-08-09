# 📚 VocabStudy — Học & ôn từ vựng thông minh

🌐 **[vocastudy.app](https://vocastudy.app)**

Website học và ôn **từ vựng đa ngôn ngữ**, khởi đầu với **1000 từ tiếng Anh thông dụng nhất** (chuẩn Oxford & Cambridge) dành cho **người Việt học tiếng Anh**.

Phần học chạy **hoàn toàn phía trình duyệt** (dùng được offline sau lần tải đầu). Đăng nhập là **tuỳ chọn**: chưa đăng nhập thì tiến độ lưu ở `localStorage`; đăng nhập thì đồng bộ qua **Supabase** giữa các thiết bị và mở khoá **trợ lý AI**.

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

## 🤖 Trợ lý AI (có Guardrail, chạy server-side)

Bong bóng trợ lý (`src/components/AssistantFab.tsx`) nổi ở mọi trang, dùng **OpenAI o4-mini** qua **Cloudflare Pages Function** `/api/ai/chat` — **key OpenAI là secret trên server, không bao giờ ra trình duyệt**. Khóa chặt trong phạm vi học từ vựng tiếng Anh:

- **Định vị phạm vi + từ chối chuẩn + chống prompt-injection** — system prompt (`src/lib/ai/systemPrompt.ts`) chạy **ở Function** (server), nên học viên mở DevTools cũng không gọi tắt được.
- **Cá nhân hoá theo trình độ** (`src/lib/level.ts`): 5 bậc A1→C1, tự ước lượng từ tiến độ; chèn vào system prompt để giảng đúng mức ("học 1 hiểu 2/3/5/10").
- **Đọc ngữ cảnh trang** (`src/store/contextStore.ts`): trợ lý biết đang xem/ôn/kiểm tra từ nào để gợi ý & trả lời sát hơn.
- **Lớp client** (`src/lib/ai/guardrail.ts`): chặn input rỗng/quá dài trước khi gọi.

Yêu cầu **đăng nhập** để dùng AI. Cấu hình key = biến `OPENAI_API_KEY` trên Cloudflare (xem [DEPLOY.md](DEPLOY.md)).

## 🚀 Chạy dự án

Yêu cầu: **Node.js ≥ 18** (khuyến nghị 20) và npm.

```bash
npm install
cp .env.example .env          # điền VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (nếu dùng tài khoản)
npm run dev                   # web (phần học + đăng nhập + đồng bộ Supabase)

# Chạy đầy đủ cả API (AI, admin) ở local qua Cloudflare Functions:
cp .dev.vars.example .dev.vars   # điền OPENAI_API_KEY + SUPABASE_* (secret local)
npm run build && npm run pages:dev
```

> 💡 Chưa cấu hình Supabase → app vẫn chạy ở **chế độ khách** (tiến độ lưu localStorage). Tài khoản **đầu tiên đăng ký = admin**.
> Audio phát âm tạo sẵn trong `public/audio/en/` (~56MB) nên chạy được ngay, kể cả offline.

## 🏗️ Kiến trúc (Cloudflare Pages + Supabase)

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind | Build tĩnh → **Cloudflare Pages**. |
| Auth + DB | **Supabase** (Auth + Postgres + RLS) | Gọi từ browser bằng `@supabase/supabase-js`; RLS: mỗi user chỉ dữ liệu của mình. Schema: `supabase/schema.sql`. |
| API (secret) | **Cloudflare Pages Functions** (`functions/`) | `/api/ai/chat` (AI proxy giữ key + guardrail), `/api/admin/users` (service-role, chỉ admin). |
| Auth model | Supabase Auth + bảng `profiles` | RBAC `student`/`admin` kiểm **ở server**; user đầu tiên = admin (trigger). |
| Đồng bộ | bảng `progress(user_id, lang_code, data jsonb)` | Tải khi đăng nhập, lưu debounce; **migrate localStorage → tài khoản** lần đầu. |

**Deploy:** xem [**DEPLOY.md**](DEPLOY.md) (Supabase → GitHub → Cloudflare Pages → domain `vocastudy.app`). Thiết kế 3 vai: [`docs/design/`](docs/design/) và `docs/PLAN.md` (Phần G, H).

> ⚠️ **Bảo mật:** mật khẩu do Supabase Auth quản lý; **RLS** chặn truy cập chéo; **key OpenAI + service-role chỉ ở Cloudflare secret**; quyền admin kiểm ở server. Roadmap: giới hạn lượt AI/học sinh, quản lý lớp (mã lớp/CSV), quên-mật-khẩu email.

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
python3 scripts/generate_phonetics.py    # điền ipa + viRead vào public/data/en.json
```

---

## 📁 Cấu trúc dự án

```
Vocabulary-Study/
├─ docs/                       # PLAN.md, thiết kế 3 vai (design/) + tài liệu PDF gốc
├─ public/
│  ├─ data/
│  │  ├─ index.json            # Manifest liệt kê các ngôn ngữ
│  │  └─ en.json               # Gói ngôn ngữ tiếng Anh (app đọc qua fetch) — nguồn chân lý
│  └─ audio/en/                # MP3 giọng Neural sinh sẵn (~56MB) + index.json
├─ functions/                  # Cloudflare Pages Functions — API giữ secret server-side
│  ├─ _shared.ts               # Xác thực token Supabase, helper response
│  └─ api/                     # ai/chat, ai/status, admin/users
├─ src/
│  ├─ types/                   # Kiểu dữ liệu dùng chung
│  ├─ lib/                     # Logic thuần: srs, quiz, level, tts, date, summary, decks, backup…
│  │  └─ ai/                   # systemPrompt, guardrail, suggestions
│  ├─ store/                   # Zustand: auth, settings, study, data, context
│  ├─ hooks/                   # useEffectiveLevel, useProgressSync
│  ├─ components/              # UI tái sử dụng: Layout, Flashcard, SpeakButton, ProgressRing…
│  └─ features/                # Màn hình: dashboard, learn, review, quiz, browse, stats,
│                              #           settings, auth, admin, tutor
├─ supabase/schema.sql         # Bảng profiles/progress, RLS, trigger admin đầu tiên
├─ scripts/                    # Python: sinh audio (edge-tts) & phiên âm IPA
└─ (vite / tsconfig / tailwind / eslint / prettier configs)
```

Nguyên tắc: **dữ liệu và logic (`src/lib`) độc lập với React** → dễ kiểm thử (xem `src/lib/*.test.ts`); **store** nối logic với UI và lo phần lưu trữ; **UI** chỉ render + phát sự kiện.

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
