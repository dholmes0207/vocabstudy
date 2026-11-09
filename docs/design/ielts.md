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

- **Bước 4: Nghe điền phiếu** (Part 1). 4 cuộc gọi (đăng ký phòng tập, đặt khách sạn, làm thẻ thư viện,
  thuê xe đạp), hai giọng nam – nữ. Đọc trước phiếu, bấm nghe (được nghe lại, khác phòng thi), điền dần,
  rồi kiểm tra: ô sai hiện đáp án, có lời thoại và mẹo làm bài. Chấm không phân biệt hoa thường, dấu câu;
  số điện thoại bỏ qua khoảng trắng; số có thể viết bằng chữ khi dữ liệu cho phép. Ghi `ielts-listening`
  (cấp 6 thêm bước "Nghe IELTS", 3 lượt). Lời thoại có trong `screens.json` để thu giọng.
- Cấp 6 giờ có đủ 4 kỹ năng nên bỏ nhãn "Đang mở rộng".

- **Bước 10: Câu trả lời mẫu cho Nói Part 1.** Mỗi câu hỏi Part 1 có một câu trả lời mẫu 2–3 câu
  (mức band 7) theo đúng bố cục trả lời thẳng – lý do – ví dụ, và một cụm đáng học (`samples[].key`,
  phải nằm trong câu mẫu) được tô màu. Mẫu gập sẵn để người học tự trả lời trước; mở ra thì nghe được để
  nói theo (shadowing). Câu mẫu vào `screens.json` để thu giọng. Kiểm dữ liệu: đủ một mẫu cho mỗi câu hỏi.

- **Bước 16: Đọc, Yes / No / Not Given.** Người Việt hay nhầm dạng này với True / False / Not Given: TFNG
  hỏi sự thật trong bài, YNNG hỏi ý kiến của tác giả. 4 bài nghị luận ngắn mới (bài tập về nhà cho trẻ nhỏ,
  bảo tàng miễn phí, làn xe đạp, học ngoại ngữ sớm), tác giả xưng "I" và nêu quan điểm (I believe, in my
  view, strikes me as…), mỗi bài 5 câu có đủ YES, NO, NOT GIVEN. Câu NOT GIVEN là điều bài có nhắc chủ đề
  nhưng tác giả không bày tỏ ý kiến (giá xe đạp điện, bảo tàng đông đúc). Mục riêng trên trang `/ielts` giải
  thích khác biệt, rồi chạy bằng `TfngRound` (thêm `scale="ynng"`: nhãn, câu hỏi, mẹo riêng). Điểm cao nhất
  lưu riêng (`ieltsStore.opinion`). Dữ liệu `opinion[]` trong `en.json`; `validateIeltsBank` chỉ nhận
  Y/N/NG, id không trùng bài đọc khác; test kiểm có đủ ba đáp án và bài viết ở ngôi thứ nhất.

- **Bước 15: Đọc, điền câu (Sentence completion).** Mỗi bài đọc (8 bài) có 4–5 câu, mỗi câu một chỗ trống
  (`___`), điền KHÔNG QUÁ HAI TỪ lấy nguyên từ bài. Khác Summary completion: gõ tay, không có hộp từ, nên
  phải chép đúng chính tả của bài. Câu hỏi đi theo thứ tự bài đọc như đề thật; câu hỏi diễn đạt lại phần
  quanh chỗ trống ("greatest" thay "strongest"), còn từ cần điền giữ nguyên. Gõ quá hai từ thì ô viền vàng
  và nhắc ngay; khi chấm, đáp án quá hai từ tính sai dù đúng ý. Chấp nhận vài cách viết khác (`accept`:
  "17th", "practise"). Chấm cả lượt: đáp án và đoạn nào nói điều đó cho từng câu, mẹo dò từ khoá. +3 XP mỗi
  câu đúng, ghi `ielts-reading`, điểm cao nhất trong `ieltsStore.completion` (hiện ✍️ trên danh sách bài).
  Dữ liệu `reading[].completion`; `validateIeltsBank` kiểm mỗi câu có đúng một chỗ trống, đáp án tối đa hai
  từ và có trong bài; test kiểm thêm các câu theo thứ tự bài, đáp án không trùng nhau.

