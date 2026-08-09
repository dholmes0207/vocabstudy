# KẾ HOẠCH DỰ ÁN — VocabStudy

> **Website học & ôn từ vựng đa ngôn ngữ**, khởi đầu với **1000 từ tiếng Anh thông dụng** (chuẩn Oxford & Cambridge) dành cho **người Việt học tiếng Anh**.
>
> Tài liệu này được xây dựng theo đúng quy trình 3 vai mà bạn yêu cầu:
> **(1) Người học mới** đưa ra mong muốn → **(2) Business Analyst** phân tích & thiết kế nghiệp vụ → **(3) Solution Architect / DEV** thiết kế kỹ thuật.
> Phần cuối là **tổng hợp quyết định** đã chốt cho bản build thực tế.

---

## 0. Tóm tắt điều hành (Executive Summary)

**Vấn đề:** Người Việt mới học tiếng Anh dễ bỏ cuộc vì học xong quên, không biết phát âm, không biết dùng từ trong câu, không theo dõi được tiến độ và không biết học bao nhiêu là đủ.

**Giải pháp:** Một website **hoàn toàn client-side** (không đăng nhập, không backend, chạy được offline sau lần tải đầu) áp dụng 4 trụ cột phương pháp trong tài liệu gốc:

| Trụ cột (từ tài liệu) | Cách hiện thực trong sản phẩm |
|---|---|
| **Lặp lại ngắt quãng (SRS)** — Ngày 1→2→5→14→30 | Engine SRS kiểu Leitner với đúng các mốc `[1, 2, 5, 14, 30]` ngày. Mỗi ngày app tự chọn danh sách "cần ôn hôm nay". |
| **Học theo ngữ cảnh & cụm từ** | Mỗi thẻ luôn kèm câu ví dụ Anh–Việt; quiz điền từ dùng chính câu ví dụ. |
| **Active Recall (10–15 từ/ngày)** | Flashcard tự đánh giá "Nhớ/Quên", quiz 4 dạng; mặc định giới hạn 15 từ mới/ngày. |
| **Học theo chủ đề / phân loại** | Chia 1000 từ thành các **bộ (deck) ~20 từ**; lọc theo **từ loại**; tra cứu toàn bộ. |

**Điểm nhấn:** phát âm bằng **Web Speech API (TTS)** (thay cho IPA còn trống trong nguồn), **dark mode**, **mobile-first**, **streak & tiến độ trực quan**, và kiến trúc **"language pack" JSON** để **mở rộng đa ngôn ngữ** không cần sửa logic.

**Dữ liệu:** đã trích xuất sạch **đúng 1000 từ** từ PDF (STT 1–1000, không trùng/thiếu) → `data/en.json` (bản gốc) và `public/data/en.json` (bản app dùng).

---

## PHẦN A — VAI 1: NGƯỜI HỌC MỚI (Mong muốn & yêu cầu)

*Góc nhìn ngôi thứ nhất của một người Việt mất gốc, ít thời gian, bắt đầu học lại tiếng Anh.*

### Bối cảnh & động lực của tôi

Mình tên là một người đi làm bình thường, tiếng Anh của mình gần như mất gốc. Hồi đi học mình có học nhưng học xong trả chữ cho thầy cô hết rồi, giờ nhìn vào một câu tiếng Anh là mình đọc bập bõm, nhiều từ đơn giản mà không nhớ nghĩa.

Mình muốn học lại từ vựng vì mấy lý do rất thật:
- Đi làm bây giờ hay gặp email, tài liệu, hoặc video tiếng Anh, mình muốn hiểu được kha khá mà không phải tra Google Dịch từng chữ.
- Mình muốn sau này tự tin hơn, đọc được tin tức, xem phim đỡ phải phụ đề tiếng Việt.
- Mục tiêu trước mắt của mình khiêm tốn thôi: nắm chắc khoảng 1000 từ thông dụng, biết đọc và biết đặt câu cơ bản.

Nhưng vấn đề lớn nhất là **mình rất ít thời gian**. Một ngày mình chỉ rảnh được tầm 10-15 phút, thường là lúc chờ xe, lúc nghỉ trưa, hoặc trước khi đi ngủ. Mình không thể ngồi 1-2 tiếng học nghiêm túc được. Nên mình cần một cách học **ngắn, gọn, mỗi ngày một chút** mà vẫn tiến bộ.

### Những khó khăn/nỗi đau khi học từ vựng

Mình đã thử học từ vựng nhiều lần rồi nhưng lần nào cũng bỏ dở, vì mấy nỗi đau này:

- **Học xong là quên.** Hôm nay mình chép 20 từ vào vở, thuộc vanh vách, mà 3 ngày sau nhìn lại không nhớ nổi một nửa. Mình không biết cách nào để nhớ lâu.
- **Không biết phát âm.** Nhìn chữ mình không biết đọc thế nào cho đúng. Phiên âm IPA thì mình nhìn cũng chịu, không hiểu mấy ký hiệu đó. Mình sợ đọc sai rồi quen miệng luôn.
- **Biết nghĩa nhưng không biết dùng.** Mình học từ "afford", biết nghĩa là "đủ khả năng chi trả", nhưng bảo đặt một câu thì mình đứng hình, không biết ghép với từ nào, dùng trong tình huống nào.
- **Mất động lực nhanh.** Học vài hôm đầu hăng lắm, rồi bận một hôm là bỏ, bỏ một hôm thành bỏ luôn. Không có gì kéo mình quay lại.
- **Không biết học bao nhiêu là đủ.** Mỗi ngày nên học mấy từ? Học nhiều quá thì ngợp, học ít quá thì thấy chậm. Mình muốn có người "chốt" giùm cho mình con số hợp lý.
- **Không theo dõi được tiến độ.** Mình học lộn xộn, không biết mình đã thuộc bao nhiêu từ, còn bao nhiêu từ chưa động tới, từ nào cần ôn lại. Cảm giác học mãi mà không thấy đích đâu, nản.
- **Không biết khi nào nên ôn lại.** Mình cứ học từ mới liên tục mà quên mất phải quay lại ôn từ cũ, nên từ cũ rơi rụng hết.

### Tôi muốn website làm được gì

Mình liệt kê cụ thể những thứ mình mong, cứ tưởng tượng mình đang dùng thật luôn nha:

- Tôi muốn **bấm vào cái loa để nghe phát âm** của từng từ, nghe được bao nhiêu lần tùy thích. Tốt nhất là nghe được cả từ lẫn nghe câu ví dụ đọc lên.
- Tôi muốn **học kiểu lật thẻ (flashcard)**: mặt trước là từ tiếng Anh, mình đoán nghĩa trong đầu, rồi lật ra xem nghĩa tiếng Việt với câu ví dụ ở mặt sau.
- Tôi muốn **mỗi ngày app tự chọn cho tôi 10-15 từ để học**, tôi không phải tự nghĩ hôm nay học từ nào. Cứ mở lên là có sẵn "bài học hôm nay".
- Tôi muốn **app tự nhắc hôm nay cần ôn lại những từ nào** theo lịch, kiểu "hôm nay bạn có 8 từ cần ôn". Từ nào tôi hay quên thì cho hiện lại nhiều hơn, từ nào thuộc rồi thì giãn ra, lâu lâu mới hỏi lại.
- Tôi muốn sau khi lật thẻ có nút để tôi **tự đánh giá "Tôi nhớ" / "Tôi quên"**, rồi app dựa vào đó mà xếp lịch ôn cho tôi (kiểu Ngày 1, Ngày 2, Ngày 5, Ngày 14, Ngày 30).
- Tôi muốn **luôn thấy câu ví dụ đầy đủ cả tiếng Anh lẫn tiếng Việt**, để tôi biết từ đó dùng trong câu như thế nào, chứ không chỉ học nghĩa trơ trọi.
- Tôi muốn thấy được **từ đó thường đi chung với những từ nào** (kiểu cụm hay dùng), để tôi nói/viết cho tự nhiên.
- Tôi muốn có **trò chơi hoặc quiz nho nhỏ cho đỡ chán**: ví dụ chọn nghĩa đúng trong 4 đáp án, nghe phát âm rồi đoán từ, hoặc ghép từ với nghĩa. Đúng thì có tiếng "ting" vui vui, sai thì chỉ ra đáp án đúng.
- Tôi muốn **thấy mình tiến bộ bao nhiêu %**: đã thuộc bao nhiêu từ trên tổng số, hôm nay học được mấy từ, một cái thanh tiến độ chạy lên cho tôi thấy sướng.
- Tôi muốn có **chuỗi ngày học liên tục (streak)** kiểu "bạn đã học 5 ngày liên tiếp", để tôi có động lực không bỏ ngày nào.
- Tôi muốn được **chia nhỏ 1000 từ thành từng bộ/deck khoảng 20 từ**, học xong bộ này mở khóa bộ kia, để tôi thấy rõ chặng đường và không bị ngợp.
- Tôi muốn **được nhóm từ theo từ loại (danh từ, động từ, tính từ)** hoặc theo chủ đề, để học có hệ thống hơn là học lung tung theo bảng chữ cái.
- Tôi muốn **tìm nhanh một từ bất kỳ** khi tôi tò mò, gõ vào ô tìm kiếm là ra.
- Tôi muốn app **tự nhớ tôi học tới đâu**, hôm sau mở lại là học tiếp chỗ cũ, không phải làm lại từ đầu (kể cả khi tôi tắt trình duyệt).
- Tôi muốn có một trang **ôn tập riêng cho những từ tôi hay sai / hay quên**, gom lại một chỗ để tôi luyện thêm.
- Tôi muốn app **dùng được cả khi mạng chập chờn**, vì nhiều lúc tôi học lúc đi đường.

### Kỳ vọng về cảm giác sử dụng

- **Đơn giản, mở lên là học được ngay.** Đừng bắt tôi đăng ký tài khoản, điền form, đọc hướng dẫn dài dòng. Vào phát là thấy nút "Bắt đầu học hôm nay".
- **Trực quan, không rối.** Mỗi màn hình chỉ nên có một việc chính để làm. Nút bấm to rõ, chữ đủ lớn để đọc, biết ngay phải bấm gì tiếp theo.
- **Dùng ngon trên điện thoại.** Vì tôi hay học lúc cầm điện thoại một tay, nên thao tác vuốt / bấm phải dễ, chữ không bị bé xíu, không phải phóng to thu nhỏ.
- **Nhìn đẹp, dễ chịu, hiện đại.** Màu sắc nhẹ nhàng, gọn gàng, có chế độ tối (dark mode) thì càng tốt vì tôi hay học buổi tối.
- **Nhanh, không giật lag.** Bấm loa là phát âm ra liền, lật thẻ là mượt, không phải chờ tải lâu.
- **Có chút vui, chút gamification** nhưng vừa phải: thanh tiến độ, huy hiệu, chuỗi ngày, tiếng động nhỏ khi trả lời đúng. Đủ để tôi thấy hào hứng chứ không lòe loẹt như game trẻ con.
- **Cho tôi cảm giác "mỗi ngày làm một chút là đủ rồi".** Học xong bài hôm nay thì có một màn hình khen ngợi nhẹ nhàng, kiểu "Xong rồi! Hẹn gặp lại ngày mai", để tôi thấy nhẹ nhõm và muốn quay lại.

