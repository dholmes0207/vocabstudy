# Tiếng Trung (beta)

**User**: "Tiếng Hàn xong thì tiếng Trung nữa."

**BA**

- Thêm gói **tiếng Trung phổ thông (chữ giản thể)**, gắn nhãn beta. Bản đầu có khoảng 100 từ
  thông dụng nhất cho người mới (trình độ HSK 1). Mỗi từ có:
  - pinyin có dấu thanh;
  - nghĩa tiếng Việt;
  - một câu ví dụ ngắn kèm bản dịch.
- Các phần lõi phải dùng được với gói này: Học, Ôn, Kiểm tra, Ghép cặp, Xếp câu, Nghe –
  chép, Luyện nói, Tra cứu.
- Cách đọc ghi là **pinyin** (ví dụ "pinyin: nǐ hǎo"), không ghi "đọc gần giống". Pinyin
  là cách ghi âm chuẩn mà người học tiếng Trung đều dùng.
- Các bước sau, mỗi bước một bản:
  1. trang "Pinyin & thanh điệu" (giống trang Hangul của tiếng Hàn);
  2. âm Hán Việt cho từng từ, lợi thế riêng của người Việt (学生 = "học sinh");
  3. bộ từ theo chủ đề, ngữ pháp, truyện ngắn.

**Dev**

- **Dữ liệu** (`public/data/zh.json`):
  - `word` là chữ giản thể;
  - `viRead` là pinyin có dấu thanh, các âm tiết của một từ viết liền ("xǐhuan");
  - `ipa` để trống;
  - `meta.ttsLang = 'zh-CN'`;
  - `meta.readingLabel = ['pinyin', 'pinyin']`. Thẻ học, Từ của ngày, Luyện nói và Đọc
    truyện đọc nhãn này qua `readingLabel()`; gói không có trường này giữ nhãn cũ.
- **Tách từ:** tiếng Trung không có dấu cách giữa các từ.
  - Đã thử `Intl.Segmenter('zh')`: công cụ này hay dính các từ lại với nhau ("我不 | 吃肉",
    "他是 | 我的"), nên không dùng được cho Xếp câu.
  - Cách dùng: câu ví dụ đánh dấu ranh giới từ bằng **ký tự ZWSP (U+200B)**. Ký tự này
    không hiện trên màn hình. `tokenize()` tách theo khoảng trắng và ZWSP, nên Xếp câu ra
    đúng từng từ do người viết chọn.
  - Test kiểm tra mỗi câu tiếng Trung đều có ZWSP và không có dấu cách thường.
- **Nghe – chép:** người học gõ chữ Hán bằng bộ gõ pinyin, chữ gõ vào không có ranh giới
  từ. Vì vậy với chữ Hán, `diffWords` so **từng chữ** thay vì từng từ.
- **Gạch chân và câu điền chỗ trống:** `findWordInSentence` tìm theo chuỗi; ranh giới chữ
  Latin không ảnh hưởng tới chữ Hán, nên tìm được ngay. Ví dụ của từ nào phải chứa đúng mặt
  chữ của từ đó (test giống gói tiếng Hàn).
- **Luyện nói:** nhận dạng giọng `zh-CN`. Khi chấm điểm, `phoneticKey` rỗng với chữ Hán nên
  đi đường so từng chữ, đã có từ lần sửa cho tiếng Hàn.
- **Màn hình theo gói:** Hangul chỉ dành cho tiếng Hàn. Đọc truyện, Chủ đề, Ngữ pháp, Mẫu
  câu, Âm khó chưa mở cho tiếng Trung (`lib/packContent.ts`), nên thanh dưới điện thoại có
  4 ô.
- **Trợ lý AI:** thêm `zh` vào danh sách cho phép `TARGET_LANGUAGES`, với cùng giới hạn như
  tiếng Hàn: chỉ hỏi về từ vựng, câu ví dụ và cách đọc.
- **Âm thanh:** dùng giọng đọc của trình duyệt (zh-CN), cùng lý do giới hạn 20.000 file như
  gói tiếng Hàn.
