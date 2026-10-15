# Bảng chữ cái Hangul

**User**: "Hướng tới nhiều ngôn ngữ, không chỉ dừng ở từ vựng." Người mới học tiếng Hàn chưa
đọc được chữ Hàn, nên 182 thẻ từ chỉ là những hình vẽ lạ. Bước đầu tiên phải là đọc được
Hangul.

**BA**

- Trang **"Bảng chữ cái Hangul"** (`/hangul`) chỉ hiện khi đang học tiếng Hàn. Trang có:
  - **Khối chữ:** ví dụ 한 = ㅎ + ㅏ + ㄴ, đọc từ trái sang phải, từ trên xuống.
  - **Bảng chữ:** 10 nguyên âm cơ bản, 14 phụ âm cơ bản, 5 phụ âm căng, 11 nguyên âm ghép.
    - Chạm vào một chữ thì nghe âm mẫu (ㄱ → 가, ㅏ → 아) và xem: tên chữ, cách đọc kiểu Việt,
      mẹo phát âm, một từ trong gói có chứa chữ đó (bấm vào để nghe).
  - **Tự ghép chữ:** chọn phụ âm đầu, nguyên âm, phụ âm cuối; app ghép thành khối, ghi cách
    đọc và đọc to lên.
  - **Phụ âm cuối (받침):** 7 âm cuối, mỗi âm có ví dụ từ gói (책, 돈, 옷, 물, 밤, 밥, 방).
  - **Kiểm tra nhanh** 10 câu:
    - 5 câu nhìn chữ cái chọn cách đọc;
    - 5 câu nhìn khối chữ chọn cách đọc. Đáp án nhiễu có chung phụ âm hoặc chung nguyên âm,
      nên phải đọc cả hai phần.
    - Làm xong được XP: 5 + 2 × câu đúng, cộng thêm 5 nếu đúng hết. Không lưu thêm dữ liệu
      mới, nên trang Quyền riêng tư không cần sửa.
- **Menu theo ngôn ngữ:**
  - Khi học tiếng Hàn, ô "Mẫu câu" (tiếng Anh) ở thanh dưới điện thoại được thay bằng
    "Hangul".
  - Thanh bên, menu tài khoản, trang Luyện tập và trang chủ ẩn Ngữ pháp, Chủ đề, Đọc truyện,
    Mẫu câu, Âm khó.
  - Ngày 5 của "Hành trình 7 ngày đầu" đổi từ "Âm khó" sang "Đọc bảng chữ Hangul".
  - Mở một đường dẫn cũ tới trang chỉ có cho tiếng Anh (ví dụ `/grammar` khi đang học tiếng
    Hàn) thì app không báo lỗi. Thay vào đó là một ghi chú kèm nút "Chuyển sang tiếng Anh".

**Dev**

- `src/lib/hangul.ts` chứa bảng chữ, hàm `compose` / `decompose` và `readSyllable`.
  - `compose` / `decompose` dùng công thức Unicode `0xAC00 + (đầu × 21 + giữa) × 28 + cuối`.
  - `readSyllable` đọc từng khối riêng lẻ, chưa áp dụng biến âm giữa các khối (nối âm, căng
    âm).
  - `hangulQuiz(count, rand)` sinh câu hỏi kiểm tra.
- Cách đọc theo cùng quy ước với `viRead` của `public/data/ko.json`: ㅅ → x, ㅈ/ㅊ → ch,
  ㅓ → ơ, âm tắc cuối khối có dấu sắc (밥 → "báp"). Test kiểm tra mọi từ một khối trong gói
  (네, 밥, 책, 형…) đọc khớp với `readSyllable`.
- Kiểm tra nhanh bỏ ㅊ và phụ âm căng ở phần đọc khối, vì cách đọc kiểu Việt của chúng trùng
  với ㅈ và phụ âm thường. Khối chữ được lấy bằng cách xáo trộn danh sách đầy đủ một lần, nên
  luôn dừng được.
  - Bản đầu chọn ngẫu nhiên từng khối rồi bỏ khối trùng. Với `Math.random` cố định, cách đó
    lặp mãi đến tràn bộ nhớ (test component đã bắt được lỗi này).
- Âm thanh dùng giọng đọc `ko-KR` của trình duyệt. Một chữ cái đứng riêng thì giọng đọc không
  đọc được, nên mỗi chữ có một khối mẫu `sample` để phát.
- **Màn hình theo gói:** `src/lib/packContent.ts` là nơi duy nhất ghi màn hình nào thuộc gói
  nào.
  - `Layout` (thanh bên và thanh dưới), `UserMenu`, trang Luyện tập, `Dashboard` và
    `journeyFor` đều đọc từ đây.
  - `Layout` hiện `PackOnly` thay cho màn hình khi gói hiện tại không có màn hình đó.
  - Trường `englishOnly` của mục Luyện tập đã bỏ.

## Bước tiếp theo

- Bài đọc ghép âm, ví dụ 한국어 → "han-cu-gơ" (nối âm).
- Giọng thu sẵn (edge-tts `ko-KR-SunHiNeural`) sau khi audio chuyển sang R2.
