# Production hoá — Vai Business Analyst

# Tài liệu Phân tích Nghiệp vụ (BA) — Production hoá VocabStudy

_Phiên bản: 1.0 · Ngày: 08/08/2026 · Người soạn: BA · Trạng thái: Draft để review_

---

## 0. Tóm tắt điều hành

VocabStudy hiện là ứng dụng học 1000 từ vựng tiếng Anh chạy client-side (React + Vite), lưu tiến độ trong `localStorage`, và để lộ API key OpenAI cùng cơ chế "phân quyền" ngay trên trình duyệt — không an toàn cho nhiều người dùng. Tài liệu này định nghĩa phạm vi, yêu cầu và tiêu chí nghiệm thu để chuyển sản phẩm sang bản **production đa người dùng**: có database thật, đăng ký/đăng nhập, quản trị tài khoản, guardrail + API key AI đặt phía server, và triển khai được lên server.

**Ràng buộc kiến trúc cốt lõi:** giữ nguyên frontend React/Vite hiện có; bổ sung một tầng backend + database chạy được local (không phụ thuộc dịch vụ đám mây bắt buộc) và test được.

**Đề xuất stack (mức nghiệp vụ, để tham chiếu):**

| Thành phần  | Lựa chọn đề xuất                                                          | Lý do                                      |
| ----------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| Frontend    | Giữ React 18 + Vite + TS + Tailwind (HashRouter → cân nhắc BrowserRouter) | Không phá vỡ đầu tư hiện có                |
| Backend API | Node.js + TypeScript (Fastify/Express hoặc NestJS)                        | Cùng ngôn ngữ FE, dễ tuyển/bảo trì         |
| Database    | PostgreSQL (prod) + SQLite (dev/test) qua ORM (Prisma)                    | Chạy local dễ, migrate an toàn, test nhanh |
| Xác thực    | JWT access ngắn hạn + refresh token trong cookie `httpOnly`               | Cân bằng bảo mật & đa thiết bị             |
| AI proxy    | Endpoint server-side giữ key + guardrail + rate limit                     | Học sinh không thấy key                    |
| Triển khai  | Docker Compose (FE tĩnh + API + Postgres)                                 | Chạy local và deploy VPS như nhau          |

---

## 1. Vision & Phạm vi

### 1.1 Tầm nhìn

Đưa VocabStudy từ công cụ cá nhân thành **nền tảng học từ vựng nhiều người dùng an toàn**, nơi mỗi học sinh có tài khoản, tiến độ đồng bộ đa thiết bị, còn giáo viên/admin quản lý người dùng và cấu hình AI tập trung, chi phí và bảo mật được kiểm soát.

### 1.2 Ngoài phạm vi (Out of scope) ở bản production đầu tiên

- Thanh toán/gói trả phí, hóa đơn.
- Ứng dụng mobile native (chỉ web responsive).
- Nội dung ngoài 1000 từ hiện có / thêm ngôn ngữ mới (kiến trúc chừa chỗ nhưng chưa làm).
- Social login (Google/Facebook) — có thể thêm sau.
- Realtime lớp học (chat trực tiếp, bảng xếp hạng thời gian thực).

### 1.3 Phân kỳ

| Giai đoạn              | Nội dung chính                                                                                                                                                                                                                                     | Mục tiêu                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **MVP Production**     | DB thật; đăng ký/đăng nhập/đăng xuất/quên mật khẩu; đồng bộ tiến độ đa thiết bị; RBAC 4 vai; admin quản lý tài khoản (list/khoá/xoá/đổi vai); AI proxy server-side có guardrail + rate limit + usage log; deploy bằng Docker Compose; test tự động | Chạy an toàn cho nhiều người dùng thực |
| **Sau này (Post-MVP)** | Class/Enrollment (lớp học), báo cáo tiến độ theo lớp cho giáo viên, social login, đa ngôn ngữ nội dung, giới hạn ngân sách AI theo lớp, export dữ liệu học sinh, audit log chi tiết                                                                | Mở rộng quy mô & trường học            |

