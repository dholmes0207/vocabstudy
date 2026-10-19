# Mẫu câu giao tiếp (`/phrases`)

Tính năng đầu tiên vượt ra ngoài phạm vi học từ vựng.

**User** (người mất gốc): "Học từ rồi mà gặp người nước ngoài vẫn không nói được câu nào.
Mình cần những câu dùng được ngay."

**BA**

- 10 tình huống × 10 câu: chào hỏi, khi chưa nghe rõ, lịch sự hằng ngày, gọi món, mua sắm,
  hỏi đường, sân bay & khách sạn, ở chỗ làm, hẹn gặp & điện thoại, cảm xúc & ý kiến.
- Mỗi câu gồm tiếng Anh tự nhiên, nghĩa tiếng Việt và mẹo dùng nếu cần (nghĩa và mẹo là
  nội dung học nên giữ tiếng Việt ở cả hai giao diện). Có giọng đọc bản xứ, 2 giọng như
  phần từ vựng.
- Trang tình huống: bấm vào câu nào cũng nghe được. Nút "Luyện tập" mở một lượt 8 câu,
  ưu tiên câu chưa thuộc, xen kẽ 3 dạng:
  1. nghe rồi chọn nghĩa;
  2. đọc nghĩa rồi chọn câu tiếng Anh;
  3. xếp các từ thành câu.
- Một câu được tính là "đã thuộc" sau 2 lần trả lời đúng. Mỗi tình huống có vòng tiến độ.
  Luyện xong được cộng XP và tính vào chuỗi ngày học (`addPlayXp`), không đụng lịch ôn
  từ vựng.
- Lối vào:
  - tab "Mẫu câu" trên thanh dưới điện thoại;
  - mục trên sidebar;
  - thẻ "Mới" ở trang chủ.
    "Tra cứu" rời thanh dưới để nhường chỗ, vẫn vào được từ sidebar, menu tài khoản và trang
    chủ.

**Dev**

- Dữ liệu ở `public/data/phrases/en.json`; mã nguồn lấy dữ liệu bằng fetch, không nhúng
  vào bundle.
- `src/lib/phrases.ts` là phần thuần, có test: kiểm tra dữ liệu, tiến độ, tạo lượt luyện,
  tính XP.
- Tiến độ lưu ở `src/store/phrasesStore.ts` (`vocab.phrases.v1`, chỉ trên máy, nằm trong
  bản sao lưu).
- Audio tạo bằng `python3 scripts/generate_phrase_audio.py`, ghi ra
  `public/audio/en/<voice>/p<id>.mp3`, có `?v=<textHash>`.
  - Câu nào đổi chữ sẽ được ghi âm lại.
  - Test sẽ lỗi nếu thiếu file audio hoặc file audio cũ.

## Mẫu câu tiếng Hàn

**User** (người học tiếng Hàn): "Học chữ Hangul và từ rồi, nhưng đến quán vẫn không biết
nói 'cho tôi món này' hay 'tính tiền'."

**BA**

- 8 tình huống, 66 câu: chào hỏi, khi chưa nghe rõ, lịch sự hằng ngày, gọi món, mua sắm,
  hỏi đường, đi lại & khách sạn, cảm xúc & ý kiến. Bỏ "ở chỗ làm" và "hẹn gặp & điện
  thoại" của bản tiếng Anh vì người mới sang Hàn cần câu đi đường, ăn uống trước.
- Câu viết ở thể lịch sự -요 (해요체); câu chào trang trọng giữ thể -ㅂ니다 như người Hàn
  vẫn nói (감사합니다, 처음 뵙겠습니다). Mẹo nói rõ khi nào dùng câu nào: 안녕히 가세요 hay
  안녕히 계세요, 감사합니다 hay 고마워요.
- Không có hai câu cùng nghĩa (ví dụ không để cả 감사합니다 lẫn 고마워요 thành câu riêng), vì
  câu hỏi chọn nghĩa sẽ có hai đáp án đúng. Câu gần nghĩa đi vào phần mẹo.
- Màn hình, cách luyện, tiến độ giống bản tiếng Anh. Câu hỏi "chọn câu đúng" ghi tên
  ngôn ngữ đang học.
- Lối vào: mục trên sidebar và thẻ trong trang Luyện tập. Thanh dưới điện thoại vẫn giữ
  tab Hangul, vì thêm tab thứ sáu thì chữ quá nhỏ. Thẻ ở Trang chủ vẫn là bảng chữ Hangul.

**Dev**

- Dữ liệu ở `public/data/phrases/ko.json`, cùng khuôn với `en.json` (trường `en` là câu ở
  ngôn ngữ đang học, như trong gói ngữ pháp).
- Tiến độ chỉ lưu theo id câu, nên mỗi gói có dải id riêng: tiếng Anh từ 1, tiếng Hàn từ
  2001 (`PHRASE_ID_BASE`, `phraseInPack` trong `src/lib/phrases.ts`). Test bắt lỗi nếu id
  ra ngoài dải. Thẻ ở Trang chủ chỉ đếm câu của gói đang học.
- Chưa có audio ghi sẵn cho tiếng Hàn: câu được đọc bằng giọng tiếng Hàn của trình duyệt
  (`meta.ttsLang` = `ko-KR`), như các phần khác của gói tiếng Hàn.
- Chưa có cách đọc kiểu Việt cho từng câu. Nếu thêm sau thì phải áp dụng biến âm như
  trên thẻ từ (xem `docs/design/hangul.md`).
