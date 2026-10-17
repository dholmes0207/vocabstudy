# Học sâu, nhớ lâu — nâng chất lượng học & ôn cho người mất gốc

> Quy trình 3 vai như mọi tính năng trước: **(1) Người học** nói nỗi đau thật →
> **(2) BA** biến nó thành vấn đề đo được, user story, tiêu chí chấp nhận →
> **(3) Dev** thiết kế kỹ thuật, dữ liệu, test, và cách triển khai không làm gãy
> bản đang chạy ở `vocastudy.app`.
>
> Ngày: 23/09/2026. Phạm vi: engine học/ôn, nội dung 1000 từ, giao diện Học –
> Ôn – Kiểm tra – Tra cứu.

---

## PHẦN 1 — VAI NGƯỜI HỌC (mất gốc)

Mình 27 tuổi, đi làm văn phòng, tiếng Anh "trả lại thầy cô" từ hồi cấp 3. Mình
dùng VocaStudy được 3 tuần, mỗi tối 15 phút. App đẹp, có tiếng đọc, có lịch ôn.
Nhưng mình bắt đầu thấy mấy chuyện này:

- **Mình "thuộc" mà không nhớ.** Lúc học từ mới, thẻ hiện "ability", mình lật
  ra xem nghĩa rồi bấm "Đã nhớ" — vì mình _vừa nhìn thấy nó 3 giây trước_. Tất
  nhiên là nhớ! Hôm sau gặp lại thì trắng trơn. Cái nút "Đã nhớ" đó giống tự
  chấm bài cho mình, và mình chấm dễ lắm.
- **Số "thành thạo" tăng nhanh đến mức đáng ngờ.** Có hôm mình làm quiz "Đã học"
  ba lần liền cho vui, tối đó thấy số từ thành thạo nhảy vọt. Mình biết là mình
  chưa thật sự thuộc mấy từ đó — app đang khen hộ mình.
- **Câu ví dụ nhiều câu kỳ kỳ.** "Key study point." — "Điểm key học tập". "Drive
  car safely." "Read book page." Mình mất gốc thật, nhưng mình vẫn thấy mấy câu
  đó không giống tiếng Anh người ta nói. Học theo câu sai thì mình nói sai theo.
- **Mình biết nghĩa nhưng không biết dùng.** Mình thuộc "decision = quyết định",
  nhưng muốn nói "đưa ra quyết định" thì không biết là _make_ hay _do_ hay _take_.
  Mình cần biết từ đó hay đi với từ nào.
- **Sai rồi thì sao?** Làm quiz sai, app chỉ tô xanh đáp án đúng rồi qua câu
  khác. Mình không hiểu vì sao mình nhầm, và từ vừa sai cũng không quay lại để
  mình thử lần nữa.
- **Mấy từ nhỏ khó nhất.** "the, of, to, in, is" — dịch ra "cái, của, đến, trong,
  thì" thì mình biết, nhưng dùng thế nào mới đúng thì chẳng ai nói.
- **Nghĩa bị cụt.** "need = cần thiết", "save = lưu trữ", "right = đúng đắn".
  Ngoài đời mình gặp "save money", "turn right" thì chịu.

Điều mình mong:

1. Học từ mới thì **bắt mình nhớ lại thật**, không cho mình tự chấm dễ dãi — nhưng
   đừng làm như thi cử, sai thì chỉ cho mình vì sao rồi cho làm lại.
2. Mỗi từ có **câu ví dụ thật**, vài **cụm hay đi chung**, **từ cùng họ**, và một
   **mẹo nhớ / lỗi hay gặp** bằng tiếng Việt dễ hiểu.
3. Ôn tập **đúng hạn mới được tính**, để con số "thành thạo" là thật.
4. Cho mình **tự đặt câu** của riêng mình — mình nghe nói tự nghĩ ra câu thì nhớ
   lâu hơn nhiều.
5. Vẫn ngắn gọn, 10–15 phút, không ngợp.

---

## PHẦN 2 — VAI BUSINESS ANALYST

### 2.1 Chẩn đoán (đã kiểm chứng trên code & dữ liệu)

