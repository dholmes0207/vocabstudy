# Độ trễ khi luyện nghe, đọc, nói (29/10/2026)

**User**: "Cải thiện khi người dùng học nói, phát âm, đọc, nghe ấy, và ngoài tiếng Anh, sẽ ưu tiên
tiếng Trung nữa."

Phần mở app đã làm ở [latency.md](latency.md). Phần này đo từ lúc bấm loa đến lúc nghe tiếng, và từ
lúc nói xong đến lúc có điểm.

## Cách đo

Cùng điều kiện với latency.md: Pixel 7, 4G chậm (độ trễ 150 ms, 1,6 Mbps), CPU chậm 4 lần, trên
Cloudflare thật. Trang đọc truyện `/reading/lans-morning` (tiếng Anh) và `/reading/zh-my-day`
(tiếng Trung), bấm loa ba câu đầu, mỗi câu hai lần. Thời gian tính từ sự kiện `click` trong trang
đến sự kiện `playing` của `<audio>`.

## Trước khi sửa

- **Bấm lần đầu chờ cả một vòng tải**: 0,6–1,9 s tiếng Anh, 1,7–2,0 s tiếng Trung. Màn đọc truyện,
  nghe chép, quiz nghe, luyện số, luyện phát âm chỉ tải clip khi bấm. Mỗi lần bấm lại tạo một
  `<audio>` mới, phải nạp và giải mã lại file dù đã có trong cache (110–130 ms trên máy yếu).
- **Clip hay rơi về giọng máy**: trình phát gửi `Range: bytes=0-`. Với range mở như vậy R2 trả về
  một object có khoá `suffix` mang giá trị `undefined`; `byteSpan` thấy khoá đó nên tính ra
  `Content-Range: bytes NaN-20447/20448`. Trình duyệt từ chối phản hồi 206 này và `pronounce()`
  chuyển sang Web Speech. Lỗi xảy ra mỗi khi clip chưa nằm trong cache của trung tâm dữ liệu Cloudflare gần
  nhất, tức gần như mọi câu truyện, câu ví dụ mới thu.
- **Chấm phát âm chờ khoảng lặng**: `listenOnce` chỉ nhận kết quả cuối. Trình duyệt chờ người học
  im lặng một lúc (thường gần một giây) mới chốt, kể cả khi đã nghe đúng từ ngay.

## Đã làm

- **Chuẩn bị sẵn clip** (`prefetchAudio` trong `src/lib/audio.ts`): tải trước vào cache HTTP (iOS
  Safari bỏ qua `preload`) và giữ sẵn một `<audio>` đã nạp, tối đa 24 clip, cũ nhất bỏ trước. Phát
  xong trả phần tử về để lần bấm sau cũng nhanh. Clip máy chủ báo 404 đọc ngay bằng giọng trình
  duyệt. Không tải trước khi người học bật tiết kiệm dữ liệu.
  - Gọi ở: mọi `SpeakButton` (trừ danh sách duyệt từ, 24 dòng một trang), các câu của truyện đang
    đọc và từ đang tra, nghe chép, câu quiz nghe/đánh vần, luyện số, luyện phát âm, vòng đầu bài
    nghe phân biệt âm.
  - Trang tham khảo của gói (`usePrefetchPackSay`): thanh điệu, biến điệu, bảng thanh mẫu/vận mẫu
    và quiz của Pinyin; 8 thẻ đầu và vòng đoán nghĩa của bảng Hán Việt; các phần của Hangul.
- **Sửa `byteSpan`** (`src/lib/audioServe.ts`): đọc range theo giá trị chứ không theo khoá có mặt.
  `bytes=0-` lại thành một 200 trọn vẹn, service worker lưu được.
- **Chấm sớm khi đã khớp trọn** (`accept` của `listenOnce`): bật kết quả tạm. Khi điều đã nghe
  được khớp hoàn toàn (100 điểm) và giữ nguyên 300 ms, chấm luôn và tắt micro. 300 ms để tránh
  chấm giữa chừng ("cat" khi người học đang nói "category"). Chưa khớp trọn thì vẫn chờ kết quả cuối
  với 5 phương án, dễ dãi hơn với giọng người học. Dùng ở luyện phát âm và "Nói thành tiếng" của
  bài ngữ pháp.

## Sau khi sửa

| Bấm loa (đọc truyện) | Trước                                   | Sau       |
| -------------------- | --------------------------------------- | --------- |
| Tiếng Anh, lần đầu   | 0,6 s; 2 trong 3 câu rơi về giọng máy   | 50–130 ms |
| Tiếng Trung, lần đầu | cả 3 câu rơi về giọng máy sau 0,5–0,6 s | 60–140 ms |
| Bấm lại              | 0,15 s, hoặc lại rơi về giọng máy       | 55–115 ms |

Khi clip đã nằm sẵn trong cache của trung tâm dữ liệu Cloudflare (không dính lỗi range), lần bấm
đầu trước đây mất 0,9–1,9 s (tiếng Anh) và 1,7–2,0 s (tiếng Trung), tính từ cú bấm của Playwright.

Phần chấm sớm không đo được ở đây (cần micro thật). Mức tiết kiệm là khoảng lặng trình duyệt chờ
trước khi chốt, trừ 300 ms.