- **Bước 14: Đọc, tìm thông tin (Matching information).** Mỗi bài đọc (8 bài) có 3–5 câu diễn đạt lại một ý
  ("a reason why…", "a comparison of…"); người học chọn đoạn A–E chứa ý đó. Như đề thật, một chữ có thể dùng
  nhiều lần (ở đây mỗi đoạn là đáp án tối đa một lần, nên không đoán mò bằng cách loại trừ được). Chấm cả lượt,
  điểm cao nhất mỗi bài lưu trong `ieltsStore.matching` và hiện 🔎 trên danh sách bài. Dữ liệu
  `reading[].matching`.

- **Bước 13: Nghe Part 4 (bài giảng, điền ghi chú).** Thêm 2 bài giảng một người nói (lịch sử cà phê, giấc ngủ
  và trí nhớ), mỗi bài 7 câu và một bảng ghi chú 6 chỗ trống, mỗi chỗ đúng một từ (hoặc một số) như đề thật. Dữ
  liệu nằm chung `listening` với `part: 4` (thiếu `part` là Part 1), dùng lại vòng điền phiếu của Part 1, tiêu đề
  đổi thành "Part 4 · Điền ghi chú". Kiểm dữ liệu: Part 4 chỉ nhận đáp án một từ.

- **Bước 12: Bài mẫu Task 2.** Mỗi đề Viết Task 2 (6 đề) có một bài mẫu band 7, 4 đoạn (mở, 2 thân, kết),
  260–280 từ, đi đúng bố cục của dạng đề. Bài mẫu tự qua được checklist của trang (đủ 250 từ, 4 đoạn, ít nhất
  4 từ nối, không viết tắt hay văn nói); test kiểm điều đó. Bài mẫu mở ra sau khi nộp bài, hoặc bấm "Xem bài
  mẫu" nếu muốn xem trước; từ nối trong `LINKERS` được tô vàng, mỗi đoạn có nhãn. Dữ liệu
  `writing.prompts[].model`.

- **Bước 11: Câu trả lời mẫu cho Part 3.** Mỗi câu thảo luận Part 3 (6 thẻ × 3 câu) có câu trả lời mẫu dài
  hơn Part 1: nêu quan điểm, giải thích, ví dụ, có khi nói cả phía bên kia; cụm tô là cách nêu ý kiến hay
  nối ý (`In my opinion`, `To some extent`, `Having said that`…). Dữ liệu `part2[].part3Samples`, cùng
  cách hiển thị và kiểm dữ liệu như Part 1.

- **Bước 9: Bài đọc dài.** Thêm 2 bài 5 đoạn (ong mật trong thành phố, tuần làm việc bốn ngày), gần độ dài
  đề thật hơn; mỗi bài đủ 3 dạng: 6 câu True/False/Not Given (có bẫy suy luận), 7 tiêu đề cho 5 đoạn, đoạn
  tóm tắt 4 chỗ trống. Danh sách bài gắn nhãn "Bài dài · 5 đoạn".

- **Bước 8: Viết Task 1 (tả biểu đồ).** 3 biểu đồ (2 đường, 1 cột) vẽ bằng SVG từ dữ liệu, số liệu minh
  hoạ (có ghi rõ). Bước 1 chọn câu tổng quan trong 3 câu: câu đúng nói xu hướng chính và không có số; hai
  câu kia là một chi tiết số liệu hoặc nói sai biểu đồ, mỗi câu có lý do. Bước 2 hoàn thành đoạn chi tiết
  bằng hộp từ tả số liệu (dramatic, steadily, peak, overtaking, more than doubled…), dùng chung ô điền với
  Summary completion (`GapFill.tsx`, `useGapFill.ts`). +2 XP mỗi câu đúng, ghi `ielts-writing`. Số liệu có
  bảng ẩn cho trình đọc màn hình. `validateIeltsBank` kiểm tra mỗi dãy số đủ nhãn, có lý do cho từng câu
  tổng quan, đoạn điền đúng khuôn.