---

## 2. Vai trò & Phân quyền (RBAC)

### 2.1 Định nghĩa vai trò

| Vai trò             | Mô tả                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **Guest**           | Chưa đăng nhập. Học thử/tra cứu, không lưu tiến độ trên server.                                        |
| **Student**         | Người học đã đăng ký. Có tiến độ cá nhân đồng bộ, dùng AI qua server.                                  |
| **Teacher (Admin)** | Quản trị vận hành: quản lý tài khoản học sinh, cấu hình AI provider, xem usage.                        |
| **Super-admin**     | Quyền cao nhất: quản lý cả teacher/admin, cấu hình hệ thống, khôi phục/sao lưu, xem toàn bộ audit log. |

### 2.2 Bảng quyền (RBAC Matrix)

| Chức năng / Vai trò                                      |                      Guest                      |                Student                |                Teacher (Admin)                |      Super-admin       |
| -------------------------------------------------------- | :---------------------------------------------: | :-----------------------------------: | :-------------------------------------------: | :--------------------: |
| Học flashcard / quiz / tra cứu                           |                 ✅ (không lưu)                  |                  ✅                   |                      ✅                       |           ✅           |
| Nghe audio Neural (TTS)                                  |                       ✅                        |                  ✅                   |                      ✅                       |           ✅           |
| Đăng ký / đăng nhập                                      |            ✅ (để trở thành Student)            |                   —                   |                       —                       |           —            |
| Lưu & đồng bộ tiến độ đa thiết bị                        |                       ❌                        |             ✅ (của mình)             |                 ✅ (của mình)                 |     ✅ (của mình)      |
| Tự đặt LEVEL (1–5)                                       |                    Local tạm                    |                  ✅                   |                      ✅                       |           ✅           |
| Dùng trợ lý AI qua server                                | ⚠️ giới hạn/ẩn danh (tuỳ chính sách, rate thấp) |                  ✅                   |                      ✅                       |           ✅           |
| Xem danh sách người dùng                                 |                       ❌                        |                  ❌                   |                 ✅ (student)                  |      ✅ (tất cả)       |
| Khoá / mở khoá tài khoản                                 |                       ❌                        |                  ❌                   |                 ✅ (student)                  | ✅ (student + teacher) |
| Xoá tài khoản                                            |                       ❌                        | ❌ (chỉ xoá tài khoản của chính mình) |           ✅ (student, soft-delete)           |      ✅ (tất cả)       |
| Đổi vai người dùng                                       |                       ❌                        |                  ❌                   | ⚠️ chỉ trong student ↔ (không nâng lên admin) |      ✅ (mọi vai)      |
| Cấu hình AI Provider (key server-side, model, guardrail) |                       ❌                        |                  ❌                   |                      ✅                       |           ✅           |
| Xem UsageLog / chi phí AI                                |                       ❌                        |           ❌ (chỉ của mình)           |                 ✅ (tổng hợp)                 |     ✅ (chi tiết)      |
| Cấu hình hệ thống (rate limit, ngân sách, backup)        |                       ❌                        |                  ❌                   |                      ❌                       |           ✅           |
| Xem audit log quản trị                                   |                       ❌                        |                  ❌                   |                  ⚠️ một phần                  |           ✅           |

> Quy tắc nền tảng: **mọi kiểm quyền thực thi ở server** (không tin client). Quyền càng cao càng cần bước xác nhận và ghi audit log.

---

## 3. User Stories chính & Tiêu chí chấp nhận

Định dạng tiêu chí: **Given / When / Then** (Cho trước / Khi / Thì).

### US-01 — Đăng ký tài khoản

_Là Guest, tôi muốn đăng ký bằng email + mật khẩu để trở thành Student và lưu tiến độ._