| #   | Vấn đề                                                                                                                                                 | Bằng chứng                                                                    | Ảnh hưởng tới "nhớ sâu"                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| D1  | **Nhồi được "thành thạo"**: mọi câu trả lời đúng đều đẩy thẻ lên 1 bậc, kể cả khi chưa tới hạn ôn. Làm quiz 6 lần trong 1 buổi → từ "thành thạo" luôn. | `srs.ts#review` không kiểm tra `dueDay`; Quiz gọi `recordAnswer` cho mọi câu. | Phá hỏng lặp lại ngắt quãng — thứ duy nhất tạo trí nhớ dài hạn. Số liệu sai. |
| D2  | **Học mới = tự chấm**: thẻ lật + "Đã nhớ/Chưa nhớ" ngay sau khi vừa đọc nghĩa.                                                                         | `Learn.tsx` → `FlashcardSession`.                                             | Ảo giác "biết rồi" (illusion of competence); không có luyện nhớ chủ động.    |
| D3  | **Ôn = tự chấm**: trang Ôn tập cũng chỉ lật thẻ.                                                                                                       | `Review.tsx` → `FlashcardSession`.                                            | Người mới chấm dễ, lịch ôn giãn ra khi chưa thật sự nhớ.                     |
| D4  | **Sai không được học lại trong buổi**: thẻ sai về hộp 0 "đến hạn hôm nay" nhưng hàng đợi đã chốt lúc mở trang.                                         | `Review.tsx` dựng `queue` 1 lần.                                              | Mất khoảnh khắc sửa sai quý nhất.                                            |
| D5  | **Phản hồi khi sai quá mỏng**: chỉ tô đáp án đúng.                                                                                                     | `QuizRunner.tsx`.                                                             | Không phân biệt được từ dễ nhầm; không hiểu vì sao sai.                      |
| D6  | **~220 câu ví dụ hỏng** (id 150–374, phần trích từ PDF): cụm cụt, sai ngữ pháp, chủ đề "học tập" lặp lại, bản dịch lẫn tiếng Anh ("Điểm key học tập"). | Dữ liệu `public/data/en.json`.                                                | Học theo mẫu sai; không thấy từ sống trong câu thật.                         |
| D7  | **Nghĩa cụt / sai** ở một số từ đa nghĩa: need, save, right, order, point, table, view, second…                                                        | Như trên.                                                                     | Gặp nghĩa thông dụng nhất ngoài đời thì không nhận ra.                       |
| D8  | **Không có chiều sâu**: mỗi từ chỉ 1 nghĩa + 1 câu. Không cụm đi kèm, không từ cùng họ, không mẹo/lỗi hay gặp.                                         | Kiểu `Word`.                                                                  | Biết nghĩa nhưng không dùng được (đúng nỗi đau "afford" trong PLAN.md).      |
| D9  | **Điền từ bỏ sót từ biến đổi**: 63 câu dùng "hands, eyes, cries…" nên không tô sáng, không tạo được câu điền từ.                                       | `gapExample`, `HighlightExample` so khớp nguyên dạng.                         | Mất dạng bài theo ngữ cảnh ở chính những từ cơ bản nhất.                     |

### 2.2 Nguyên tắc sư phạm được chọn (và lý do)

- **Truy xuất chủ động (retrieval practice)**: phải _tự lôi ra_ từ trí nhớ mới
  nhớ lâu; đọc lại / tự chấm thì không. → Học mới & ôn đều bằng câu hỏi thật.
- **Độ khó tăng dần (desirable difficulty)**: từ nhận diện (chọn nghĩa) → nhớ lại
  (chọn từ tiếng Anh, điền vào câu) → tự viết ra (gõ từ). Thẻ càng "già" câu hỏi
  càng khó.
- **Chia nhỏ (chunking)**: người mất gốc học từng nhóm 5 từ: làm quen 5 từ → luyện
  ngay 5 từ đó → nhóm tiếp.
- **Sai là để học**: sai thì giải thích + so sánh với từ mình chọn nhầm, rồi từ đó
  quay lại sau vài câu. Không trừ điểm, không màn hình đỏ.
- **Giãn cách thật sự**: chỉ câu trả lời _đúng hạn_ mới đẩy lịch ôn đi xa. Trả lời
  sai thì luôn được tính (đó là thông tin thật: bạn đã quên).
