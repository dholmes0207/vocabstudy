# 📚 VocaStudy — Học & ôn từ vựng thông minh

🌐 **[vocastudy.app](https://vocastudy.app)**

Nơi **người Việt học nhiều ngoại ngữ**: hiện có **tiếng Anh** (4.440 từ từ cơ bản đến B1, mẫu câu, phát âm), **tiếng Hàn** và **tiếng Trung** (beta). Mọi ngôn ngữ dùng chung một cách học (lặp lại ngắt quãng, chủ đề, ngữ pháp, truyện ngắn, nghe – chép), giải thích bằng tiếng Việt.

Phần học chạy **hoàn toàn phía trình duyệt**. Có **service worker** nên sau lần tải đầu, từ vựng và file phát âm đã nghe qua vẫn dùng được **khi mất mạng**; phần vỏ ứng dụng luôn ưu tiên tải bản mới nên không bao giờ bị kẹt ở bản cũ. Đăng nhập là **tuỳ chọn**: chưa đăng nhập thì tiến độ lưu ở `localStorage`; đăng nhập thì đồng bộ qua **Supabase** giữa các thiết bị và mở khoá **trợ lý AI**.

> 📄 Tài liệu kế hoạch chi tiết (theo quy trình 3 vai: Người học → BA → DEV): [`docs/PLAN.md`](docs/PLAN.md)
> 📖 Tài liệu nguồn: [`docs/sources/1000-tu-vung-tieng-anh-thong-dung.pdf`](docs/sources/1000-tu-vung-tieng-anh-thong-dung.pdf) — xem ghi chú về [nguồn dữ liệu](#-nguồn--giấy-phép)

---

## ✨ Tính năng

| Nhóm                | Chi tiết                                                                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🏠 **Trang chủ**    | Kế hoạch hôm nay (từ cần ôn / từ mới), vòng tiến độ, streak & XP.                                                                                                                                                    |
| 📖 **Học từ mới**   | Từng **nhóm 5 từ**: _Làm quen_ (phát âm, câu ví dụ, cụm hay đi chung, từ cùng họ, mẹo nhớ) → _Luyện nhớ_ ngay (chọn nghĩa, rồi chọn từ hợp với câu). Sai thì được giảng và làm lại. Chia **50 bộ ~20 từ**.           |
| 🔁 **Ôn tập (SRS)** | Lặp lại ngắt quãng **Ngày 1 → 2 → 5 → 14 → 30**. Mặc định **tự nhớ lại**, câu hỏi khó dần theo tuổi thẻ (chọn nghĩa → chọn từ → gõ từ); quên thì học lại ngay trong buổi. Vẫn có kiểu **Lật thẻ**.                   |
| 🎯 **Kiểm tra**     | 6 dạng: Anh→Việt, Việt→Anh, Nghe→chọn, **Chọn từ hợp với câu**, Gõ từ vào câu, **Đánh vần ✍️**. Sai thì giảng: _"Bạn chọn X — đó là nghĩa của từ Y"_ + thẻ tóm tắt từ đúng.                                          |
| ✍️ **Đánh vần**     | Nghe + nhìn nghĩa rồi **gõ lại từ** với khung gợi ý `abi__ty`, nút **"Gợi ý +1 chữ"**, chấm **từng chữ cái** — luyện nhớ mặt chữ. Nạp vào SRS.                                                                       |
| 🎙️ **Luyện nói**    | **Ghi âm giọng mình**, nghe đối chiếu A/B với giọng mẫu, chấm điểm **0–100** tự động. 3 mức khó. Kết quả nạp vào SRS.                                                                                                |
| 📚 **Tra cứu**      | Tìm kiếm & lọc toàn bộ kho từ theo từ loại và trạng thái; mở một từ để xem cụm đi kèm, từ cùng họ, mẹo và **tự đặt câu**.                                                                                            |
| ✍️ **Câu của bạn**  | Tự đặt 1 câu với từ mới (chỉ lưu khi câu thật sự dùng từ đó); câu được nhắc lại mỗi khi gặp lại từ; đã đăng nhập thì **nhờ AI xem câu** bằng một chạm.                                                               |
| 🎮 **Trò chơi**     | **Ghép cặp** (6 cặp từ–nghĩa, đua giờ, kỷ lục cá nhân) và **Xếp câu** (xếp mảnh thành câu ví dụ). Cộng XP & giữ chuỗi ngày, không đụng lịch ôn SRS. **Từ của ngày** trên Trang chủ, **combo 🔥** khi đúng liên tiếp. |
| 📱 **Điện thoại**   | 5 tab (Trang chủ · Học · Ôn tập · Luyện tập · Tra cứu); **chế độ tập trung** khi đang học (ẩn thanh dưới, nút hành động dính đáy màn hình); **cài được lên màn hình chính** (PWA).                                   |
| 📈 **Thống kê**     | Phân bố bậc ghi nhớ, hoạt động 14 ngày, độ chính xác, streak, XP, **huy hiệu 🏅**.                                                                                                                                   |
| 🏅 **Gamification** | Streak 🔥, điểm XP ⭐, **15 huy hiệu** theo cột mốc, **pháo giấy 🎉** khi hoàn thành phiên.                                                                                                                          |
| 🤖 **Trợ lý AI**    | **Bong bóng nổi** ở mọi trang (OpenAI **o4-mini**), **đọc ngữ cảnh** trang đang xem + **cá nhân hoá theo trình độ** (5 bậc). Có **guardrail** từ chối ngoài phạm vi, và **phân quyền** admin/học sinh.               |
| 🎚️ **Trình độ**     | Tự đánh giá 5 bậc (A1→C1) từ tiến độ; trợ lý giảng theo mức ("học 1 hiểu 2/3/5/10").                                                                                                                                 |
| ⚙️ **Cài đặt**      | Giao diện sáng/tối, giọng đọc, hạn mức từ/ngày, tốc độ đọc, trình độ, quản lý AI (admin), sao lưu/khôi phục.                                                                                                         |

**Phương pháp học** — _học sâu, nhớ lâu_ cho người mất gốc (thiết kế: [`docs/design/learning-depth.md`](docs/design/learning-depth.md)): _tự nhớ lại_ thay cho tự chấm, _độ khó tăng dần_ theo độ "già" của thẻ, _giãn cách thật_ (trả lời đúng khi chưa tới hạn không làm từ "thành thạo" nhanh hơn), _sai là để học_ (giảng + làm lại trong buổi), _học trong ngữ cảnh & cụm từ_, _tự tạo câu_, và emoji minh hoạ cho từ cụ thể.

### 🔤 Phiên âm & cách đọc

Mỗi từ có **phiên âm IPA** (chuẩn General American, vd `/əˈbɪləˌti/`) và **gợi ý cách đọc kiểu Việt** (vd `ơ-BI-lơ-ti`, âm tiết nhấn viết HOA; nguyên âm dài có trọng âm viết đôi để tách các cặp dễ nhầm: sheep `SHIIP` / ship `SHIP`) — giúp người mới chưa quen ký hiệu IPA. Sinh sẵn bằng `scripts/generate_phonetics.py` (IPA từ `eng-to-ipa`, cách đọc suy ra từ CMU Pronouncing Dictionary). _Cách đọc kiểu Việt là gợi ý gần đúng — âm chuẩn vẫn là file audio Neural._

### 🎙️ Luyện nói (ghi âm + chấm điểm)

Màn **Luyện nói** (`src/features/speaking/`) khép kín vòng học: **nghe mẫu → đọc vào micro → nghe lại giọng mình ngay cạnh giọng mẫu**. Thiết kế **2 lớp độc lập**, lớp này hỏng không kéo lớp kia chết:

| Lớp                  | API                                       | Trình duyệt                                   | Nếu thiếu                                                                            |
| -------------------- | ----------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| Ghi âm & so sánh A/B | `MediaRecorder` (`src/lib/recorder.ts`)   | Chrome, Edge, Safari (iOS 14.3+), **Firefox** | Báo rõ và tắt màn hình                                                               |
| Chấm điểm tự động    | `SpeechRecognition` (`src/lib/speech.ts`) | Chrome, Edge, Safari — **Firefox không có**   | Rơi về **tự chấm** (Giống rồi / Chưa giống), giống cơ chế "Nhớ / Chưa" của flashcard |

**Chấm theo âm, không theo chữ.** Máy nhận dạng trả về _chữ viết_, nên đọc chuẩn `four` vẫn có thể bị ghi thành `for`. `src/lib/phonetic.ts` mã hoá cả hai bằng **Metaphone** — cùng mã ⇒ tính là đọc đúng. Bảng điểm (`src/lib/pronunciation.ts`):

- **100 — “Chuẩn!”**: máy nghe đúng hẳn chữ (chấp nhận cả khi lẫn trong câu: _“uh, ability”_).
- **88 — đồng âm**: khác chữ nhưng cùng mã ngữ âm. **Không bao giờ được “Chuẩn”**, vì Metaphone bỏ nguyên âm giữa nên `cat`/`cut` cũng cùng mã — luôn hiện _“máy nghe được: …”_ để người học tự đối chiếu.
- **≤ 80 — gần đúng**: pha trộn khoảng cách chữ và khoảng cách ngữ âm.
- Ngưỡng đạt: **Dễ 45 · Vừa 60 · Khó 80** (đổi trong _Cài đặt → Luyện nói_).

Chỉ **lần thử đầu tiên** của mỗi từ được ghi vào SRS — nhớ ngay từ lần đầu mới là tín hiệu đúng cho lịch ôn; thử lại là để luyện.

### 🔊 Phát âm bằng giọng Neural

Mỗi từ và câu ví dụ đều có **file MP3 giọng đọc AI (Neural) chuẩn Mỹ** (nghe tự nhiên), tạo sẵn bằng thư viện **`edge-tts`** (giọng Microsoft Edge, miễn phí, không cần API key) và đặt trong `public/audio/en/`. App phát file tĩnh (chỉnh tốc độ qua `playbackRate`), tự động **fallback sang Web Speech API** của trình duyệt nếu thiếu file. Có thể chọn giọng fallback trong _Cài đặt → Phát âm_.

**Tiếng Hàn, tiếng Trung:** cùng cách làm, mỗi gói có hai giọng riêng (SunHi / InJoon, Xiaoxiao / Yunxi), khai báo trong `VOICES_BY_CODE` của `scripts/generate_audio.py`. Sinh bằng workflow **"Generate audio"** trên GitHub (tab Actions → Run workflow → chọn gói): workflow ghi từ, câu ví dụ, mẫu câu, chạy `src/lib/packAudio.test.ts` rồi đẩy lên nhánh `chore/audio-<gói>`. Khi gói chưa có `public/audio/<gói>/index.json`, app đọc bằng giọng của trình duyệt như trước.

**Lưu trữ:** `public/audio/` trong repo là nguồn gốc; bản deploy lấy audio từ bucket Cloudflare R2 (workflow **"Sync audio to R2"** tự đồng bộ khi `main` đổi audio), vì Pages giới hạn 20.000 file mỗi lần deploy. Chi tiết: [`docs/design/audio-r2.md`](docs/design/audio-r2.md).
---

## 🤖 Trợ lý AI (có Guardrail, chạy server-side)

Bong bóng trợ lý (`src/components/AssistantFab.tsx`) nổi ở mọi trang, dùng **OpenAI o4-mini** qua **Cloudflare Pages Function** `/api/ai/chat` — **key OpenAI là secret trên server, không bao giờ ra trình duyệt**. Khóa chặt trong phạm vi học từ vựng tiếng Anh:

- **Định vị phạm vi + từ chối chuẩn + chống prompt-injection** — system prompt (`src/lib/ai/systemPrompt.ts`) chạy **ở Function** (server), nên học viên mở DevTools cũng không gọi tắt được.
- **Cá nhân hoá theo trình độ** (`src/lib/level.ts`): 5 bậc A1→C1, tự ước lượng từ tiến độ; chèn vào system prompt để giảng đúng mức ("học 1 hiểu 2/3/5/10").
- **Đọc ngữ cảnh trang** (`src/store/contextStore.ts`): trợ lý biết đang xem/ôn/kiểm tra từ nào để gợi ý & trả lời sát hơn.
- **Lớp client** (`src/lib/ai/guardrail.ts`): chặn input rỗng/quá dài trước khi gọi.

Yêu cầu **đăng nhập** để dùng AI. Cấu hình key = biến `OPENAI_API_KEY` trên Cloudflare (xem [docs/DEPLOY.md](docs/DEPLOY.md)).

## 🚀 Chạy dự án

Yêu cầu: **Node.js ≥ 20.19** (hoặc ≥ 22.12 — mức Vite 8 đòi hỏi; `.nvmrc` đã ghi sẵn, dùng `nvm use`) và npm.

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

### 🧪 Kiểm tra trước khi push

Đúng 5 lệnh mà CI sẽ chạy — chạy hết là gần như chắc CI xanh:

```bash
npm run format:check   # Prettier
npm run lint           # ESLint (0 error, 0 warning)
npm run typecheck      # tsc -b --noEmit
npm test               # Vitest — unit test cho src/lib
npm run build          # Vite production build
```

`npm run format` và `npm run lint:fix` để tự sửa; `npm run test:watch` khi đang viết logic.

## 🏗️ Kiến trúc (Cloudflare Pages + Supabase)

| Lớp          | Công nghệ                                       | Ghi chú                                                                                                         |
| ------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Frontend     | React 18 + Vite + Tailwind                      | Build tĩnh → **Cloudflare Pages**.                                                                              |
| Auth + DB    | **Supabase** (Auth + Postgres + RLS)            | Gọi từ browser bằng `@supabase/supabase-js`; RLS: mỗi user chỉ dữ liệu của mình. Schema: `supabase/schema.sql`. |
| API (secret) | **Cloudflare Pages Functions** (`functions/`)   | `/api/ai/chat` (AI proxy giữ key + guardrail), `/api/admin/users` (service-role, chỉ admin).                    |
| Auth model   | Supabase Auth + bảng `profiles`                 | RBAC `student`/`admin` kiểm **ở server**; user đầu tiên = admin (trigger).                                      |
| Đồng bộ      | bảng `progress(user_id, lang_code, data jsonb)` | Tải khi đăng nhập, lưu debounce; **migrate localStorage → tài khoản** lần đầu.                                  |

**Deploy:** xem [**docs/DEPLOY.md**](docs/DEPLOY.md) (Supabase → GitHub → Cloudflare Pages → domain `vocastudy.app`). Thiết kế 3 vai: [`docs/design/`](docs/design/) và `docs/PLAN.md` (Phần G, H).

> ⚠️ **Bảo mật:** mật khẩu do Supabase Auth quản lý; **RLS** chặn truy cập chéo; **key OpenAI + service-role chỉ ở Cloudflare secret**; quyền admin kiểm ở server (fail-closed — Supabase lỗi thì từ chối kèm 503 chứ không cho qua); mọi id gửi lên endpoint admin phải đúng dạng UUID. Trợ lý AI có **hạn mức `AI_DAILY_LIMIT` lượt/học sinh/ngày** (mặc định 30, đếm nguyên tử trong Postgres, mốc ngày theo giờ Việt Nam). Học sinh được nhắc số lượt còn lại khi sắp hết; admin xem được hạn mức có đang đếm thật hay không ngay ở trang Quản trị. Roadmap: quản lý lớp (mã lớp/CSV), quên-mật-khẩu email.

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

Câu mà mỗi clip ví dụ được đọc từ đó được ghi ở `scripts/audio-texts/<code>.json`: **sửa câu ví dụ rồi chạy lại script là nó tự đọc lại đúng clip đó** (mọi giọng). Test dataset fail nếu clip lệch câu; app gắn `?v=<hash câu>` vào URL clip nên người học không nghe nhầm bản cũ trong cache.

### Sửa / bổ sung nội dung một từ

```bash
python3 scripts/patch_words.py patch.json --dry-run   # xem trước
python3 scripts/patch_words.py patch.json             # ghi vào public/data/en.json
python3 scripts/generate_audio.py                     # nếu có đổi câu ví dụ
```

`patch.json` là `{ "<id>": { "meaning": …, "exampleEn": …, "exampleVi": …, "collocations": [{"en","vi"}], "family": [{"word","vi"}], "tip": …, "emoji": … } }`. Script từ chối cả patch nếu có id lạ, đổi `id`/`word`, hoặc sai kiểu dữ liệu. Test kiểm tra thêm: mỗi câu ví dụ và mỗi cụm đi kèm phải chứa đúng từ đó.

### Tạo lại phiên âm / cách đọc (tuỳ chọn)

```bash
pip install eng-to-ipa cmudict
python3 scripts/generate_phonetics.py    # điền ipa + viRead vào public/data/en.json
```

---

## 📁 Cấu trúc dự án

```
vocabstudy/
├─ docs/
│  ├─ DEPLOY.md                # Hướng dẫn deploy: Supabase → GitHub → Cloudflare Pages
│  ├─ PLAN.md                  # Kế hoạch dự án (3 vai: Người học → BA → DEV)
│  ├─ design/                  # Thiết kế từng tính năng
│  ├─ research/                # Ghi chép quan sát các web học ngoại ngữ khác
│  └─ sources/                 # Tài liệu PDF gốc
├─ public/
│  ├─ data/                    # Gói ngôn ngữ en / ko / zh (+ grammar, reading, topics, phrases)
│  │  └─ index.json            # Manifest liệt kê các ngôn ngữ
│  └─ audio/en/                # MP3 giọng Neural sinh sẵn (2 giọng) + index.json
├─ functions/                  # Cloudflare Pages Functions — API giữ secret server-side
│  ├─ tsconfig.json            # Kiểu cho môi trường Workers
│  ├─ _shared.ts               # Xác thực token Supabase, helper response
│  └─ api/                     # ai/, admin/, account, feedback, errors, health…
├─ src/
│  ├─ tsconfig.json            # Kiểu cho app (kèm vite.config.ts)
│  ├─ types/                   # Kiểu dữ liệu dùng chung
│  ├─ lib/                     # Logic thuần (srs, quiz, level, pronunciation, sync…) + test
│  ├─ store/                   # Zustand stores
│  ├─ hooks/                   # React hooks dùng chung
│  ├─ components/              # UI tái sử dụng
│  └─ features/                # Từng màn hình / tính năng
├─ supabase/                   # schema.sql, mẫu email, hướng dẫn bật đăng nhập Google
├─ scripts/                    # Python: dựng gói dữ liệu, sinh audio (edge-tts) & phiên âm IPA
├─ tsconfig.json               # Chỉ trỏ tới src/ và functions/ (tsc -b kiểm cả hai)
└─ vite.config.ts …            # Cấu hình Vite + Vitest + PostCSS + Tailwind; eslint.config.js
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
   {
     "code": "fr",
     "name": "French",
     "nativeName": "Tiếng Pháp",
     "flag": "🇫🇷",
     "learnerLang": "vi",
     "learnerLangName": "Tiếng Việt",
     "ttsLang": "fr-FR",
     "count": 800,
     "file": "fr.json",
     "description": "…"
   }
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
- Trả lời **đúng khi đã tới hạn** → lên 1 bậc, hẹn ôn sau `INTERVALS[bậc]` ngày. Qua hết 5 bậc → **thành thạo**.
- Trả lời **đúng khi chưa tới hạn** (làm quiz, lượt thứ hai trong buổi học) → được tính lượt đúng & XP nhưng **không đổi bậc/lịch** — chống "nhồi" ra thành thạo giả.
- Trả lời **sai** (bất cứ lúc nào) → về bậc 0, ôn lại ngay hôm nay; học lại đúng trong ngày → mai ôn.
- Dạng câu hỏi khi ôn theo bậc: 0–1 chọn nghĩa/nghe · 2–3 chọn từ/chọn từ hợp câu · ≥4 gõ từ vào câu/đánh vần (`src/lib/practice.ts`).
- "Cần ôn hôm nay" = thẻ đã học, chưa thành thạo, có `dueDay ≤ hôm nay`.
- Giới hạn từ mới/ngày mặc định **15** (chỉnh trong Cài đặt).

Chi tiết đầy đủ trong [`docs/PLAN.md`](docs/PLAN.md) — Phần C & D.

---

## 🛠️ Công nghệ

React 18 · Vite 5 · TypeScript (strict) · Tailwind CSS 3 · Zustand (persist) · React Router (BrowserRouter, đường dẫn sạch) · lucide-react · Supabase (Auth + Postgres + RLS) · Cloudflare Pages + Pages Functions · OpenAI o4-mini · audio Neural tạo sẵn (edge-tts) + Web Speech API fallback.

Chất lượng mã: ESLint + Prettier + TypeScript strict, unit test bằng Vitest, CI GitHub Actions chạy `lint → typecheck → test → build` trên mọi push/PR.

> Đường dẫn sạch (`/phrases/food`) cần host trả `index.html` cho đường dẫn lạ. Cloudflare Pages tự làm việc này vì repo không có `404.html` ở gốc — đừng thêm file đó (xem `docs/design/landing.md`). **AI và trang quản trị cần `functions/`** → phải deploy lên Cloudflare Pages (hoặc nền tảng có edge functions tương đương).

---

## 📜 Nguồn & giấy phép

Dữ liệu từ vựng — **1000 từ lõi + phần mở rộng B1, không trùng lặp**, xây theo ba nguồn:

1. **374 từ** trích từ _"Tài liệu Tổng hợp 1000 Từ vựng Tiếng Anh Thông dụng nhất"_ (chuẩn Oxford & Cambridge, bản gốc trong `docs/`). PDF này **đánh số tới 1000 nhưng bị lặp** — chỉ có 374 từ thật, mỗi từ xuất hiện ~2,7 lần; bản trùng đã được dọn.
2. **626 từ** do dự án bổ sung để đủ 1000, chọn từ **nhóm tần suất cao dành cho người mới** (Fry / Oxford 3000 bậc A1–A2) và các chủ đề đời sống: gia đình, màu sắc, con số, cơ thể, đồ ăn, nhà cửa, thời gian, trường học, nghề nghiệp. Nghĩa tiếng Việt, câu ví dụ Anh–Việt, IPA, cách đọc và audio đều được sinh & duyệt trong repo này.
3. **Phần mở rộng B1** (id từ 1001 trở đi, `stage: 2`): từ thông dụng bậc B1 (Oxford 3000) bổ sung theo từng lô 50 từ, mỗi từ đều có **cụm đi kèm, mẹo nhớ, IPA, cách đọc và audio**. Trên lộ trình học, phần này nằm sau 1000 từ lõi và các bộ của nó được gắn nhãn "B1".

**Thứ tự lưu trong `en.json` chính là lộ trình học** (màn Học từ mới và các bộ 20 từ đi theo đúng thứ tự này): nhóm tần suất cao nhất trước (_the, of, to, in, is, you…_) → từ đời sống A1–A2 (_water, bread, mother…_) → nhóm học thuật hơn từ tài liệu gốc. Riêng màn **Tra cứu** xếp theo bảng chữ cái cho dễ tìm.

> Bộ kiểm thử `src/lib/dataset.test.ts` khoá các cam kết trên: ít nhất 1000 từ, id liên tục từ 1, 1000 từ đầu là lõi (`stage: 1`) và phần sau là B1 (`stage: 2`, bắt buộc có cụm đi kèm + mẹo), không trùng từ, **mọi từ đều có IPA + cách đọc + đủ 4 file audio** (từ & ví dụ × 2 giọng).

**Mã nguồn**: [MIT](LICENSE). **Nội dung học** (PDF gốc, bộ từ vựng `public/data/`, audio `public/audio/`) là tài liệu bên thứ ba, đính kèm cho mục đích học tập và **không** thuộc phạm vi giấy phép MIT — xem phần ghi chú cuối [`LICENSE`](LICENSE).
