# Nhiều ngôn ngữ (ngoài tiếng Anh)

**User**: "Hướng tới không chỉ tiếng Anh mà nhiều ngôn ngữ khác nữa."

**BA**

- Một gói ngôn ngữ mới (ví dụ tiếng Hàn) phải dùng được ngay với các phần lõi:
  - Học, Ôn, Kiểm tra;
  - Ghép cặp, Xếp câu;
  - Tra cứu, Nghe thụ động, Thống kê.
- Giao diện phải nói đúng tên ngôn ngữ đang học ("Gõ từ tiếng Hàn…"), không được viết cứng
  "tiếng Anh".
- Nội dung chỉ viết cho tiếng Anh thì ẩn khi học ngôn ngữ khác:
  - Ngữ pháp căn bản, Học theo chủ đề, Âm khó cho người Việt;
  - ước tính "% từ hiểu được" (lấy từ dữ liệu tần suất tiếng Anh).
- Gói mới ghi rõ "beta" trong mô tả.

**Dev**

- Đợt chuẩn bị (15/10/2026) đã xong:
  - `lib/targetLang.ts` và `hooks/useTargetLang.ts` lấy tên ngôn ngữ từ `pack.meta` để
    đưa vào câu ("tiếng Hàn" / "Korean");
  - đã thay các chuỗi viết cứng ở Cài đặt, Tra cứu, Ghép cặp, Xếp câu, Kiểm tra, Câu của
    bạn, trang chủ;
  - nhãn câu hỏi trắc nghiệm dùng cách nói trung lập;
  - `PracticeEntry.englishOnly` ẩn Ngữ pháp, Chủ đề và Âm khó với gói khác tiếng Anh. Từ
    ngày 15/10/2026, việc này chuyển sang `lib/packContent.ts`, dùng chung cho mọi menu (xem
    `hangul.md`);
  - Nghe thụ động chỉ hiện IPA khi từ có IPA.
- **Định dạng từ cho gói không phải tiếng Anh:**
  - `ipa` để trống;
  - `viRead` là cách đọc kiểu Việt, hữu ích hơn phiên âm Latin với người Việt;
  - `wordForms` (biến đổi từ tiếng Anh) không tìm được dạng chia động từ, nên Kiểm tra tự
    lùi về dạng câu hỏi "vi-to-en". Đã có sẵn đường lùi này, không bị vỡ.
- **Giới hạn file:**
  - `public/` có 17.977 file, giới hạn của Cloudflare Pages là 20.000;
  - audio của gói mới tạm dựa vào giọng đọc của trình duyệt (Web Speech, có `ko-KR` trên
    Chrome/Edge/Android/iOS);
  - muốn dùng audio edge-tts cho gói mới thì cần chuyển audio sang R2. **Việc này cần chủ
    dự án làm.**
- **Gói tiếng Hàn beta** (`public/data/ko.json`): bản đầu có 81 từ, ngày 15/10/2026 tăng
  lên 182 từ.
  - Chủ đề của bản đầu: chào hỏi, con người, ăn uống, nơi chốn, thời gian, đồ vật, động từ
    và tính từ thông dụng.
  - Đợt 2 thêm:
    - câu chào khi chia tay, trước bữa ăn, lần đầu gặp;
    - từ để hỏi: 뭐, 어디, 언제, 누구, 얼마, 왜;
    - số đếm thuần Hàn 하나 / 둘 / 셋 và đơn vị tiền 원;
    - màu sắc, bộ phận cơ thể, phương tiện đi lại, nơi chốn trong thành phố, đồ ăn uống,
      buổi trong ngày, thứ;
    - 23 động từ và 13 tính từ hay dùng.
  - Hai quy tắc giữ cho gói dùng tốt với trắc nghiệm, đều có test:
    - **Mỗi từ một nghĩa riêng.** Khi hai từ gần nghĩa thì ghi rõ khác biệt. Ví dụ 공부하다
      là "học", còn 배우다 là "học (một kỹ năng, môn học)".
    - **Ví dụ của danh từ và cụm cố định phải chứa đúng mặt chữ của từ**, vì thẻ học gạch
      chân và câu hỏi điền chỗ trống tìm theo chuỗi Hangul. Cũng tránh ví dụ mà từ chỉ nằm
      bên trong một từ dài hơn (밤 trong 어젯밤).
  - Câu ví dụ dùng đuôi lịch sự -아요/-어요.
  - `viRead` đọc theo **cách phát âm thật**, không theo chính tả (감사합니다 →
    "cam-xa-ham-ni-đa", 한국어 → "han-cu-gơ") và theo chính tả tiếng Việt (고기 →
    "cô-ghi"). Âm căng (ㅃ, ㄸ…) không viết đôi.
  - `src/lib/koreanPack.test.ts` kiểm tra gói có trong manifest, id liền mạch, đủ Hangul /
    cách đọc / nghĩa / ví dụ, và `ipa` để trống.
  - Đã chạy thử trọn một phiên học tiếng Hàn: thẻ, gạch chân từ trong ví dụ, câu hỏi chỗ
    trống với chữ Hàn.
