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

## Bước 12: nghe chọn thanh (19/10/2026)

**User**: "Cải thiện thêm phần học tiếng Trung."

Bài kiểm tra pinyin cũ chỉ hỏi bằng mắt: nhìn chữ để đoán thanh, hoặc chọn cách đọc. Trong khi
đó, cái khó nhất với người mới là nghe ra thanh, nhất là khi hai thanh đi liền nhau trong một từ.

**BA**

- Trang Pinyin có thêm nút **"Nghe chọn thanh (10 câu)"**, cạnh nút "Kiểm tra nhanh".
- Mỗi câu:
  - Câu tự phát một từ hai chữ (bấm nút loa to để nghe lại). Chữ Hán **ẩn** cho đến khi trả lời,
    để người học phải nghe chứ không đọc.
  - Có 4 cách viết bính âm, chỉ khác nhau ở dấu thanh: xǐhuan, xīhuan, xíhuan, xìhuan.
  - Trả lời xong thì hiện chữ Hán và nghĩa, có nút nghe lại. Cuối lượt cộng XP như bài kiểm tra
    nhanh.
- **Bỏ các từ có hai thanh 3 liền nhau** (你好, 可以, 手表…). Hai thanh 3 đi liền thì thanh đầu
  được đọc thành thanh 2, nên tai nghe "ní hǎo" trong khi chữ viết là "nǐ hǎo". Hỏi những từ này
  sẽ chấm sai người nghe đúng.
- Tiếng Trung đọc bằng giọng của trình duyệt. Máy không có giọng tiếng Trung thì câu hỏi im lặng,
  giống mọi phần khác của gói tiếng Trung.

**Dev**

- `lib/pinyin.ts`:
  - `toneVariants(reading)` đổi dấu thanh trên từng nguyên âm có dấu, không cần tách âm tiết.
  - `hasThirdToneRun(reading)`.
  - `earQuiz(words)` lấy từ hai chữ, bỏ từ viết hoa (tên riêng) và từ có hai thanh 3 liền nhau.
  - `PinyinQuestion` có thêm loại `ear`.
- `features/pinyin/Pinyin.tsx`: câu loại `ear` tự phát khi hiện ra, và giấu chữ cho tới khi trả
  lời.
- Test: `lib/pinyin.test.ts`, `features/pinyin/Pinyin.test.tsx`.

## Bước 13: đợt từ thứ hai, lấy từ chính nội dung của app (19/10/2026)

**User**: "Thêm bộ từ hợp lý."

Cách chọn từ: đếm những từ đã xuất hiện trong câu ví dụ và truyện nhưng chưa có trong gói, nên
người học chạm vào thì không ra nghĩa. Có 41 từ như vậy.

**BA**

- Thêm 32 từ, gói tăng từ 234 lên 266 từ:
  - **bốn mùa**: 春天 夏天 秋天 冬天;
  - **thời gian**: 天 今年 晚 起床 一下;
  - **lượng từ**: 杯 只 条 张 口;
  - **động từ**: 给 带 等 用 进 要 开车;
  - **hư từ**: 也 一起 吧 离;
  - **danh từ**: 饭 越南 音乐 汉字 门 外面 头发.
- Không thêm:
  - tên riêng (安娜, 王, 李);
  - số ghép (十一, 二十, 一百), vì đã học được từ các số đơn;
  - 这个 (这 + 个, cả hai đã có trong gói);
  - 每天 (每 và 天 đều đã có);
  - 得 (trợ từ bổ ngữ, cần một bài ngữ pháp riêng).
- Từ nào cũng có câu ví dụ riêng kèm pinyin. 31/32 từ có âm Hán Việt; 吧 không có, vì là trợ từ.
- Mỗi từ được xếp vào ít nhất một bộ chủ đề. Các bài ngữ pháp và truyện được dựng lại: các từ vừa
  thêm có trong câu đều đọc đúng như cách đọc của gói.
- Trang chủ ghi 266 từ. Tổng số từ vẫn trên 4.800.

## Bước 14: bài 得 và 比 (19/10/2026)

