# Ngữ pháp căn bản (`/grammar`)

Tính năng thứ hai vượt ra ngoài từ vựng. Tính năng thứ nhất là Mẫu câu giao tiếp.

**User** (người mới học): "Biết nhiều từ rồi mà ghép câu vẫn sai: quên is/are, quên thêm
-s, nói 'I have 20 years old'. Cần ai đó giải thích thật dễ hiểu bằng tiếng Việt."

**BA**

- Có 12 bài cho người mới (trình độ A1–A2):
  - to be;
  - các thì: hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn, tương lai (will / be going
    to);
  - a / an / the;
  - số nhiều, danh từ đếm được và không đếm được;
  - đại từ và sở hữu;
  - in / on / at;
  - so sánh hơn và so sánh nhất;
  - can / must / should;
  - câu hỏi.
- Mỗi bài gồm các phần:
  - **Cách dùng**, giải thích bằng tiếng Việt;
  - **Công thức** (+ / − / ?);
  - **Ví dụ** có nút nghe;
  - **Lỗi người Việt hay gặp** (sai → đúng → vì sao);
  - **Luyện tập** 9 câu: 6 câu chọn từ điền chỗ trống (có giải thích sau mỗi câu) và 3 câu
    xếp từ thành câu.
- Đạt 80% thì bài được đánh dấu là xong. App giữ điểm cao nhất của mỗi bài.
  - Luyện tập được cộng XP và tính vào chuỗi ngày học.
  - Không đụng tới lịch ôn từ vựng.
- Vào trang này từ thanh bên (máy tính) và menu tài khoản (điện thoại).
- Tiến độ chỉ lưu trên máy, giống Mẫu câu. Chính sách bảo mật và Điều khoản đã ghi rõ
  điều này, và file sao lưu có chứa tiến độ.

**Dev**

- Dữ liệu nằm ở `public/data/grammar/en.json`. Phần giải thích viết bằng tiếng Việt,
  tiêu đề có cả hai ngôn ngữ.
- `lib/grammar.ts` (thuần, có test):
  - `validateGrammarPack` kiểm tra: mỗi câu chọn phải có `___`, đáp án nằm trong các lựa
    chọn, các lựa chọn không trùng nhau; mỗi câu xếp từ có 3–10 từ;
  - `buildGrammarRound` xáo thứ tự câu hỏi và các lựa chọn, đáp án đi theo đúng lựa chọn;
  - `recordAttempt` giữ điểm cao nhất; `grammarXp` cùng thang với Mẫu câu.
  - Test kiểm tra mọi bài trong gói phát hành đều có đủ ví dụ, lỗi hay gặp và cả hai loại
    bài tập.
- Lưu trữ: `store/grammarStore.ts`, khoá `vocab.grammar.v1`.
- Giao diện: `features/grammar/Grammar.tsx` (danh sách bài, bài học, luyện tập).
  - Ô xếp từ dùng chung với Mẫu câu qua `components/BuildTiles.tsx` (tách ra từ
    `Phrases.tsx`).
  - Ví dụ chưa có audio ghi sẵn nên đọc bằng giọng của trình duyệt (`SpeakButton`). Có
    thể tạo audio edge-tts sau, giống `generate_phrase_audio.py`.
- Lỗi đã gặp khi làm:
  - danh sách bài tràn ngang 548 px vì chữ `truncate` nằm trong ô grid
    (`grid-cols-1` + `min-w-0` đã sửa);
  - nút Luyện tập để trong `.session-actions` bị thanh điều hướng dưới che, nên đã chuyển
    về vị trí bình thường trong trang.

## Tiếng Hàn (15/10/2026)

- `public/data/grammar/ko.json` có 7 bài A1:
  - 이에요/예요 ("là");
  - các tiểu từ 은/는, 이/가, 을/를, 에/에서;
  - đuôi lịch sự -아요/-어요;
  - phủ định bằng 안.
- Cách trình bày giống bài tiếng Anh: giải thích bằng tiếng Việt, mẫu câu, ví dụ, lỗi hay
  gặp, ít nhất 5 bài luyện. Trường `en` chứa câu tiếng Hàn, theo cách đặt tên của gói.