- **Trợ lý AI:** lời nhắc hệ thống hiện chỉ cho phép phạm vi từ vựng tiếng Anh. Mở rộng
  sang ngôn ngữ khác cần soát lại guardrail; tạm giữ nguyên.

## Gói thứ ba: tiếng Trung (15/10/2026)

- `public/data/zh.json` có 132 từ HSK 1 kèm pinyin, sinh từ `scripts/build_zh_pack.py`.
  Chi tiết thiết kế ở `chinese.md`.
- Hai thay đổi dùng chung cho mọi gói:
  - `tokenize()` tách cả theo ZWSP (U+200B), là ranh giới từ vô hình trong câu tiếng Trung.
  - `meta.readingLabel`: gói nào có trường này thì nhãn cách đọc lấy tên từ đó ("pinyin"),
    thay vì "đọc gần giống".
- Nghe – chép so từng chữ với chữ Hán. Trợ lý AI có thêm mục `zh` trong danh sách cho phép.

## Âm Hán Việt cho tiếng Hàn (16/10/2026)

- Từ Hán Hàn cũng có âm Hán Việt (학생 學生 = học sinh, 병원 病院 = bệnh viện). Thẻ học của
  tiếng Hàn hiện thêm dòng này, dùng chung `components/HanViet.tsx` với tiếng Trung.
- 48 từ có âm Hán Việt. Chỉ ghi khi **mọi** khối trong từ đều là Hán Hàn, và mỗi khối ứng
  với đúng một âm tiết. Không ghi cho:
  - từ thuần Hàn (사람, 이름);
  - từ mượn (택시, 호텔);
  - từ ghép lẫn (선생님 = 先生 + 님, mọi từ có 하다).

  Test kiểm tra các điều kiện này.

- Tra cứu tìm được theo âm Hán Việt cho cả hai gói: "hoc sinh" ra 학생 và 学生.

## Mở app thẳng vào một ngôn ngữ (17/10/2026)

- **User:** người muốn học tiếng Hàn hay tiếng Trung vào trang chủ thì luôn rơi vào tiếng
  Anh, phải tự tìm nút ngôn ngữ trong app.
- **BA:**
  - Dưới nút "Bắt đầu học miễn phí" của trang chủ có thêm dòng "Hoặc học 🇰🇷 tiếng Hàn · 🇨🇳
    tiếng Trung (beta)".
  - Đường dẫn `/home?lang=ko` hoặc `/home?lang=zh` mở app ở ngôn ngữ đó; dùng được cả khi
    chia sẻ.
- **Dev:** hook `useLangParam` chạy trong `Layout`.
  - Đợi danh sách gói tải xong, rồi chuyển ngôn ngữ nếu mã có trong danh sách. Mã lạ
    (`?lang=fr`) bị bỏ qua.
  - Sau đó xoá `lang` khỏi URL, để tải lại trang không ghi đè lựa chọn người học làm sau.
  - Có test cho cả ba trường hợp: mã hợp lệ, mã lạ, danh sách gói chưa tải xong.

## Gói tiếng Hàn: 192 từ (17/10/2026)

- Thêm 10 từ rất hay gặp mà truyện A2 cần: 저, 정말, 아주, 조금, 같이, 그리고, 그래서, 요즘,
  열심히, 내년. Riêng 내년 (來年) có âm Hán Việt "lai niên".