- Given email chưa tồn tại, When gửi email hợp lệ + mật khẩu đạt chính sách (≥ 8 ký tự, có chữ và số), Then tạo tài khoản vai `student`, mật khẩu được **hash (bcrypt/argon2)**, trả về đăng nhập thành công (hoặc yêu cầu xác minh email nếu bật).
- Given email đã tồn tại, When đăng ký, Then báo lỗi trung tính ("Email không dùng được") — **không tiết lộ** email đã tồn tại.
- Given mật khẩu yếu, When submit, Then chặn và hiển thị yêu cầu chính sách.
- Mật khẩu **không bao giờ** được log hay trả về trong response.

### US-02 — Đăng nhập

_Là Student, tôi muốn đăng nhập để truy cập tiến độ của mình._

- Given thông tin đúng và tài khoản không bị khoá, When đăng nhập, Then nhận access token (ngắn hạn) + refresh token (cookie `httpOnly`), điều hướng vào app.
- Given sai mật khẩu, Then báo lỗi trung tính "Email hoặc mật khẩu không đúng".
- Given tài khoản bị khoá (`status = locked`), Then từ chối kèm thông báo tài khoản bị khoá.
- Given ≥ N lần sai liên tiếp (vd 5) trong T phút, Then kích hoạt **chống brute-force** (khoá tạm/tăng delay/CAPTCHA phía người dùng tự làm — hệ thống chỉ chặn, không tự giải CAPTCHA).

### US-03 — Đăng xuất

_Là người dùng đã đăng nhập, tôi muốn đăng xuất an toàn._

- When đăng xuất, Then refresh token bị thu hồi phía server (blacklist/rotate) và cookie bị xoá; access token hết hạn tự nhiên.
- Given đăng xuất trên thiết bị A, Then phiên thiết bị B **không** bị ảnh hưởng (đăng xuất từng thiết bị), trừ tuỳ chọn "đăng xuất tất cả thiết bị".

### US-04 — Quên mật khẩu

_Là Student quên mật khẩu, tôi muốn đặt lại qua email._

- Given nhập email, When yêu cầu reset, Then hệ thống gửi link chứa **token dùng một lần, hết hạn ngắn (vd 30–60 phút)**; response luôn trung tính dù email có tồn tại hay không.
- Given token hợp lệ, When đặt mật khẩu mới đạt chính sách, Then cập nhật hash, **thu hồi mọi refresh token cũ**, yêu cầu đăng nhập lại.
- Given token hết hạn/đã dùng, Then từ chối và mời yêu cầu link mới.

### US-05 — Đồng bộ tiến độ đa thiết bị

_Là Student, tôi muốn tiến độ (SRS, level, huy hiệu, thống kê) đồng bộ giữa các thiết bị._

- Given đăng nhập trên thiết bị mới, When mở app, Then tải tiến độ mới nhất từ server (per user, per language `en`).
- Given học offline/thay đổi ở 2 thiết bị, When đồng bộ, Then áp dụng chiến lược hợp nhất **last-write-wins theo mốc thời gian từng mục** (hoặc merge theo `nextReviewAt` mới hơn), không mất dữ liệu SRS đang chờ ôn.
- Given lần đầu đăng nhập từ thiết bị đang có dữ liệu `localStorage`, Then đề nghị **import tiến độ local lên server một lần** (có xác nhận).
- Tiến độ được lưu bền vững; xoá cache trình duyệt **không** mất tiến độ.

### US-06 — Admin quản lý tài khoản

_Là Teacher/Super-admin, tôi muốn list/khoá/xoá/đổi vai người dùng._