- **Bước 7: Đọc, điền tóm tắt (Summary completion).** Mỗi bài đọc thêm một đoạn tóm tắt viết lại
  bằng từ khác, 4 chỗ trống, hộp 6 từ (2 từ bẫy: trái nghĩa, hoặc có trong bài nhưng sai ý). Chạm từ để
  điền vào ô đang mở (ô trống đầu tiên, hoặc ô vừa chạm), chạm ô đã điền để lấy từ ra. Kiểm tra khi đủ ô:
  đáp án và đoạn nào nói điều đó cho từng ô, mẹo đoán loại từ trước. +3 XP mỗi ô đúng, ghi
  `ielts-reading`, điểm cao nhất riêng (`ieltsStore.summary`, hiện 📝 trên danh sách bài). Chỗ trống viết
  `{0}`, `{1}`… trong `summary.text`; `validateIeltsBank` kiểm tra đủ và đúng thứ tự.

- **Bước 6: Nghe trắc nghiệm** (Part 2 và 3). 2 bài một người nói (giới thiệu bảo tàng, thư viện mới)
  và 2 bài hai sinh viên bàn bạc (chọn đề tài thuyết trình, bàn kết quả khảo sát), mỗi bài 4 câu A/B/C.
  Bài nghe cố ý nhắc cả đáp án bẫy (số cũ, ý bị bác, điều đã đoán) như đề thật; test kiểm tra ít nhất
  nửa số câu có bẫy được nói ra. Đọc trước câu hỏi, nghe (nghe lại thoải mái), chọn đủ rồi kiểm tra:
  lý do từng câu chỉ rõ chữ nào cho đáp án và bẫy nằm ở đâu, lời thoại (Part 3 ghi ai nói), mẹo. +2 XP
  mỗi câu đúng, ghi `ielts-listening`. Phần phát lời thoại dùng chung với Part 1 (`hooks/useLinesPlayer.ts`,
  `PlayLinesButton.tsx`); lời thoại có trong `screens.json` để thu giọng nam/nữ.

- **Bước 5: Đọc, nối tiêu đề (Matching headings).** Dùng lại 6 bài đọc: mỗi bài 5 tiêu đề (i–v) cho 3
  đoạn (A–C), 2 tiêu đề thừa làm bẫy (lặp một chữ trong đoạn nhưng chỉ nói một chi tiết, hoặc nói điều
  bài không có). Mỗi đoạn có hàng nút i–v như phiếu trả lời; một tiêu đề chỉ gắn được một đoạn, chọn lại
  ở đoạn khác thì đoạn cũ được trả về trống. Kiểm tra khi đủ 3 đoạn: viền xanh/đỏ, đáp án và lý do bằng
  tiếng Việt cho từng đoạn, mẹo đọc câu đầu – câu cuối. +3 XP mỗi đoạn đúng, ghi `ielts-reading` (tính
  vào bước "Đọc IELTS" của cấp 6), điểm cao nhất riêng (`ieltsStore.headings`, hiện 🧩 trên danh sách bài).

## 4. Dev

- `public/data/ielts/en.json`, kiểm tra khi tải bằng `validateIeltsBank` (`lib/ielts.ts`, dùng
  `bankLoader` chung với TOEIC, HSK). Service worker tải sẵn file khi cài.
- `store/ieltsStore.ts` (`vocab.ielts.v1`): điểm cao nhất từng bài (True/False/Not Given và nối tiêu
  đề, `HeadingsRound.tsx`). Mỗi lượt xong ghi
  `ielts-reading` vào `activityStore` cho lộ trình.
- Trang `/ielts` (`features/ielts/Ielts.tsx`), lượt đọc `TfngRound.tsx`, lượt nói `SpeakingRound.tsx` với
  `AnswerRecorder.tsx` (ghi âm qua `lib/recorder.ts`); mục trong trang Luyện tập.

## 5. Tiếp theo

1. Thêm dạng đọc: trắc nghiệm nhiều lựa chọn (chọn 2 trong 5).
2. Nghe: dạng nối thông tin (matching) ở Part 2–3.
