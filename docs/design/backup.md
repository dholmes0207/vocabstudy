# Sao lưu cơ sở dữ liệu hằng tuần

**User** (chủ dự án): "Nếu lỡ tay xoá bảng, hay project Supabase bị xoá, thì tài khoản và tiến độ của người học có
lấy lại được không?"

Hiện tại là không: gói miễn phí của Supabase không giữ bản sao lưu nào. Đây là việc 0.7 trong Phần 0 của
`docs/PLAN.md`.

## BA

- Mỗi tuần một lần, một tác vụ tự động chép dữ liệu người học ra ngoài Supabase:
  - toàn bộ schema `public`: hồ sơ, tiến độ đồng bộ, lượt dùng AI, góp ý, lỗi đã ghi nhận;
  - dòng đăng nhập trong `auth.users` và `auth.identities`, để khôi phục được cả tài khoản.
- Bản sao được **mã hoá** bằng một mật khẩu chỉ chủ dự án giữ, rồi lưu vào một bucket R2 **riêng tư**.
  - Không lưu thành artifact của GitHub Actions: repo công khai thì ai đăng nhập GitHub cũng tải được artifact.
  - Không dùng chung bucket audio: bucket đó được `functions/audio/[[path]].ts` phát công khai.
- Giữ 12 bản mới nhất, tức khoảng ba tháng.
- Chưa cấu hình thì tác vụ chỉ cảnh báo, không báo lỗi.
- Bản sao chứa email và mật khẩu đã băm của người học. Cloudflare đã là bên xử lý dữ liệu trong chính sách bảo mật
  (lưu trữ trang web, máy chủ và bảo mật), nên không có bên nhận dữ liệu mới. Khi bật sao lưu, thêm vào chính sách
  một dòng nói rằng dữ liệu tài khoản có bản sao lưu được mã hoá, giữ khoảng ba tháng
  (`src/features/marketing/legal.ts`).

## Chủ dự án cần làm một lần

1. Cloudflare → R2: tạo bucket `vocastudy-backup`, **không** bật truy cập công khai. Nếu đặt tên khác thì thêm biến
   `R2_BACKUP_BUCKET` trong GitHub → Settings → Secrets and variables → Actions → Variables.
2. Kiểm tra token R2 đang dùng cho audio (`R2_ACCESS_KEY_ID`) có quyền ghi vào bucket mới. Nếu token chỉ giới hạn
   cho bucket audio thì thêm bucket mới vào quyền của token.
3. Supabase → Project Settings → Database → Connection string → **Session pooler**: chép chuỗi kết nối (có mật khẩu
   cơ sở dữ liệu) vào secret `SUPABASE_DB_URL`. Dùng Session pooler vì máy chạy của GitHub chỉ có IPv4.
4. Đặt secret `BACKUP_PASSPHRASE` là một mật khẩu dài, và **lưu mật khẩu đó ở nơi khác** (trình quản lý mật khẩu).
   Mất mật khẩu này thì mọi bản sao lưu không mở được.
5. GitHub → Actions → "Back up the database" → Run workflow. Lần chạy đầu phải báo "Backup … stored".

## Khôi phục

```bash
# 1. Tải bản mới nhất từ R2 (Cloudflare → R2 → vocastudy-backup → db/) rồi giải mã
gpg -d backup-2026-11-15T1941Z.tar.gz.gpg | tar -xzf -

# 2. Trên project Supabase mới: tạo lược đồ trước
#    (SQL editor → chạy supabase/schema.sql)

# 3. Nạp tài khoản rồi tới dữ liệu
psql "$NEW_DB_URL" -f auth.sql
psql "$NEW_DB_URL" -f public.sql
```

- `public.sql` có cả lệnh tạo bảng; trên project đã chạy `schema.sql` thì các lệnh đó báo "already exists" và phần
  dữ liệu vẫn được nạp. Nếu muốn chỉ nạp dữ liệu, thêm `--data-only` khi tạo bản sao.
- Mỗi quý thử khôi phục một lần vào một project thử (nhịp hằng quý trong `docs/PLAN.md`). Bản sao lưu chưa từng
  được khôi phục thử thì chưa chắc dùng được.

## Dev

- `.github/workflows/backup.yml`:
  - chạy 19:41 UTC thứ Bảy (02:41 Chủ nhật giờ Việt Nam), có `workflow_dispatch` để chạy tay;
  - `pg_dump` chạy trong image `postgres:17-alpine`, vì client phải không cũ hơn máy chủ;
  - kiểm tra dòng "PostgreSQL database dump complete" ở cuối mỗi tệp trước khi tải lên, để một bản dở dang không
    được tính là bản sao lưu;
  - nén, mã hoá bằng `gpg --symmetric` (AES-256), tải lên `db/backup-<thời điểm>.tar.gz.gpg`;
  - xoá các bản cũ hơn 12 bản mới nhất;
  - `permissions: {}`: không cần quyền nào trên repo.
- Lịch này cũng chịu quy tắc của GitHub với repo công khai: 60 ngày không có hoạt động thì lịch bị tắt
  (`docs/design/keepalive.md`).

## Giới hạn

- Đã thử trên máy phát triển: cách truyền tham số cho `pg_dump`, mã hoá rồi giải mã, và quy tắc giữ 12 bản. **Chưa
  chạy với cơ sở dữ liệu và bucket thật**, vì cần secret của chủ dự án; bước 5 ở trên là lần kiểm tra đó.
- Bản sao theo tuần: mất tối đa bảy ngày dữ liệu đồng bộ. Tiến độ trên máy người học vẫn còn và được gộp lại khi họ
  mở app (`src/lib/sync.ts`).
