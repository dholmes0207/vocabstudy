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

## Bước 3: bộ từ theo chủ đề (đã làm)

- `public/data/topics/zh.json` có 10 bộ, sinh từ `scripts/build_topics_zh.py`:
  - chào hỏi, con người & gia đình, ăn uống, nơi chốn & đi lại;
  - thời gian, số đếm & mua sắm, hoạt động hằng ngày, đồ vật quanh nhà;
  - miêu tả & thời tiết, từ để hỏi & từ ngữ pháp.
- Mỗi bộ 12–19 từ. Cả 132 từ đều nằm trong ít nhất một bộ; script và test cùng kiểm tra.
- `/topics` mở cho tiếng Trung (`lib/packContent.ts`).

## Bước 4: truyện ngắn (đã làm)

- `public/data/reading/zh.json` có 3 truyện A1, sinh từ `scripts/build_reading_zh.py`:
  "Một ngày của tôi", "Ở cửa hàng", "Trời mưa rồi". Câu viết với dấu "|", script đổi
  thành ZWSP.
- Tiếng Trung không chia từ, nên token chính là từ gốc: bảng tra tìm thẳng được, không cần
  trường `gloss` viết tay như tiếng Hàn. Test yêu cầu hơn 70% số từ chạm được.
- Màn hình đọc tách từ bằng `tokenize()` và chỉ chèn dấu cách nếu câu gốc có dấu cách. Nhờ
  vậy câu tiếng Trung hiện liền mạch, mỗi từ vẫn chạm được riêng.
- `/reading` mở cho tiếng Trung.

## Bước 5: ngữ pháp căn bản (đã làm)

- `public/data/grammar/zh.json` có 7 bài A1, sinh từ `scripts/build_grammar_zh.py`:
  是, 不 / 没, câu hỏi với 吗 và từ để hỏi, 的, lượng từ 个 / 本 / 杯 / 只, 在, 很 + tính từ.
- Mỗi bài có giải thích bằng tiếng Việt, mẫu câu, ví dụ, lỗi hay gặp (nhiều lỗi do dịch
  từng chữ từ tiếng Việt, ví dụ 我学习在学校) và ít nhất 5 bài luyện.
- Câu xếp từ dùng ranh giới ZWSP giống câu ví dụ trong gói; test bảo đảm câu không có dấu
  cách thường. `/grammar` mở cho tiếng Trung.

## Tra cứu không cần dấu (đã làm)

- Trang Tra cứu tìm không phân biệt dấu tiếng Việt và dấu thanh pinyin (`lib/search.ts`):
  - "xin chao" tìm ra "xin chào";
  - "ni hao", "nihao" hay "nǐ hǎo" đều tìm ra 你好;
  - "bang huu" tìm ra 朋友 (theo âm Hán Việt).
- Cách đọc chỉ được tìm với từ không viết bằng chữ Latin (tiếng Hàn, tiếng Trung). Với từ
  tiếng Anh, cách đọc kiểu Việt chỉ là phiên âm nên không đưa vào kết quả.

## Bước 6: pinyin cho câu ví dụ

**User**: người mới học chưa đọc được chữ Hán. Câu ví dụ 我喜欢喝咖啡。 trên thẻ học là một dòng
ký hiệu họ không đọc ra. Ở trang Nghe – chép, họ gõ bằng bộ gõ pinyin, nên cần biết pinyin
mới gõ ra được chữ.

**BA**

- Dưới mỗi câu ví dụ tiếng Trung hiện thêm một dòng pinyin, chia theo từ: "Wǒ xǐhuan hē
  kāfēi."
  - Dòng này có trên thẻ học, mặt sau thẻ lật và trang Nghe thụ động.
- Nghe – chép có thêm nút gợi ý "xem pinyin", bên cạnh gợi ý nghĩa tiếng Việt.
- Quy ước ghi dấu theo giáo trình HSK chuẩn:
  - đánh dấu biến điệu của 一 và 不 (一个 yí gè, 不客气 bú kèqi);
  - không đánh dấu biến điệu 3 + 3 (你好 vẫn ghi nǐ hǎo);
  - thanh nhẹ không có dấu (朋友 péngyou).

**Dev**

- Trường `exampleRead` (không bắt buộc) của từ: cách đọc của câu ví dụ.
  - Gói tiếng Trung lấy trường này từ `EXAMPLE_PINYIN` trong `scripts/build_zh_pack.py`.
  - Mỗi chữ Hán ứng với **một âm tiết**, viết cách nhau. Script ghép âm tiết theo ranh giới
    từ trong câu, đổi dấu câu Trung sang dấu Latin, rồi viết hoa chữ đầu câu.
- Script từ chối khi:
  - số âm tiết khác số chữ Hán;
  - các âm tiết của chính từ đang học khác `viRead` của từ đó (bỏ qua 一 và 不, vì thanh của
    chúng đổi theo chữ đứng sau).
- Trên màn hình, dòng pinyin chỉ hiện khi từ có `exampleRead`. Tiếng Anh và tiếng Hàn không
  thay đổi.

## Bước 7: pinyin cho truyện ngắn

- Màn hình đọc có thêm nút **pinyin** bên cạnh "Bản dịch". Nút chỉ hiện khi truyện có
  pinyin; bật lên thì dưới mỗi câu chữ Hán có một dòng pinyin.
- Mỗi câu truyện có thêm trường `read`. Nguồn là `SENTENCE_PINYIN` trong
  `scripts/build_reading_zh.py`, viết mỗi chữ một âm tiết.
- `build_zh_pack.py` và `build_reading_zh.py` dùng chung module `scripts/zh_pinyin.py` để
  ghép dòng pinyin. Sau khi tách module, gói từ được sinh lại giống hệt từng byte.
- Script truyện kiểm tra:
  - số âm tiết bằng số chữ Hán;
  - mọi từ trong câu có mặt trong gói thì đọc đúng như `viRead` của gói (trừ 一 / 不).
- Test lặp lại phép kiểm tra thứ hai trên file đã sinh ra.
- Thứ tự chạy: `build_zh_pack.py` trước, `build_reading_zh.py` sau (script truyện đọc cách
  đọc từ gói).
