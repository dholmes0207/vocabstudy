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
- 143/156 từ có âm Hán Việt (lúc đầu là 122/132). Cố ý để trống:
  - các trợ từ 吗 / 呢 / 的 / 了;
  - từ mượn 咖啡;
  - 哪 / 哪儿 / 这儿 / 那儿 / 一点儿 (khẩu ngữ, có thêm âm nhi hoá), thán từ 喂;
  - các từ có 吃, vì từ điển không thống nhất (cật / ngật / khiết). Không đoán khi chưa chắc.
- Hiển thị (`components/HanViet.tsx`) ngay dưới nghĩa trên thẻ học và ở mặt sau thẻ lật,
  không bao giờ ở mặt câu hỏi, vì âm Hán Việt hay trùng luôn với nghĩa (学生 = học sinh).

## Bước 3: bộ từ theo chủ đề (đã làm)

- `public/data/topics/zh.json` có 10 bộ, sinh từ `scripts/build_topics_zh.py`:
  - chào hỏi, con người & gia đình, ăn uống, nơi chốn & đi lại;
  - thời gian, số đếm & mua sắm, hoạt động hằng ngày, đồ vật quanh nhà;
  - miêu tả & thời tiết, từ để hỏi & từ ngữ pháp.
- Mỗi bộ 12–23 từ. Mọi từ trong gói đều nằm trong ít nhất một bộ; script và test cùng kiểm
  tra.
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
- Ví dụ trong 7 bài ngữ pháp cũng có dòng pinyin (trường `read` của `GrammarExample`). Nguồn
  là `EXAMPLE_PINYIN` trong `scripts/build_grammar_zh.py`, kiểm tra theo cùng cách với ví dụ
  của gói. Dòng pinyin hiện giữa câu chữ Hán và nghĩa.

## Bước 8: đủ 150 từ HSK 1

- Gói tăng từ 132 lên 156 từ: thêm 24 từ HSK 1 còn thiếu, gồm:
  - số đếm 四 / 五 / 六 / 七 / 八 / 九;
  - từ chỉ vị trí 上 / 下 / 里 / 前面 / 后面;
  - 岁, 号, 分钟, 电影, 哪, 怎么, 怎么样, 请, 同学, 喂, 些, 一点儿, 看见.

  Mỗi từ mới có đủ pinyin, câu ví dụ có ranh giới từ, pinyin của câu ví dụ, và âm Hán Việt
  khi chắc chắn.

- Danh sách HSK 1 (đề cương 2012) có 150 mục. 哪（哪儿）và 那（那儿）mỗi mục có hai dạng,
  nên tổng cộng là 152 từ. Danh sách này nằm trong `src/lib/chinesePack.test.ts`; test kiểm
  tra gói có đủ từng từ. Câu "đủ 150 từ HSK 1" trên trang chủ dựa vào test này.
- 4 từ ngoài HSK 1 vẫn giữ lại: 你好, 咖啡, 好吃, 火车站.
- "năm" (năm, 年) và "năm (số 5)" (五) có nghĩa ghi khác nhau, để câu trắc nghiệm luôn có
  một đáp án đúng.

## Cùng chữ Hán Việt và nhãn HSK 1 (18/10/2026)

**User**: "Học 学生 xong, muốn biết chữ 学 còn ở trong những từ nào nữa."

Tham khảo, quét trang từ công khai bằng REA (`docs/research/2026-10-17-language-apps.md`, vòng
5):

- Hanzii ghi âm Hán Việt cho cả từ (学习 [HỌC TẬP]), nhãn HSK 1 / TOCFL 1, từ ghép và cách tách
  chữ.
- Naver Hàn–Việt ghi chữ Hán gốc (工夫) và các từ phái sinh.

VocaStudy không làm từ điển như họ. App nối các từ **trong chính gói đang học** bằng âm Hán
Việt: một từ đã biết trở thành chìa khoá để nhớ các từ khác. Cách này dùng được cho cả tiếng
Trung và tiếng Hàn.

**BA**

- Trên thẻ từ (thẻ làm quen, mục Tra cứu, mặt sau thẻ lật) có thêm mục "Cùng chữ Hán Việt".
  - Mỗi chữ hiện kèm âm Hán Việt (学 HỌC), rồi các từ khác trong gói có chữ đó, **đọc cùng một
    âm**. Ví dụ: 学校 HỌC HIỆU · trường học, 学习, 同学.
  - Tiếng Hàn tính theo khối âm tiết: 학 HỌC có trong 학생 và 학교.
  - Từ không có Hán Việt, hoặc không có từ nào cùng chữ trong gói, thì không hiện mục này.
