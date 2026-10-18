# Nghe – chép (`/dictation`)

Kỹ năng thứ ba vượt ra ngoài từ vựng, sau Mẫu câu và Ngữ pháp.

**User**: "Đọc thì hiểu mà nghe người ta nói thì không bắt được chữ nào. Viết cũng hay sai
chính tả."

**BA**

- Mỗi lượt có 6 câu ví dụ, lấy từ **những từ đã học**. Nếu người học chưa học từ nào, app
  lấy câu ở các từ đầu gói. Mỗi câu dài 4–12 từ.
- Câu tự phát khi hiện ra. Người học có thể:
  - nghe lại bao nhiêu lần cũng được;
  - bấm "Chậm" để nghe ở tốc độ 0,7;
  - bấm "Gợi ý" để xem nghĩa tiếng Việt.
- Người học gõ lại câu vừa nghe rồi bấm **Kiểm tra**. App so từng từ:
  - **xanh** là nghe đúng;
  - **vàng gạch chân** là bị sót;
  - **đỏ gạch ngang** là thừa.
  - Sau đó app hiện câu gốc kèm nghĩa.
- Không tính chữ hoa, dấu câu và dấu nháy, nên gõ "dont" vẫn khớp với "don't".
- Đạt 80% thì câu được tính là nghe được. Từ gõ thừa bị trừ một nửa điểm, để không ai
  "gõ bừa cho trúng".
- Cộng XP, không đụng tới lịch ôn.
- Dùng được với mọi gói ngôn ngữ, kể cả tiếng Hàn: gói không có audio ghi sẵn thì dùng
  giọng của trình duyệt.

**Dev**

- `lib/dictation.ts` (thuần, có test):
  - `normalizeWords` chuẩn hoá từ (dùng `\p{L}` nên chạy được với chữ Hàn);
  - `diffWords` so bằng LCS (dãy con chung dài nhất) và giữ cách viết gốc để hiển thị;
  - `dictationScore`, `pickDictationRound`, `dictationXp`.
- Màn hình: `features/dictation/Dictation.tsx` (`useImmersive`).
  - Audio dùng `exampleAudio(id, text)`, tức đúng file câu ví dụ đã có. Không thêm file
    mới, nên không chạm giới hạn 20.000 file.
- Vào từ trang Luyện tập.

## Chép theo truyện và theo bài ngữ pháp (18/10/2026)

**User**: "Chép câu rời rạc mau chán. Muốn chép cả một câu chuyện, hoặc chép lại đúng câu của
bài ngữ pháp vừa học."

Tham khảo, quét trang công khai bằng REA (`docs/research/2026-10-17-language-apps.md`, vòng
6):

- **Daily Dictation**: chép cả một truyện, từng câu (1/21), có chỉnh tốc độ, nút Check/Skip
  và ghi cấp độ từ vựng.
- **How to Study Korean**: mỗi bài kết thúc bằng phần luyện câu và luyện nghe – chép dùng
  chính câu của bài.

**BA**

- Trang đọc truyện có nút **"Nghe – chép"**: chép lần lượt mọi câu của truyện, đầu màn hiện
  tên truyện. Truyện có pinyin thì gợi ý pinyin vẫn dùng được.
- Bài ngữ pháp có nút **"Nghe – chép ví dụ (N câu)"** dưới nút Luyện tập: chép các câu ví dụ
  của bài.
- Cách chấm, nghe chậm, gợi ý nghĩa và XP giống hệt Nghe – chép thường. Không có nút "Thêm
  một lượt", vì đã chép xong cả bài.
- Câu truyện và câu ngữ pháp đọc bằng giọng của trình duyệt. Không thêm file audio, nên không
  chạm giới hạn 20.000 file.

**Dev**

- `Dictation.tsx` xuất `DictationRound({ items, caption, onExit, onAgain? })`, với `items` là
  `{ key, text, vi, read?, audioSrc? }[]`. Trang Nghe – chép cũ chuyển từ danh sách từ sang
  `items` qua `fromWords`.
- `Reading.tsx` và `Grammar.tsx` dựng `items` từ câu truyện hoặc câu ví dụ.

Chưa có bàn phím Hàn hoặc bàn phím bính âm thì làm bằng thẻ chữ, xem `typing-help.md`.