- Phần lớn câu chọn tiểu từ phụ thuộc một quy tắc: danh từ có kết thúc bằng phụ âm (받침)
  hay không. Test `grammar.test.ts` tự tính 받침 từ mã Unicode của khối chữ cuối và đối chiếu
  với đáp án của từng câu (hiện có 20 câu). Nhờ vậy viết nhầm 은 thành 는 sẽ bị bắt ngay.
- Giọng đọc ví dụ lấy theo gói (`pack.meta.ttsLang`), không còn cố định `en-US`.
- `/grammar` mở cho tiếng Hàn qua `lib/packContent.ts`. Mô tả ở trang Luyện tập không còn
  liệt kê chủ đề riêng của tiếng Anh.

## Tiếng Hàn A2 (17/10/2026)

- Thêm 4 bài A2, tổng cộng 11 bài:
  - quá khứ -았/었어요;
  - muốn làm gì -고 싶어요 (kèm nghĩa "nhớ" của 보고 싶어요);
  - dự định -(으)ㄹ 거예요;
  - phủ định dài -지 않아요.
- Nguồn nay nằm trong repo ở `scripts/build_grammar_ko.py`. Bản nguồn cũ ở thư mục tạm đã mất
  khi máy khởi động lại, nên script được sinh lại từ `grammar/ko.json`; nó tái tạo đúng nội
  dung 7 bài cũ.
- Script kiểm tra trước khi ghi file:
  - câu chọn tiểu từ khớp với 받침 của danh từ;
  - câu có chỗ trống;
  - câu xếp dài 3–10 từ;
  - mỗi bài có ít nhất 5 bài luyện.

## Nói thành tiếng (17/10/2026)

**User**: "Làm bài trắc nghiệm ngữ pháp thì đúng, mà mở miệng nói vẫn ngập ngừng."

Tham khảo: mỗi bài học của Talk To Me In Korean có 4 bước: khởi động, học, **nói thành
tiếng**, ôn nhanh (`docs/research/2026-10-17-language-apps.md`). VocaStudy không làm giống
hệt: không thêm màn hình riêng, chỉ thêm một mục giữa phần giải thích và bài luyện. Thứ tự
thành: hiểu → nói → luyện.

**BA**

- Mục "Nói thành tiếng" nằm sau "Lỗi người Việt hay gặp", trước nút "Luyện tập". Mục có 3 câu
  ví dụ đầu tiên của bài.
- Mỗi câu có nút nghe mẫu và nút micro. Nói xong, app hiện:
  - điểm: "Rất tốt" từ 85%, "Khá tốt" từ 60%, dưới đó là "Thử lại nhé";
  - câu mẫu, tô đỏ những chữ máy chưa nghe ra;
  - "Máy nghe được: …".
- Mỗi lúc chỉ một micro mở. Bấm vào câu khác thì câu đang nghe dừng lại.
- Trình duyệt không chấm được giọng nói (Firefox) thì hiện lời giải thích. Người học vẫn
  nghe mẫu và đọc theo được.
- Không lưu điểm, không cộng XP, không lưu ghi âm. App dùng nhận dạng giọng nói của trình
  duyệt, giống trang Luyện nói; trang Quyền riêng tư đã ghi điều này, và mục có link tới đó.

**Dev**

- `lib/sentenceScore.ts` chấm cả câu. `lib/pronunciation.ts` chỉ chấm một từ.
  - Đơn vị so sánh tuỳ chữ viết (`unitFor(ttsLang)`):
    - tiếng Anh so từng từ;
    - tiếng Hàn so từng âm tiết, vì máy nhận dạng đặt khoảng trắng khác sách;
    - tiếng Trung so từng chữ.
  - Điểm: 0,8 × phần câu mẫu nghe được (theo dãy con chung dài nhất, giữ đúng thứ tự) +
    0,2 × phần lời nói khớp với câu mẫu. Nói thêm vài chữ thừa chỉ bị trừ nhẹ.
  - Quy về cùng một dạng trước khi so:
    - dạng viết tắt tiếng Anh (doesn't = does not, I'm = I am);
    - số tiếng Anh từ 0–99 (twenty = 20);
    - số viết bằng chữ số trong tiếng Trung (3 → 三, 25 → 二十五).
  - Chưa xử lý số trong tiếng Hàn. Hàn có hai hệ số đếm, "3" có thể là 셋 hoặc 삼.