Tiếp nối Bước 10. Hai điểm HSK 2 người học gặp ngay sau các bài A1, nay dùng được các từ mới
(快, 高, 唱歌, 游泳).

- **得** (`zh-de-degree`): động từ + 得 + lời nhận xét (他走得很快). Có tân ngữ thì nhắc lại động từ
  (他说汉语说得很好). Bài phân biệt 得 với 的: cùng đọc "de" nhưng khác chữ, khác vị trí.
- **比** (`zh-bi`):
  - A 比 B + tính từ; câu có 比 thì không dùng 很;
  - "hơn nhiều" là 多了, "hơn một chút" là 一点儿;
  - "không bằng" là A 没有 B + tính từ.
- Câu chọn chỉ đưa ra phương án sai khi chắc chắn sai. Ví dụ, 不比 không được dùng làm phương án
  sai cho 没有, vì 不比 vẫn đúng ngữ pháp, chỉ khác nghĩa.
- Trang chủ ghi 13 bài ngữ pháp tiếng Trung.

## Bước 15: bài 过 và 要…了 (19/10/2026)

Hai điểm ngữ pháp HSK 2. Bài dùng các từ đã có trong gói (到, 开始, 考试, 次, 羊肉).

- **过** (`zh-guo`): đã từng (我去过北京).
  - Khác với 了: 了 kể việc đã xảy ra, 过 nói về trải nghiệm.
  - Phủ định bằng 没 … 过 thì giữ 过 và không thêm 了.
  - Số lần đặt sau động từ: 看过两次.
- **要…了, 快…了** (`zh-yao-le`): sắp (要下雨了, 火车快到了).
  - Thiếu 了 thì câu dở dang.
  - Có mốc thời gian cụ thể thì dùng 就要 … 了, không dùng 快 … 了. Câu chọn hỏi đúng điểm này.
- Trang chủ ghi 15 bài ngữ pháp tiếng Trung.

## Bước 16: 2 truyện mức HSK 2 (19/10/2026)

- **Ở nhà hàng** (A2, `zh-restaurant`): 服务员, 欢迎, 面条, 杯, 非常, 元.
- **Lần đầu đến Trung Quốc** (A2, `zh-first-time`): 第一, 次, 从, 机场, 已经, 等, 房间, 大家, 觉得,
  希望, 再.
- Cách viết giống Bước 11: 8 câu, mỗi câu có pinyin và câu dịch, 3 câu hỏi. Từ ngoài gói (一共,
  第二, 明年) không chạm được. Tổng cộng 8 truyện tiếng Trung, 30 truyện cho cả app.

## Bước 17: bài "Cùng âm, khác chữ" (19/10/2026)

- `zh-same-sound`: 在 / 再 (zài), 他 / 她 / 它 (tā), 的 / 得 (de). Nghe thì giống hệt nhau, nên bài
  dạy cách chọn chữ theo nghĩa, kèm mẹo 再见 = "gặp lại". Đây là lỗi viết hay gặp khi người học bắt
  đầu gõ chữ Hán, kể cả khi gõ bằng bính âm rồi chọn chữ.
- Trang chủ ghi 16 bài ngữ pháp tiếng Trung, và nhắc tới màn lượng từ và nghe số.

## Bước 18: 2 truyện ôn ngữ pháp mới (19/10/2026)

- **Cuối tuần** (`zh-weekend`): dùng 比 (天气比昨天好), 得 (打得很好), 过 (没看过), 要…了 (要下雨了).
- **Chiếc điện thoại mới** (`zh-new-phone`): dùng 比 + số lượng (比那个便宜五百块), 告诉, 给…打电话.
- Người học gặp lại các mẫu của Bước 14–15 trong một câu chuyện. Cách viết vẫn như cũ: 8 câu có
  pinyin, 3 câu hỏi. Tổng cộng 10 truyện tiếng Trung, 32 truyện cho cả app.

## Bước 19: bộ "Thời tiết & bốn mùa" và "Ở nhà hàng" (19/10/2026)