- Given vào trang quản trị, Then thấy danh sách người dùng có phân trang, tìm kiếm theo email/tên, lọc theo vai/trạng thái.
- Given chọn "Khoá", When xác nhận, Then `status = locked`; người đó không đăng nhập được và các phiên hiện có bị vô hiệu ở lần refresh kế tiếp; hành động được ghi **audit log**.
- Given chọn "Xoá", When xác nhận, Then thực hiện **soft-delete** (ẩn + giữ dữ liệu theo chính sách lưu trữ); hard-delete chỉ Super-admin và ghi audit log.
- Given đổi vai, Then chỉ Super-admin nâng lên teacher/admin; Teacher **không** tự nâng quyền mình hay người khác lên admin (chống leo thang đặc quyền).
- Mọi thao tác quản trị đều kiểm quyền **ở server**, không dựa cờ client.

### US-07 — Admin quản lý AI Provider (key server-side)

_Là Teacher/Super-admin, tôi muốn cấu hình provider AI mà không lộ key cho học sinh._

- Given nhập API key OpenAI, When lưu, Then key được **mã hoá tại chỗ (at-rest)**, chỉ backend dùng; **không endpoint nào trả key ra client**, kể cả cho admin (chỉ hiển thị dạng che `sk-****`).
- Given cấu hình model (vd o4-mini), guardrail (chỉ học từ vựng), rate limit, ngân sách trần, When lưu, Then áp dụng cho mọi request AI của học sinh.
- Given key sai/hết hạn, Then hiển thị trạng thái lỗi provider cho admin, học sinh nhận thông báo "trợ lý tạm không khả dụng".

### US-08 — Học sinh dùng AI qua server

_Là Student, tôi muốn hỏi trợ lý AI mà không cần biết/không thấy API key._

- Given gửi câu hỏi, When backend nhận, Then backend **tự đính key**, áp **guardrail server-side** (chặn chủ đề ngoài học từ vựng), gọi provider, trả kết quả; **client không bao giờ thấy key**.
- Given vượt rate limit hoặc chạm trần ngân sách, Then từ chối lịch sự và ghi UsageLog.
- Given prompt cố vượt guardrail (jailbreak/injection từ nội dung trang), Then backend từ chối và không thực thi chỉ dẫn nhúng trong dữ liệu.
- Mỗi request AI ghi **UsageLog** (user, thời điểm, tokens/chi phí ước tính, kết quả pass/blocked).

---

## 4. Yêu cầu chức năng (FR)

### 4.1 Xác thực & Tài khoản

- **FR-01** Hệ thống cho phép đăng ký bằng email + mật khẩu; kiểm tra định dạng và chính sách mật khẩu.
- **FR-02** Mật khẩu được hash bằng bcrypt hoặc argon2id, có salt; không lưu plaintext.
- **FR-03** Đăng nhập cấp access token ngắn hạn + refresh token trong cookie `httpOnly`, `Secure`, `SameSite`.
- **FR-04** Refresh token có cơ chế xoay vòng (rotation) và thu hồi (revoke); hỗ trợ đăng xuất một thiết bị và tất cả thiết bị.
- **FR-05** Quên/đặt lại mật khẩu qua token một lần, hết hạn ngắn, dùng một lần.
- **FR-06** (Tuỳ chọn bật/tắt) Xác minh email khi đăng ký.
- **FR-07** Chống brute-force: giới hạn số lần đăng nhập sai, khoá tạm/tăng delay theo IP + tài khoản.

### 4.2 Tiến độ & Học tập

- **FR-08** Lưu tiến độ SRS (lịch 1/2/5/14/30 ngày), level (1–5), huy hiệu, thống kê theo `user × language`.
- **FR-09** API lấy/cập nhật tiến độ; đồng bộ đa thiết bị với chiến lược hợp nhất theo thời gian.
- **FR-10** Import một lần tiến độ từ `localStorage` lên tài khoản (có xác nhận).
- **FR-11** Guest dùng được flashcard/quiz/tra cứu/audio nhưng không lưu server.

### 4.3 Quản trị (Admin)