- `features/grammar/SpeakAloud.tsx`:
  - dùng `listenOnce` của `lib/speech.ts` với `ttsLang` của gói;
  - nhận dạng giọng nói thật không chạy được trong test, nên test thay nó bằng bản giả.
- **Chưa kiểm tra bằng giọng nói thật.** Khung trình duyệt dùng để kiểm tra chặn micro. Cần
  thử trên Chrome điện thoại với cả 3 ngôn ngữ.

## Ôn ngữ pháp theo lịch (20/10/2026)

**User**: "Tiếp tục cho mình". Hướng đã đề xuất là đưa bài ngữ pháp vào lịch ôn như từ vựng.

Hiện bài ngữ pháp đạt 80% là "xong" mãi mãi: không có gì nhắc người học làm lại. Trong khi đó một
mẫu câu không dùng tới cũng quên nhanh như một từ.

**BA**

- Bài đạt từ 80% có lịch ôn: sau **3, 7, 21, rồi 60 ngày**. Mỗi lần ôn đạt, bài giãn sang mốc kế
  tiếp; tới 60 ngày thì giữ ở 60 ngày.
- Luyện lại khi **chưa đến hạn** thì lịch giữ nguyên, để luyện thêm không bị phạt.
- Ôn **trượt** (dưới 80% khi đã đến hạn): bài quay lại vào ngày hôm sau. Lần đạt kế tiếp bắt đầu lại
  từ mốc 3 ngày. Điểm cao nhất vẫn giữ, nên bài vẫn tính là đã học.
- **Trang chủ** có thẻ "Ôn ngữ pháp" khi có bài đến hạn: số bài, tối đa 3 bài, bài quá hạn lâu nhất
  đứng đầu. Chạm một bài là mở bài đó. Không có bài nào đến hạn thì thẻ ẩn.
- **Danh sách bài** gắn nhãn "Đến hạn ôn" thay cho dấu tích. **Trong bài** có dòng nhắc làm lại
  phần luyện tập.
- Bản ghi lưu từ trước khi có lịch ôn vẫn dùng được: hạn ôn tính bằng ngày làm cuối cộng 3 ngày.

**Dev**

- `lib/grammar.ts`:
  - `GrammarRecord` thêm `step` (bậc trên `REVIEW_DAYS`; -1 là đang học lại) và `due`;
  - `REVIEW_DAYS`, `dueDay(rec)`, `dueUnits(progress, ids, day)`;
  - lịch ôn được tính trong `recordAttempt`.
- `features/grammar/GrammarReviewCard.tsx` đặt trên trang chủ (`Dashboard.tsx`). Thẻ tải gói ngữ
  pháp của ngôn ngữ đang học, chỉ với gói có ngữ pháp.
- Dữ liệu vẫn ở `vocab.grammar.v1` trên máy, nên nằm trong file sao lưu. Chỉ thêm trường, không
  đổi phiên bản lưu.
- Test: `lib/grammar.test.ts` (lịch ôn, ôn trượt, bản ghi cũ, thứ tự đến hạn),
  `GrammarReviewCard.test.tsx`.

## Tiếng Hàn: bài 못 và -(으)세요 (20/10/2026)

Hai điểm người mới gặp ngay ở trình độ TOPIK I, bổ sung vào 11 bài cũ (tổng 13 bài):

- **못** (`ko-mot`):
  - "không thể", khác 안 "không": 안 가요 là không đi, 못 가요 là không đi được;
  - với danh từ + 하다 thì 못 đứng ngay trước 해요;
  - dạng dài -지 못해요;
  - cách đọc 못 가요 [몯까요], 못 먹어요 [몬머거요].
- **-(으)세요** (`ko-seyo`): lời mời, nhờ lịch sự.
  - 세요 sau gốc không có patchim, 으세요 sau gốc có patchim;
  - gốc tận cùng ㄹ thì bỏ ㄹ (만들다 → 만드세요);
  - dạng kính ngữ riêng: 드세요, 주무세요, 계세요.
- Câu chọn chỉ đưa ra phương án chắc chắn sai (sai trật tự, sai patchim). Không đưa ra phương án
  chỉ khác sắc thái: "바빠서 안 가요" vẫn đúng ngữ pháp, nên không dùng làm phương án sai.
- Dữ liệu viết trong `scripts/build_grammar_ko.py`. Script kiểm tra chỗ trống, độ dài câu xếp chữ và
  patchim của các cặp trợ từ.
