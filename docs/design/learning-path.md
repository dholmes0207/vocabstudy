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
  | Cấp | Tên             | CEFR  | Bước                                                                                                                                                    |
  | --- | --------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 1   | Khởi động       | A1    | Từ 1–150; to be, hiện tại đơn, đại từ, mạo từ; 2 truyện đầu                                                                                             |
  | 2   | Các thì cơ bản  | A1–A2 | Từ 151–500; tiếp diễn, quá khứ, tương lai, câu hỏi; 3 lượt nghe – chép; 3 truyện A2                                                                     |
  | 3   | Cấu trúc câu    | A2    | Từ 501–1000; đếm được, giới từ, so sánh, can/must; hiện tại hoàn thành, quá khứ tiếp diễn; 3 lượt Cấu trúc câu; 3 lượt xếp câu; 3 lượt luyện nói        |
  | 4   | Nghe & nói      | A2–B1 | Từ 1001–1600; ngữ pháp B1 (bị động, điều kiện, mệnh đề quan hệ, tường thuật); 5 lượt nghe thụ động; tổng 8 lượt nghe – chép, 8 lượt nói; 4 truyện A2–B1 |
  | 5   | Luyện thi TOEIC | B1    | 200 từ TOEIC; ≥ 10 câu ở mỗi Part; bài thi nhỏ đạt 60%                                                                                                  |
  | 6   | Hướng tới IELTS | B1–B2 | Từ 1601–2500; 4 lượt đọc IELTS True/False/Not Given; đọc hết kho truyện                                                                                 |
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

## 3b. Lộ trình tiếng Trung (08/11/2026)

4 cấp, mỗi cấp kết thúc bằng bài thi nhỏ HSK của cấp đó (trừ cấp 1). Bài thi vượt cấp hỏi từ trong danh
sách HSK của cấp và ngữ pháp tiếng Trung của cấp.

| Cấp | Tên                           | Bước                                                                                                                      |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Làm quen: pinyin & thanh điệu | 3 lượt Pinyin; 60 từ HSK 1; 是, 不/没, 吗, 很; 2 truyện đầu                                                               |
| 2   | HSK 1                         | 140/152 từ HSK 1; 8 bài ngữ pháp; 2 lượt lượng từ; 2 lượt nghe số; 40 câu dạng đề HSK 1; bài thi nhỏ 60%                  |
| 3   | HSK 2                         | 130/147 từ HSK 2; 9 bài ngữ pháp; 2 lượt bộ thủ; 5 truyện; 40 câu dạng đề HSK 2; bài thi nhỏ 60%                          |
| 4   | HSK 3                         | 270/298 từ HSK 3; 9 bài ngữ pháp B1; 2 lượt Hán Việt; 5 lượt nghe – chép; 9 truyện; 40 câu dạng đề HSK 3; bài thi nhỏ 60% |

- Trang Pinyin, bộ thủ, lượng từ, nghe số, Hán Việt giờ ghi số lượt đã xong (`activityStore`), trước
  đây chỉ cộng XP.
- Số câu dạng đề HSK đọc từ `retryStore.hsk` (đếm theo cấp), điểm bài thi nhỏ từ `examStore`
  (`hsk1-mini`…).

## 3c. Nhiệm vụ hôm nay và huy chương (08/11/2026)

- Mỗi ngày, lần đầu mở lộ trình (hay trang chủ), app lấy bước đang dở của cấp hiện tại làm
  **nhiệm vụ hôm nay** và ghi lại số đếm lúc đó. Bước ấy tiến thêm (dù làm ở trang nào) là xong;
  bấm "Nhận" được +15 XP và pháo giấy. Một ngày một nhiệm vụ, nhận một lần.
- Thẻ lộ trình ở trang chủ nhắc "Có nhiệm vụ hôm nay" hoặc "Nhiệm vụ xong, vào nhận quà".
- Trang Thống kê có **Huy chương lộ trình**: mỗi cấp một huy chương, sáng lên khi qua cấp, thêm
  cúp 🏆 khi thắng thử thách của cấp.
- Code: `lib/pathQuest.ts` (thuần, có test), `hooks/useDailyQuest.ts`, `pathStore.quests`,
  `features/stats/PathBadges.tsx`.

## 3d. Lộ trình tiếng Hàn (08/11/2026)

- Gói tiếng Hàn (253 từ, 14 bài ngữ pháp, 10 truyện) đủ cho phần nền TOPIK I, nên có lộ trình 3 cấp:
  1. **Hangul & chào hỏi**: 3 lượt kiểm tra Hangul, 60 từ đầu, 이에요/예요, 은/는, 이/가, 아요/어요, 2 truyện.
  2. **Câu hằng ngày**: từ 61–150, tiểu từ 을/를, 에/에서, phủ định 안/못, -(으)세요, 도/만, đơn vị đếm, nghe
     số, 4 truyện.
  3. **Quá khứ & tương lai**: từ 151 tới hết gói, 았/었어요, -고 싶어요, -(으)ㄹ 거예요, -지 않아요, từ Hán Hàn
     – Hán Việt, luyện nói, 4 truyện A2.
- Trang Hangul giờ ghi số lượt kiểm tra đã xong (`hangul` trong `activityStore`), trước đây chỉ cộng XP.
- Thi vượt cấp, nhiệm vụ hôm nay, huy chương ở trang Thống kê dùng chung, không cần code riêng.

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
  "Lộ trình theo cấp". Có cho cả ba gói: tiếng Anh (6 cấp, A1 → IELTS), tiếng Trung (4 cấp, HSK 1 → 3) và
  tiếng Hàn (3 cấp, TOPIK I).

## 5. Tiếp theo

Từ 10/11/2026 chỉ tiếp tục hoàn thiện tiếng Anh và tiếng Trung; gói tiếng Hàn giữ nguyên.

1. Rà lại mô tả các bước khi một trang có thêm dạng bài, để lộ trình nói đúng những gì trang có.
