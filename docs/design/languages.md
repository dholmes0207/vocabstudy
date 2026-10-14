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
  - `PracticeEntry.englishOnly` ẩn Ngữ pháp, Chủ đề và Âm khó với gói khác tiếng Anh;
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
- **Trợ lý AI:** lời nhắc hệ thống hiện chỉ cho phép phạm vi từ vựng tiếng Anh. Mở rộng
  sang ngôn ngữ khác cần soát lại guardrail; tạm giữ nguyên.