- **Học trong ngữ cảnh & cụm từ**: câu ví dụ tự nhiên + 2–3 cụm hay đi chung +
  từ cùng họ + 1 mẹo tiếng Việt.
- **Tự tạo nội dung (generation / self-reference)**: tự đặt câu với từ mới.
- **Mã hoá kép (dual coding)**: emoji minh hoạ cho từ cụ thể (táo 🍎, mưa 🌧️).

### 2.3 User stories & tiêu chí chấp nhận

**US-L1 — Học từ mới có luyện nhớ (P0)**
Là người mất gốc, tôi muốn sau khi làm quen vài từ thì được hỏi lại ngay, để
biết mình nhớ thật hay chưa.

- Buổi học chia nhóm **5 từ**. Mỗi nhóm: _Làm quen_ (thẻ đầy đủ, không có nút tự
  chấm) → _Luyện nhớ_ (mỗi từ 2 câu: 1 câu nhận diện, 1 câu nhớ lại/ngữ cảnh).
- Trả lời sai → thấy lời giải thích, từ đó **quay lại sau ~3 câu**, tối đa 3 lần.
- Thoát giữa chừng không mất gì: từ nào đã trả lời thì đã vào lịch ôn.
- Từ chỉ được tính "đã học" khi đã trả lời ít nhất 1 câu luyện nhớ.

**US-R1 — Ôn tập bằng nhớ lại, độ khó theo tuổi thẻ (P0)**

- Mặc định ôn bằng câu hỏi: hộp 0–1 chọn nghĩa/nghe; hộp 2–3 chọn từ tiếng Anh
  hoặc chọn từ điền vào câu; hộp ≥4 gõ từ vào câu (hoặc đánh vần nếu không có câu).
- Sai → giải thích → quay lại trong buổi.
- Vẫn có kiểu **"Lật thẻ"** cho ai thích (tuỳ chọn, nhớ lựa chọn).

**US-S1 — Không nhồi được "thành thạo" (P0)**

- Trả lời đúng một từ **chưa tới hạn** không đổi hộp, không đổi ngày ôn (vẫn cộng
  XP, vẫn tính độ chính xác).
- Trả lời sai thì luôn tính: về hộp 0, ôn lại ngay hôm nay.
- Trang Kiểm tra nói rõ điều này bằng lời thường.

**US-F1 — Sai thì được giảng (P0)**

- Sau câu sai: hiện thẻ tóm tắt của từ đúng (phát âm, nghĩa, câu ví dụ có loa,
  mẹo) và **"Bạn chọn X — đó là nghĩa của từ Y"**.
- Sau câu đúng: nhắc lại câu ví dụ 1 dòng để củng cố ngữ cảnh.

**US-D1 — Câu ví dụ & nghĩa chuẩn (P0)**

- Không còn câu cụt/sai ngữ pháp; mỗi câu là câu hoàn chỉnh, tự nhiên, dùng từ
  vựng dễ; bản dịch thuần Việt.
- Audio câu ví dụ đọc **đúng câu đang hiển thị** (có test chặn lệch).

**US-D2 — Hiểu sâu một từ (P1)**

- Mỗi từ có: 2–3 **cụm hay đi chung** (kèm nghĩa), **từ cùng họ** (nếu có), 1
  **mẹo nhớ / lỗi hay gặp** (≤ 2 câu tiếng Việt), emoji cho từ cụ thể.
- Hiển thị ở thẻ làm quen, mặt sau thẻ lật, phản hồi khi sai, và Tra cứu.

**US-P1 — Câu của riêng tôi (P1)**

- Ở thẻ làm quen và tra cứu có ô "Tự đặt 1 câu" (không bắt buộc). Câu được lưu
  và hiện lại mỗi khi gặp từ đó. Có nút nhờ trợ lý AI xem câu (nếu đã đăng nhập).

**US-C1 — Điền từ hiểu từ biến đổi (P1)**

- "hands", "cries", "watched", "making" được nhận là dạng của hand/cry/watch/make:
  tô sáng trong câu và dùng được cho câu hỏi ngữ cảnh.

