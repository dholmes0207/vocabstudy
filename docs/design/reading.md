# Đọc truyện ngắn

**User**: "Không chỉ dừng ở từ vựng, mà còn phát triển lên nhiều ngữ vực khác nữa." Người học
đã thuộc vài trăm từ nhưng chưa từng đọc một đoạn văn tiếng Anh liền mạch. Họ cần thấy những
từ đã học xuất hiện trong ngữ cảnh thật.

**BA**

- Trang **"Đọc truyện ngắn"** (`/reading`) là danh sách truyện ngắn có phân cấp độ A1–B1,
  mỗi truyện 7–8 câu. Thẻ truyện hiện cấp độ, số câu và điểm cao nhất nếu đã đọc.
- Trong một truyện (`/reading/:id`):
  - **Chạm vào từ có gạch chân** để xem nghĩa tiếng Việt, cách đọc gần giống và nghe phát
    âm. Chỉ những từ có trong gói từ vựng mới chạm được, nên nghĩa luôn khớp với thẻ học.
  - **"Bản dịch"** bật hoặc tắt câu tiếng Việt dưới từng câu.
  - **"Nghe cả bài"** đọc lần lượt từng câu. Câu đang đọc được tô nền và tự cuộn vào khung
    nhìn; nút đổi thành "Dừng" trong lúc đọc. Mỗi câu cũng có nút nghe riêng. Bấm loa trong
    hộp nghĩa của một từ thì dừng phần đọc cả bài.
  - Cuối truyện có 3 câu hỏi trắc nghiệm **bằng tiếng Việt**, để kiểm tra người học hiểu
    nội dung chứ không phải đoán chữ. Thứ tự đáp án được xáo mỗi lần.
- Đọc xong được XP: `5 + 3 × câu đúng`, cộng thêm 5 nếu đúng hết. Phần đọc không thay đổi
  lịch ôn SRS.
- Tiến độ đọc (điểm cao nhất, số lần đọc) chỉ lưu trên máy, giống Mẫu câu và Ngữ pháp.
  Trang Quyền riêng tư và Điều khoản đã ghi rõ điều này.
- Trang hiện với gói nào có file truyện (`lib/packContent.ts`). Tiếng Trung có 3 truyện (xem
  `chinese.md`). Tiếng Anh có 14 truyện,
  tiếng Hàn có 8 truyện (`public/data/reading/ko.json`, sinh từ
  `scripts/build_reading_ko.py`):
  - 6 truyện A1: một ngày của Min-su, đi chợ, ngày mưa, người bạn mới, ở quán cà phê, đi bệnh
    viện;
  - 2 truyện A2 (17/10/2026), dùng ngữ pháp A2: "Cuối tuần trước" (quá khứ) và "Kế hoạch đi Hàn
    Quốc" (-고 싶어요, -(으)ㄹ 거예요).
  - Từ không đổi dạng như 정말, 그리고, 그래서, 저는 được gắn nghĩa tự động ở mọi câu (`COMMON`
    trong script), không cần ghi từng câu.

**Dev**

- **Dữ liệu:** `public/data/reading/en.json`, có dạng

  ```text
  stories[]: id, emoji, level, title [vi, en],
             sentences[] { en, vi }, questions[] { q, options, answer }
  ```

  - Truyện được viết tay, chỉ dùng từ thông dụng. Mỗi câu không quá 14 từ.
  - Test `src/lib/reading.test.ts` kiểm tra mọi truyện đều hợp lệ, mỗi câu ngắn, và hơn
    75% số từ tra được trong gói.

- **Tra nghĩa:** `buildGlossary` lập bảng từ dạng xuất hiện sang từ gốc.
  - Lượt 1 lấy **từ gốc** (headword) trước: "evening" là "buổi tối", không phải "even" + -ing.
    Từ có mục riêng trong gói như "went" ("đã đi (quá khứ của go)") giữ nghĩa của mục đó.
  - Lượt 2 mới đến các dạng biến đổi từ `surfaceForms`, ví dụ "drinks" → "drink",
    "bought" → "buy".
  - Bỏ qua các cụm nhiều chữ.
  - `bareWord` bỏ dấu câu và đuôi `'s`.
