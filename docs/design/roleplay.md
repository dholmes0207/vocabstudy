# Nhập vai hội thoại (08/11/2026)

**User**: "Level học từ, xong học thì, cấu trúc câu, luyện nói, luyện nghe… tạo hứng thú, hấp dẫn khi học,
phong cách tránh nhàm chán".

## 1. Người học

- Trang Luyện nói chấm từng từ; ngữ pháp và truyện có "Nói thành tiếng" cho từng câu rời. Chưa có chỗ nào
  để nói trong một cuộc trò chuyện: nghe người kia hỏi rồi trả lời đúng lúc, như ngoài đời và như phần nói
  của IELTS, HSKK.

## 2. Cách làm

- Mỗi cảnh là một tình huống đời thường có hai vai. Tiếng Anh: gọi cà phê, hỏi đường, nhận phòng khách sạn,
  đi khám, phỏng vấn xin việc. Tiếng Trung: gọi món, mặc cả khi mua đồ, đi taxi, làm quen (kèm pinyin).
- Hiện như khung chat. Câu của người kia được đọc lên (giọng nữ hoặc nam, thu sẵn khi có, không thì giọng
  trình duyệt), nghe lại được. Đến lượt mình: thấy nghĩa tiếng Việt và câu cần nói, bấm nghe mẫu nếu muốn,
  bấm micro và nói. Chữ không nghe rõ bị gạch đỏ; nói lại hay đi tiếp tuỳ ý.
- **Chế độ thử thách**: ẩn câu của mình, chỉ hiện nghĩa tiếng Việt, phải tự nghĩ ra câu rồi nói.
- Hết cảnh: 1–3 sao theo điểm trung bình các câu (85% trở lên 3 sao, 60% trở lên 2 sao), +4 XP mỗi sao,
  pháo giấy khi được 3 sao, ghi `roleplay` cho lộ trình.
- Trình duyệt không nhận dạng được giọng nói thì vẫn nghe mẫu và đọc theo, bấm "Đã đọc to, tiếp".
- Thêm cảnh (dữ liệu 1.1.0): tiếng Anh có thêm đặt bàn qua điện thoại, mua vé tàu, đổi hàng; tiếng Trung có
  thêm hỏi đường, nhận phòng khách sạn. Câu của người học tránh đánh vần từng chữ cái, vì nhận dạng giọng
  nói khó chấm đúng.
- Cảnh công sở cho TOEIC (dữ liệu 1.2.0, nhãn `tag: "TOEIC"` hiện trên danh sách): dời lịch họp qua điện
  thoại, máy in hỏng, đón khách ở lễ tân. Cấp 5 (TOEIC) thêm bước "Nhập vai nơi công sở" (tổng 6 cảnh).
- Cảnh tiếng Trung mức HSK 2–3 (dữ liệu 1.2.0, nhãn HSK): đi khám bệnh, gọi điện đặt đồ ăn, thuê nhà. Cấp 4 lộ
  trình tiếng Trung (HSK 3) thêm bước "Nhập vai mức HSK 3" (tổng 4 cảnh).
- Lộ trình: cấp 4 tiếng Anh (Nghe & nói) và cấp 2 tiếng Trung (HSK 1) thêm bước "Nhập vai hội thoại".

## 3. Dev

- `public/data/roleplay/{en,zh}.json`, kiểm tra khi tải (`validateRoleplay`, `lib/roleplay.ts`), service
  worker tải sẵn. Test kiểm tra hai vai nói xen kẽ, mỗi vai một giọng, câu tiếng Trung có pinyin.
- Trang `/roleplay` (`features/roleplay/`), mục trong trang Luyện tập. Chấm bằng `listenOnce` và
  `scoreSentence` như "Nói thành tiếng". Mọi câu có trong `scripts/audio-texts/screens.json` để thu giọng.