- **FR-12** Danh sách người dùng: phân trang, tìm kiếm, lọc theo vai/trạng thái.
- **FR-13** Khoá/mở khoá tài khoản.
- **FR-14** Xoá tài khoản: soft-delete (Teacher), hard-delete (Super-admin).
- **FR-15** Đổi vai theo ràng buộc RBAC (chống leo thang đặc quyền).
- **FR-16** Ghi audit log cho mọi hành động quản trị (ai, làm gì, khi nào, đối tượng).

### 4.4 AI Provider (server-side)

- **FR-17** Lưu cấu hình provider: key (mã hoá at-rest), model, guardrail, rate limit, ngân sách trần.
- **FR-18** Endpoint proxy AI: server đính key, áp guardrail, gọi provider, trả kết quả; không lộ key.
- **FR-19** Rate limit theo người dùng và theo hệ thống; chặn khi chạm trần ngân sách.
- **FR-20** Ghi UsageLog mỗi request (tokens/chi phí ước tính, pass/blocked, lý do chặn).
- **FR-21** Bong bóng đọc ngữ cảnh trang & gợi ý theo level giữ nguyên trải nghiệm, nhưng gọi qua endpoint server.

### 4.5 Hệ thống & Vận hành

- **FR-22** Triển khai bằng Docker Compose: FE tĩnh + API + Postgres; chạy được local và trên VPS.
- **FR-23** Migration DB có phiên bản (versioned), rollback được.
- **FR-24** Cấu hình qua biến môi trường (`.env`), không hardcode bí mật.
- **FR-25** Sao lưu DB định kỳ và khôi phục được (Super-admin).
- **FR-26** Health check endpoint cho FE/BE/DB.

---

## 5. Mô hình dữ liệu (mức nghiệp vụ)

### 5.1 Thực thể & thuộc tính

**User**

| Thuộc tính                          | Kiểu                                    | Ghi chú              |
| ----------------------------------- | --------------------------------------- | -------------------- |
| id                                  | UUID                                    | Khoá chính           |
| email                               | string, unique                          | Định danh đăng nhập  |
| displayName                         | string                                  | Tên hiển thị         |
| role                                | enum(guest/student/teacher/super_admin) | Vai trò              |
| status                              | enum(active/locked/deleted)             | Trạng thái tài khoản |
| level                               | int (1–5)                               | Level tự đánh giá    |
| createdAt / updatedAt / lastLoginAt | timestamp                               |                      |

**Account/Auth** _(tách khỏi User để cô lập bí mật)_

| Thuộc tính                       | Kiểu             | Ghi chú                        |
| -------------------------------- | ---------------- | ------------------------------ |
| userId                           | FK → User        | 1–1                            |
| passwordHash                     | string           | bcrypt/argon2, không plaintext |
| passwordUpdatedAt                | timestamp        |                                |
| emailVerifiedAt                  | timestamp/null   | Nếu bật xác minh               |
| failedLoginCount / lockoutUntil  | int / timestamp  | Chống brute-force              |
| resetToken / resetTokenExpiresAt | hash / timestamp | Đặt lại mật khẩu               |

**Session/Token** _(refresh token, đa thiết bị)_

| Thuộc tính              | Kiểu      | Ghi chú                       |
| ----------------------- | --------- | ----------------------------- |
| id                      | UUID      |                               |
| userId                  | FK → User |                               |
| refreshTokenHash        | string    | Lưu hash, không lưu token thô |
| device / userAgent / ip | string    | Nhận diện thiết bị            |
| expiresAt / revokedAt   | timestamp | Xoay vòng & thu hồi           |

**Progress** _(per user per language)_

| Thuộc tính                | Kiểu             | Ghi chú                            |
| ------------------------- | ---------------- | ---------------------------------- |
| id                        | UUID             |                                    |
| userId                    | FK → User        |                                    |
| language                  | string (vd `en`) | Chừa chỗ đa ngôn ngữ               |
| wordId                    | string/int       | Tham chiếu từ trong `data/en.json` |
| srsStage                  | int              | Bậc SRS (1/2/5/14/30)              |
| nextReviewAt              | timestamp        | Lịch ôn kế tiếp                    |
| correctCount / wrongCount | int              | Thống kê                           |
| lastReviewedAt            | timestamp        | Dùng cho hợp nhất đa thiết bị      |

