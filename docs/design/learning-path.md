# Lộ trình theo cấp (08/11/2026)

**User**: "Đi sâu vào tính năng học tập, hướng đến không chỉ từ vựng mà còn luyện thi chứng chỉ nữa,
sẽ có các level để người dùng theo thay vì chỉ ra từ đầu. Level học từ, xong học thì, cấu trúc câu,
luyện nói, luyện nghe, TOEIC, IELTS… Ưu tiên tiếng Anh xong tiếng Trung. Nhớ là tạo hứng thú, hấp
dẫn khi học, phong cách tránh nhàm chán."

## 1. Người học

- App đã có nhiều phần: học từ, ngữ pháp, truyện, nghe – chép, nghe thụ động, luyện nói, xếp câu,
  luyện TOEIC, HSK. Nhưng chúng nằm rời trong menu. Người mới không biết học gì trước, học tới đâu
  thì đủ để sang phần khó hơn.
- Người đã có nền không muốn bị bắt học lại từ đầu.
- Điều làm người học bỏ cuộc: không thấy mình tiến lên, mỗi ngày giống nhau.

## 2. Cách làm

- **6 cấp tiếng Anh**, mỗi cấp 2–5 bước. Mỗi bước nối tới một trang đã có và đếm một thứ app đã ghi:
  | Cấp | Tên             | CEFR  | Bước                                                                                    |
  | --- | --------------- | ----- | --------------------------------------------------------------------------------------- |
  | 1   | Khởi động       | A1    | Từ 1–150; to be, hiện tại đơn, đại từ, mạo từ; 2 truyện đầu                             |
  | 2   | Các thì cơ bản  | A1–A2 | Từ 151–500; tiếp diễn, quá khứ, tương lai, câu hỏi; 3 lượt nghe – chép; 3 truyện A2     |
  | 3   | Cấu trúc câu    | A2    | Từ 501–1000; đếm được, giới từ, so sánh, can/must; 3 lượt xếp câu; 3 lượt luyện nói     |
  | 4   | Nghe & nói      | A2–B1 | Từ 1001–1600; 5 lượt nghe thụ động; tổng 8 lượt nghe – chép, 8 lượt nói; 4 truyện A2–B1 |
  | 5   | Luyện thi TOEIC | B1    | 200 từ TOEIC; ≥ 10 câu ở mỗi Part; bài thi nhỏ đạt 60%                                  |
  | 6   | Hướng tới IELTS | B1–B2 | Từ 1601–2500; 4 lượt đọc IELTS True/False/Not Given; đọc hết kho truyện                 |
- **Mở cấp**: qua 80% một cấp thì mở cấp sau, để một bước khó không chặn cả lộ trình. Cấp đầu tiên
  chưa xong vẫn là cấp "Làm tiếp".
- **Không bắt học lại**: kết quả bài xếp lớp (`/placement`) mở sẵn các cấp có phần từ vựng bắt đầu
  trước vị trí xếp lớp, và các từ trước vị trí đó tính là đã biết.
- **Hứng thú**: trang dạng đường đi với huy hiệu mỗi cấp; thẻ "Làm tiếp" màu của cấp; qua cấp có
  pháo giấy, dòng "Lên cấp!" và +30 XP (mỗi cấp một lần); thẻ lộ trình ở trang chủ.
- Ghi chú: "Cấp" ở đây là cấp của lộ trình, khác "Cấp" XP ở đầu trang chủ.

## 3. Thi vượt cấp

- Mỗi cấp đang mở có nút "Thi vượt cấp": 12 câu, 3 tim, sai lần thứ 3 là thua.
  - Tối đa 5 câu ngữ pháp lấy từ câu chọn của các bài ngữ pháp trong cấp.
  - Còn lại là câu từ vựng trong khoảng từ của cấp, hỏi xoay vòng 3 kiểu: nghĩa của từ (có nút nghe
    phát âm), từ của nghĩa, từ điền vào câu. Cấp TOEIC hỏi từ TOEIC.
- Thắng: mở cấp sau, +20 XP, pháo giấy, huy hiệu 🏆 "Đã vượt" trên cấp đó. Thua: nói đúng mấy câu và
  gợi ý làm thêm vài bước của cấp. Làm lại bao nhiêu lần cũng được, không mất gì.
- Vì thế người đã có nền leo được vài cấp trong vài phút, còn người mới vẫn đi từng bước.
- Dev: `lib/levelTest.ts` (dựng câu hỏi, luật thắng, có test), `features/path/LevelTest.tsx`;
  `store/pathStore.ts` lưu các cấp đã thắng; `usePathStates` mở cấp theo kết quả xếp lớp hoặc cấp cao
  nhất đã thắng.

## 4. Dev

- `lib/learningPath.ts` (thuần, có test): `EN_PATH`, `pathState` (tiến độ, mở khoá), `currentLevel`,
  `nextStep`, `levelForPlacement`. Mỗi bước có `measure(ctx)` đọc `PathContext`.
- `hooks/usePathContext.ts` gom `PathContext` từ các store có sẵn: thẻ SRS, ngữ pháp, truyện, số câu
  từng Part TOEIC, điểm bài thi nhỏ, kết quả xếp lớp.
- `store/activityStore.ts` (`vocab.activity.v1`): số lượt đã xong của nghe – chép, nghe thụ động, luyện
  nói, xếp câu. Trước đây các trang này không ghi lại gì. Ghi qua `hooks/useLogActivity.ts` hoặc
  `useActivity.log` ở chỗ phiên kết thúc.
- `store/pathStore.ts` (`vocab.path.v1`): cấp cao nhất đã ăn mừng, để pháo giấy và XP chỉ có một lần.
- Trang `/path` (`features/path/LearningPath.tsx`), thẻ ở trang chủ (`PathCard.tsx`), mục menu
  "Lộ trình theo cấp". Hiện chỉ có cho gói tiếng Anh (`lib/packContent.ts`).

## 5. Tiếp theo

1. Luyện IELTS tiếp (`docs/design/ielts.md`): Nói Part 1–3 có ghi âm, khung bài Writing Task 1/2, Nghe
   điền thông tin.
2. Lộ trình tiếng Trung: pinyin & thanh điệu → HSK 1 → HSK 2 → HSK 3.