- Từ tiếng Trung thuộc danh sách HSK 1 có nhãn **HSK 1** cạnh từ loại. TOPIK I không có danh
  sách chính thức mà gói bao trọn, nên tiếng Hàn không có nhãn.
- Số liệu ngày 18/10: tiếng Trung có 36 họ chữ, phủ 66 từ. Tiếng Hàn có 10 họ, phủ 17 từ.

**Dev**

- `lib/hanVietFamily.ts`:
  - `hanVietUnits(word)` ghép từng chữ (hoặc khối Hangul) với từng âm của `hanViet`. Số chữ
    và số âm phải bằng nhau, nếu không thì bỏ qua từ đó;
  - `familyIndex(words)` lập bảng (chữ, âm) → các từ, có cache theo mảng `words`;
  - `familiesOf(word, words)`.
- `components/HanVietFamily.tsx`, hiện trong `WordInsight` (biến thể `full` và `details`).
- `lib/exams.ts` `examLabelFor(lang, word)` trả về nhãn, chỉ cho kỳ thi có `wordList`.
- Ghép theo **cả chữ lẫn âm**, vì một chữ có thể có hai âm: 不 trong 不客气 và 对不起 cùng là
  "bất", nhưng nếu một chữ đọc khác thì nó thuộc họ khác.

## Bước 9: từ đời thường ngoài HSK 1 (19/10/2026)

**User**: "Thêm bộ từ hợp lý." Gói đã đủ 150 từ HSK 1 (Bước 8), nhưng người mới học vẫn thiếu
những từ nói hằng ngày: anh/chị/em, màu sắc, ốm/thuốc, xe buýt, trái/phải, đắt/rẻ.

**BA**

- Thêm 78 từ, gói tăng từ 156 lên 234 từ. Phần lớn là từ HSK 2 (bản 2012), chọn theo chủ đề
  đời thường:
  - **gia đình**: 哥哥 姐姐 弟弟 妹妹 孩子 丈夫 妻子;
  - **sức khoẻ**: 身体 眼睛 生病 药 累 休息;
  - **màu sắc**: 颜色 红色 白色 黑色;
  - **ăn uống**: 鸡蛋 牛奶 面条 鱼 羊肉 西瓜 饿;
  - **thời gian**: 早上 晚上 小时 时间 每 已经 去年 生日;
  - **mua sắm**: 便宜 贵 卖 件 两 百 手机 手表;
  - **đi lại**: 公共汽车 路 远 近 走 左边 右边 机场 旅游;
  - **học tập và công việc**: 考试 问题 教室 公司 上班 懂 知道 帮助 介绍;
  - **sở thích**: 运动 游泳 跑步 唱歌 跳舞 踢足球 玩;
  - **miêu tả**: 晴 雪 高 长 新 快 慢 难 有意思;
  - **liên từ, trợ động từ**: 可以 因为 所以 但是.
- Từ mới nào cũng đủ các phần như từ cũ: nghĩa tiếng Việt, pinyin, câu ví dụ ngắn đã tách từ,
  câu dịch và pinyin của câu.
  - Câu ví dụ dùng chủ yếu từ đã có trong gói.
  - Âm Hán Việt có cho 76/78 từ. 跑步 và 踢足球 không ghi, vì các từ điển đọc 跑 và 踢 khác nhau.
- Thêm 3 bộ chủ đề: **Sức khoẻ & màu sắc**, **Học tập & công việc**, **Sở thích & thể thao**.
  Từ mới cũng được xếp vào các bộ cũ (con người, ăn uống, nơi chốn, thời gian, mua sắm, miêu tả,
  từ ngữ pháp). Tổng cộng có 13 bộ, và từ nào cũng nằm trong ít nhất một bộ.
- Lộ trình HSK 1 không đổi: danh sách thi vẫn là 152 mục trong `lib/exams.ts`, nên từ mới không
  làm sai tiến độ thi.
- Tiếng Trung đọc bằng giọng của trình duyệt, nên không thêm file audio (giới hạn 20.000 file của
  Cloudflare Pages không bị ảnh hưởng).

**Dev**

