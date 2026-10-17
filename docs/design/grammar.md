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