### 2.4 Ngoài phạm vi lần này

- Đổi thuật toán sang SM-2/FSRS (giữ thang 1-2-5-14-30 của tài liệu gốc).
- Ảnh minh hoạ thật (bản quyền + dung lượng) — dùng emoji.
- Đồng bộ "câu của tôi" lên Supabase (lưu trên máy + có trong file sao lưu).
- Âm thanh cho cụm từ đi kèm (dùng giọng đọc của trình duyệt).

### 2.5 Chỉ số thành công

- Tỉ lệ đúng ở lần ôn đầu tiên (ngày +1) của từ mới — kỳ vọng tăng.
- Tỉ lệ từ "thành thạo" bị trả lời sai khi gặp lại — kỳ vọng giảm (thành thạo là thật).
- Không phát sinh lỗi mới trên production; tiến độ cũ đọc được y nguyên.

---

## PHẦN 3 — VAI DEV (thiết kế kỹ thuật)

### 3.1 Engine SRS (`src/lib/srs.ts`) — sửa D1

```
review(card, correct, day):
  correct && card đã học && card.dueDay > day   → "đúng sớm": chỉ tăng correctCount,
                                                   cập nhật lastReviewedDay; KHÔNG đổi box/dueDay
  correct (đến hạn hoặc thẻ mới)               → như cũ: box+1, dueDay = day + INTERVALS[box]
  sai                                          → như cũ: box 0, dueDay = day
```

- Không đổi định dạng `SRSCard` → tiến độ cũ, đồng bộ, sao lưu giữ nguyên.
- Nhờ luật này, các buổi học/ôn **cứ ghi mọi câu trả lời** mà không sợ lạm phát:
  từ mới đúng lần đầu → hộp 1 (mai ôn); đúng thêm trong buổi → không đổi; sai →
  hộp 0 (hôm nay) rồi đúng lại → hộp 1 (mai ôn). Đây đúng là "bước học lại".

### 3.2 Dạng câu hỏi & chọn độ khó (`src/lib/quiz.ts`, `src/lib/practice.ts`)

- Thêm `QuizMode = 'context'`: câu ví dụ đục lỗ + 4 lựa chọn tiếng Anh (dễ hơn gõ,
  hợp người mất gốc).
- `gapExample` / `HighlightExample` dùng chung `findWordInSentence()` hiểu biến
  đổi thông dụng: `-s/-es/-ies`, `-ed/-d/-ied`, `-ing` (bỏ `e` câm, gấp đôi phụ âm),
  và bảng bất quy tắc nhỏ (go→went, child→children…). `checkFillAnswer` chấp nhận
  cả dạng trong câu lẫn dạng gốc.
- `reviewModeFor(card, word)`: box ≤1 → en-to-vi | listen; box 2–3 → vi-to-en |
  context; box ≥4 → fill (gõ) | spell. Lựa chọn quay vòng theo id + ngày để ổn định
  trong buổi mà vẫn đổi giữa các ngày.
- `learnPlan(words)`: nhóm 5; mỗi nhóm = làm quen từng từ → vòng 1 (nhận diện) →
  vòng 2 (ngữ cảnh/nhớ lại). Thuần hàm, có test.
- `requeue(queue, index, item)`: chèn lại câu sai sau `REQUEUE_GAP = 3` câu; tối
  đa `MAX_ATTEMPTS = 3` lần/câu để buổi học không bao giờ kẹt.

### 3.3 Giao diện

- `QuizRunner` chuyển về `src/components/` và dùng chung cho Học – Ôn – Kiểm tra:
  thêm `requeueWrong`, `onExit`, dạng `context`, và khối phản hồi `WordInsight`.
- `LearnSession` (mới): làm quen (thẻ `WordInsight` đầy đủ + ô "câu của bạn") →
  `QuizRunner` cho nhóm → nhóm kế → màn hình hoàn thành.
- `Review`: công tắc **Nhớ lại** (mặc định) / **Lật thẻ**; lưu ở
  `settings.reviewStyle`. Chế độ Nhớ lại dùng `QuizRunner` + `requeueWrong`.
- `WordInsight` (mới): khối "hiểu sâu" dùng lại ở 4 nơi (thẻ làm quen, mặt sau thẻ
  lật, phản hồi khi sai, Tra cứu).

