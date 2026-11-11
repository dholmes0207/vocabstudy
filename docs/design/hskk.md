# Luyện nói HSKK sơ cấp (08/11/2026)

**User**: "đi sâu vào tính năng học tập, hướng đến không chỉ từ vựng mà còn luyện thi chứng chỉ… ưu tiên
tiếng Anh xong tiếng Trung".

## 1. Người học

- HSKK là kỳ thi nói đi kèm HSK; nhiều trường, học bổng yêu cầu cả HSK lẫn HSKK. Bậc sơ cấp (初级) ứng với
  khoảng HSK 1–2, thi bằng cách ghi âm trong khoảng 17 phút.
- Gói tiếng Trung đã có luyện HSK (đọc, nghe, viết) và nhập vai, nhưng chưa có chỗ luyện đúng dạng đề nói.

## 2. Đề thi (HSKK 初级)

1. **听后重复** (nghe rồi nhắc lại): 15 câu ngắn, mỗi câu nghe một lần rồi nói lại.
2. **听后回答** (nghe rồi trả lời): 10 câu hỏi ngắn, trả lời bằng một câu.
3. **回答问题** (trả lời câu hỏi): 2 câu hỏi có in sẵn, mỗi câu nói khoảng 1 phút 30 giây.

## 3. Cách làm

- Trang `/hskk` (chỉ gói tiếng Trung) có ba thẻ, mỗi thẻ một phần. Một lượt: Phần 1 và 2 lấy 5 câu ngẫu nhiên,
  Phần 3 một chủ đề.
- Phần 1 và 2 là nghe chứ không đọc: câu được đọc ngay khi hiện (giọng thu sẵn khi có, không thì giọng trình
  duyệt), chữ ẩn tới khi bấm "Hiện chữ"; luôn có nút nghe lại. Phần 3 hiện câu hỏi và cho ghi âm tối đa 90 giây.
- Mỗi câu có ô ghi âm và nghe lại (dùng lại `AnswerRecorder` của trang IELTS). Phần 2 và 3 có "Câu trả lời mẫu"
  gập sẵn, có pinyin, nghĩa và nút nghe để nói theo; mẫu Phần 3 dài ít nhất 5 câu.
- Không chấm điểm: mục tiêu là nói thành tiếng. Xong một phần +10 XP, ghi `hskk`. Lộ trình tiếng Trung cấp 3
  (HSK 2) thêm bước "Luyện nói HSKK sơ cấp" (3 lượt).

## 4. Dev

- Dữ liệu và logic trong `lib/hskk.ts` (12 câu Phần 1, 10 câu Phần 2, 3 chủ đề Phần 3). Test kiểm đủ chữ,
  pinyin, nghĩa, có mẫu ở Phần 2–3, mẫu Phần 3 đủ 5 câu, không trùng câu, lượt không lặp.
- Câu và câu mẫu có trong `scripts/audio-texts/screens.json` để thu giọng.

## 5. HSKK trung cấp (09/11/2026)

- Trang `/hskk` có hai thẻ: Sơ cấp 初级 (HSK 1–2) và Trung cấp 中级 (HSK 3–4). Đề trung cấp: nghe nhắc lại câu
  dài (10 câu), nhìn tranh nói 2 phút (2 tranh), trả lời câu hỏi 2 phút (2 câu).
- Ở đây: 10 câu nhắc lại có 如果…就, 虽然…但是, câu 把…; 3 tranh là cảnh emoji kèm dòng tả (chưa có ảnh thật),
  câu hỏi hiện và được đọc lên; 3 câu hỏi Phần 3. Phần 2–3 ghi âm tối đa 120 giây, có bài nói mẫu từ 5 câu trở
  lên kèm pinyin, nghĩa và nút nghe.
- Dữ liệu chia theo cấp trong `HSKK_LEVELS` (`lib/hskk.ts`): câu của từng phần, số câu một lượt, giới hạn giây.
  Lộ trình tiếng Trung cấp 4 (HSK 3) thêm bước "Luyện nói HSKK trung cấp" (5 lượt, cộng dồn với bước ở cấp 3).

## 6. Tiếp theo

1. Thay cảnh emoji bằng ảnh thật khi có nguồn ảnh được phép dùng.
