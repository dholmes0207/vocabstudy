# Lộ trình luyện thi HSK, TOPIK I, A2 Key, B1 Preliminary

**User**: "Mình học tiếng Trung, tiếng Hàn để đi thi lấy chứng chỉ. Muốn biết phải học gì, học
tới đâu rồi, còn thiếu gì."

Tham khảo (`docs/research/2026-10-17-language-apps.md`, quét bằng REA):

- **Migii** và **Prep**, hai nền tảng luyện thi lớn ở Việt Nam, đều có HSK và TOPIK.
- Người Việt sẵn sàng trả tiền cho luyện thi.

Cách của VocaStudy, **không làm giống hệt**:

- Không làm đề thi giả. App không có đề thật, và không nên khiến người học tưởng đang làm
  đề thật.
- Lộ trình nối những phần **đã có** trong app (bảng chữ, từ vựng, ngữ pháp, truyện, nghe
  – chép) theo đúng thứ tự cần cho kỳ thi.
- Mỗi bước hiện người học đã làm tới đâu, kèm một bài kiểm tra từ vựng ngắn theo hai kỹ năng
  của đề thi là nghe và đọc.

**Thông tin kỳ thi** (kiểm tra ngày 17/10/2026). Trang có link tới nguồn và nhắc người học
xem lại trên trang chính thức trước khi đăng ký thi.

- **HSK 1** (chuẩn đang áp dụng):
  - 40 câu: 20 câu nghe, 20 câu đọc;
  - tổng 200 điểm, đạt từ 120 điểm;
  - danh sách 150 từ.
  - HSK đang chuyển sang chuẩn mới (HSK 3.0). Ở chuẩn mới, danh sách từ cấp 1 lớn hơn. Các
    nguồn ghi ngày thi chính thức khác nhau, nên trang chỉ nói "đang chuyển", không ghi
    ngày.
  - Nguồn: Wikipedia "Hanyu Shuiping Kaoshi"; giới thiệu HSK 1 của eblcu.com.
- **TOPIK I**:
  - nghe 30 câu (40 phút), đọc 40 câu (60 phút);
  - tổng 200 điểm: cấp 1 từ 80 điểm, cấp 2 từ 140 điểm.
  - Gói tiếng Hàn hiện có 192 từ sơ cấp. Đó mới là phần nền, chưa đủ cho cả kỳ thi, và
    trang nói thẳng điều này.
  - Nguồn: Wikipedia "Test of Proficiency in Korean". Trang thông báo của Trung tâm Văn hoá
    Hàn Quốc tại Ấn Độ cũng ghi các mốc 80 và 140, nhưng không mở được để kiểm tra lại, nên
    không dùng làm nguồn.

**BA**

- Trang `/exam` hiện với gói có kỳ thi: `zh` → HSK 1, `ko` → TOPIK I. Trang nằm trong menu
  bên và trong trang Luyện tập.
- Phần "Về kỳ thi": các thông tin trên, lời lưu ý và link nguồn.
- Lộ trình 6 bước:
  1. Pinyin & thanh điệu, hoặc Bảng chữ Hangul.
  2. Từ vựng.
     - HSK 1: 150 từ của kỳ thi. TOPIK I: toàn bộ gói.
     - Hiện số từ đã học và số từ đã thuộc.
     - Nút học tối đa 10 từ chưa học, dùng bài Học bình thường, có ghi vào lịch ôn.
  3. Ngữ pháp: số bài đạt từ 80% trở lên.
  4. Đọc truyện: số truyện đã đọc.
  5. Nghe – chép.
  6. Kiểm tra từ vựng: 20 câu, gồm 10 câu nghe rồi chọn nghĩa và 10 câu đọc.
     - Từ hỏi lấy ngẫu nhiên trong danh sách của kỳ thi.
     - Không ghi vào lịch ôn, vì nhiều từ có thể chưa học.
     - Lưu điểm cao nhất.
     - Học xong có nút "Lưu các từ sai để học", dùng danh sách "Lưu để học"
       (`saved-words.md`).
- Không đổi điểm bài kiểm tra ra điểm thi thật, vì hai bài không cùng thang đo.
- Điểm bài kiểm tra chỉ lưu trên máy. Trang Quyền riêng tư đã ghi thêm điều này.

**Dev**

- `lib/exams.ts`:
  - `EXAMS`: thông tin, lời lưu ý và nguồn của từng kỳ thi;
  - `HSK1`: danh sách từ, chuyển ra từ `chinesePack.test.ts`;
  - `examFor(code)`;
  - `examWords(exam, words)`;
  - `mockQuestions(words, pool, rng)`: nửa đầu là câu `listen`, nửa sau là `en-to-vi` /
    `context`.
- `store/examStore.ts` (`vocab.exam.v1`): `{ [examId]: { best, total, day, tries } }`.
- `features/exam/Exam.tsx`:
  - dùng lại `LearnSession` cho bước 2 và `QuizRunner` cho bước 6;
  - lấy tiến độ ngữ pháp và đọc truyện từ `grammarStore` và `readingStore`.
- `lib/packContent.ts`: `/exam` chỉ dành cho `ko` và `zh`.

## HSK 2 (19/10/2026)

**User**: "Cải thiện thêm phần học tiếng Trung, thêm bộ từ hợp lý." Học xong HSK 1 thì bước tiếp
theo là HSK 2, và các đợt từ mới đã phủ được phần lớn danh sách này.

**Thông tin kỳ thi**, kiểm tra ngày 19/10/2026 trên tờ thông tin HSK 2 của Viện Khổng Tử Anh
(bản 2015):