- Hai tình huống người học gặp sớm, ghép từ những từ đã có trong gói, không thêm từ mới.
  - **Thời tiết & bốn mùa**: 15 từ (天气, 冷/热, 下雨, 雪, 晴, 阴, bốn mùa, 外面, 可能…).
  - **Ở nhà hàng**: 21 từ (饭店, 服务员, 欢迎, món ăn, đồ uống, 杯, 要, 多少钱, 块/元, 饿…).
- Tổng cộng 15 bộ chủ đề tiếng Trung. Trang chủ đã cập nhật.

## Bước 20: bài 几 / 多少 và 有点儿 / 一点儿 (19/10/2026)

- **几 / 多少** (`zh-ji-duoshao`, A1):
  - 几 cho số nhỏ và cần lượng từ;
  - 多少 cho số bất kỳ và để hỏi giá;
  - giờ, ngày, thứ thì hỏi bằng 几.
  - Câu chọn chỉ đưa ra phương án chắc chắn sai: 星期多少, 几学生 (thiếu lượng từ). Không dùng
    "多少口人", vì câu đó vẫn có thể gặp.
- **有点儿 / 一点儿** (`zh-youdianr`, A2): 有点儿 đứng trước tính từ (hơi, thường là điều không vừa
  ý); 一点儿 đứng sau tính từ (hơn một chút) hoặc trước danh từ (một ít).
- Tổng cộng 18 bài ngữ pháp tiếng Trung. Trang chủ đã cập nhật.

## Bước 21: truyện "Đi mua trái cây" (19/10/2026)

- `zh-fruit-shopping` (A2): một lần mặc cả ngắn, ôn 多少钱一公斤, 有点儿贵, 便宜一点儿吧, 您要几个,
  吃了一点儿 (Bước 20). Tổng cộng 11 truyện tiếng Trung, 33 truyện cho cả app.

## Bước 22: bài 也 / 都 (20/10/2026)

- **也 / 都** (`zh-ye-dou`, A1): 也 (cũng) và 都 (đều) đứng sau chủ ngữ, trước động từ, giống
  "cũng", "đều" trong tiếng Việt. Bài nói thêm:
  - 都 gom những gì đứng trước nó, nên chủ ngữ thường là số nhiều;
  - 每天都 (ngày nào cũng);
  - có cả hai thì 也 đứng trước (也都);
  - 都不 (đều không) khác 不都 (không phải tất cả).
- Câu chọn chỉ đưa ra phương án chắc chắn sai: 都 với chủ ngữ một người, 都都, 也也. Không dùng
  "我每天___喝茶" với hai phương án 都 / 也, vì 我每天也喝茶 vẫn đúng khi có ngữ cảnh.
- Tổng cộng 19 bài ngữ pháp tiếng Trung. Trang chủ đã cập nhật.

## Bước 23: bài 想 / 要 (20/10/2026)

- **想 / 要** (`zh-xiang-yao`, A1). Người Việt hay dịch cả hai là "muốn", rồi nói 不要 khi
  định nói "không muốn". Bài này tách rõ:
  - 想 + động từ = muốn (nhẹ nhàng);
  - 要 + danh từ = cho tôi…, muốn lấy (gọi món, mua đồ);
  - "không muốn" là 不想, còn 不要 + động từ = đừng;
  - 想 + người hay nơi chốn = nhớ.
- Câu chọn chỉ đưa ra phương án chắc chắn sai: 我想一杯咖啡, 想杯咖啡, 请不想说话, 我很要你. Không
  dùng 我不要去 làm câu sai, vì câu đó vẫn có người nói khi từ chối thẳng.
- Tổng cộng 20 bài ngữ pháp tiếng Trung. Trang chủ đã cập nhật.

## Bước 24: bài 和 (20/10/2026)

- **和** (`zh-he`, A1): tiếng Việt dùng "và" để nối cả danh từ lẫn hai vế câu, nên người Việt
  hay nói 他会说汉语和会说英语. Bài này nói rõ:
  - 和 chỉ nối danh từ (我和他, 猫和狗, 北京和上海);
  - nối hai vế câu dùng 也;
  - hai vế cùng động từ thì nói động từ một lần;
  - 和 … 一起 = cùng với ai.
- Câu chọn có hai phương án 和 / 也; ở mỗi câu, phương án sai đều chắc chắn sai (我也他, 猫也狗,
  汉语，和会说).