_(Có thể gộp thống kê tổng & huy hiệu vào bảng `UserStats`/`Badge` riêng: streak, tổng từ thuộc, huy hiệu đạt được.)_

**AIProvider**

| Thuộc tính       | Kiểu                        | Ghi chú                             |
| ---------------- | --------------------------- | ----------------------------------- |
| id               | UUID                        |                                     |
| name             | string                      | vd "OpenAI"                         |
| apiKeyEncrypted  | string                      | Mã hoá at-rest, không trả ra client |
| model            | string                      | vd o4-mini                          |
| guardrailConfig  | json                        | Ràng buộc chủ đề                    |
| rateLimitPerUser | int                         |                                     |
| budgetCapMonthly | number                      | Trần chi phí                        |
| status           | enum(active/error/disabled) |                                     |

**UsageLog**

| Thuộc tính                      | Kiểu                   | Ghi chú               |
| ------------------------------- | ---------------------- | --------------------- |
| id                              | UUID                   |                       |
| userId                          | FK → User              |                       |
| providerId                      | FK → AIProvider        |                       |
| createdAt                       | timestamp              |                       |
| tokensPrompt / tokensCompletion | int                    |                       |
| estimatedCost                   | number                 | Kiểm soát ngân sách   |
| outcome                         | enum(ok/blocked/error) |                       |
| blockReason                     | string/null            | Guardrail/rate/budget |

**AuditLog** _(quản trị)_

| Thuộc tính                                                       | Kiểu | Ghi chú                |
| ---------------------------------------------------------------- | ---- | ---------------------- |
| id, actorUserId, action, targetUserId, metadata(json), createdAt |      | Ghi mọi thao tác admin |

**Class & Enrollment** _(Post-MVP — nếu triển khai lớp học)_

- **Class**: id, name, teacherId (FK→User), createdAt.
- **Enrollment**: id, classId (FK→Class), studentId (FK→User), joinedAt, status.

### 5.2 Quan hệ (tóm tắt)

```
User 1—1 Account/Auth
User 1—* Session/Token
User 1—* Progress            (Progress khoá theo user × language × wordId)
User 1—* UsageLog
User 1—* AuditLog (as actor / as target)
AIProvider 1—* UsageLog
Teacher(User) 1—* Class 1—* Enrollment *—1 Student(User)   [Post-MVP]
```

### 5.3 Sơ đồ quan hệ

```mermaid
erDiagram
    USER ||--|| ACCOUNT_AUTH : has
    USER ||--o{ SESSION_TOKEN : owns
    USER ||--o{ PROGRESS : tracks
    USER ||--o{ USAGE_LOG : generates
    AIPROVIDER ||--o{ USAGE_LOG : serves
    USER ||--o{ AUDIT_LOG : acts
    TEACHER ||--o{ CLASS : manages
    CLASS ||--o{ ENROLLMENT : contains
    STUDENT ||--o{ ENROLLMENT : joins
```

---

## 6. Yêu cầu phi chức năng & Bảo mật (NFR)