### Điều khiến tôi bỏ cuộc (anti-features cần tránh)

Đây là mấy thứ mà nếu app có, chắc chắn tôi sẽ xóa hoặc không dùng nữa:

- **Bắt đăng ký/đăng nhập mới được học.** Tôi ngại nhất khoản này. Mới vào đã đòi email, mật khẩu là tôi thoát luôn.
- **Nhồi quá nhiều từ một lúc.** Nếu mỗi ngày bắt tôi học 50-100 từ, tôi ngợp và bỏ ngay. Ít mà đều mới bền.
- **Giao diện rối rắm, nhiều menu, nhiều nút không hiểu để làm gì.** Tôi không muốn phải học cách dùng app trước khi học tiếng Anh.
- **Chỉ có phiên âm IPA mà không có nút nghe.** Nhìn ký hiệu tôi chịu, phải có giọng đọc thật tôi mới học phát âm được.
- **Học vẹt nghĩa trơ trọi, không có ví dụ, không có ngữ cảnh.** Kiểu bảng từ - nghĩa khô khan là tôi học vào rồi quên ngay, chán chết.
- **Quảng cáo chen ngang, pop-up liên tục, hoặc đang học thì hiện bảng "nâng cấp trả phí".** Mất hết cảm hứng.
- **Bắt làm bài kiểm tra dài, khó, chấm điểm gắt.** Tôi học cho vui và tiến bộ, không phải để bị thi. Sai mà bị "phạt" nặng là tôi tự ti rồi nghỉ.
- **Không lưu tiến độ, mở lại là mất hết.** Nếu hôm nào cũng phải làm lại từ đầu thì tôi bỏ ngay.
- **Bắt học đúng thứ tự cứng nhắc, không cho bỏ qua hay quay lại.** Tôi muốn linh hoạt theo thời gian rảnh của mình.
- **Thông báo nhắc nhở làm phiền quá đà** (kiểu nhắc 5-6 lần một ngày, giọng điệu trách móc). Nhắc nhẹ nhàng một lần thôi, đừng làm tôi thấy áp lực.
- **Chữ nhỏ, nút bé, khó bấm trên điện thoại.** Bấm nhầm hoài là tôi bực rồi tắt.
- **Tải chậm, phát âm trễ, lật thẻ giật.** Tôi chỉ có 10 phút, lag là mất hết thời gian quý báu.

---

## PHẦN B — VAI 2: BUSINESS ANALYST (Phân tích nghiệp vụ)

*Chuyển hóa mong muốn của người học thành tầm nhìn sản phẩm, user story, yêu cầu chức năng, mô hình dữ liệu và lộ trình.*

### 1. Product Vision & Mục tiêu

Sản phẩm là một website học và ôn từ vựng tiếng Anh dành cho người Việt mới bắt đầu, hoạt động hoàn toàn phía client (không cần đăng nhập, không backend), lấy 1000 từ thông dụng chuẩn Oxford & Cambridge làm dữ liệu lõi. Sản phẩm áp dụng đúng bốn trụ cột phương pháp trong tài liệu gốc — lặp lại ngắt quãng (SRS), học theo ngữ cảnh/cụm từ, active recall, và học theo chủ đề — để biến việc "học vẹt" thành ghi nhớ dài hạn. Kiến trúc dữ liệu dạng "language pack" JSON cho phép mở rộng sang nhiều ngôn ngữ mà không phải viết lại logic học tập.

**Tuyên bố tầm nhìn:** *"Giúp mỗi người Việt tự tin làm chủ 1000 từ tiếng Anh thông dụng đầu tiên bằng phương pháp khoa học, miễn phí, dùng được mọi lúc kể cả offline — và trở thành nền tảng học từ vựng đa ngôn ngữ cho người Việt."*

### 2. Đối tượng người dùng (Persona)

| Persona | Mô tả | Nhu cầu chính | Bối cảnh dùng |
|---|---|---|---|
| **Minh — Học sinh cấp 3 (16 tuổi)** | Mất gốc từ vựng, chuẩn bị thi. Điện thoại là thiết bị chính. | Học nhanh 10-15 từ/ngày, có nhắc ôn, biết phát âm đúng. | 15-20 phút mỗi tối trên điện thoại, mạng chập chờn. |
| **Lan — Nhân viên văn phòng (28 tuổi)** | Muốn dùng tiếng Anh trong công việc, bận rộn, dễ bỏ cuộc. | Lịch ôn tự động, thấy tiến độ rõ ràng, học tranh thủ giờ nghỉ. | Vài phiên ngắn rải rác trong ngày, đa thiết bị (laptop + điện thoại). |
| **Cô Hà — Giáo viên / phụ huynh (40 tuổi)** | Cần công cụ đơn giản, đáng tin để tự học hoặc giới thiệu cho con. | Nội dung chuẩn, giao diện dễ, không cần cài đặt/đăng ký. | Trên laptop, ít rành công nghệ, ngại tạo tài khoản. |

### 3. Phạm vi MVP vs. Giai đoạn sau

#### Trong phạm vi MVP
- Duyệt/tìm 1000 từ tiếng Anh với đầy đủ các trường (word, pos, meaning, exampleEn, exampleVi).
- Chia bộ/deck ~20 từ; lọc theo từ loại (pos).
- Học bằng Flashcard (lật thẻ, đánh dấu Biết/Chưa biết).
- SRS với lịch Ngày 1 → 2 → 5 → 14 → 30.
- Quiz cơ bản (trắc nghiệm nghĩa, điền từ vào câu ví dụ).
- Phát âm bằng Web Speech API (TTS).
- Theo dõi tiến độ + streak cơ bản, lưu localStorage.
- Cài đặt (số từ mục tiêu/ngày, giọng đọc, sáng/tối).
- Responsive mobile-first, không cần đăng nhập.

#### Giai đoạn sau (Out of scope của MVP)
- Đa ngôn ngữ đầy đủ (thêm language pack thứ 2, ví dụ tiếng Nhật/Trung, và UI đa ngôn ngữ).
- Gán chủ đề (thematic) tự động/thủ công cho toàn bộ 1000 từ.
- Đồng bộ đám mây, tài khoản người dùng, học trên nhiều thiết bị.
- Chế độ nghe-chép, luyện phát âm chấm điểm (speech-to-text).
- Bảng xếp hạng, huy hiệu nâng cao, chia sẻ mạng xã hội.
- IPA tĩnh (khi nguồn được bổ sung trường ipa).
- PWA cài đặt về màn hình chính + offline nâng cao.
- Nhập/xuất tiến độ, sao lưu file.

### 4. User Stories & Tiêu chí chấp nhận

#### Epic A — Duyệt/Tìm từ

- **US-A1:** Là người học, tôi muốn xem danh sách toàn bộ từ vựng, để nắm được mình sẽ học những gì.
- **US-A2:** Là người học, tôi muốn tìm kiếm một từ theo chữ cái tiếng Anh hoặc nghĩa tiếng Việt, để tra cứu nhanh khi cần.
- **US-A3:** Là người học, tôi muốn lọc từ theo từ loại (n./v./adj....), để tập trung vào nhóm tôi đang yếu.
- **US-A4:** Là người học, tôi muốn xem chi tiết một từ (từ loại, nghĩa, câu ví dụ Anh–Việt), để hiểu cách dùng trong ngữ cảnh.

**Tiêu chí chấp nhận (US-A2):**
- Ô tìm kiếm lọc kết quả theo thời gian thực (không cần nhấn Enter).
- Tìm không phân biệt hoa/thường và bỏ dấu tiếng Việt (vd "meo" khớp "mèo").
- Khớp cả trường `word` lẫn `meaning`.
- Khi không có kết quả, hiển thị thông báo rõ ràng "Không tìm thấy từ".

#### Epic B — Học bằng Flashcard

- **US-B1:** Là người học, tôi muốn học một deck ~20 từ dưới dạng thẻ lật, để tập trung theo lô nhỏ.
- **US-B2:** Là người học, tôi muốn lật thẻ để xem nghĩa và câu ví dụ, để tự kiểm tra trí nhớ (active recall).
- **US-B3:** Là người học, tôi muốn đánh dấu "Đã biết / Chưa biết" cho mỗi thẻ, để hệ thống biết đưa từ nào vào lịch ôn.
- **US-B4:** Là người học, tôi muốn giới hạn phiên học ở 10-15 từ chất lượng/ngày, để không quá tải.

**Tiêu chí chấp nhận (US-B2 & US-B3):**
- Mặt trước hiển thị `word` + nút phát âm; mặt sau hiển thị `pos`, `meaning`, `exampleEn`, `exampleVi`.
- Lật thẻ được cả bằng nhấp/chạm và bằng phím Space.
- Hai lựa chọn "Đã biết"/"Chưa biết" luôn hiển thị ở mặt sau; sau khi chọn tự chuyển thẻ kế tiếp.
- Lựa chọn cập nhật ngay trạng thái SRS của từ và được lưu vào localStorage.
- Kết thúc phiên hiển thị tóm tắt: số từ đã học, số biết/chưa biết.

#### Epic C — Ôn tập theo SRS

- **US-C1:** Là người học, tôi muốn mỗi ngày được đưa đúng danh sách từ "đến hạn ôn", để ôn đúng lúc sắp quên.
- **US-C2:** Là người học, tôi muốn hệ thống giãn khoảng ôn theo lịch 1 → 2 → 5 → 14 → 30 ngày khi tôi trả lời đúng, để tiết kiệm thời gian với từ đã nhớ.
- **US-C3:** Là người học, tôi muốn từ trả lời sai được đặt lại về đầu chu kỳ, để ôn dày hơn cho từ khó.
- **US-C4:** Là người học, tôi muốn thấy số từ cần ôn hôm nay ngay ở trang chủ, để biết khối lượng công việc.

**Tiêu chí chấp nhận (US-C2 & US-C3):**
- Mỗi từ có bậc SRS (stage) ánh xạ khoảng cách ngày: [1, 2, 5, 14, 30].
- Trả lời đúng → tăng 1 bậc, tính `nextReviewDate = ngày hiện tại + khoảng của bậc mới`. Vượt bậc cuối → coi là "đã thuộc" (không lặp lại thường xuyên).
- Trả lời sai → đặt về bậc 1, `nextReviewDate = ngày mai`.
- "Đến hạn" xác định bằng `nextReviewDate <= hôm nay` (so theo ngày, không theo giờ).
- Khi mở app ở ngày mới, danh sách ôn được tính lại tự động dựa trên ngày hệ thống.