- **Soát nghĩa khi viết truyện mới:** máy chỉ khớp được mặt chữ, không hiểu nghĩa trong câu.
  Vì vậy mỗi truyện mới phải in ra danh sách "từ → mục trong gói: nghĩa" và đọc lại từng dòng.
  Câu nào bị ghép sai nghĩa thì sửa câu, không sửa gói. Một số lỗi đã gặp:
  - "draw" (hoà) bị ghép thành "vẽ" → viết lại thành "the score was one to one";
  - "lasts" (kéo dài) bị ghép thành "last" (cuối cùng) → đổi câu;
  - tên "Hung" trùng quá khứ của "hang" → đổi tên nhân vật thành "Huy";
  - "crowded" bị ghép thành danh từ "crowd" → "full of people".
  - Truyện dùng chính tả Mỹ (favorite, neighbor, Mom) cho khớp gói từ và giọng đọc Mỹ.
- **Tiếng Hàn:** không đoán được từ gốc từ mặt chữ. Tiểu từ dính liền danh từ (시장에서 →
  시장), còn động từ chia và rút gọn (마시다 → 마셔요, 보다 → 봐요). Vì vậy mỗi câu có thêm
  trường `gloss: { token: id }`, viết tay, và được ưu tiên hơn bảng tra (`glossInLine`).
  - Khi viết, ghi `token → từ gốc` (ví dụ `"마셔요": "마시다"`). Một script đổi từ gốc sang
    id trong gói, nên không phải gõ id bằng tay.
  - `validateReadingPack` báo lỗi nếu khoá của `gloss` không có trong câu.
  - Test kiểm tra: mọi id có trong gói `ko.json`; mỗi câu có ít nhất một từ chạm được; hơn
    60% số từ chạm được.
  - Những từ chưa có trong gói (그리고, 정말, 열심히…) để không chạm được, không thêm nghĩa
    ngoài gói.
- **Âm thanh:** câu và cả bài dùng giọng đọc của trình duyệt (`pronounce` với `ttsLang`),
  còn từ đơn dùng file mp3 sẵn có (`wordAudio`).
  - Chưa thêm file audio cho câu truyện, vì `public/` đã gần chạm giới hạn 20.000 file của
    Cloudflare Pages. Cần chuyển audio sang R2 trước.
- **Đọc theo câu:** `playLine(i, all)` gọi `pronounce` cho từng câu và đọc câu kế tiếp trong
  `onEnd`. Mỗi lần bắt đầu đọc hoặc bấm Dừng thì tăng biến đếm `run`. Câu bị huỷ vẫn gọi
  `onEnd` (Web Speech báo lỗi "interrupted"), nhưng callback cũ có `run` khác nên không làm
  gì. Test `Reading.test.tsx` giả lập giọng đọc để kiểm tra điều này.
- **Lưu trữ:** `store/readingStore.ts` (`vocab.reading.v1`) lưu `{ best, reads }` theo id
  truyện.
- **Lỗi đã gặp:**
  - Hộp nghĩa `position: fixed` nằm trong khung trang có `animate-fade-in`. Hiệu ứng giữ
    lại `transform` (fill-mode `both`), nên hộp bị neo theo trang thay vì theo màn hình.
  - Cách sửa:
    - đổi fill-mode của `fade-in` sang `backwards` cho toàn bộ app;
    - render hộp nghĩa qua `createPortal` vào `document.body`.

## Bước tiếp theo

- Thêm truyện cấp A2–B1 và truyện theo chủ đề, nối với trang `/topics`.
- Thêm audio thu sẵn cho từng câu, sau khi đã chuyển audio sang R2.
- Truyện cho gói tiếng Hàn: cần tra nghĩa theo cách tách từ riêng, vì tiếng Hàn có tiểu từ
  dính liền danh từ.
