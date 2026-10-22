# Audio trên Cloudflare R2

## Vấn đề

- Cloudflare Pages (gói Free) nhận tối đa **20.000 file** mỗi lần deploy.
- Ngày 21/10/2026: `main` deploy 18.089 file, trong đó audio tiếng Anh đã chiếm 17.961
  (8.980 file × 2 giọng). Thêm audio tiếng Hàn (1.144) và tiếng Trung (1.320) thì lên 20.555,
  Pages sẽ từ chối deploy.
- Mỗi 100 từ tiếng Anh mới cũng thêm 400 file (từ + câu ví dụ, 2 giọng), nên dù không có tiếng
  Hàn/Trung thì sớm muộn cũng chạm trần.

## Cách làm

- `public/audio/` trong repo vẫn là nguồn gốc. Script sinh audio, test `packAudio.test.ts` và
  workflow "Generate audio" giữ nguyên.
- Bucket R2 giữ một bản sao (mặc định tên `vocastudy-audio`), khoá giống đường dẫn trong
  `public/audio`: `ko/sunhi/w12.mp3`, `ko/index.json`.
- Workflow **"Sync audio to R2"** (`.github/workflows/audio-sync.yml`):
  - mỗi lần push lên `main` có đổi `public/audio`, chỉ gửi file thêm hoặc sửa, xoá file đã bỏ;
  - chạy tay thì đồng bộ toàn bộ, dùng một lần để đổ đầy bucket rỗng.
- **Pages Function** `functions/audio/[[path]].ts` trả `/audio/*` từ bucket qua binding
  `AUDIO_BUCKET`:
  - đường dẫn không đổi, nên service worker (cache để học offline), header cache và mọi chỗ phát
    audio giữ nguyên;
  - hỗ trợ `Range` (Safari luôn xin từng đoạn) và `If-None-Match` (trả 304);
  - xin cả file (`bytes=0-`) thì trả 200 chứ không trả 206, vì service worker chỉ lưu được 200;
  - không có binding, hoặc bucket thiếu file, thì trả file tĩnh của bản deploy; file không có ở
    đâu cả thì trả 404. Không để Pages trả `index.html` với mã 200, vì service worker sẽ lưu
    trang đó thay cho file mp3 và người học không bao giờ nghe được từ đó nữa.
- Biến **`AUDIO_FROM_R2=1`** trên Cloudflare Pages: bản build bỏ thư mục `audio` (plugin
  `audioFromR2` trong `vite.config.ts`). Khi đó deploy còn khoảng 130 file. Chưa đặt biến thì
  bản build giữ audio như cũ, nên merge code trước khi bucket sẵn sàng vẫn an toàn.

Vì sao không dùng tên miền riêng (`audio.vocastudy.app`) trỏ thẳng vào bucket: service worker
bỏ qua mọi request khác tên miền, nên audio sẽ không còn dùng được khi mất mạng; ngoài ra phải
cấu hình CORS cho `prefetchAudio`.

Đánh đổi: mỗi lần tải một file audio là một lượt gọi Function. Gói Free cho 100.000 lượt mỗi
ngày (chung cho Workers và Pages Functions). Service worker và header `Cache-Control` một tháng
giúp mỗi người học chỉ tải mỗi file một lần. Nếu sau này vượt mức đó, có thể chuyển sang tên miền
riêng cho bucket (phải xử lý offline như trên) hoặc lên gói trả phí.

## Cài đặt (làm một lần, trên Cloudflare và GitHub)

1. Cloudflare → **R2** → Create bucket, tên `vocastudy-audio`. Không cần bật truy cập công
   khai.
2. R2 → **Manage API tokens** → Create API token:
   - quyền **Object Read & Write**, chỉ cho bucket `vocastudy-audio`;
   - ghi lại Access Key ID, Secret Access Key, và Account ID (ở trang tổng quan R2).
3. GitHub → repo → Settings → Secrets and variables → Actions → **New repository secret**:
   - `R2_ACCOUNT_ID`;
   - `R2_ACCESS_KEY_ID`;
   - `R2_SECRET_ACCESS_KEY`.
   - Nếu đặt tên bucket khác: thêm biến (Variables) `R2_AUDIO_BUCKET`.
4. GitHub → Actions → **Sync audio to R2** → Run workflow. Lần đầu gửi khoảng 19.000 file,
   vài phút.
5. Cloudflare → Pages → dự án → Settings → **Bindings** → Add → R2 bucket:
   - tên biến `AUDIO_BUCKET`, chọn `vocastudy-audio`;
   - làm cho cả Production và Preview.
6. Cùng trang Settings → **Variables and Secrets**: thêm `AUDIO_FROM_R2` = `1` cho Production
   và Preview.
7. Deploy lại (Retry deployment, hoặc merge PR kế tiếp). Kiểm tra:
   - log build trên Pages chỉ tải lên khoảng 130 file;
   - `https://vocastudy.app/audio/en/aria/w1.mp3` trả `200 audio/mpeg` và có header
     `X-Audio-Source: r2` (`curl -sI <địa chỉ> | grep -i x-audio-source`);
   - `https://vocastudy.app/audio/en/aria/w99999.mp3` trả `404`.

   Đừng dựa vào mã 206 khi gửi `Range`: bộ nhớ đệm CDN của Cloudflare cũng trả 206 cho file
   tĩnh, nên mã này không chứng minh audio đến từ R2.

Thứ tự 4 → 5 → 6 quan trọng: bucket phải có file trước khi bản deploy bỏ audio. Nếu làm ngược,
trong lúc chờ app vẫn chạy, chỉ là đọc bằng giọng trình duyệt.

## Kiểm tra đã làm

- `src/lib/audioServe.test.ts`: khoá hợp lệ, kiểu nội dung, mọi dạng `Range` của R2.
- `wrangler pages dev` với R2 cục bộ, bản build ở chế độ `AUDIO_FROM_R2=1`:
  - cả file 200 và trùng từng byte với file gốc;
  - `bytes=0-` trả 200; `bytes=0-1`, `bytes=100-199`, `bytes=-100` trả 206 đúng `Content-Range`;
  - `If-None-Match` trả 304; `HEAD` đúng `Content-Length`;
  - file không có và đường dẫn lạ trả 404.
- Chromium có service worker: phát được qua Function, file được lưu vào cache
  `vocabstudy-content-v3`, ngắt mạng vẫn phát được.
- Workflow đồng bộ chạy thử với `aws` giả:
  - push PR tiếng Hàn: gửi đúng 1.145 file vào `ko/…`;
  - chạy tay: đồng bộ cả 19.106 file;
  - chưa có secret: chỉ cảnh báo.