- Tổng cộng 21 bài ngữ pháp tiếng Trung. Trang chủ đã cập nhật.

## Bước 25: bài 吧 (20/10/2026)

- **吧** (`zh-ba`, A1): 吧 ở cuối câu dùng để:
  - rủ, đề nghị (我们走吧, giống "…thôi", "…nhé");
  - nhờ hay khuyên nhẹ nhàng (你明天来吧);
  - hỏi lại điều mình đã đoán (你是越南人吧？).
- Bài đặt 吧 cạnh 吗 (hỏi thật, chưa biết câu trả lời), vì cả hai đều đứng cuối câu.
- Câu chọn chỉ có những câu rủ hay khuyên, kết thúc bằng "！" hoặc "。", nên 吗 chắc chắn sai.
  Không dùng câu hỏi "你是学生___？", vì cả 吧 lẫn 吗 đều đúng ở đó.
- Tổng cộng 22 bài ngữ pháp tiếng Trung. Trang chủ đã cập nhật.

## Bước 26: chia lại bộ chủ đề (29/10/2026)

Sau khi thêm đủ từ HSK 3 (gói lên 618 từ), các từ mới được dồn vào những bộ sẵn có, nên có bộ
phình tới 111 từ (Hoạt động hằng ngày), 90 từ (Từ để hỏi & từ ngữ pháp) và 87 từ (Miêu tả). Bộ
tiếng Anh lớn nhất chỉ có 47 từ. Một bộ quá lớn không còn là "một chủ đề" để học trong vài buổi.

- Chia lại thành 24 bộ, mỗi bộ 16–49 từ. Tám bộ cũ giữ nguyên (Chào hỏi, Con người, Ăn uống, Ở
  nhà hàng, Đồ vật quanh nhà, Sức khoẻ & màu sắc, Sở thích, Thời tiết & bốn mùa).
- Bộ tách ra:
  - Nơi chốn → **Đi lại & du lịch**, **Phương hướng & vị trí**, **Thành phố & nơi công cộng**;
  - Thời gian → **Giờ giấc & ngày tháng**, **Trước, sau & bao lâu**;
  - Số đếm & mua sắm → **Số đếm & lượng từ**, **Mua sắm**;
  - Hoạt động hằng ngày → **Sinh hoạt hằng ngày**, **Dự định & việc phải làm**, **Cảm xúc & suy
    nghĩ**;
  - Miêu tả & thời tiết → **Tính chất & miêu tả** (từ thời tiết đã có ở bộ Thời tiết & bốn mùa);
  - Học tập & công việc → **Trường lớp & học tập**, **Công việc**;
  - Từ để hỏi & từ ngữ pháp → **Từ để hỏi**, **Từ ngữ pháp cơ bản**, **Liên từ & phó từ**.
- Một từ có thể nằm ở hai bộ khi hợp cả hai (银行 ở Mua sắm và Thành phố). Tiến độ lưu theo từ,
  không theo bộ, nên đổi bộ không làm mất gì của người học.

## Bước 27: 9 bài ngữ pháp HSK 3 (29/10/2026)

Gói đã có đủ từ HSK 3, nhưng 22 bài ngữ pháp đều ở mức A1–A2. Thêm 9 bài cho các điểm ngữ pháp
chính của HSK 3, mức **B1**. Ví dụ chỉ dùng từ trong gói, và cách đọc của từ được đối chiếu với gói
như mọi bài khác.

- **Câu chữ 把** (`zh-ba-sentence`): 把 + tân ngữ + động từ + phần sau; tân ngữ là vật cụ thể; 没 /
  别 đứng trước 把.
- **Câu bị động 被** (`zh-bei`): đặt cạnh câu 把 với cùng một việc (弟弟把蛋糕吃完了 / 蛋糕被弟弟吃完了).
- **越来越, 越…越…** (`zh-yue`): không thêm 很 sau 越.
- **虽然…但是** (`zh-suiran`): giữ cả hai vế như "tuy… nhưng…"; không ghép 虽然 với 所以.
- **一边…一边 và 又…又** (`zh-yibian`): tiếng Việt chỉ có "vừa… vừa…", nên bài tách rõ: hành động →
  一边, tính chất → 又.
