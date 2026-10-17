# Tham khảo các web học ngoại ngữ khác (17/10/2026)

**User**: "Xem tham khảo các web học tiếng nổi tiếng khác ngoài Duolingo, ELSA, Memrise." Định
hướng sản phẩm: VocaStudy là nơi người Việt học **nhiều** ngoại ngữ, không chỉ tiếng Anh.

## Cách làm

- Công cụ: [REA](https://github.com/morluto/rea) `rea-agents@6.5.0`, chạy bằng CLI.
  - Mỗi trang được mở trong một Chrome riêng, profile tạm, chỉ nghe ở `127.0.0.1`.
  - `inspect-web-page` chụp cấu trúc trang và cây accessibility (tiêu đề, link).
  - `analyze-web-bundle` đọc tĩnh các file JS mà trang tải về, để nhận ra framework.
- Chỉ xem **trang giới thiệu công khai**: không đăng nhập, không bấm, không chép code hay
  nội dung.
  - Một số đoạn mô tả được đọc thêm bằng trình duyệt thường (TTMIK, Du Chinese).
  - Pleco từ chối phiên quan sát (`target_not_allowed`), nên không có dữ liệu.
- Giới hạn:
  - REA chỉ giữ một phần chữ của trang. Những gì nằm sau đăng nhập không thấy được.
  - Các ý ghi **[PRIOR]** là hiểu biết sẵn có về sản phẩm đó, chưa kiểm chứng trong lần quét
    này.

| Web                  | Evidence trang / bundle                 | Công nghệ REA nhận ra   |
| -------------------- | --------------------------------------- | ----------------------- |
| Busuu                | `ev_e8327f54163a…` / `ev_7987e92c8a8a…` | Next.js, React, webpack |
| LingQ                | `ev_d65e3ae97e89…` / `ev_43211ca243d7…` | –                       |
| Clozemaster          | `ev_3bf5b7dc9820…` / `ev_11eae4a4b7f7…` | React                   |
| HelloChinese         | `ev_f54745c07f70…` / `ev_c875a272940d…` | –                       |
| Migii                | `ev_b03e22366279…` / `ev_d5abd9d1facc…` | –                       |
| MochiMochi           | `ev_8618b8949eb2…` / `ev_0f44d9e56576…` | –                       |
| LingoDeer            | `ev_223cf1717ff9…` / `ev_e61ca9f4e16f…` | Vite, Vue               |
| Babbel               | `ev_68a1e0a3fccb…` / `ev_4cbea42f4b00…` | Next.js, React          |
| Drops                | `ev_0420bda164e0…` / `ev_0d9c28a92eac…` | –                       |
| Cake                 | `ev_3fbebc98c8ac…` / `ev_a88cf55a8b74…` | –                       |
| Talk To Me In Korean | `ev_88b091bf041e…` / `ev_3e34772dd576…` | –                       |
| Prep                 | `ev_6ae656b30426…` / `ev_17e156ad452e…` | –                       |
| Du Chinese           | `ev_b62906acddd8…` / `ev_09cf18a4631b…` | –                       |

## Mỗi web làm gì nổi bật

- **Busuu**: 14 ngôn ngữ trong menu.
  - Đầu trang chủ là ô chọn "Tôi muốn học…".
  - Mỗi ngôn ngữ có trang riêng ("Learn Korean online"…).
  - Nhấn mạnh "người thật": cộng đồng chữa bài, gia sư.
- **Babbel**: trang chủ có mục "Bạn muốn học ngôn ngữ nào?" và một trang chuyên đề cho từng
  ngôn ngữ (Spanish Learning Hub). Bài học ngắn, hướng tới nói sớm.
- **Clozemaster**: hơn 50 ngôn ngữ, cùng một cách học: xem câu thật, điền chỗ trống, lên mức
  thành thạo. Trang chủ cũng hỏi "Bạn đang học ngôn ngữ nào?".
- **Drops**: hơn 55 ngôn ngữ.
  - Phiên học ngắn bằng hình ảnh, có từ điển hình ảnh.
  - Vừa mở rộng sang ngữ pháp và luyện nói cho hội thoại.
- **LingQ**: học qua nội dung thật (tin tức, phim, chủ đề).
  - Có tiện ích trình duyệt để nhập bài đọc bất kỳ.
  - Từ gặp khi đọc được lưu lại để ôn **[PRIOR]**.
- **Du Chinese**: thư viện truyện chia 6 cấp.
  - Chạm vào từ là ra nghĩa, có giải thích ngữ pháp ngay trong bài.
  - **Lưu từ chưa biết vào thẻ ôn**.
  - "Khoá học" nhắc lại từ mới qua nhiều ngữ cảnh.
  - Có lời gợi ý bắt đầu bằng pinyin nếu chưa đọc được chữ.
- **Talk To Me In Korean**: mỗi bài học 4 bước (khởi động, học, **nói thành tiếng**, ôn
  nhanh).
  - **Bài kiểm tra trình độ 3 phút** để biết nên bắt đầu từ đâu.
  - Lộ trình từ Hangul đến nâng cao.
- **LingoDeer**: tập trung vào ngôn ngữ châu Á (Nhật, Hàn, Trung, Thái, cả tiếng Việt).
  Giải thích ngữ pháp kỹ, có truyện.
- **Cake**: tiếng Anh và tiếng Hàn qua clip ngắn, "10 phút mỗi ngày".
- **Migii** (Việt Nam): luyện thi JLPT, HSK/HSKK, TOPIK/EPS-TOPIK, TOEIC; có cộng đồng người
  luyện thi.
- **Prep** (Việt Nam): luyện thi IELTS, TOEIC, VSTEP, HSK, HSK 3.0; có lộ trình cá nhân hoá
  và AI chấm bài.
- **MochiMochi** (Việt Nam): mỗi ngôn ngữ một app riêng (MochiVocab, MochiKana, MochiKanji,
  Mochi Chinese…).
  - Có tiện ích tra từ trên trình duyệt.
  - Nhấn mạnh thói quen học mỗi ngày.

## Điều rút ra cho VocaStudy

1. **Web nhiều ngôn ngữ đều hỏi ngay "Bạn muốn học ngôn ngữ nào?"** (Busuu, Babbel,
   Clozemaster, Cake).
   - VocaStudy chỉ có một dòng nhỏ "Hoặc học tiếng Hàn · tiếng Trung" dưới nút chính.
   - Đây là điểm khớp nhất với định hướng "học nhiều ngôn ngữ".
2. **Đối thủ Việt chia mỗi ngôn ngữ thành một app riêng** (Mochi) hoặc đi theo hướng luyện
   thi (Migii, Prep).
   - VocaStudy khác ở chỗ: **một app, một cách học, nhiều ngôn ngữ, giải thích bằng tiếng
     Việt**. Đây nên là thông điệp chính.
3. **Luyện thi là thứ người Việt sẵn sàng trả tiền** (Migii, Prep đều có HSK và TOPIK).
   - VocaStudy đã có đủ 150 từ HSK 1, nhưng chưa nói ra theo cách người luyện thi tìm kiếm.
4. **Đọc → lưu từ → ôn** (Du Chinese, LingQ): VocaStudy có truyện và có chạm để xem nghĩa,
   nhưng chưa có nút đưa từ đó vào lịch ôn.
5. **Biết bắt đầu từ đâu** (bài kiểm tra trình độ của TTMIK): gói tiếng Anh có 4.440 từ, người
   đã biết kha khá vẫn phải học lại từ đầu danh sách.
6. **Busuu và Babbel dùng Next.js** để mỗi trang ngôn ngữ có HTML sẵn cho Google.
   - VocaStudy là SPA. Nếu làm trang riêng cho từng ngôn ngữ để lên Google, cần render sẵn
     (prerender) các trang đó.

## Đề xuất, xếp theo giá trị trên công sức

| #   | Việc                                                                   | Học từ                           | Công sức  | Trạng thái         |
| --- | ---------------------------------------------------------------------- | -------------------------------- | --------- | ------------------ |
| 1   | Mục "Bạn muốn học ngôn ngữ nào?" trên trang chủ, sinh từ `index.json`  | Busuu, Babbel, Clozemaster, Cake | nhỏ       | **làm ngày 17/10** |
| 2   | Nút "Lưu để học" trong hộp nghĩa khi đọc truyện                        | Du Chinese, LingQ, Readlang      | vừa       | **làm ngày 17/10** |
| 3   | Kiểm tra trình độ 3 phút: chọn chỗ bắt đầu của bài Học                 | TTMIK, Lingvist                  | vừa       | **làm ngày 17/10** |
| 4   | Lộ trình HSK 1 / TOPIK I: tiến độ theo danh sách thi, kiểm tra từ vựng | Migii, Prep                      | vừa → lớn | **làm ngày 17/10** |
| 5   | Bước "nói thành tiếng" trong bài ngữ pháp                              | TTMIK                            | vừa       | **làm ngày 17/10** |
| 6   | Trang riêng cho từng ngôn ngữ (render sẵn để lên Google)               | Busuu, LingoDeer, Drops          | lớn       | cần bạn quyết      |
| 7   | Tiện ích trình duyệt tra từ / nhập bài đọc                             | LingQ, Mochi                     | lớn       | để sau             |

Không đề xuất: cộng đồng, bootcamp, gia sư. Những thứ đó cần người kiểm duyệt và vận hành
liên tục.

## Vòng 2 (tối 17/10): tập trung vào việc #2 và #3

Cũng chỉ xem trang giới thiệu công khai, bằng REA (sau khi khởi động lại thì có cả công cụ
MCP).

**Nguyên tắc: chỉ tham khảo, không làm giống hệt.** Mỗi ý lấy từ web khác phải được viết
lại theo cách học sẵn có của VocaStudy.

| Web           | Evidence trang / bundle                 | Ý đáng chú ý                                                                          |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
| Readlang      | `ev_35aa4316f499…` / `ev_1dc0f84318ce…` | Bấm để dịch. Mọi từ đã dịch được lưu lại, ôn bằng thẻ                                 |
| Lingvist      | `ev_a9a331ba5b69…` / `ev_c942de3f6702…` | Thuật toán xếp người học vào đúng trình độ; học từ thông dụng trước; 10 phút mỗi ngày |
| Glossika      | `ev_48eab5f9d04a…` / `ev_b5c4218eb64c…` | Lộ trình theo trình độ và sở thích; luyện cả câu; chế độ "rảnh tay"                   |
| Speak         | `ev_9ddf7e7d5109…` / `ev_03c8585ddde8…` | Lấy nói làm trung tâm; nói lại cho tới khi tự tin                                     |
| Lingopie      | `ev_0ce61fe4225f…` / `ev_bf4d03b81a5e…` | Học qua phim; nội dung chia theo cấp                                                  |
| Hanzii (VN)   | `ev_b6915bda6e07…` / `ev_64c5a348af9c…` | Từ điển Trung, có danh sách từ theo chủ đề                                            |
| Dungmori (VN) | `ev_11094099d224…` / `ev_26981190f327…` | Luyện thi JLPT, lớp Zoom, kho từ vựng                                                 |

Mondly trả lỗi `403 Forbidden` cho trình duyệt quan sát. Tôi bỏ qua, không tìm cách vượt.

**Việc #2 đã làm theo cách riêng** (`docs/design/saved-words.md`):

- Readlang tự lưu mọi từ được bấm. VocaStudy chỉ lưu khi người học bấm "Lưu để học", vì
  chạm vào từ nhiều khi chỉ để chắc nghĩa.
- Readlang và Du Chinese đưa từ vào thẻ ôn rời. Ở VocaStudy, từ đã lưu đi qua bài Học sẵn
  có: làm quen → tự nhớ lại → lịch ôn ngắt quãng.

**Việc #3 (gợi ý cho lần sau):** Lingvist và TTMIK cho thấy người học cần được xếp đúng
trình độ. Cách hợp với VocaStudy là một bài kiểm tra nhanh bằng chính dạng câu hỏi nhớ lại
của app, trên từ lấy mẫu theo từng nấc độ khó. Không dùng tự khai "biết / không biết".

## Cài REA

- Đăng ký MCP `rea` ở cấp người dùng trong `~/.claude.json`.
  - Lệnh được ghim vào Node 22, vì REA cần Node ≥ 22.19 mà Node mặc định của máy là 20.
  - `rea doctor --client claude_code` báo `aligned`.
- Skill ở `~/.claude/skills/reverse-engineer-anything`.
- **Phải khởi động lại Claude Code** thì các công cụ MCP của REA mới hiện trong phiên. Trước
  đó vẫn dùng được CLI `rea`.
- Chrome dùng để quan sát là profile tạm, đã tắt sau khi quét.

## Vòng 3 (tối 17/10): Duolingo, ELSA, Memrise

Hai vòng trước bỏ qua ba web này, vì yêu cầu ban đầu là tìm các web "khác với" chúng. Khi
được hỏi lại thì quét luôn, cũng chỉ trang giới thiệu công khai. Nội dung trong app của cả
ba đều cần đăng nhập, nên không xem.

| Web        | Evidence trang / bundle                 | Ý đáng chú ý                                                                                   |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Duolingo   | `ev_999b6a4a61ee…` / `ev_ab742023866f…` | "Free. fun. effective.", bài ngắn, điểm và cấp độ; tách riêng Duolingo English Test            |
| ELSA Speak | `ev_4b355c8d6d0a…` / `ev_2e808e59035c…` | Chấm phát âm bằng AI, phản hồi tức thì; chia theo nhóm người học (đi làm, phỏng vấn, du lịch…) |
| Memrise    | `ev_1e36c37f1cae…` / `ev_0d926ee6fddb…` | "Nghe – học – nói theo" bằng video người bản xứ; chọn trong hơn 145 ngôn ngữ                   |

**Việc #3 đã làm theo cách riêng** (`docs/design/placement.md`):

- Không hỏi tự khai "biết / không biết". Bài dùng câu chọn nghĩa có sẵn của app, thêm nút
  "Tôi chưa biết từ này" để khỏi đoán bừa.
- Các mức có ranh giới 25, 50, 100, 200… từ, nên người mới học cũng được xếp chính xác.
- Kết quả chỉ đổi chỗ bắt đầu của bài Học. App không đánh dấu từ nào là đã thuộc, nên số
  liệu và lịch ôn vẫn trung thực.

## Vòng 4 (18/10): xem bên trong Duolingo và Memrise khi đã đăng nhập

**Cách làm**

- Mở một cửa sổ Chrome riêng: profile tạm, cổng điều khiển chỉ nghe ở `127.0.0.1`.
- **Chủ dự án tự đăng nhập** vào Duolingo, Memrise và ELSA rồi tự làm một bài trên mỗi web.
  Mật khẩu không đi qua công cụ nào.
- REA (`inspect-web-page`) chụp cấu trúc màn hình mỗi vài giây, chỉ đọc, không bấm.
  - REA không lưu cookie, giá trị lưu trữ hay header đăng nhập.
  - Bản chụp chứa trang của tài khoản người dùng, nên **đã xoá sau khi rút ra kết luận**. Chỉ
    giữ Evidence ID.
- Sau đó đóng cửa sổ và xoá profile tạm, phiên đăng nhập trong đó cũng mất theo.
- ELSA: trên web không vào được phần học (chủ yếu là app điện thoại), nên không có dữ liệu.

**Duolingo** (trang `/learn`: `ev_d78097efbba8…`; bài học: 18 màn, ví dụ `ev_d7b7485d5403…`,
`ev_82efd9b6f16f…`, `ev_a0bc9cd1f27c…`, `ev_87365400fcde…`, `ev_0fe6ac10f71b…`,
`ev_e5def540ad9b…`)

- **Lộ trình:**
  - chia theo Phần → Cửa;
  - mỗi phần có nút "Hướng dẫn" (sổ tay của phần đó) và "Học vượt?" (kiểm tra để bỏ qua
    phần đã biết);
  - bên cạnh có nhiệm vụ hằng ngày, giải đấu tuần, tim (mạng) và mục Phát âm.
- **Trong bài:**
  - từ mới gắn nhãn "TỪ MỚI";
  - các dạng câu: chọn nghĩa, xếp chữ để dịch, hoàn thành hội thoại, nghe rồi điền;
  - đáp án có phím tắt 1/2/3;
  - có nút "Hiện không nghe được" để tạm bỏ câu nghe.
- **Phản hồi:**
  - "Tuyệt vời!" kèm "5 lần liên tiếp", và hai nút "Quá dễ" / "Quá khó";
  - sai thì mất một tim.
- **Cuối bài:**
  - "Cùng xem lại những câu chưa đúng nhé!" rồi hỏi lại các câu sai (nhãn "LỖI SAI CŨ");
  - sau đó là màn chọn mục tiêu chuỗi 7/14/30/50 ngày, kèm cảnh báo chuỗi về 0 nếu mai quên
    học.

**Memrise** (trang chủ: `ev_7e60a69a9d65…`; lượt học: 13 màn, ví dụ `ev_3feaa4cbfd86…`,
`ev_fd4a7c13455d…`, `ev_1d522b6bd932…`, `ev_1b23a6cfecb7…`, `ev_4203515257f4…`)

- **Trang chủ** tách việc ôn theo kỹ năng: "Học từ mới", "Nghe các từ đã học", "Dùng các
  từ đã học", có điểm để lên cấp và mục "Bạn thân AI" (ghép câu, hội thoại).
- **Thẻ từ mới:**
  - nghe hai giọng hoặc video người bản xứ;
  - nút **"Tôi đã biết từ này"**;
  - nút "đánh dấu từ khó" để luyện nhiều hơn;
  - **nói thử ngay trên thẻ**: xin quyền micro → ghi âm → "Không hề tệ, hãy thử lại để hoàn
    thiện hơn nhé!".
- **Dạng câu:**
  - gõ bản dịch bằng các chữ cái cho sẵn, có nút "Gợi ý";
  - xếp ô chữ thành câu, có ô gây nhiễu và nút "Tôi không biết".
- **Cuối lượt:**
  - màn "Kỷ lục học đã dài ra" kèm lịch tuần;
  - tóm tắt thay đổi: điểm +6, từ đã thành thạo +2.

**Đã làm theo cách riêng**

- "Mình biết từ này rồi" trên thẻ làm quen (`docs/design/learning-depth.md`). Khác Memrise:
  từ đó không tính là đã thuộc, mà được hỏi lại sau 5 ngày.

**Gợi ý cho lần sau** (cả 4 đã làm ngày 18/10, xem `docs/design/learning-depth.md`), xếp theo giá
trị trên công sức:

1. "Tạm thời không nghe được" trong Ôn tập và Quiz, cho người đang ở nơi công cộng: đổi câu
   nghe thành câu đọc trong 15 phút. Học từ Duolingo.
2. Tóm tắt cuối buổi theo thay đổi: "đã thuộc +2, ôn tiếp +3", thay vì chỉ số câu đúng. Học
   từ Memrise.
3. Nói thử ngay trên thẻ làm quen, dùng lại bộ chấm một từ có sẵn. Học từ Memrise.
4. "Kiểm tra để bỏ qua bộ từ này" trong danh sách bộ từ, dùng lại `bandQuestions` của bài
   kiểm tra trình độ. Học từ "Học vượt?" của Duolingo.

**Không làm**: tim / mạng và cảnh báo mất chuỗi. Hai cơ chế này phạt người học, trái với giá
trị "động viên, không chê trách" của VocaStudy. Chuỗi ngày học của VocaStudy đã có khiên bảo
vệ.