| Mã     | Nhóm                 | Yêu cầu                                                                                                                                                                              |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-01 | Mật khẩu             | Hash bằng **bcrypt (cost ≥ 12)** hoặc **argon2id**; salt riêng từng người; không plaintext, không log.                                                                               |
| NFR-02 | Phiên đăng nhập      | **JWT access ngắn hạn (5–15 phút)** + **refresh token trong cookie `httpOnly, Secure, SameSite=Strict/Lax`**, có xoay vòng & thu hồi. Không lưu token nhạy cảm trong `localStorage`. |
| NFR-03 | Kênh truyền          | **HTTPS/TLS** bắt buộc ở production; HSTS; chuyển hướng HTTP→HTTPS.                                                                                                                  |
| NFR-04 | Rate limit           | Giới hạn theo IP + tài khoản cho login, reset mật khẩu, và endpoint AI.                                                                                                              |
| NFR-05 | Chống brute-force    | Đếm lần sai, khoá tạm/tăng delay; cảnh báo bất thường.                                                                                                                               |
| NFR-06 | Kiểm quyền           | **Toàn bộ RBAC thực thi ở server**; client chỉ ẩn/hiện UI, không phải nguồn quyền.                                                                                                   |
| NFR-07 | Bí mật               | API key & khoá mã hoá đặt server-side, qua biến môi trường/secret store; **không bao giờ gửi ra client**. Key AI mã hoá at-rest.                                                     |
| NFR-08 | Chống injection      | Validate & sanitize input; parameterized queries/ORM; chống XSS/CSRF (token CSRF cho cookie-session); guardrail AI chặn chỉ dẫn nhúng trong nội dung trang.                          |
| NFR-09 | Quyền riêng tư/PDPA  | Thu thập tối thiểu (email, tiến độ học); có chính sách quyền riêng tư; cho phép người dùng **xoá tài khoản & dữ liệu của mình**; không đưa dữ liệu cá nhân vào URL/query.            |
| NFR-10 | Sao lưu DB           | Backup định kỳ (vd hằng ngày), lưu ngoài máy chính, kiểm thử khôi phục; có RPO/RTO mục tiêu.                                                                                         |
| NFR-11 | Giới hạn chi phí AI  | Rate limit theo người dùng + **trần ngân sách** hệ thống; chặn khi chạm trần; theo dõi qua UsageLog.                                                                                 |
| NFR-12 | Khả dụng & Hiệu năng | API phản hồi < 300ms cho thao tác thường (không kể độ trễ AI); mục tiêu uptime ≥ 99% MVP.                                                                                            |
| NFR-13 | Nhật ký & Giám sát   | Log lỗi tập trung (ẩn dữ liệu nhạy cảm), audit log quản trị, health check.                                                                                                           |
| NFR-14 | Kiểm thử             | Unit + integration cho auth/RBAC/AI-proxy; test chạy được local với SQLite/Postgres container; CI chạy test trước deploy.                                                            |
| NFR-15 | Khả chuyển           | Chạy local (Docker Compose) và deploy VPS giống nhau; cấu hình tách khỏi code.                                                                                                       |

---

## 7. Chỉ số thành công & Definition of Done

### 7.1 Chỉ số thành công (Success Metrics)

| Nhóm      | Chỉ số                                                 | Mục tiêu MVP                |
| --------- | ------------------------------------------------------ | --------------------------- |
| Chấp nhận | Tỷ lệ đăng ký hoàn tất                                 | ≥ 80% người bắt đầu đăng ký |
| Giữ chân  | % người dùng quay lại trong 7 ngày (đồng bộ hoạt động) | ≥ 40%                       |
| Đồng bộ   | Sự cố mất/mâu thuẫn tiến độ được báo cáo               | ≈ 0                         |
| Bảo mật   | Sự cố lộ API key / mật khẩu                            | 0                           |
| AI        | % request AI bị guardrail chặn đúng (ngoài phạm vi)    | ≥ 95% chính xác             |
| Chi phí   | Chi phí AI/tháng so với trần ngân sách                 | ≤ 100% trần, không vượt     |
| Vận hành  | Uptime                                                 | ≥ 99%                       |

### 7.2 Definition of Done (bản production)