- Cách đọc theo quy ước cũ: ㄱ đứng đầu ghi "c" trước ư (그리고 → "cư-ri-gô"), và đọc theo
  phát âm thật (열심히 → "yơl-xi-mi", 같이 → "ca-chi").

## Lộ trình luyện thi (17/10/2026)

- Gói tiếng Trung có lộ trình HSK 1, gói tiếng Hàn có lộ trình TOPIK I (`/exam`; xem
  `exam-track.md`).
- Thêm kỳ thi cho một gói mới thì thêm một mục vào `EXAMS` trong `lib/exams.ts` và mã gói
  vào `/exam` trong `lib/packContent.ts`.

## Tiếng Hàn: thêm 61 từ (20/10/2026)

**User**: "Tiếp tục cho mình". Hướng đã đề xuất là làm cho tiếng Hàn tương tự tiếng Trung. Gói
tiếng Hàn mới có 192 từ, ít hơn hẳn 330 từ của tiếng Trung, và còn thiếu nhiều từ cơ bản của
trình độ TOPIK I.

**BA**

- Thêm 61 từ, gói tăng lên **253 từ**:
  - **gia đình**: 아버지, 어머니, 할머니, 할아버지, 오빠, 누나, 남편, 아내, 아들, 딸;
  - **thứ trong tuần**: 화요일 → 토요일 (trước đây chỉ có 월요일, 일요일);
  - **mùa**: 봄, 가을;
  - **số Hán Hàn** (일, 이, 삼, 십, 백, 천, 만) và **số thuần Hàn** (넷, 다섯, 열). Đi đôi với
    màn "Nghe số" của tiếng Hàn (`numbers.md`);
  - **đồ vật**: 시계, 우산, 신발, 책상, 의자, 안경;
  - **nơi chốn**: 백화점, 편의점, 우체국, 대학교;
  - **động từ**: 입다, 씻다, 놀다, 웃다, 울다, 팔다, 보내다, 시작하다, 끝나다;
  - **tính từ**: 길다, 짧다, 높다, 따뜻하다, 시원하다, 깨끗하다, 무겁다;
  - **trạng từ**: 많이, 빨리, 천천히, 다시, 항상, 자주, 아직, 너무.
- **Cách đọc kiểu Việt** viết tay theo quy ước sẵn có, có áp dụng biến âm:
  - nối âm: 목요일 → mô-gyô-il;
  - âm hữu thanh giữa từ: 아들 → a-đưl, 시계 → xi-ghê;
  - âm ㅎ bị nuốt: 시원하다 → xi-uơ-na-đa, 천천히 → chơn-chơ-ni;
  - bật hơi: 백화점 → be-khoa-chơm, 시작하다 → xi-cha-kha-đa;
  - phụ âm căng: 오빠 → ôp-pa, 짧다 → chal-ta.
- **Âm Hán Việt** có cho 23 từ gốc Hán, ví dụ 화요일 hoả diệu nhật, 우체국 bưu đệ cục, 편의점 tiện
  nghi điếm. Các từ này được thêm vào trang "Gốc Hán qua âm Hán Việt".
- **Nghĩa không trùng**: 많이 và 빨리 ghi "(trạng từ)" để không trùng với 많다 ("nhiều") và 빠르다
  ("nhanh"). Mỗi câu hỏi chọn nghĩa vì vậy chỉ có một đáp án đúng.
- Mỗi từ có câu ví dụ ngắn. Danh từ, số và trạng từ xuất hiện nguyên dạng trong câu, nên thẻ gạch
  chân được.
- Mọi từ đều nằm trong bộ chủ đề (gia đình, nơi chốn, thời gian, mua sắm, miêu tả, hoạt động
  hằng ngày). Trang chủ ghi 253 từ, tổng "5.000+".

**Dev**

- `public/data/ko.json` được sửa tay như các đợt trước (không có script dựng); phiên bản 0.5.0.
- `scripts/build_topics_ko.py` (danh sách bộ chủ đề) và `public/data/index.json`.
- `koreanPack.test.ts`, `topics.test.ts`, `landingClaims.test.ts` kiểm tra số từ, nghĩa không
  trùng, từ có trong câu ví dụ, âm Hán Việt một âm cho mỗi khối chữ.
