# Luyện IELTS (08/11/2026)

**User**: "Hướng đến không chỉ từ vựng mà còn luyện thi chứng chỉ… TOEIC, IELTS." IELTS là cấp 6 của
lộ trình theo cấp (`docs/design/learning-path.md`).

## 1. Người học

- Sinh viên cần IELTS 5.5–6.5 để ra trường, du học hay xin học bổng.
- Phần Đọc làm mất điểm nhiều nhất là **True / False / Not Given**: người Việt hay chọn FALSE khi bài
  không nhắc tới, hoặc dùng hiểu biết của mình thay vì chỉ dựa vào bài.

## 2. Đề thi

Kiểm tra ngày 08/11/2026 qua kết quả tìm kiếm trên các trang của British Council và IDP (ielts.org,
takeielts.britishcouncil.org và idp.com bị chặn trong môi trường làm việc nên không mở trực tiếp được).
Trang nhắc người học xem lại trên ielts.org trước khi đăng ký.

| Kỹ năng | Thời gian  | Nội dung                                                                                 |
| ------- | ---------- | ---------------------------------------------------------------------------------------- |
| Nghe    | 30 phút    | 4 phần (2 hội thoại, 2 bài nói), 40 câu                                                  |
| Đọc     | 60 phút    | Academic: 3 bài đọc dài, 40 câu                                                          |
| Viết    | 60 phút    | Task 1 tả biểu đồ ≥ 150 từ (~20 phút); Task 2 bài luận ≥ 250 từ (~40 phút, điểm gấp đôi) |
| Nói     | 11–14 phút | 3 phần với giám khảo                                                                     |

Điểm theo band, có nửa band (6.5, 7.0…). Nghe, Đọc, Viết thi liền nhau trong một buổi; Nói cùng ngày
hoặc trong vòng 7 ngày.

## 3. Cách làm

- Không làm đề giả, không dùng đề thật: bài đọc do VocaStudy tự viết, ngắn (100–130 từ, 3 đoạn), chủ
  đề học thuật quen thuộc của IELTS (môi trường, khoa học, xã hội, lịch sử).
- **Bước 1 (PR này): Đọc True / False / Not Given.** 6 bài, mỗi bài 5 câu và có đủ cả 3 đáp án. Sau mỗi
  câu giải thích bằng tiếng Việt, chỉ rõ đoạn nào nói gì (hoặc bài không nói gì). Ba ô nhắc nghĩa của
  TRUE / FALSE / NOT GIVEN đặt ngay trên nút bắt đầu.
- Hứng thú: chọn bài theo chủ đề (mỗi bài một biểu tượng), đánh dấu ✓ và điểm cao nhất, ưu tiên bài
  chưa đọc; đúng hết thì pháo giấy; mỗi câu đúng +3 XP.
- Lộ trình: cấp 6 thêm bước "Đọc IELTS" (4 lượt).

- **Bước 2: Nói.**
  - Part 1: 6 chủ đề quen thuộc, mỗi chủ đề 4 câu hỏi. Giám khảo đọc từng câu (giọng thu sẵn khi đã có,
    không thì giọng trình duyệt), người học ghi âm rồi nghe lại; nhắc cách trả lời 2–3 câu: trả lời
    thẳng, lý do, ví dụ.
  - Part 2 & 3: 6 thẻ "Describe…", mỗi thẻ 4 ý "You should say". 1 phút chuẩn bị đếm ngược, có ô ghi
    chú và gợi ý bố cục, cụm từ mở – nối – kết; hết giờ tự sang 2 phút nói, tự ghi âm và tự dừng ở 2
    phút. Sau đó 3 câu Part 3 hỏi ý kiến chung.
  - Không chấm điểm: mục tiêu là nói thành tiếng và tự nghe lại. Xong một phần được +10 XP, ghi
    `ielts-speaking` cho lộ trình (cấp 6 thêm bước "Nói IELTS", 4 lượt).
  - Câu hỏi Part 1 và Part 3 được đưa vào `scripts/audio-texts/screens.json` để workflow thu giọng.

- **Bước 3: Viết.**
  - Khung 4 dạng bài Task 2 (nêu quan điểm, thảo luận hai phía, vấn đề – giải pháp, lợi ích – bất lợi):
    cách nhận ra dạng bài từ câu hỏi, bố cục 4 đoạn bằng tiếng Việt, câu mở đầu mẫu.
  - 10 câu luyện ngẫu nhiên từ 14 câu: từ nối (however, moreover, as a result…), từ tả xu hướng cho
    Task 1 (rose / raised, slight, peaked…), văn phong học thuật (không gotta, lots of, kids).
  - Viết thử Task 2: 6 đề, thanh đếm từ tới 250, danh sách tự đánh dấu (đủ 250 từ, 4 đoạn, ít nhất 4 từ
    nối khác nhau, không viết tắt hay văn nói), chỉ ra từ cần thay. Bản nháp lưu trên máy
    (`vocab.ielts.draft.<id>`). Nộp khi đủ 250 từ: +15 XP, ghi `ielts-writing` (cấp 6 thêm bước "Viết
    IELTS", 2 bài). Không chấm band: danh sách chỉ kiểm hình thức, không thay được giám khảo.

## 4. Dev

- `public/data/ielts/en.json`, kiểm tra khi tải bằng `validateIeltsBank` (`lib/ielts.ts`, dùng
  `bankLoader` chung với TOEIC, HSK). Service worker tải sẵn file khi cài.
- `store/ieltsStore.ts` (`vocab.ielts.v1`): điểm cao nhất từng bài. Mỗi lượt xong ghi
  `ielts-reading` vào `activityStore` cho lộ trình.
- Trang `/ielts` (`features/ielts/Ielts.tsx`), lượt đọc `TfngRound.tsx`, lượt nói `SpeakingRound.tsx` với
  `AnswerRecorder.tsx` (ghi âm qua `lib/recorder.ts`); mục trong trang Luyện tập.

## 5. Tiếp theo

1. Nghe: điền thông tin vào phiếu (form completion) với giọng thu sẵn.
2. Thêm dạng đọc: nối tiêu đề (matching headings), điền vào tóm tắt.