#### Epic D — Kiểm tra / Quiz (active recall)

- **US-D1:** Là người học, tôi muốn làm quiz trắc nghiệm chọn nghĩa đúng của từ, để kiểm tra nhớ chủ động.
- **US-D2:** Là người học, tôi muốn quiz điền từ còn thiếu vào câu ví dụ, để học từ trong ngữ cảnh.
- **US-D3:** Là người học, tôi muốn thấy đáp án đúng và giải thích ngay sau mỗi câu, để học từ lỗi sai.
- **US-D4:** Là người học, tôi muốn kết quả quiz ảnh hưởng đến lịch SRS, để việc kiểm tra và ôn tập gắn kết với nhau.

**Tiêu chí chấp nhận (US-D1):**
- Mỗi câu có 1 đáp án đúng và 3 phương án gây nhiễu lấy từ các từ khác cùng tập.
- Thứ tự phương án được xáo trộn ngẫu nhiên.
- Phản hồi đúng/sai hiển thị tức thì, có màu và biểu tượng rõ ràng (không chỉ dựa vào màu — kèm chữ/icon).
- Kết quả mỗi câu ghi vào `QuizResult` và cập nhật bậc SRS tương ứng (đúng/sai).
- Cuối bài hiển thị điểm số và danh sách các từ trả lời sai.

#### Epic E — Phát âm

- **US-E1:** Là người học, tôi muốn nghe phát âm của từ bằng một nút bấm, để đọc theo cho đúng.
- **US-E2:** Là người học, tôi muốn nghe cả câu ví dụ tiếng Anh, để nắm ngữ điệu và trọng âm.
- **US-E3:** Là người học, tôi muốn chọn giọng/tốc độ đọc, để phù hợp trình độ nghe của tôi.

**Tiêu chí chấp nhận (US-E1):**
- Nút phát âm gọi Web Speech API với `lang` = mã ngôn ngữ của language pack (vd `en-US`).
- Khi trình duyệt không hỗ trợ TTS, nút bị vô hiệu hóa kèm chú thích thay vì gây lỗi.
- Nhấn lại khi đang đọc sẽ dừng và đọc lại từ đầu (không chồng tiếng).
- Nút có nhãn/aria-label để hỗ trợ trình đọc màn hình.

#### Epic F — Theo dõi tiến độ & Gamification

- **US-F1:** Là người học, tôi muốn thấy tổng số từ đã học / đã thuộc trên tổng 1000, để cảm nhận tiến bộ.
- **US-F2:** Là người học, tôi muốn duy trì "streak" số ngày học liên tiếp, để có động lực học đều.
- **US-F3:** Là người học, tôi muốn thấy tiến độ hoàn thành theo từng deck, để biết nên học deck nào tiếp.
- **US-F4:** Là người học, tôi muốn nhận huy hiệu/cột mốc (vd học đủ 100 từ), để được khích lệ.

**Tiêu chí chấp nhận (US-F2):**
- Streak tăng 1 khi hoàn thành tối thiểu một hoạt động học/ôn trong ngày.
- Nếu bỏ lỡ trọn một ngày, streak về 0 (hiển thị nhẹ nhàng, không gây nản).
- Streak và mọi chỉ số tiến độ được lưu và khôi phục đúng từ localStorage sau khi tải lại.

#### Epic G — Cài đặt & Đa ngôn ngữ

- **US-G1:** Là người học, tôi muốn đặt mục tiêu số từ mới mỗi ngày (mặc định 10-15), để kiểm soát nhịp học.
- **US-G2:** Là người học, tôi muốn chuyển giao diện sáng/tối, để dễ nhìn theo môi trường.
- **US-G3:** Là người học, tôi muốn đặt lại toàn bộ tiến độ, để bắt đầu lại khi cần.
- **US-G4:** *(Giai đoạn sau)* Là người học, tôi muốn chọn ngôn ngữ đích để học (vd tiếng Anh, tiếng Nhật), để dùng cùng một app cho nhiều ngôn ngữ.
- **US-G5:** *(Giai đoạn sau)* Là người quản trị nội dung, tôi muốn thêm một language pack JSON mới đúng schema, để mở rộng ngôn ngữ mà không sửa mã nguồn.

**Tiêu chí chấp nhận (US-G4 & US-G5):**
- Mỗi language pack là một file JSON độc lập, cùng schema (word, pos, meaning, exampleEn, exampleVi, ipa, langCode...).
- Thêm pack mới chỉ cần khai báo trong danh mục ngôn ngữ, không phải sửa logic học/SRS/quiz.
- Đổi ngôn ngữ đích không làm mất tiến độ của các ngôn ngữ khác (tiến độ tách theo `langCode`).

### 5. Yêu cầu chức năng (Functional Requirements)

| Mã | Yêu cầu chức năng |
|---|---|
| **FR-01** | Hệ thống tải dữ liệu từ vựng từ (các) file language pack JSON khi khởi động. |
| **FR-02** | Hiển thị danh sách từ với word, pos, meaning; hỗ trợ phân trang hoặc cuộn danh sách 1000 từ mượt. |
| **FR-03** | Tìm kiếm từ theo `word` và `meaning`, không phân biệt hoa/thường, hỗ trợ bỏ dấu tiếng Việt. |
| **FR-04** | Lọc và sắp xếp từ theo từ loại (pos) và theo bảng chữ cái. |
| **FR-05** | Tự động chia dữ liệu thành các deck ~20 từ; cho phép chọn deck để học. |
| **FR-06** | Hiển thị flashcard hai mặt; lật thẻ bằng chuột/chạm/phím. |
| **FR-07** | Cho phép đánh dấu "Đã biết / Chưa biết" trên mỗi thẻ và ghi nhận vào trạng thái SRS. |
| **FR-08** | Tính lịch ôn theo thuật toán SRS với các khoảng 1, 2, 5, 14, 30 ngày. |
| **FR-09** | Sinh danh sách "từ đến hạn ôn hôm nay" dựa trên `nextReviewDate` và ngày hệ thống. |
| **FR-10** | Tạo quiz trắc nghiệm chọn nghĩa với 3 phương án nhiễu và xáo trộn thứ tự. |
| **FR-11** | Tạo quiz điền từ vào câu ví dụ (ẩn từ đích trong `exampleEn`). |
| **FR-12** | Chấm điểm quiz tức thì, hiển thị đáp án đúng và danh sách từ sai; lưu `QuizResult`. |
| **FR-13** | Cập nhật bậc SRS của từ dựa trên kết quả quiz và flashcard. |
| **FR-14** | Phát âm từ và câu ví dụ qua Web Speech API theo `langCode` của pack. |
| **FR-15** | Cho phép chọn giọng đọc và tốc độ đọc (khi trình duyệt hỗ trợ). |
| **FR-16** | Hiển thị bảng tiến độ: số từ đã học / đã thuộc / tổng, tiến độ theo deck. |
| **FR-17** | Theo dõi và hiển thị streak số ngày học liên tiếp. |
| **FR-18** | Trao huy hiệu/cột mốc theo ngưỡng số từ đã thuộc. |
| **FR-19** | Lưu toàn bộ trạng thái (SRS, tiến độ, cài đặt) vào localStorage và khôi phục khi mở lại. |
| **FR-20** | Cho phép đặt mục tiêu số từ mới/ngày và giới hạn phiên học theo mục tiêu đó. |
| **FR-21** | Cung cấp chế độ sáng/tối và ghi nhớ lựa chọn. |
| **FR-22** | Cho phép đặt lại (reset) toàn bộ tiến độ với bước xác nhận. |
| **FR-23** | *(Giai đoạn sau)* Cho phép chọn ngôn ngữ đích và nạp language pack tương ứng. |
| **FR-24** | *(Giai đoạn sau)* Tách và lưu tiến độ độc lập theo từng `langCode`. |
| **FR-25** | *(Giai đoạn sau)* Hỗ trợ i18n cho chuỗi giao diện (Việt/Anh...). |

### 6. Ưu tiên tính năng theo MoSCoW

| Mức | Tính năng / FR |
|---|---|
| **Must have** | Tải & duyệt từ (FR-01, FR-02), chi tiết từ, flashcard (FR-06, FR-07), SRS 1-2-5-14-30 (FR-08, FR-09), phát âm TTS (FR-14), lưu localStorage (FR-19), responsive mobile-first, không cần đăng nhập. |
| **Should have** | Tìm kiếm & lọc (FR-03, FR-04), chia deck (FR-05), quiz trắc nghiệm (FR-10, FR-12, FR-13), bảng tiến độ + streak (FR-16, FR-17), mục tiêu từ/ngày (FR-20), sáng/tối (FR-21). |
| **Could have** | Quiz điền từ (FR-11), chọn giọng/tốc độ đọc (FR-15), huy hiệu/cột mốc (FR-18), reset tiến độ (FR-22), tiến độ theo deck. |
| **Won't have (lần này)** | Đa ngôn ngữ đầy đủ & i18n (FR-23, FR-24, FR-25), tài khoản/đồng bộ đám mây, IPA tĩnh, luyện phát âm chấm điểm, bảng xếp hạng/chia sẻ xã hội, PWA offline nâng cao. |

### 7. Mô hình dữ liệu (mức nghiệp vụ)

| Thực thể | Thuộc tính chính | Ghi chú |
|---|---|---|
| **Word** | `id`, `word`, `pos`, `meaning`, `exampleEn`, `exampleVi`, `ipa` (hiện trống), `langCode`, `deckId` | Đơn vị nội dung lõi; thuộc một language pack. |
| **LanguagePack** | `langCode` (vd en), `name`, `sourceLang` (ngôn ngữ mẹ, vd vi), `voiceLang` (vd en-US), `version`, `words[]` | Mỗi ngôn ngữ = 1 file JSON cùng schema; đơn vị mở rộng đa ngôn ngữ. |
| **Deck / StudySet** | `deckId`, `langCode`, `title`, `wordIds[]` (~20 từ), `order` | Nhóm học theo lô; nền tảng cho gán chủ đề sau này. |
| **SRSCard / StudyProgress** | `wordId`, `langCode`, `stage` (0-5 ↔ 1/2/5/14/30 ngày), `nextReviewDate`, `lastReviewedDate`, `status` (new/learning/known), `correctCount`, `wrongCount` | Trạng thái ôn của từng từ theo từng người dùng, theo từng ngôn ngữ. |
| **QuizResult** | `id`, `date`, `quizType` (mcq/fill), `wordIds[]`, `score`, `wrongWordIds[]` | Lịch sử kiểm tra; nguồn cập nhật SRS và thống kê. |
| **UserSettings** | `dailyGoal`, `theme` (light/dark), `ttsVoice`, `ttsRate`, `activeLangCode`, `streakCount`, `lastActiveDate`, `badges[]` | Cấu hình & gamification; lưu localStorage. |

