# Học theo chủ đề và ngữ vực

**User**: "Không chỉ học từ vựng chung chung, mà phát triển lên nhiều ngữ vực khác nữa: tiếng
Anh công sở, du lịch, sức khoẻ, công nghệ…; sau này cả những ngôn ngữ khác."

**BA**

- Thêm trang **"Chủ đề"** (`/topics`) gồm các bộ từ theo tình huống:
  - Công sở, Du lịch, Mua sắm và trang phục, Sức khoẻ, Ăn uống, Nhà cửa, Thiên nhiên và
    con vật, Thể thao và sở thích, Cảm xúc và tính cách, Học đường và công nghệ, Thời gian
    và nơi chốn, Nghề nghiệp.
  - Mỗi bộ có thẻ tiến độ giống "Các bộ từ" ở trang Học, với nút "Học bộ này" và "Ôn bộ
    này".
- Mỗi bộ dùng **đúng những từ đã có trong gói 4.440 từ**, kèm âm thanh, phiên âm, ví dụ.
  Không thêm từ mới cho đến khi bộ từ được kiểm duyệt.
- Giai đoạn sau là **ngữ vực chuyên sâu**, tức các bộ từ mới cho tiếng Anh công sở,
  CNTT, du lịch – khách sạn, y tế, IELTS học thuật. Từ mới được thêm bằng quy trình hiện
  có: `add_words.py` → `generate_phonetics.py` → `generate_audio.py`, kèm các bước soát
  lỗi IPA đã ghi trong memory.
- Một từ có thể thuộc nhiều chủ đề.
- Tiến độ dùng chung với SRS hiện có: học một từ ở chủ đề nào cũng tính là đã học từ đó.

**Dev**

- **Dữ liệu:** `public/data/topics/en.json`, có dạng
  `[{ id, emoji, title: [vi, en], wordIds: number[] }]`.
  - Một test kiểm tra mọi id có trong gói và mỗi bộ có ít nhất 15 từ.
- **Lấy dữ liệu từ đâu:** các đợt thêm từ theo chủ đề từ 08/10 đến 09/10/2026 có commit
  riêng. Ví dụ:
  - `374d670b` thêm 20 từ công sở;
  - `d790da2b` thêm 30 từ sức khoẻ;
  - `bc7f423c` thêm 32 từ đường phố, du lịch, mua sắm;
  - `a0984fc9` thêm 37 từ ăn uống, công nghệ, học đường;
  - `89d059d5` thêm 41 từ đồ dùng trong nhà.
  - Lệnh `git show <hash> -- public/data/en.json` cho ra id của các từ được thêm trong
    commit đó. Viết script `scripts/build_topics.py` gom chúng thành bộ đầu tiên.
- **Bổ sung từ trong 1.000 từ lõi:** nhóm theo `emoji` và từ khoá trong `meaning`, rồi
  **soát tay** (ví dụ "bank" không nằm ở chủ đề Thiên nhiên).
- **Giao diện:** dùng lại `features/learn` (LearnSession) với danh sách từ của bộ được
  truyền vào, giống `?deck=`. `/review?topic=` lọc các thẻ đến hạn theo bộ.
- **Nhiều ngôn ngữ:** hạ tầng đã có sẵn (`public/data/index.json` → `languages[]`,
  `LanguageSwitcher`, tiến độ tách theo `lang_code`). Trước khi làm nội dung, cần soát lại
  mọi chỗ đang giả định tiếng Anh:
  - trò Xếp câu tách từ theo khoảng trắng;
  - `wordForms`;
  - `viRead`;
  - ngôn ngữ nhận dạng giọng nói;
  - tên giọng edge-tts;
  - font.
  - Tiếng Hàn dễ làm trước nhất vì có khoảng trắng giữa các từ; tiếng Nhật và tiếng Trung
    cần tách từ và thêm trường romaji/pinyin.
  - Gói đầu tiên khoảng 100 từ, nghĩa tiếng Việt chính xác, gắn nhãn "beta" trong bộ chọn
    ngôn ngữ.

## Trạng thái (15/10/2026)

- Đã có trang `/topics` với 19 bộ, mỗi bộ 20–47 từ.
  - Các bộ: Công sở, Nghề nghiệp, Nơi chốn, Đường phố & đi lại, Quần áo, Ăn uống, Cơ thể,
    Sức khoẻ, Gia đình, Nhà cửa, Trường học, Công nghệ & mạng xã hội, Thiên nhiên & thời
    tiết, Con vật, Thời gian, Sở thích & thể thao, Cảm xúc, Màu sắc & hình khối, Tuổi thơ &
    truyện kể.
  - Mỗi lần học lấy tối đa 10 từ chưa thành thạo của bộ.
- `scripts/build_topics.py` sinh ra `public/data/topics/en.json` từ danh sách từ đọc được.
  - Script dừng và báo lỗi nếu có từ không nằm trong gói.
  - Mỗi từ đã được đối chiếu với nghĩa ghi trong gói. Ví dụ "mouse" trong gói là con chuột
    nên không xếp vào Công nghệ; "post" là động từ nên không xếp vào Nơi chốn.
- **Ôn theo bộ:** mỗi thẻ chủ đề có 2 nút, "Học" và "Ôn (n)", với n là số từ của bộ bạn đã
  gặp.
  - "Ôn" là bài quiz trắc nghiệm, tối đa 10 câu, lấy từ những từ đã có thẻ SRS. Câu trả lời
    được ghi qua `recordAnswer` giống trang Kiểm tra: trả lời sai thì từ quay lại lịch ôn,
    trả lời đúng khi chưa đến hạn thì không làm từ "thành thạo" nhanh hơn.
  - Không làm thành route `/review?topic=` như dự định ban đầu. Trang Ôn tập chỉ hỏi những từ
    đến hạn, nên khi lọc theo bộ thì thường không còn từ nào để hỏi.
- **Bước tiếp theo:**
  - ngữ vực chuyên sâu, tức các bộ từ **mới** cho tiếng Anh công sở, CNTT, du lịch –
    khách sạn, y tế, kèm audio. Việc này cần chuyển audio sang R2 trước;
  - truyện đọc theo chủ đề (xem `reading.md`).

## Tiếng Hàn (15/10/2026)

- `public/data/topics/ko.json` có 12 bộ, sinh từ `scripts/build_topics_ko.py` (danh sách từ
  gốc viết tay, cụm có dấu cách thì viết bằng "_").
  - Các bộ: chào hỏi, con người, ăn uống, nơi chốn, đi lại, thời gian & thời tiết, mua sắm &
    số đếm, cơ thể & sức khoẻ, màu sắc & miêu tả, hoạt động hằng ngày, sở thích & cảm xúc,
    câu hỏi & từ cơ bản.
  - Mỗi bộ 12–21 từ. Cả 182 từ của gói đều nằm trong ít nhất một bộ; script và test cùng
    kiểm tra điều này.
- `/topics` mở cho tiếng Hàn qua `lib/packContent.ts`. Lời giới thiệu và mô tả ở trang
  Luyện tập đổi thành ví dụ dùng chung cho cả hai ngôn ngữ (ăn uống, đi lại, sức khoẻ…).