- **除了…(以外)** (`zh-chule`): 还/也 = thêm vào, 都 = trừ ra.
- **Bổ ngữ kết quả** (`zh-result`): 写完, 找到, 听懂, 看见, 说错, 做好; phủ định bằng 没.
- **Bổ ngữ xu hướng** (`zh-direction`): 来 về phía người nói, 去 rời xa; nơi chốn đứng trước 来/去.
- **如果…就** (`zh-ruguo`): 就 đứng sau chủ ngữ; đối chiếu với 因为…所以.
- Mỗi bài có câu chọn và câu xếp từ. Ở mỗi câu chọn, phương án sai đều chắc chắn sai.
- Tổng cộng 31 bài ngữ pháp tiếng Trung. Trang chủ tự đếm lại.

## Bước 28: 5 truyện mức HSK 3 (29/10/2026)

11 truyện cũ đều ở mức A1–A2, nên từ HSK 3 hầu như chỉ xuất hiện trên chính thẻ của nó. Thêm 5
truyện mức **B1**, viết để người học gặp lại nhiều từ HSK 3 và các điểm ngữ pháp ở Bước 27:

- **Tìm ví** (`zh-lost-wallet`): 发现, 着急, 一直, 阿姨, 刚才, 终于, câu 把.
- **Thành phố mới** (`zh-new-city`): 搬, 城市, 附近, 公园, 图书馆, 环境, 安静, 邻居, 一边…一边, 越来越.
- **Ôn thi HSK 3** (`zh-hsk-exam`): 打算, 参加, 为了, 提高, 水平, 认真, 复习, 练习, 句子, 愿意, 虽然…但是.
- **Quà sinh nhật bà** (`zh-birthday-gift`): 奶奶, 特别, 礼物, 花, 蛋糕, 厨房, 满意, 除了, 又…又.
- **Bị cảm** (`zh-catch-cold`): 突然, 注意, 疼, 发烧, 担心, 检查, 感冒, 饱, 锻炼, 忘记.
- Tên riêng và vài từ ngoài gói (钱包, 对面, 聊天, 录音, 通过, 感谢) không bấm được. Mỗi truyện vẫn bấm được
  hơn 70% số từ, như các truyện khác.
- Riêng 5 truyện này dùng 57/298 từ HSK 3. Tính cả 9 bài ngữ pháp, 77 từ HSK 3 xuất hiện ngoài thẻ
  của chính nó (trước đây khoảng 29). `reading.test.ts` giữ mức tối thiểu 50 từ.
- Tổng cộng 16 truyện tiếng Trung. Trang chủ tự đếm lại.

## Bước 29: đọc theo truyện, và các ý tưởng tiếp theo (02/11/2026)

**User**: "Thêm vài ý tưởng cho tiếng Trung."

Đã làm: **Đọc theo** cho 16 truyện tiếng Trung (chi tiết ở `reading.md`). Người học nghe từng câu,
đọc lại, được chấm theo từng chữ Hán.

Các ý tưởng tiếp theo, xếp theo lợi ích cho người Việt:

1. **Báo sai thanh khi luyện phát âm.** Máy nhận dạng hay trả về một chữ khác cùng âm, khác thanh
   (nói 买 mǎi thành 卖 mài). Hiện máy chỉ chấm "sai". Nếu tra được pinyin của chữ nghe được thì báo
   "đúng âm, sai thanh: thanh 3 → thanh 4". Cần một bảng chữ → pinyin rộng hơn gói (khoảng 3.500 chữ
   thông dụng).
2. **Bộ thủ.** Khoảng 40 bộ thủ hay gặp, mỗi bộ có tên Hán Việt (亻 nhân, 氵 thuỷ, 口 khẩu, 木 mộc…)
   và các chữ trong gói chứa bộ đó. Người Việt nhớ chữ qua bộ thủ và âm Hán Việt rất nhanh. Dữ liệu
   bộ thủ ghi tay, kiểm tra bằng test như pinyin.