**Nguyên tắc lưu trữ:** Word/Deck/LanguagePack là dữ liệu tĩnh (đóng gói cùng build); SRSCard, QuizResult, UserSettings là dữ liệu người dùng lưu trong localStorage, khóa theo `langCode` để cô lập tiến độ giữa các ngôn ngữ.

### 8. Yêu cầu phi chức năng (Non-Functional Requirements)

| Nhóm | Yêu cầu |
|---|---|
| **Hiệu năng** | Tải trang đầu < 2s trên 3G/di động phổ thông; thao tác lật thẻ/chuyển câu quiz phản hồi < 100ms; danh sách 1000 từ cuộn mượt (dùng virtualization nếu cần). |
| **Khả dụng offline** | Sau lần tải đầu, ứng dụng và dữ liệu từ vựng dùng được không cần mạng; tiến độ vẫn lưu/đọc từ localStorage khi offline. |
| **Responsive / Mobile-first** | Thiết kế ưu tiên điện thoại trước, mở rộng lên tablet/desktop; vùng chạm tối thiểu 44×44px; không cần cuộn ngang. |
| **Accessibility (a11y)** | Tuân WCAG 2.1 AA: tương phản màu đạt chuẩn, điều hướng bằng bàn phím, aria-label cho nút phát âm/lật thẻ, không truyền đạt thông tin chỉ bằng màu. |
| **i18n / Đa ngôn ngữ** | Kiến trúc tách nội dung (language pack) khỏi mã; chuỗi giao diện tách khỏi logic để bản địa hóa; thêm ngôn ngữ mới không sửa logic học tập. |
| **Không cần đăng nhập** | Toàn bộ tính năng dùng ẩn danh; không thu thập dữ liệu cá nhân; mọi tiến độ nằm trên thiết bị người dùng. |
| **Khả năng bảo trì & triển khai** | Client-side thuần, triển khai tĩnh trên GitHub Pages/Netlify; dữ liệu ở JSON dễ cập nhật; tách rõ tầng dữ liệu — logic — giao diện. |
| **Tương thích** | Chạy tốt trên Chrome/Edge/Safari/Firefox bản gần đây; suy giảm êm khi thiếu Web Speech API (ẩn/vô hiệu nút phát âm, không vỡ luồng học). |
| **Độ bền dữ liệu** | Cảnh báo giới hạn dung lượng localStorage; tránh mất tiến độ khi cập nhật phiên bản (schema có `version`). |

### 9. Chỉ số thành công & Định nghĩa "Hoàn thành"

#### Success metrics

| Chỉ số | Mục tiêu |
|---|---|
| Tỷ lệ hoàn thành phiên học đầu tiên (onboarding) | ≥ 70% người dùng học xong deck đầu tiên. |
| Số từ trung bình học/ôn mỗi phiên | 10-15 từ (đúng phương pháp gốc). |
| Tỷ lệ quay lại đúng lịch ôn (SRS adherence) | ≥ 40% người dùng quay lại vào ngày có từ đến hạn. |
| Streak trung bình | Tăng dần theo tuần; ≥ 3 ngày cho người dùng hoạt động. |
| Tỷ lệ trả lời đúng ở lần ôn thứ 2 trở đi | Tăng dần (bằng chứng ghi nhớ dài hạn). |
| Tỷ lệ dùng nút phát âm | ≥ 50% phiên học có sử dụng TTS. |

#### Definition of Done (cho một tính năng)
- Đáp ứng đầy đủ Acceptance Criteria của user story liên quan.
- Chạy đúng trên mobile và desktop, đạt a11y cơ bản (bàn phím + tương phản).
- Tiến độ ghi/đọc localStorage chính xác qua reload.
- Suy giảm êm khi thiếu TTS/localStorage.
- Không lỗi console; triển khai được bản tĩnh và kiểm thử thủ công theo kịch bản chính.

### 10. Roadmap 3 giai đoạn