### 3.4 Dữ liệu (`public/data/en.json`) — vẫn là nguồn sự thật duy nhất

Trường mới, **đều tuỳ chọn** (gói cũ vẫn hợp lệ):

```ts
collocations?: { en: string; vi: string }[] // cụm hay đi chung
family?: { word: string; vi: string }[]     // từ cùng họ
tip?: string                                // mẹo nhớ / lỗi hay gặp (tiếng Việt)
emoji?: string                              // mã hoá kép cho từ cụ thể
```

- `scripts/patch_words.py <patch.json>`: vá theo id (kiểm tra id tồn tại, không
  đổi `word`/`id`, trường hợp lệ) — dùng cho cả sửa câu ví dụ lẫn bổ sung chiều sâu.
- `scripts/generate_audio.py` ghi lại **câu đã đọc** vào
  `scripts/audio-texts/en.json` và tự đọc lại khi câu đổi. Test mới fail nếu audio
  lệch câu.
- Cache: `exampleAudio(id, text)` gắn `?v=<hash câu>` → clip mới không bị chặn bởi
  cache HTTP 30 ngày (`public/_headers`) hay cache của service worker.

### 3.5 "Câu của bạn"

- Store mới `vocab.notes.v1` (Zustand persist, tiền tố `vocab.` nên tự có trong
  file sao lưu). Không đụng `progress` → không ảnh hưởng đồng bộ Supabase.
- Nút "Nhờ AI xem câu": `contextStore.ask(text)` → bong bóng AI tự mở và gửi.

### 3.6 Tương thích & an toàn khi deploy

- Không đổi schema Supabase, không đổi `SRSCard`, không đổi khoá localStorage cũ.
- `settings` thêm `reviewStyle` với giá trị mặc định → persist cũ vẫn đọc được.
- Tiến độ đã "nhồi" trước đây giữ nguyên (không hạ bậc ai) — luật mới chỉ áp cho
  câu trả lời từ nay.
- Mọi thay đổi logic có test viết trước (TDD); CI: format → lint → typecheck →
  test → build.

### 3.7 Kế hoạch commit

1. docs: tài liệu này
2. fix(SRS): chống nhồi
3. feat(ngữ cảnh): nhận dạng từ biến đổi + dạng câu hỏi `context`
4. feat(học): buổi học có luyện nhớ + phản hồi giảng giải
5. feat(ôn): ôn bằng nhớ lại, độ khó theo tuổi thẻ, học lại trong buổi
6. fix(dữ liệu): viết lại câu ví dụ hỏng + nghĩa cụt, đọc lại audio
7. feat(dữ liệu): cụm đi kèm, từ cùng họ, mẹo nhớ, emoji cho 1000 từ
8. feat: câu của bạn + nhờ AI xem câu

## "Mình biết từ này rồi" (18/10/2026)

**User**: "Trong bài học có những từ mình biết rồi, vẫn phải đi qua hết."

Tham khảo: thẻ học của Memrise có nút "Tôi đã biết từ này". Quan sát bằng REA khi người dùng
đăng nhập và tự làm một lượt học (xem `docs/research/2026-10-17-language-apps.md`, vòng 4).
VocaStudy **không làm giống hệt**: ở Memrise, từ đó được tính là đã thuộc. Ở VocaStudy, từ đó
**chỉ được bỏ qua tạm**, rồi được kiểm tra lại.

**BA**

- Thẻ làm quen (bài Học, Chủ đề, Lộ trình luyện thi) có nút "Mình biết từ này rồi", kèm
  dòng nhỏ: "app sẽ hỏi lại sau 5 ngày để chắc chắn".
- Bấm vào thì từ rời khỏi bài đang học. Thẻ sau hiện ngay. Nếu cả nhóm đều đã biết thì sang
  nhóm tiếp theo.
- Từ đó vào lịch ôn ở **hộp 3**: qua bước đầu, nhưng không tính là đã thuộc.
  - Sau 5 ngày, phần Ôn tập hỏi nó bằng dạng câu của hộp 3. Đây là dạng khó hơn, không phải
    chọn nghĩa.
  - Trả lời sai thì từ quay về hộp 0 và học lại như từ mới.