3. **Luyện cặp thanh.** Mở rộng "Nghe chọn thanh": 20 tổ hợp hai thanh (1-1, 1-2… 4-4), mỗi tổ hợp
   vài từ quen. Người học biết mình hay nhầm cặp nào (2-3, 3-2 là khó nhất).
4. **Thứ tự nét viết.** Hiện nét viết từng chữ và cho tập viết theo. Cần dữ liệu nét (Make Me a
   Hanzi; phải đọc kỹ giấy phép trước khi dùng) và khoảng 1 MB cho 600 chữ, nên chỉ tải khi mở.

## Bước 30: bộ thủ (03/11/2026)

Làm ý tưởng 2 ở Bước 29: màn **"Bộ thủ"** (`/radicals`) với 41 bộ hay gặp, tên Hán Việt, các chữ
trong gói chứa bộ đó và bài "Đoán bộ thủ". Chi tiết ở `radicals.md`.

## Bước 31: cặp thanh (03/11/2026)

Làm ý tưởng 3 ở Bước 29. Bài "Nghe chọn thanh" (Bước 12) hỏi ngẫu nhiên, nên người học không biết
mình hay nhầm cặp thanh nào.

**BA**

- Trang Pinyin có thêm bảng **"Cặp thanh"**: 4 hàng (thanh chữ đầu) × 5 cột (thanh chữ sau, kể cả
  thanh nhẹ), mỗi ô một từ trong gói kèm pinyin, chạm để nghe. Ô 3 + 3 ghi "đọc 2 + 3".
- "Nghe chọn thanh" rải 10 câu qua 10 cặp thanh khác nhau thay vì bốc ngẫu nhiên.
- Hết lượt, màn kết quả ghi các cặp nghe sai, cặp sai nhiều nhất trước: "Cặp thanh cần nghe lại:
  2 + 3 (sai 1/1), 3 + 2 (sai 1/1)".
- Từ có 儿 đọc cuộn lưỡi (哪儿 nǎr, 这儿 zhèr) chỉ là một âm tiết nên không tính là cặp. 女儿 nǚ'ér
  vẫn là hai âm tiết: khi 儿 đứng riêng, pinyin luôn có dấu nháy trước ér.

**Dev**

- `lib/pinyin.ts`: `tonePair`, `pairKey`, `TONE_PAIRS`, `tonePairTable`, `missedPairs`; câu hỏi
  `ear` có thêm `pair`; `earQuiz` chia từ theo cặp rồi lấy lần lượt từng cặp.
- `features/pinyin/Pinyin.tsx`: `TonePairs`, `MissedPairs`.
- Test: `lib/pinyin.test.ts` (20 cặp đều có từ trong gói, một lượt phủ 10 cặp khác nhau),
  `features/pinyin/Pinyin.test.tsx`.

## Bước 32: Luyện thi HSK (03/11/2026)

Trang `/hsk` luyện đúng các dạng câu của đề HSK 1–3 (nghe hiểu, chọn từ điền chỗ trống, sắp xếp câu)
và có bài thi nhỏ theo cấp. Chi tiết ở `toeic.md`, bước B1.

## Bước 33: luyện biến điệu (09/11/2026)

Thẻ "Biến điệu khi nói liền" chỉ có 3 ví dụ, chưa có chỗ luyện, trong khi đọc sai 一, 不 và hai thanh 3 liền
nhau là lỗi rất hay gặp ở phần nói HSKK. Trang Pinyin thêm nút "Luyện biến điệu 一 · 不" (10 câu, dùng lại
vòng "Kiểm tra nhanh", kiểu câu mới `sandhi`): thấy từ, chọn cách đọc khi nói trong 2–3 phương án (có cả cách
đọc theo thanh gốc). Trả lời xong nghe từ và đọc quy tắc. Bộ 22 từ trong `SANDHI_DRILL` (`lib/pinyin.ts`): 10
từ với 一 (kể cả 第一, 十一 giữ yī), 7 từ với 不, 5 từ hai thanh 3. Một lượt chia đều ba quy tắc. Test kiểm từng
đáp án đúng theo quy tắc (thanh của chữ sau quyết định 一, 不; chữ đầu của cặp 3 + 3 thành thanh 2).
