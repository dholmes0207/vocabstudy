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