- Không cộng XP và không tính vào số từ mới của ngày, nên bài học hôm đó đề xuất thêm từ
  khác.
- Nút chỉ hiện với từ **chưa có** trong lịch ôn. Khi học lại cả một bộ từ, những từ đang ôn
  không có nút này.
- Cuối bài, app báo: "Bạn đã bỏ qua N từ đã biết — app sẽ hỏi lại sau 5 ngày."

**Dev**

- `lib/srs.ts`: `KNOWN_BOX = 3`, `KNOWN_CHECK_DAYS = INTERVALS[2]` (5 ngày) và `knownCard(id,
day)`.
- `studyStore.markKnown(code, id)`:
  - tạo thẻ bằng `knownCard`;
  - không đụng `stats`, nên không có XP, không đổi `newByDay` và chuỗi ngày học;
  - từ đã có thẻ thì bỏ qua.
- Thẻ dùng các trường như mọi thẻ khác, nên đồng bộ và sao lưu không phải sửa gì.
- `LearnSession`:
  - nhận `onKnown`; nhóm từ được lọc trong `useMemo`, để câu hỏi không bị xáo lại mỗi lần
    render;
  - `renderComplete(total, known)`.

## "Hiện không nghe được" (18/10/2026)

**User**: "Đang trên xe buýt, không bật tiếng được, mà bài ôn cứ bắt nghe."

Tham khảo: nút "Hiện không nghe được" của Duolingo, xem bằng REA (vòng 4). VocaStudy không
bỏ hẳn câu nghe: câu đó **đổi thành câu đọc**. Người học vẫn được hỏi về từ, chỉ là đọc thay
vì nghe.

**BA**

- Câu nghe trong Ôn tập, Quiz, bài Học, Kiểm tra từ vựng có thêm nút "Hiện không nghe được
  (tắt câu nghe 15 phút)", nằm dưới nút loa.
- Bấm vào thì trong 15 phút, mọi câu nghe hiện chữ của từ thay cho nút loa. Đáp án vẫn là
  các nghĩa như cũ, và app không tự phát tiếng. Câu gõ chính tả cũng không tự phát tiếng.
- Đầu thẻ câu hỏi có dòng "Câu nghe đang tạm tắt · Bật lại".
- Hết 15 phút thì câu nghe tự bật lại. Trạng thái nằm trên máy (`vocab.listenpause.v1`), nên
  tải lại trang vẫn giữ.

**Dev**

- `store/listenPauseStore.ts`: lưu `until` (mili giây), có `pause()`, `resume()` và
  `useListenPaused()`.
- `QuizRunner` đổi câu `listen` thành `en-to-vi` trong `useMemo` khi đang tạm tắt. Hai dạng
  có cùng đáp án (nghĩa), nên không phải tạo lại câu hỏi.

## Tóm tắt cuối buổi theo thay đổi (18/10/2026)

**User**: "Ôn xong chỉ thấy 8/10 đúng, không biết mình tiến bộ thế nào."

Tham khảo: cuối lượt học của Memrise ghi "từ đã thành thạo +2" (REA, vòng 4).

**BA**

- Màn kết thúc của Ôn tập và Quiz có thêm một hàng nhãn, dưới số câu đúng:
  - "⭐ +N từ đã thuộc";
  - "📈 N từ lên bậc ôn";
  - "🌱 +N từ vào lịch ôn";
  - "🔁 N từ cần học lại".
- Nhãn nào bằng 0 thì ẩn. Không có thay đổi nào thì không hiện cả hàng.
- Bài Học không có hàng này, vì lời chúc cuối bài đã nói số từ mới.

**Dev**

- `lib/sessionDelta.ts`:
  - `snapshotPhases(ids, cards)` chụp giai đoạn của các từ trước câu trả lời đầu tiên;
  - `phaseDelta(before, cards)` so với thẻ sau buổi học. Thứ bậc: new < learning <
    review < mastered.
- `components/SessionChanges.tsx` đọc thẻ hiện tại từ `studyStore`.
- `Review` chụp trong `useState` lúc mở trang. `Quiz` chụp khi bấm bắt đầu.