| Giai đoạn | Trọng tâm | Phạm vi chính | Kết quả bàn giao |
|---|---|---|---|
| **Giai đoạn 1 — MVP tiếng Anh (Must)** | Học được ngay, đúng phương pháp | 1000 từ tiếng Anh, duyệt/tìm, flashcard, SRS 1-2-5-14-30, phát âm TTS, tiến độ + streak cơ bản, cài đặt, localStorage, mobile-first, triển khai tĩnh | Sản phẩm dùng được thật, một ngôn ngữ (en), không đăng nhập. |
| **Giai đoạn 2 — Chiều sâu & gắn kết (Should/Could)** | Học vui hơn, nhớ lâu hơn | Quiz trắc nghiệm + điền từ, gán chủ đề (thematic) cho decks, gamification (huy hiệu/cột mốc), chọn giọng/tốc độ đọc, tinh chỉnh SRS, offline/PWA cơ bản, nhập/xuất tiến độ | Trải nghiệm học hoàn chỉnh, tăng giữ chân người dùng. |
| **Giai đoạn 3 — Mở rộng đa ngôn ngữ (Won't-this-time → then)** | Một nền tảng, nhiều ngôn ngữ | Bộ chọn ngôn ngữ đích, thêm language pack thứ 2+ cùng schema, tiến độ tách theo `langCode`, i18n giao diện, bổ sung trường `ipa` khi có nguồn | Nền tảng học từ vựng đa ngôn ngữ, thêm ngôn ngữ mới chỉ bằng JSON. |

---

## PHẦN C — VAI 3: SOLUTION ARCHITECT / DEV (Thiết kế kỹ thuật)

*Thiết kế để một lập trình viên có thể code trực tiếp: công nghệ, kiến trúc, thuật toán SRS/quiz, cấu trúc thư mục, schema, lưu trữ, kiểm thử.*

## Tài liệu Thiết kế Kỹ thuật — Website Học & Ôn Từ vựng (Vocabulary Study)

> Trạng thái nguồn dữ liệu thực tế: đã có file `/home/dholmes/Project_personal/Vocabulary-Study/data/en.json` (258 KB, 1000 từ). Schema hiện tại của mỗi từ: `id, word, ipa (rỗng), pos, posCategory, meaning, exampleEn, exampleVi`. Meta gồm `code, name, flag, nativeName, learnerLang, learnerLangName, ttsLang, count, source, version`. Phân bố `posCategory`: noun 535, verb 251, adjective 159, adverb 20, preposition 15, determiner 11, conjunction 6, pronoun 2, other 1. Thiết kế dưới đây bám sát schema này và chỉ khuyến nghị **di chuyển** file vào `public/data/en.json` khi dựng dự án Vite.

---

### 1. Lựa chọn công nghệ & lý do

| Lớp | Công nghệ | Lý do chọn |
|-----|-----------|------------|
| Build tool | **Vite 5** | Dev server HMR cực nhanh (esbuild), cấu hình `base` tối giản cho deploy tĩnh (GitHub Pages/Netlify), tree-shaking tốt, output là static assets thuần. |
| UI runtime | **React 18** | Concurrent features, ecosystem lớn, component hóa rõ ràng cho các màn học/ôn/quiz. Không cần SSR nên SPA là đủ. |
| Ngôn ngữ | **TypeScript (strict)** | Schema từ vựng và SRS card có nhiều union type (`status`, `posCategory`); type an toàn giúp tránh lỗi migrate localStorage và sinh quiz. |
| Styling | **Tailwind CSS 3** | Utility-first, mobile-first mặc định, hỗ trợ `dark:` variant sẵn cho dark mode, không phát sinh runtime CSS-in-JS. |
| State | **React hooks + Context + custom `usePersistentState`** | Không backend nên state = state cục bộ + localStorage. Không cần Redux; một store nhẹ (Context + reducer) là đủ. Có thể nâng lên **Zustand** nếu muốn store phẳng, dễ persist (khuyến nghị cho phần SRS/settings). |
| Phát âm | **Web Speech API — `speechSynthesis`** | Chạy 100% client-side, không tốn phí API, thay thế cho IPA tĩnh còn trống. Chọn voice theo `meta.ttsLang` (vd `en-US`). |
| Routing | **React Router 6** (hash hoặc `HashRouter`) | `HashRouter` tránh lỗi 404 khi deploy tĩnh trên GitHub Pages (không cần rewrite server). |
| List ảo hóa | **@tanstack/react-virtual** | Render mượt danh sách 1000 từ ở màn Browse. |
| Test | **Vitest + React Testing Library + Playwright** | Vitest tích hợp Vite, chạy nhanh; Playwright cho E2E luồng học/ôn. |

**Vì sao phù hợp & dễ mở rộng:**
- Toàn bộ là **static build** → deploy 1 lệnh, không vận hành server, không chi phí hạ tầng.
- Dữ liệu tách rời code: mỗi ngôn ngữ = 1 file JSON trong `public/data/`, nạp động qua `fetch`. Thêm ngôn ngữ **không cần build lại logic**, chỉ thêm file + đăng ký trong manifest.
- TypeScript interface `LanguagePack` là hợp đồng chung → mọi pack mới chỉ cần đúng schema là chạy.

---

### 2. Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────────┐
│                        UI LAYER (React + Router)                   │
│  Routes: / /learn /review /quiz /browse /stats /settings           │
│  Components: Flashcard, ReviewSession, QuizCard, WordTable,         │
│              StatsDashboard, TTSButton, DeckPicker, ThemeToggle     │
└───────────────▲───────────────────────────────────┬───────────────┘
                │ đọc state / dispatch action        │ render
┌───────────────┴───────────────────────────────────▼───────────────┐
│                      STATE / STORE LAYER                            │
│  - AppStore (Context/Zustand): currentLangCode, settings           │
│  - StudyStore per-lang: Record<wordId, SRSCard>, sessionQueue       │
│  - usePersistentState<T>(key, version) ⇄ storage.ts                │
└───────────────▲───────────────────────────────────┬───────────────┘
                │ gọi hàm thuần (pure)               │ persist
┌───────────────┴───────────────────────────────────▼───────────────┐
│                    DOMAIN / LOGIC LAYER (src/lib)                   │
│  srs.ts     → review(card, correct), getDueCards(cards, today)     │
│  quiz.ts    → generateQuestion(word, pool, type), pickDistractors  │
│  dataLoader.ts → loadManifest(), loadPack(code) [fetch + validate] │
│  tts.ts     → speak(text, lang), getVoices()                       │
│  storage.ts → get/set/remove, migrate(version), export/import      │
│  scheduler.ts → buildTodayQueue(dueCards, newLimit)                │
└───────────────▲────────────────────────────────────────────────────┘
                │ đọc JSON
┌───────────────┴────────────────────────────────────────────────────┐
│                          DATA LAYER (public/data)                   │
│  index.json        → manifest liệt kê packs [{code,name,flag,...}]  │
│  en.json           → LanguagePack { meta, words[1000] }             │
│  <code>.json       → pack ngôn ngữ khác (cùng schema)               │
└─────────────────────────────────────────────────────────────────────┘
                │ (side-channel, không phải data source)
                └── localStorage: vocab:v1:progress:<code>, vocab:v1:settings
```

Nguyên tắc: **DATA và LOGIC là pure/không phụ thuộc React**; STATE nối logic với UI và chịu trách nhiệm persist; UI chỉ render + dispatch. Điều này giúp unit-test `srs.ts`/`quiz.ts` độc lập, và thay UI mà không đụng thuật toán.

---

### 3. Thiết kế thuật toán SRS (Leitner theo bậc)

#### 3.1 Định nghĩa

- Bảng khoảng cách (interval) theo bậc, đơn vị **ngày**:
  ```ts
  const INTERVALS = [1, 2, 5, 14, 30] as const; // box 0..4
  const MAX_BOX = INTERVALS.length - 1;          // = 4 (mastered)
  ```
- Trạng thái thẻ (`status`):
  - `new` — chưa từng học (chưa vào hàng đợi lần nào).
  - `learning` — đang ở box 0–1 (mới học, khoảng ngắn 1–2 ngày).
  - `review` — box 2–3 (khoảng 5–14 ngày).
  - `mastered` — box 4, đã đúng liên tục, khoảng 30 ngày. (Có thể coi là "tốt nghiệp" nhưng vẫn ôn lại sau 30 ngày.)
- `dueAt` = `lastReviewedAt + INTERVALS[box] * MS_PER_DAY`.

#### 3.2 Quy tắc chuyển bậc

- **Đúng (`correct=true`)**: lên 1 bậc (`box = min(box+1, MAX_BOX)`), reset `lapses` streak, cập nhật `status` theo box mới.
- **Sai (`correct=false`)**: lùi về **box 1** (không hẳn 0 để tránh spam lặp lại quá dày ngay trong ngày; nếu muốn nghiêm khắc hơn dùng box 0). Tăng `lapses`. `status = 'learning'`. Từ mới lần đầu trả lời sai → box 0.

> Quyết định thiết kế: "lùi về bậc 0/1" — dùng **box 1** cho thẻ đã từng ở review/mastered (interval 2 ngày, ôn lại nhanh nhưng không dồn dập), và **box 0** cho thẻ `new/learning` sai ngay lần đầu (ôn lại sau 1 ngày). Có thể cấu hình bằng `Settings.lapseResetBox`.

#### 3.3 Chọn danh sách "hôm nay cần ôn"

- Due = thẻ có `status !== 'new'` và `dueAt <= endOfToday`.
- Từ mới/ngày giới hạn `newWordsPerDay` (mặc định **15**, đúng khuyến nghị 10–15 từ/ngày). Đếm số từ `new` đã được "kích hoạt" hôm nay để không vượt hạn.

#### 3.4 Pseudo-code

```ts
// src/lib/srs.ts
const MS_PER_DAY = 86_400_000;
const INTERVALS = [1, 2, 5, 14, 30];
const MAX_BOX = INTERVALS.length - 1;

function statusForBox(box: number): SRSStatus {
  if (box <= 1) return 'learning';
  if (box < MAX_BOX) return 'review';
  return 'mastered';
}

// Cập nhật 1 thẻ sau khi người dùng trả lời
function review(card: SRSCard, correct: boolean, now = Date.now()): SRSCard {
  let box: number;
  let lapses = card.lapses ?? 0;

  if (correct) {
    box = Math.min(card.box + 1, MAX_BOX);
  } else {
    lapses += 1;
    // thẻ đã "trưởng thành" -> lùi về box 1; thẻ mới/sơ khai -> box 0
    box = card.status === 'new' || card.box === 0 ? 0 : 1;
  }

  const intervalDays = INTERVALS[box];
  return {
    ...card,
    box,
    status: statusForBox(box),
    lapses,
    lastReviewedAt: now,
    dueAt: now + intervalDays * MS_PER_DAY,
    reps: (card.reps ?? 0) + 1,
    history: [...card.history, { at: now, correct, box }].slice(-50),
  };
}

// Lấy danh sách cần ôn hôm nay (đã tới hạn), sắp xếp ưu tiên
function getDueCards(cards: SRSCard[], today = Date.now()): SRSCard[] {
  const endOfToday = startOfDay(today) + MS_PER_DAY - 1;
  return cards
    .filter(c => c.status !== 'new' && c.dueAt <= endOfToday)
    .sort((a, b) =>
      // ưu tiên: quá hạn lâu nhất trước, rồi box thấp (yếu) trước
      (a.dueAt - b.dueAt) || (a.box - b.box)
    );
}

// Dựng hàng đợi học của một ngày: due trước, rồi bổ sung từ mới theo hạn mức
function buildTodayQueue(
  cards: SRSCard[], newLimit: number, today = Date.now()
): SRSCard[] {
  const due = getDueCards(cards, today);
  const introducedToday = cards.filter(
    c => c.firstSeenAt && startOfDay(c.firstSeenAt) === startOfDay(today)
  ).length;
  const slots = Math.max(0, newLimit - introducedToday);
  const fresh = cards
    .filter(c => c.status === 'new')
    .sort((a, b) => a.wordId - b.wordId) // theo thứ tự alphabet/deck
    .slice(0, slots);
  return [...due, ...fresh];
}

function startOfDay(ts: number): number {
  const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime();
}
```

---

### 4. Thiết kế Quiz

#### 4.1 Các dạng câu hỏi

| Dạng | prompt | Lựa chọn / input | Nguồn TTS |
|------|--------|------------------|-----------|
| `mc-en-vi` | hiển thị `word` (EN) | 4 nghĩa VI | phát âm word |
| `mc-vi-en` | hiển thị `meaning` (VI) | 4 từ EN | — |
| `listen-choose` | chỉ phát âm word (không hiện chữ) | 4 từ EN | bắt buộc TTS |
| `fill-blank` | câu `exampleEn` bị khoét từ đích | input text (so khớp normalize) | phát âm câu |

#### 4.2 Sinh đáp án nhiễu (distractors)

Nguyên tắc: distractor phải **cùng `posCategory`** với từ đúng để câu hỏi thực sự thử thách (không loại trừ bằng ngữ pháp). Nếu không đủ trong cùng nhóm → nới sang toàn bộ pool. Với `mc-en-vi` distractor là `meaning`; với `mc-vi-en`/`listen-choose` distractor là `word`.

```ts
// src/lib/quiz.ts
function pickDistractors(answer: Word, pool: Word[], n = 3): Word[] {
  const sameCat = pool.filter(
    w => w.id !== answer.id && w.posCategory === answer.posCategory
  );
  const fallback = pool.filter(w => w.id !== answer.id);
  const source = sameCat.length >= n ? sameCat : fallback;
  return shuffle(source).slice(0, n);
}

function generateQuestion(word: Word, pool: Word[], type: QuizType): QuizQuestion {
  const distractors = pickDistractors(word, pool);
  const base = { id: crypto.randomUUID(), type, wordId: word.id };

  switch (type) {
    case 'mc-en-vi': {
      const opts = shuffle([word, ...distractors]);
      return { ...base,
        prompt: word.word, promptLang: 'en',
        options: opts.map(w => w.meaning),
        answerIndex: opts.findIndex(w => w.id === word.id),
        ttsText: word.word };
    }
    case 'mc-vi-en':
    case 'listen-choose': {
      const opts = shuffle([word, ...distractors]);
      return { ...base,
        prompt: type === 'listen-choose' ? '🔊' : word.meaning,
        promptLang: type === 'listen-choose' ? 'audio' : 'vi',
        options: opts.map(w => w.word),
        answerIndex: opts.findIndex(w => w.id === word.id),
        ttsText: word.word };
    }
    case 'fill-blank': {
      const re = new RegExp(`\\b${escapeRegex(baseForm(word.word))}\\b`, 'i');
      return { ...base,
        prompt: word.exampleEn.replace(re, '____'),
        promptLang: 'en',
        expected: word.word,          // chấm bằng normalize (lowercase, trim)
        ttsText: word.exampleEn };
    }
  }
}
```

Kết quả mỗi câu (`correct`) được đưa thẳng vào `review(card, correct)` để cập nhật SRS → quiz và ôn tập dùng chung engine.

---

### 5. Cấu trúc thư mục dự án

```
vocabulary-study/
├─ public/
│  └─ data/
│     ├─ index.json            # manifest: [{code,name,flag,file}]
│     ├─ en.json               # LanguagePack (di chuyển từ /data/en.json)
│     └─ (fr.json, ja.json…)   # thêm ngôn ngữ sau này
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                  # RouterProvider + AppProviders
│  ├─ routes.tsx
│  ├─ components/              # UI dùng chung
│  │  ├─ Flashcard.tsx
│  │  ├─ TTSButton.tsx
│  │  ├─ ThemeToggle.tsx
│  │  ├─ ProgressBar.tsx
│  │  ├─ LanguageSwitcher.tsx
│  │  └─ Layout.tsx
│  ├─ features/
│  │  ├─ flashcards/           # /learn — bộ từ mới
│  │  │  ├─ LearnPage.tsx
│  │  │  └─ DeckPicker.tsx
│  │  ├─ review/               # /review — SRS due hôm nay
│  │  │  ├─ ReviewPage.tsx
│  │  │  └─ ReviewSession.tsx
│  │  ├─ quiz/                 # /quiz
│  │  │  ├─ QuizPage.tsx
│  │  │  └─ QuizCard.tsx
│  │  ├─ browse/               # /browse — tra cứu 1000 từ
│  │  │  ├─ BrowsePage.tsx
│  │  │  └─ WordTable.tsx      # virtualized
│  │  └─ stats/                # /stats
│  │     └─ StatsPage.tsx
│  ├─ lib/                     # DOMAIN — pure, không React
│  │  ├─ srs.ts
│  │  ├─ quiz.ts
│  │  ├─ scheduler.ts
│  │  ├─ storage.ts
│  │  ├─ tts.ts
│  │  ├─ dataLoader.ts
│  │  └─ utils.ts              # shuffle, normalize, startOfDay…
│  ├─ store/
│  │  ├─ AppStore.tsx          # currentLangCode, settings (Context/Zustand)
│  │  ├─ StudyStore.tsx        # cards per-lang + actions
│  │  └─ usePersistentState.ts
│  ├─ types/
│  │  └─ index.ts              # toàn bộ type ở mục 6
│  └─ styles/
│     └─ index.css             # @tailwind base/components/utilities
├─ tests/
│  ├─ srs.test.ts
│  ├─ quiz.test.ts
│  └─ e2e/review.spec.ts
├─ index.html
├─ tailwind.config.ts
├─ vite.config.ts              # base: '/Vocabulary-Study/' cho GitHub Pages
├─ tsconfig.json
└─ package.json
```

---

### 6. Schema dữ liệu TypeScript

```ts
// src/types/index.ts

export type PosCategory =
  | 'noun' | 'verb' | 'adjective' | 'adverb'
  | 'preposition' | 'determiner' | 'conjunction' | 'pronoun' | 'other';

// Khớp 1:1 với public/data/<code>.json (words[])
export interface Word {
  id: number;
  word: string;            // "ability", có thể "a / an"
  ipa: string;             // hiện rỗng "" -> dùng TTS
  pos: string;             // nhãn hiển thị: "n.", "v./adj."
  posCategory: PosCategory;// dùng để nhóm & sinh distractor
  meaning: string;         // nghĩa tiếng Việt
  exampleEn: string;
  exampleVi: string;
}

export interface LanguagePackMeta {
  code: string;            // "en"
  name: string;            // "English"
  flag: string;            // "🇬🇧"
  nativeName: string;      // "Tiếng Anh" (tên hiển thị cho người học Việt)
  learnerLang: string;     // "vi"
  learnerLangName: string; // "Tiếng Việt"
  ttsLang: string;         // "en-US" -> chọn voice SpeechSynthesis
  count: number;           // 1000
  source: string;
  version: string;         // "1.0.0" (schema/nội dung pack)
}

export interface LanguagePack {
  meta: LanguagePackMeta;
  words: Word[];
}

// Manifest tại public/data/index.json
export interface ManifestEntry {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  file: string;            // "en.json"
  count: number;
}
export type Manifest = ManifestEntry[];

export type SRSStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface SRSCard {
  wordId: number;          // FK -> Word.id
  box: number;             // 0..4 (index của INTERVALS)
  status: SRSStatus;
  dueAt: number;           // epoch ms
  lastReviewedAt: number | null;
  firstSeenAt: number | null;
  reps: number;            // tổng số lần review
  lapses: number;          // số lần trả lời sai
  history: { at: number; correct: boolean; box: number }[];
}

export interface StudyState {
  langCode: string;
  cards: Record<number, SRSCard>; // key = wordId
  daily: {
    date: string;          // "2026-08-07"
    newIntroduced: number; // đã kích hoạt bao nhiêu từ mới hôm nay
    reviewed: number;
  };
  streakDays: number;      // chuỗi ngày học liên tục
  lastActiveDate: string | null;
}

export type QuizType = 'mc-en-vi' | 'mc-vi-en' | 'listen-choose' | 'fill-blank';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  wordId: number;
  prompt: string;
  promptLang: 'en' | 'vi' | 'audio';
  options?: string[];       // cho dạng multiple-choice
  answerIndex?: number;
  expected?: string;        // cho dạng fill-blank
  ttsText?: string;
}

