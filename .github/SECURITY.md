# Chính sách bảo mật / Security policy

## Báo lỗ hổng

Nếu bạn tìm thấy lỗ hổng bảo mật trong VocaStudy (vocastudy.app hoặc mã nguồn trong repo này), xin **đừng mở issue
công khai**. Hãy gửi email tới **contact@vocastudy.app** với:

- mô tả lỗ hổng và ảnh hưởng của nó;
- các bước tái hiện, hoặc một ví dụ tối thiểu;
- trình duyệt, thiết bị hoặc đường dẫn liên quan.

Chúng tôi sẽ xác nhận đã nhận thư sớm nhất có thể và báo lại khi lỗi được sửa. Xin cho chúng tôi thời gian sửa trước
khi công bố chi tiết.

## Phạm vi

- Ứng dụng web tại `vocastudy.app` và các API `/api/*` (Cloudflare Pages Functions).
- Mã nguồn trong repo này, gồm lược đồ cơ sở dữ liệu ở `supabase/schema.sql`.

Ngoài phạm vi: tấn công từ chối dịch vụ, thư rác, và lỗi của dịch vụ bên thứ ba (Cloudflare, Supabase, OpenAI). Lỗi của
các dịch vụ đó xin báo cho chính nhà cung cấp.

## Xin đừng

- Truy cập, sửa hay xoá dữ liệu của người học khác.
- Chạy công cụ quét tự động với cường độ làm ảnh hưởng tới người đang học.

---

## Reporting a vulnerability

Please **do not open a public issue** for a security problem. Email **contact@vocastudy.app** with a description, the
steps to reproduce it and the affected browser, device or URL. We will confirm receipt as soon as we can and tell you
when it is fixed; please give us time to fix it before publishing details.

In scope: the web app at `vocastudy.app`, its `/api/*` endpoints and the code in this repository. Out of scope:
denial-of-service, spam and flaws in third-party services (Cloudflare, Supabase, OpenAI).

Please do not access, change or delete other learners' data, and do not run automated scanners at a rate that affects
people who are learning.
