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

## Bước 1: "Pinyin & thanh điệu" (`/pinyin`)

**User**: người mới học tiếng Trung chưa đọc được pinyin và nghe chưa ra thanh điệu. Thanh
điệu là chỗ người Việt có lợi thế, vì tiếng Việt cũng có thanh, nhưng cần được chỉ ra cho
rõ.

**BA**

- Trang chỉ hiện khi học tiếng Trung. Trên thanh dưới điện thoại, nó nằm ở ô thứ năm, giống
  ô Hangul của tiếng Hàn.
- Trang có các phần:
  - **5 thanh**, mỗi thanh một ví dụ:
    - thanh 1 mā 妈: cao và bằng;
    - thanh 2 má 麻: đi lên, gần thanh sắc;
    - thanh 3 mǎ 马: xuống thấp rồi lên, gần thanh hỏi;
    - thanh 4 mà 骂: rơi mạnh từ cao xuống;
    - thanh nhẹ ma 吗: ngắn, không có dấu.

    Chạm vào thì nghe.

  - **Biến điệu:**
    - 3 + 3 thì âm đầu đọc thành thanh 2 (你好 đọc "ní hǎo");
    - 不 đứng trước thanh 4 thì đọc bú (不客气);
    - 一 đổi thanh theo chữ đứng sau.
  - **Thanh mẫu (phụ âm đầu):** 21 chữ, mỗi chữ có gợi ý cách đọc theo âm tiếng Việt và
    một chữ ví dụ lấy trong gói (b 爸, zh 中, x 学…).
  - **Vận mẫu khó:** e, ü, ou, ei, ie, uo, an / ang, en / eng, er.
  - **Kiểm tra nhanh** 10 câu:
    - nhìn dấu thanh của một chữ trong gói (茶 chá), chọn đó là thanh mấy;
    - nhìn một từ chữ Hán trong gói, chọn pinyin đúng (đáp án nhiễu có cùng số chữ).

    Làm xong được XP.

**Dev**

- `src/lib/pinyin.ts` chứa các bảng dữ liệu, `toneOf(syllable)` (trả về 1–4, hoặc 5 cho
  thanh nhẹ) và `pinyinQuiz(count, rand, words)`.
- Câu hỏi về thanh chỉ lấy từ **một chữ**, vì một chữ là một âm tiết. Như vậy không phải
  tách âm tiết trong những pinyin viết liền như "xǐhuan".
- Âm thanh dùng giọng `zh-CN` của trình duyệt, đọc từng chữ Hán (妈 / 麻 / 马 / 骂).
- Hành trình 7 ngày: ngày 5 có danh sách nhiệm vụ thay thế (`alts`). Tiếng Hàn lấy Hangul,
  tiếng Trung lấy Pinyin.

## Bước 2: âm Hán Việt (đã làm)

- Trường `hanViet` (không bắt buộc) của từ. Viết trong `HAN_VIET` của
  `scripts/build_zh_pack.py`; script và test kiểm tra mỗi chữ Hán ứng với đúng một âm tiết.
- 122/132 từ có âm Hán Việt. Cố ý để trống:
  - các trợ từ 吗 / 呢 / 的 / 了;
  - từ mượn 咖啡;
  - 哪儿 / 这儿 / 那儿 (khẩu ngữ, có thêm âm nhi hoá);
  - các từ có 吃, vì từ điển không thống nhất (cật / ngật / khiết). Không đoán khi chưa chắc.
- Hiển thị (`components/HanViet.tsx`) ngay dưới nghĩa trên thẻ học và ở mặt sau thẻ lật,
  không bao giờ ở mặt câu hỏi, vì âm Hán Việt hay trùng luôn với nghĩa (学生 = học sinh).