export interface Settings {
  schemaVersion: number;         // để migrate localStorage
  theme: 'system' | 'light' | 'dark';
  newWordsPerDay: number;        // mặc định 15
  reviewBatchSize: number;       // vd 20
  lapseResetBox: 0 | 1;          // mặc định 1
  ttsRate: number;               // 0.5..1.5
  ttsVoiceURI: string | null;    // voice ưu tiên
  autoPlayAudio: boolean;
  quizTypesEnabled: QuizType[];
  currentLangCode: string;       // "en"
}
```

---

### 7. Thiết kế mở rộng đa ngôn ngữ

- **Hợp đồng chung**: mọi ngôn ngữ mới chỉ cần một file JSON đúng interface `LanguagePack` (`meta` + `words[]`). Không đụng vào logic.
- **Đăng ký ngôn ngữ** qua manifest `public/data/index.json`:
  ```json
  [
    { "code": "en", "name": "English", "nativeName": "Tiếng Anh",
      "flag": "🇬🇧", "file": "en.json", "count": 1000 },
    { "code": "fr", "name": "French",  "nativeName": "Tiếng Pháp",
      "flag": "🇫🇷", "file": "fr.json", "count": 800 }
  ]
  ```
- **Nạp động**:
  ```ts
  // src/lib/dataLoader.ts
  export async function loadManifest(): Promise<Manifest> {
    const res = await fetch(`${import.meta.env.BASE_URL}data/index.json`);
    return res.json();
  }
  export async function loadPack(code: string): Promise<LanguagePack> {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${code}.json`);
    const pack: LanguagePack = await res.json();
    validatePack(pack); // kiểm tra meta.code === code, words[].id duy nhất
    return pack;
  }
  ```
- **Tách tiến độ theo ngôn ngữ**: mỗi ngôn ngữ có `StudyState` riêng, lưu localStorage với key nhúng `code`:
  ```
  vocab:v1:progress:en   → StudyState của English
  vocab:v1:progress:fr   → StudyState của French
  vocab:v1:settings      → Settings (chung, có currentLangCode)
  ```
  Khi đổi ngôn ngữ ở `LanguageSwitcher`: set `settings.currentLangCode`, nạp pack tương ứng, hydrate store từ `vocab:v1:progress:<code>` (khởi tạo rỗng nếu chưa có). Nhờ vậy tiến độ mỗi ngôn ngữ hoàn toàn độc lập.

---

### 8. Định tuyến (routes)

Dùng `HashRouter` để tương thích GitHub Pages (không cần cấu hình rewrite).

| Path | Màn | Chức năng |
|------|-----|-----------|
| `/` | Dashboard | Tổng quan: số từ due hôm nay, từ mới còn lại, streak, nút "Ôn ngay"/"Học bộ mới". |
| `/learn` | Flashcards | Học **bộ từ mới** (deck ~20 từ theo alphabet/posCategory): lật thẻ word↔meaning, nghe TTS, đọc câu ví dụ; đánh dấu "biết/chưa" để khởi tạo SRS card. |
| `/review` | Review SRS | Hàng đợi `getDueCards` hôm nay: trả lời đúng/sai → `review()` cập nhật box & dueAt. |
| `/quiz` | Quiz | Chọn dạng quiz (mục 4), làm bài, kết quả feed vào SRS. |
| `/browse` | Tra cứu | Bảng 1000 từ ảo hóa, tìm kiếm/lọc theo `posCategory`, phát âm, xem ví dụ. |
| `/stats` | Thống kê | Phân bố box, số từ mastered, biểu đồ ôn theo ngày, độ chính xác quiz, streak. |
| `/settings` | Cài đặt | Từ mới/ngày, theme, TTS voice/rate, chọn ngôn ngữ, export/import backup. |

---

### 9. Chiến lược lưu trữ localStorage

#### 9.1 Không gian khóa (namespace + versioning)

```
vocab:v1:settings            → Settings
vocab:v1:progress:<code>     → StudyState (mỗi ngôn ngữ 1 key)
vocab:v1:manifest-cache      → Manifest (cache tùy chọn)
```

Tiền tố `vocab:` tránh đụng key khác; `v1` là **schema version** cho migrate.

#### 9.2 storage.ts (bọc, versioning, migrate)

```ts
// src/lib/storage.ts
const NS = 'vocab';
const SCHEMA = 1;

function key(...parts: string[]) { return [NS, `v${SCHEMA}`, ...parts].join(':'); }

export function get<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
export function set<T>(k: string, value: T): void {
  try { localStorage.setItem(k, JSON.stringify(value)); }
  catch (e) { /* QuotaExceeded -> cảnh báo UI */ }
}
export function remove(k: string) { localStorage.removeItem(k); }

// Migrate khi nâng schema (vd v1 -> v2 đổi cấu trúc card)
export function migrate(): void {
  const stored = get<number>(key('meta', 'schema'), 0);
  if (stored < SCHEMA) {
    // ví dụ: v0 -> v1: đổi tên field, thêm 'lapses'
    // ... đọc key cũ, chuyển đổi, ghi key mới, xóa key cũ ...
    set(key('meta', 'schema'), SCHEMA);
  }
}
```

Chạy `migrate()` một lần khi khởi động app (trong `main.tsx` trước khi render).

#### 9.3 Export / Import backup JSON

```ts
export function exportBackup(): string {
  const dump: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith(`${NS}:`)) dump[k] = JSON.parse(localStorage.getItem(k)!);
  }
  return JSON.stringify({ app: 'vocabulary-study', schema: SCHEMA, data: dump }, null, 2);
}

export function importBackup(json: string): void {
  const parsed = JSON.parse(json);
  if (parsed.app !== 'vocabulary-study') throw new Error('File backup không hợp lệ');
  Object.entries(parsed.data as Record<string, unknown>)
        .forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
  // nếu parsed.schema < SCHEMA -> gọi migrate()
}
```

UI ở `/settings`: nút **Export** (tải file `.json` qua `Blob` + `URL.createObjectURL`), nút **Import** (`<input type="file">`, đọc bằng `FileReader`). Không cần quyền mạng, an toàn dữ liệu cá nhân.

---

### 10. Accessibility, responsive, dark mode, hiệu năng

**Accessibility (A11y):**
- Mọi nút phát âm/lật thẻ là `<button>` thật, có `aria-label` (vd "Phát âm từ ability").
- Điều hướng bàn phím: `Space`=lật thẻ, `1/2/3/4`=chọn đáp án, `Enter`=tiếp, `J/K`=đúng/sai ở review; focus ring rõ (`focus-visible`).
- Vùng kết quả quiz dùng `aria-live="polite"` để screen reader đọc đúng/sai.
- Tương phản màu đạt WCAG AA (≥4.5:1) ở cả 2 theme; không truyền tải thông tin **chỉ** bằng màu (kèm icon/label đúng-sai).
- TTS là bổ trợ, không phải kênh thông tin duy nhất — luôn có chữ tương ứng (trừ dạng `listen-choose` có chủ đích).

**Responsive / mobile-first:**
- Tailwind mobile-first: layout mặc định 1 cột, `md:`/`lg:` mở rộng. Flashcard chiếm full-width trên mobile, thao tác bằng nút lớn (≥44px) + hỗ trợ vuốt (swipe) để đúng/sai.
- Bottom navigation trên mobile, sidebar trên desktop.

**Dark mode:**
- `tailwind.config.ts` đặt `darkMode: 'class'`. `ThemeToggle` set class `dark` trên `<html>` theo `Settings.theme` (`system` đọc `prefers-color-scheme`). Lưu lựa chọn vào settings.

**Hiệu năng:**
- **Ảo hóa** danh sách 1000 từ ở `/browse` bằng `@tanstack/react-virtual` (chỉ render ~20–30 hàng trong viewport).
- Lazy-load route bằng `React.lazy` + `Suspense` (mỗi feature 1 chunk).
- Pack JSON nạp 1 lần, cache trong store; tìm kiếm/lọc dùng `useMemo` + debounce input.
- `speechSynthesis.getVoices()` load bất đồng bộ → lắng nghe sự kiện `voiceschanged`, cache danh sách voice.
- Build tách vendor chunk; bật gzip/brotli từ host tĩnh.

---

### 11. Kế hoạch kiểm thử & Definition of Done kỹ thuật

#### 11.1 Kiểm thử

**Unit (Vitest) — logic thuần, ưu tiên cao nhất:**
- `srs.test.ts`: `review()` đúng→lên box, sai→lùi box theo `lapseResetBox`; `dueAt` tính chính xác cho từng interval `[1,2,5,14,30]`; box không vượt `MAX_BOX`. `getDueCards()` chỉ trả due, loại `new`, sắp xif đúng thứ tự ưu tiên. `buildTodayQueue()` tôn trọng `newWordsPerDay`.
- `quiz.test.ts`: `pickDistractors()` ưu tiên cùng `posCategory`, không lặp từ đúng, fallback khi thiếu; `generateQuestion()` mỗi dạng có đủ 4 option và `answerIndex` trỏ đúng đáp án; `fill-blank` khoét đúng từ đích.
- `storage.test.ts`: get/set round-trip, fallback khi JSON hỏng, `migrate()` nâng version, export→import khôi phục nguyên trạng.

**Component (React Testing Library):**
- Flashcard lật khi bấm/`Space`; ReviewSession cập nhật tiến độ; QuizCard chấm đúng/sai và feed SRS.

**E2E (Playwright):**
- Luồng: mở app → `/learn` học 5 từ → `/review` xuất hiện due → làm review → `/stats` phản ánh số liệu → reload trang giữ nguyên tiến độ (localStorage). Đổi ngôn ngữ giữ tiến độ tách biệt.

**Kiểm thử thủ công thiết bị:** iOS Safari & Android Chrome (TTS voice khác nhau), kiểm tra offline sau lần nạp đầu.

#### 11.2 Definition of Done (kỹ thuật)

- [ ] `tsc --noEmit` sạch (strict), ESLint/Prettier không lỗi.
- [ ] Tất cả unit test `srs`/`quiz`/`storage` pass; coverage lib ≥ 85%.
- [ ] E2E luồng học→ôn→thống kê→reload pass trên Chromium.
- [ ] Nạp `en.json` (1000 từ) và render `/browse` không giật (ảo hóa hoạt động, TTI < 2s trên mạng thường).
- [ ] Thêm 1 pack ngôn ngữ giả (đúng schema) + đăng ký manifest → app tự nhận, tiến độ tách khỏi `en`, **không sửa code logic**.
- [ ] Tiến độ persist qua reload; export ra file, import lại khôi phục đúng.
- [ ] Migrate: nâng `SCHEMA` chạy `migrate()` không mất dữ liệu.
- [ ] Dark mode + `prefers-color-scheme` hoạt động; A11y: keyboard-only hoàn thành 1 phiên review; Lighthouse A11y ≥ 90.
- [ ] Responsive 320px→desktop không vỡ layout, body không cuộn ngang.
- [ ] TTS phát âm đúng theo `meta.ttsLang`; có fallback thông báo khi trình duyệt không hỗ trợ `speechSynthesis`.
- [ ] Build tĩnh (`vite build`) deploy được lên GitHub Pages/Netlify với `base` đúng, không lỗi 404 route (HashRouter).

---

*Ghi chú triển khai:* file dữ liệu hiện ở `/home/dholmes/Project_personal/Vocabulary-Study/data/en.json` cần **di chuyển vào `public/data/en.json`** và tạo `public/data/index.json` (manifest) khi khởi tạo dự án Vite; schema từ vựng trong tài liệu này đã khớp chính xác với dữ liệu thực tế nên không cần chuyển đổi.

---

## PHẦN D — TỔNG HỢP QUYẾT ĐỊNH ĐÃ CHỐT (cho bản build thực tế)

Sau khi tổng hợp 3 vai, các quyết định **cuối cùng** áp dụng cho bản code trong repo này:

### D.1 Stack & thư viện
- **React 18 + Vite 5 + TypeScript (strict) + Tailwind CSS 3**.
- **Zustand + middleware `persist`** cho store (thay cho Context/reducer) — gọn, tự persist localStorage, ít lỗi tự viết.
- **react-router-dom v6 với `HashRouter`** — tránh lỗi 404 khi deploy tĩnh (GitHub Pages/Netlify), đúng khuyến nghị của vai DEV.
- **lucide-react** cho icon; **không** dùng thư viện chart — biểu đồ thống kê vẽ bằng SVG/CSS thuần để giảm phụ thuộc.
- **Không** dùng `@tanstack/react-virtual`: màn Browse dùng **tìm kiếm + lọc + phân trang** (nhẹ, mượt, không thêm dependency).

### D.2 Thuật toán SRS (điều chỉnh nhỏ so với vai DEV)
- Lịch cố định `INTERVALS = [1, 2, 5, 14, 30]` ngày (5 bậc) → `MASTERED_BOX = 5`.
- **Granularity theo NGÀY** (`dueDay` = số ngày epoch, local) thay cho mili-giây → "due hôm nay" ổn định bất kể giờ giấc.
- Trả lời **đúng** → lên 1 bậc, hẹn ôn sau `INTERVALS[box]` ngày. Trả lời **sai** → **về box 0**, due lại ngay hôm nay (học lại từ đầu thang — bám sát tinh thần "ôn ngay trước khi quên"). *(Vai DEV đề xuất về box 1 cho thẻ đã trưởng thành; ta chọn về 0 cho đơn giản & dễ hiểu.)*
- `getDueCards`: thẻ đã học (`lastReviewedDay != null`), chưa mastered, `dueDay <= hôm nay`, ưu tiên due lâu nhất & box thấp.
- Giới hạn **15 từ mới/ngày** (cấu hình được).

### D.3 Mô hình dữ liệu đã chốt (khớp `src/types/index.ts`)
- `SRSCard { id, box, dueDay, lastReviewedDay, correctCount, wrongCount, createdDay }`.
- `LanguageProgress { cards: Record<id, SRSCard>, stats: StudyStats }` — **lưu tách theo từng ngôn ngữ** (`vocab.progress.<code>`).
- `Settings` chung (theme, currentLang, dailyNewLimit, dailyReviewLimit, ttsRate, autoSpeak).

### D.4 Điều hướng (routes)
`/` Dashboard · `/learn` Học bộ mới (flashcard) · `/review` Ôn SRS hôm nay · `/quiz` Kiểm tra · `/browse` Tra cứu 1000 từ · `/stats` Thống kê · `/settings` Cài đặt.

### D.5 Cấu trúc thư mục thực tế
```
Vocabulary-Study/
├─ docs/                     # PLAN.md + PDF tài liệu gốc
├─ data/en.json             # bản gốc dataset (source of truth)
├─ public/data/             # index.json (manifest) + en.json (app đọc qua fetch)
├─ src/
│  ├─ types/index.ts
│  ├─ lib/                   # date, srs, quiz, tts, dataLoader (pure logic)
│  ├─ store/                 # settingsStore, studyStore, dataStore (zustand)
│  ├─ components/            # Layout, Flashcard, SpeakButton, ProgressRing, ui...
│  └─ features/              # dashboard, learn, review, quiz, browse, stats, settings
└─ (vite/ts/tailwind configs)
```

### D.6 Mở rộng đa ngôn ngữ
Thêm 1 ngôn ngữ = thêm `public/data/<code>.json` (đúng interface `LanguagePack`) + 1 dòng trong `public/data/index.json`. Tiến độ tự tách namespace theo `code`. **Không sửa logic.**

### D.7 Definition of Done
- [x] Trích xuất đủ 1000 từ, dataset sạch, đưa vào repo.
- [x] Lưu PDF gốc vào `docs/`.
- [x] Plan 3 vai + tổng hợp (`docs/PLAN.md`).
- [ ] Build TypeScript sạch (`npm run build`), chạy `npm run dev` không lỗi console.
- [ ] Đủ 7 màn; SRS/quiz/flashcard/TTS/progress hoạt động; persist qua reload.
- [ ] Dark mode + responsive 320px→desktop; keyboard & aria cơ bản.
- [ ] README hướng dẫn chạy & mở rộng ngôn ngữ.

---

*Tài liệu gốc: `docs/Tailieu_1000_Tu_Vung_Tieng_Anh_Thong_Dung.md.pdf`. Ba vai (Người học, BA, DEV) được tạo song song bằng quy trình role-play, phần D là tổng hợp & chốt quyết định của người tổng thầu.*

---

## PHẦN E — TÍNH NĂNG GHI NHỚ NÂNG CAO (bổ sung sau)

*Role-play tiếp: Người học muốn luyện VIẾT/nhớ mặt chữ + động lực học.*

**🧑 Người học:** "Nghe/nhìn thì nhận ra nhưng bảo viết là bí. Cho tôi gõ lại từ, lộ sẵn vài chữ (`abi__ty`), bí thì mở thêm chữ. Cho huy hiệu, pháo giấy để có hứng."

**📊 BA — đánh giá cách `abi__ty`:** Hợp lý ở vai trò *scaffolding* (giảm tải, tăng tỉ lệ đúng → giữ động lực), nhưng blanks cố định dễ đoán mẹo. **Nâng cấp:** chế độ "Đánh vần" — khung chữ lộ đầu/cuối + xen kẽ giữa, gõ cả từ, **Gợi ý +1 chữ** lũy tiến, **chấm từng chữ cái**, **nghe audio** (gắn âm–chữ), nạp SRS. Gamification: **huy hiệu** theo cột mốc + **pháo giấy** cuối phiên.

**💻 DEV — thiết kế đã chốt & hiện thực:**
- `QuizMode` thêm `'spell'`; `buildSkeleton(word)` (lộ đầu/cuối + xen kẽ giữa, ẩn phần còn lại, tất định); renderer riêng trong `QuizRunner` (khung ô chữ, nút Gợi ý, chấm từng chữ cái, phát âm). Dùng lại phạm vi/số câu/SRS của Quiz.
- `lib/achievements.ts`: 13 huy hiệu tính thuần từ `StudyStats` (không lưu thêm dữ liệu); lưới huy hiệu ở màn Thống kê.
- `lib/confetti.ts`: pháo giấy canvas tự viết (không thư viện), tôn trọng `prefers-reduced-motion`; kích hoạt ở `SessionComplete`.

**Đánh giá cuối:** cách `abi__ty` của bạn **được giữ làm lõi** và mở rộng thành chế độ Đánh vần đầy đủ — vừa dễ cho người lười (có gợi ý), vừa buộc chủ động nhớ mặt chữ (gõ + chấm từng chữ).

---

## PHẦN F — TRỢ LÝ AI HỌC TỪ VỰNG (có Guardrail)

**🧑 Người học:** "Muốn hỏi như hỏi gia sư (nghĩa, khác nhau, ví dụ, mẹo nhớ) bằng tiếng Việt. Nhưng phải chặn hỏi linh tinh (code/toán/chat) — vừa lệch mục đích vừa tốn tiền API. Nhập key 1 lần, nói rõ key lưu đâu."

**📊 BA:** Gia sư từ vựng AI, hỏi–đáp tự nhiên **nhưng khóa trong phạm vi học từ vựng tiếng Anh**. Guardrail nhiều lớp: GR-1 định vị phạm vi (allow/deny list trong system prompt), GR-2 từ chối chuẩn, GR-3 chống prompt-injection, GR-4 lớp client (rỗng/dài/giới hạn lịch sử), GR-5 fail-safe (lỗi key/API → thông báo thân thiện). NFR: không backend, bring-your-own-key, **key tách khỏi backup**, model cấu hình được.

**💻 DEV (đã hiện thực & test):**
- `lib/ai/systemPrompt.ts` — guardrail lõi (allow/deny + cách từ chối + chống injection); `buildMessages()` luôn dẫn đầu bằng `system`, giới hạn 10 lượt.
- `lib/ai/guardrail.ts` — pre-check client (rỗng/≤1000 ký tự) + gợi ý câu hỏi hợp lệ. (Không lọc từ khóa chủ đề vì dễ sai — vd "code" cũng là 1 từ vựng; để model quyết định phạm vi.)
- `lib/ai/openai.ts` — gọi Chat Completions `o4-mini` (`max_completion_tokens`, `reasoning_effort: low`, không gửi `temperature`); ánh xạ lỗi 401/403/404/429/4xx/5xx sang tiếng Việt, không lộ key.
- `store/aiStore.ts` — persist `vocab-ai.v1` (KHÔNG prefix `vocab.` ⇒ không lọt vào file backup).
- `features/tutor/Tutor.tsx` — màn chat (`/tutor`): trạng thái chưa-key, gợi ý câu hỏi, loading, xử lý lỗi, xóa hội thoại. Mục cấu hình key/model trong Cài đặt.

**Kết quả test (mock fetch, không cần key thật):** mọi request đều kèm `system` guardrail (đã kiểm chứng), model/tham số đúng; lỗi 401 → thông báo thân thiện; input quá dài bị chặn; **key không xuất hiện trong file sao lưu**. Việc từ chối chủ đề ngoài phạm vi do model o4-mini thực thi theo system prompt (cần key thật để thử trực tiếp — xem checklist trong phần bàn giao).

---

## PHẦN G — CÁ NHÂN HOÁ (LEVEL) · BONG BÓNG AI ĐỌC NGỮ CẢNH · PHÂN QUYỀN

**🧑 Người học:** "Trình mình khác nhau — mới thì cần giảng dễ, giỏi thì học sâu (học 1 hiểu 5/10). Trợ lý nên biết mình đang xem từ nào mà gợi ý luôn. Ở lớp thì cô giáo cắm key, tụi mình chỉ học, không thấy key."

**📊 BA:** (1) *Level* 5 bậc tự đánh giá từ tiến độ, override được, điều khiển độ sâu + gợi ý. (2) *Bong bóng AI* nổi mọi trang, đọc ngữ cảnh trang (từ đang xem/route) → gợi ý & trả lời theo ngữ cảnh + level. (3) *Phân quyền*: admin quản lý provider (model+key) + PIN; học sinh chỉ chọn model & học, không thấy key. ⚠️ **Trung thực:** phân quyền client-side là ranh giới tổ chức/UX, không phải bảo mật cứng — muốn chặt cần proxy backend (baseUrl trỏ về proxy).

**💻 DEV (đã hiện thực & test):**
- `lib/level.ts` — 5 bậc (A1→C1) + `computeLevel(mastered, learned, accuracy)`; `hooks/useEffectiveLevel.ts` (auto/override). Level chèn vào system prompt qua `buildMessages({levelInstruction})`.
- `store/contextStore.ts` + `useProvideContext()` — mỗi màn (FlashcardSession, QuizRunner, Browse, Dashboard) đăng ký ngữ cảnh; `lib/ai/suggestions.ts` sinh gợi ý theo ngữ cảnh+level; ngữ cảnh chèn vào prompt như *tham khảo* (không phá guardrail).
- `store/aiStore.ts` v2 — `providers[]` (label/model/apiKey/baseUrl), `selectedProviderId`, `adminPinHash` (djb2), `adminUnlocked` (session-only, không persist), migrate từ v1 single-key. `isAdmin = pin chưa đặt || đã mở khóa`.
- `components/AssistantFab.tsx` + `features/tutor/TutorChat.tsx` (tách dùng chung) — bong bóng nổi mọi trang, panel responsive, badge level, header model; bỏ route/nav `/tutor` cũ. Cài đặt: `features/settings/AISettings.tsx` (admin: CRUD provider + PIN; học sinh: chọn model + mở khóa) + mục Trình độ.

**Kết quả test (mock fetch):** request kèm cả guardrail + "PHÂN HÓA THEO TRÌNH ĐỘ" (đúng level) + "NGỮ CẢNH TRANG" (đúng từ đang xem); gợi ý bám từ+level; đặt PIN→Khóa→chế độ học sinh ẩn key, chỉ còn chọn model; PIN sai bị từ chối, đúng thì mở khóa; học sinh vẫn chat được. Build TypeScript sạch.

> ⚠️ Client-side thuần: role/level/key đều nằm ở trình duyệt. Đây là ranh giới tổ chức; bảo mật thật cần proxy backend.


---

## PHẦN H — PRODUCTION HOÁ (multi-user, DB, auth, admin, deploy)

*Role-play 3 vai đầy đủ lưu ở `docs/design/production-{user,ba,dev}.md`. Tóm tắt + quyết định v1:*

**🧑 Người dùng:** tự học muốn tài khoản để **đồng bộ đa thiết bị** + không mất tiến độ (migrate localStorage khi đăng nhập lần đầu); giáo viên (admin) muốn **quản lý tài khoản học sinh**, cắm **API key ở server** (học sinh không thấy), giới hạn dùng AI, phân quyền THẬT (kiểm ở server); học sinh chỉ đăng nhập là học. Anti-features: không paywall/quảng cáo/thu thập dữ liệu thừa; xoá phải xác nhận; giữ nguyên trải nghiệm hiện tại.

**📊 BA:** RBAC guest/student/admin; user stories đăng ký/đăng nhập/đăng xuất/đồng bộ/quản trị; NFR bảo mật: hash mật khẩu, JWT, HTTPS, rate-limit, quyền server-side, riêng tư.

**💻 Dev (đề xuất):** Express + TS; SQLite→Postgres; Drizzle ORM; JWT access+refresh cookie HttpOnly; bcrypt; zod; AI proxy server-side giữ key + guardrail; Vite dev proxy; Docker deploy.

**Quyết định v1 đã hiện thực (bám đề xuất, giản lược cho chạy chắc):**
- Backend **Express + TypeScript** chạy bằng `tsx`; **SQLite (better-sqlite3)** truy vấn SQL trực tiếp (đường lên Postgres = thay tầng data). *Drizzle ORM để roadmap.*
- **Auth**: JWT (1 token 30 ngày) trong **cookie HttpOnly**, **bcrypt** (cost 10), **zod** validate, **rate-limit đăng nhập** (in-memory). *Refresh-token rotation để roadmap.*
- **RBAC server-side**: `student | admin`; **user đầu tiên đăng ký = admin**. Middleware `requireAuth`/`requireRole` — quyền quyết định ở SERVER.
- **AI proxy server-side** `/api/ai/chat`: key + guardrail + level + context chạy ở server → **học sinh không bao giờ thấy key** (giải quyết triệt để điểm yếu client trước đây). Provider quản lý trong bảng `ai_providers` (admin) + fallback `OPENAI_API_KEY` env.
- **Đồng bộ tiến độ**: bảng `progress(userId, langCode, dataJson)` — lưu blob JSON; migrate localStorage → server khi đăng nhập lần đầu.
- **Admin**: quản lý tài khoản (list/khoá/mở/xoá/đổi vai/đặt lại mật khẩu), quản lý AI provider.
- **Deploy**: 1 process Node phục vụ `/api` + static `dist`; `.env` (JWT_SECRET, OPENAI_API_KEY, DB_PATH); Dockerfile.

**Roadmap (ghi từ design, chưa làm v1):** Drizzle + migrations, Postgres, refresh-token rotation, quên-mật-khẩu qua email, giới hạn lượt AI/học sinh + usage log, quản lý lớp (mã lớp, tạo hàng loạt, xem tiến độ lớp, xuất CSV), helmet/CORS hardening, HTTPS.

---

## PHẦN I — DEPLOY: CLOUDFLARE PAGES + SUPABASE (thay backend Express v1)

Theo yêu cầu deploy lên **Cloudflare Pages** + **Supabase**, backend Express/SQLite ở Phần H **được thay** bằng kiến trúc serverless (Express không chạy trên Pages/Workers):

- **Frontend tĩnh** → Cloudflare Pages.
- **Supabase**: Auth (email/mật khẩu) + Postgres + **RLS** (`supabase/schema.sql`) — mỗi user chỉ dữ liệu của mình; `profiles` giữ role/status; trigger “user đầu tiên = admin”.
- **Cloudflare Pages Functions** (`functions/`): `/api/ai/chat` (proxy OpenAI, guardrail + level + context, key = secret), `/api/ai/status`, `/api/admin/users` (service-role, chỉ admin).
- **Đồng bộ**: bảng `progress(user_id, lang_code, data jsonb)` qua supabase-js; migrate localStorage → tài khoản.
- Secret (OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY) chỉ ở Cloudflare; `VITE_SUPABASE_*` build-time.
- Hướng dẫn từng bước: **`DEPLOY.md`**. Repo: github.com/dholmes0207/vocabstudy (private).

*Ghi chú: mình không test trực tiếp được Supabase/Cloudflare (cần project + key của bạn); code đã build sạch (frontend + Functions type-check) và chạy chế độ khách OK. Live end-to-end xác minh sau khi bạn cắm Supabase + secret theo DEPLOY.md.*