- [ ] Database thật chạy (Postgres prod, SQLite/Postgres cho test); migration versioned & rollback được.
- [ ] Đăng ký / đăng nhập / đăng xuất / quên mật khẩu hoạt động, mật khẩu hash, token an toàn.
- [ ] Tiến độ đồng bộ đa thiết bị đúng; import từ localStorage một lần hoạt động.
- [ ] RBAC 4 vai thực thi **ở server**; admin list/khoá/xoá/đổi vai hoạt động; audit log đầy đủ.
- [ ] API key OpenAI + guardrail + rate limit + kiểm quyền **hoàn toàn server-side**; học sinh không truy được key (kiểm chứng qua network/response).
- [ ] UsageLog & trần ngân sách AI hoạt động; chặn khi chạm trần.
- [ ] HTTPS, rate limit, chống brute-force, backup DB đã cấu hình.
- [ ] Deploy bằng Docker Compose chạy được local và trên VPS; health check xanh.
- [ ] Bộ test tự động (auth/RBAC/AI-proxy/đồng bộ) pass trong CI.
- [ ] Tài liệu vận hành: biến môi trường, quy trình backup/restore, quy trình xoay key.
- [ ] Chính sách quyền riêng tư + luồng người dùng tự xoá tài khoản/dữ liệu.

---

## 8. Rủi ro & Giảm thiểu

| #   | Rủi ro                                                 | Ảnh hưởng               | Khả năng          | Giảm thiểu                                                                                       |
| --- | ------------------------------------------------------ | ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| R1  | Lộ API key OpenAI (hiện đang client-side)              | Cao (chi phí, lạm dụng) | Cao nếu không sửa | Chuyển key sang server, mã hoá at-rest, không trả ra client, xoay key định kỳ, giám sát UsageLog |
| R2  | Leo thang đặc quyền (student tự thành admin)           | Cao                     | Trung bình        | RBAC server-side, ràng buộc đổi vai, audit log, review quyền                                     |
| R3  | Mất/mâu thuẫn tiến độ khi đồng bộ đa thiết bị          | Trung bình              | Trung bình        | Chiến lược hợp nhất theo thời gian từng mục, import có xác nhận, backup                          |
| R4  | Chi phí AI vượt kiểm soát                              | Cao                     | Trung bình        | Rate limit theo người dùng + trần ngân sách, cảnh báo khi gần trần, chọn model rẻ (o4-mini)      |
| R5  | Brute-force / nhồi mật khẩu                            | Cao                     | Trung bình        | Rate limit, khoá tạm, chính sách mật khẩu mạnh, cân nhắc MFA sau                                 |
| R6  | Rò rỉ dữ liệu cá nhân / vi phạm PDPA                   | Cao                     | Thấp–TB           | Thu thập tối thiểu, mã hoá, chính sách riêng tư, quyền xoá dữ liệu                               |
| R7  | Prompt injection từ nội dung trang qua bong bóng AI    | Trung bình              | Trung bình        | Guardrail server-side coi nội dung trang là dữ liệu, không phải lệnh; kiểm thử jailbreak         |
| R8  | Mất dữ liệu do sự cố hạ tầng                           | Cao                     | Thấp              | Backup định kỳ + kiểm thử khôi phục, RPO/RTO rõ ràng                                             |
| R9  | HashRouter gây khó cho SEO/deep-link auth (reset link) | Thấp–TB                 | Trung bình        | Cân nhắc chuyển BrowserRouter + fallback SPA, hoặc thiết kế link reset tương thích hash          |
| R10 | Phình phạm vi (làm cả lớp học, thanh toán ngay)        | Trung bình              | Cao               | Bám phân kỳ MVP; Class/Enrollment & tính năng khác để Post-MVP                                   |
| R11 | Không kiểm thử được local do phụ thuộc dịch vụ ngoài   | Trung bình              | Thấp              | Docker Compose + Postgres/SQLite local; email reset dùng dịch vụ giả (mailhog) khi test          |

---

_Hết tài liệu. Các mục Class/Enrollment, social login, đa ngôn ngữ, và MFA được xếp vào Post-MVP để giữ MVP production gọn, an toàn và kiểm thử được local._