- Dữ liệu viết trong `scripts/build_zh_pack.py`: `ROWS`, `EXAMPLE_PINYIN` (một âm tiết cho mỗi
  chữ) và `HAN_VIET`. Script dừng nếu số âm tiết không khớp số chữ, hoặc nếu từ trong câu đọc
  khác cách đọc của gói. Phiên bản gói 0.5.0.
- `scripts/build_topics_zh.py` có 3 bộ mới. `public/data/index.json` có số từ và mô tả mới.
- Trang chủ (`Landing.tsx`) ghi 234 từ, 13 bộ chủ đề, tổng "4.800+". `landingClaims.test.ts`
  tính lại các số này từ dữ liệu.

## Bước 10: thêm 4 bài ngữ pháp (19/10/2026)

**User**: "Cải thiện thêm phần học tiếng Trung." 7 bài cũ đã có 是, 不/没, câu hỏi, 的, lượng từ,
在 và 很. Còn thiếu những điểm người Việt hay sai khi bắt đầu nói câu dài hơn.

**BA**

- **Trật tự câu** (`zh-word-order`): thời gian và nơi chốn đứng TRƯỚC động từ.
  - Tiếng Việt quen đặt chúng ở cuối câu, nên người Việt hay nói 我工作在医院.
  - Lỗi mẫu: 我工作在医院 → 我在医院工作, và 我去北京明天 → 我明天去北京.
- **了** (`zh-le`):
  - việc đã xảy ra;
  - 了 ở cuối câu báo một thay đổi (下雨了);
  - phủ định bằng 没 thì bỏ 了;
  - 了 không phải "thì quá khứ", nên thói quen trong quá khứ không dùng 了.
- **会 / 能 / 可以** (`zh-can`): biết (kỹ năng đã học), làm được, được phép.
  - Bài nói rõ là ranh giới giữa 能 và 可以 không cứng.
  - Lỗi mẫu chỉ chọn những câu chắc chắn sai hoặc đổi nghĩa: 我会坐这儿吗, 不会去 ("sẽ không
    đi").
- **因为…所以…, 但是** (`zh-because`): dùng các từ mới ở Bước 9.
- Mỗi bài có cấu trúc giống bài cũ: 5 câu ví dụ có pinyin, 2 lỗi hay gặp, 5 câu chọn và 1 câu
  xếp chữ. Câu ví dụ cũng dùng được cho "Nói thành tiếng" và "Nghe – chép ví dụ".

**Dev**

- `scripts/build_grammar_zh.py`: thêm 4 bài vào `UNITS` và pinyin của câu ví dụ vào
  `EXAMPLE_PINYIN`. Script kiểm tra số âm tiết, cách đọc của từ có trong gói, chỗ trống của câu
  chọn và độ dài câu xếp chữ.
- Trang chủ ghi 11 bài ngữ pháp. `landingClaims.test.ts` tính lại số này từ dữ liệu.

## Bước 11: thêm 3 truyện ngắn (19/10/2026)

**User**: "Cải thiện thêm phần học tiếng Trung." Trước đây chỉ có 3 truyện (Bước 4), nên người học
chưa gặp lại các từ mới của Bước 9 trong ngữ cảnh.

**BA**

- **Gia đình tôi** (A1, `zh-my-family`): 哥哥, 妹妹, 高, 踢足球, 唱歌, 一起.
- **Tôi bị ốm** (A2, `zh-sick-day`): 累, 生病, 上班, 公司, 妻子, 药, 休息, 身体.
- **Du lịch Bắc Kinh** (A2, `zh-beijing-trip`): 去年, 旅游, 走路, 但是, 贵, 件, 红色, 有意思.
- Mỗi truyện có 8 câu, mỗi câu có pinyin và câu dịch, cuối truyện có 3 câu hỏi.
  - Hơn 70% từ chạm được để xem nghĩa (`reading.test.ts` kiểm tra tỉ lệ này).
  - Tên riêng và vài từ ngoài gói (口, 给, 带, 也, 一起) không chạm được, giống các truyện cũ.

**Dev**

- `scripts/build_reading_zh.py`: thêm 3 truyện vào `STORIES` và pinyin từng câu vào
  `SENTENCE_PINYIN`.
- `scripts/zh_pinyin.py`: viết hoa chữ đầu của câu trích dẫn sau dấu hai chấm (`shuō: “Nǐ …`).
  Dựng lại gói từ và bài ngữ pháp thì dữ liệu không đổi.
- Trang chủ ghi 6 truyện ngắn tiếng Trung.