- 60 câu: 35 câu nghe (khoảng 25 phút) và 25 câu đọc (22 phút). Cả bài khoảng 55 phút, gồm 5
  phút điền thông tin.
- Tổng 200 điểm, đạt từ 120 điểm.
- Người học cần khoảng 300 từ tính gộp.

**Danh sách từ**: dùng bảng tổng hợp mở `drkameleon/complete-hsk-vocabulary` (cấp 2 bản "old",
147 mục).

- Lấy phần cấp 1 của bảng đó so với danh sách HSK 1 của app thì lệch vài mục (饭馆 / 饭店, 说话 /
  说…), vì các bản in danh sách 2012 khác nhau.
- Trang nói rõ điều này trong lời nhắc, cùng lời nhắc về chuẩn HSK 3.0.

**BA**

- Gói tiếng Trung có hai lộ trình. Ở đầu trang có tab **HSK 1 | HSK 2**; mặc định là HSK 1.
- Mỗi cấp có thông tin kỳ thi, nguồn, danh sách từ, tiến độ và bài kiểm tra từ vựng 20 câu riêng.
  Điểm cao nhất lưu theo từng cấp (`hsk1`, `hsk2`).
- Thêm 64 từ HSK 2 còn thiếu vào gói (gói lên 330 từ). Mỗi từ có câu ví dụ và pinyin; 62/64 từ
  có âm Hán Việt (您 và 踢 không ghi, vì cách đọc không chắc chắn).
- Nhãn trên thẻ từ ghi **cấp dễ nhất** có từ đó: 学生 là HSK 1, 哥哥 là HSK 2. Từ nằm ở cả hai danh
  sách (号) mang nhãn HSK 1.

**Dev**

- `lib/exams.ts`:
  - thêm `HSK2` và mục `hsk2` trong `EXAMS`;
  - `examsFor(lang)` trả về các kỳ thi của một gói, cấp dễ trước;
  - `examFor(lang, id?)` trả về kỳ thi theo id, không có id thì lấy kỳ đầu tiên;
  - `examLabelFor` lấy cấp dễ nhất có từ đó.
- `features/exam/Exam.tsx`: `Exam()` giữ cấp đang chọn và truyền tab vào phần đầu của `Roadmap`
  (chỉ hiện khi gói có hơn một kỳ thi).
- Test: `lib/exams.test.ts` (mọi từ HSK 2 có trong gói, nhãn theo cấp), `Exam.test.tsx` (đổi tab).

## Tiếng Anh: A2 Key và B1 Preliminary (28/10/2026)

**User** (người học tiếng Anh): "Học xong 1.000 từ rồi thì thi được gì? Mình cần chứng chỉ B1."

Gói tiếng Anh chia sẵn hai phần: 1.000 từ lõi bậc A1–A2 và phần mở rộng bậc B1 (theo Oxford
3000). Hai kỳ thi Cambridge khớp đúng hai bậc này: **A2 Key** (KET) và **B1 Preliminary** (PET).

**Thông tin kỳ thi**, kiểm tra ngày 28/10/2026 trên trang chính thức của Cambridge (định dạng
từ 2020; Wikipedia còn ghi định dạng cũ của A2 Key nên không dùng):

- **A2 Key:**
  - Đọc và Viết: 1 giờ, 7 phần, 32 câu (50%);
  - Nghe: 30 phút gồm 6 phút chép đáp án, 5 phần, 25 câu (25%);
  - Nói: 8–10 phút mỗi cặp, 2 phần (25%);
  - thang Cambridge English: 120–132 hạng C, 133–139 hạng B (đều là A2), 140–150 hạng A (B1),
    100–119 nhận chứng chỉ A1.
- **B1 Preliminary:**
  - Đọc: 45 phút, 6 phần, 32 câu (25%); Viết: 45 phút, 2 phần (25%);
  - Nghe: 30 phút gồm 6 phút chép đáp án, 4 phần, 25 câu (25%);
  - Nói: 10–12 phút mỗi cặp, 4 phần (25%);
  - thang: 140–152 hạng C, 153–159 hạng B (đều là B1), 160–170 hạng A (B2), 120–139 nhận chứng
    chỉ A2.

**BA**

- Gói tiếng Anh có tab **A2 Key | B1 Preliminary**, mặc định A2 Key.
- Từ vựng: A2 Key là 1.000 từ lõi, B1 Preliminary là phần mở rộng B1, giống cách HSK 2 chỉ tính
  phần thêm sau HSK 1.
- Cambridge có danh sách từ chính thức. App không chép danh sách đó, nên lời nhắc nói rõ từ vựng
  của app gần nhưng không trùng khớp, và không gắn nhãn kỳ thi lên thẻ từ tiếng Anh.
- Lời nhắc cũng nói thẳng: app luyện từ vựng, nghe, đọc; chưa có phần Viết; phần Nói tập ở
  "Luyện nói".
- Bước 1 là "Âm khó cho người Việt", vì phần nghe cần phân biệt ship / sheep và nghe ra âm cuối.

**Dev**

- `lib/exams.ts`: mục `a2key`, `b1prelim`; trường mới `stage` (lọc từ theo bậc khi không có danh
  sách), `stageLabel` (tên nhóm từ trên trang), `basics.note` (vì sao bước 1 đứng đầu).
- `lib/packContent.ts`: `/exam` mở cho cả `en`.
- Test: `lib/exams.test.ts` (hai kỳ thi chia đúng hai bậc của gói), `Exam.test.tsx` (tab, thông
  tin đề, số từ).
