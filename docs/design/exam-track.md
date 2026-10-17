# Lộ trình luyện thi HSK 1 / TOPIK I

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
