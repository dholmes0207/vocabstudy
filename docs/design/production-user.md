# Production hoá — Vai Người dùng (đa nhóm)

## Nhóm 1 — Người tự học (self-learner)

Mình là dân văn phòng, học tiếng Anh lúc rảnh: sáng trên điện thoại lúc chờ xe, tối mở laptop ôn lại. Cái mình sợ nhất bây giờ là **mất tiến độ**. Đang học tới ngày ôn thứ 14 của một loạt từ, lỡ xoá cache trình duyệt hoặc đổi máy là bay sạch lịch SRS, chuỗi ngày (streak) và huy hiệu. Nên mình rất muốn có tài khoản.

Mong muốn của mình:

- **Đăng ký nhanh, không phiền**: chỉ cần email + mật khẩu là xong, đừng bắt xác minh 5 bước, đừng bắt nhập số điện thoại hay thông tin cá nhân không liên quan đến việc học.
- **Đăng nhập được ở nhiều nơi**: học dở trên máy tính cơ quan, về nhà mở điện thoại là tiến độ **đồng bộ ngay** — cùng lịch SRS, cùng từ đã thuộc / chưa thuộc, cùng level. Không phải học lại từ đầu.
- **Không mất dữ liệu cũ**: mình đã học kha khá bằng localStorage rồi. Khi tạo tài khoản lần đầu, mình mong hệ thống **hỏi có muốn nhập (migrate) tiến độ đang lưu trên máy vào tài khoản không**, chứ đừng ghi đè hay bỏ trắng.
- **Quên mật khẩu thì lấy lại được**: có nút "Quên mật khẩu", gửi link đặt lại qua email. Nếu chạy local chưa gắn email thật thì ít nhất admin/tài liệu phải nói rõ cách reset, đừng để mình kẹt luôn tài khoản.
- **Riêng tư**: tiến độ, điểm quiz, phần mình học yếu chỗ nào là **việc riêng của mình**. Mình không muốn người dùng khác nhìn thấy, và mình muốn biết ai có quyền xem (nếu là tài khoản tự đăng ký thì không thầy cô nào được xem mới đúng).
- **Đăng xuất và "quên máy này"**: máy dùng chung thì phải logout sạch, không để người sau mở lên thấy tài khoản mình.
- **Xoá tài khoản của chính mình**: khi không dùng nữa, mình muốn tự yêu cầu xoá dữ liệu, đúng kiểu "dữ liệu là của tôi".

Kỳ vọng ngầm: đăng nhập xong thì **mọi thứ y hệt lúc chưa có tài khoản**, chỉ khác là giờ nó theo mình sang máy khác. Đừng bắt mình học lại cách dùng app.

## Nhóm 2 — Giáo viên / quản trị lớp (admin)

Mình dạy một lớp tiếng Anh khoảng 30–40 học sinh. Mình cần công cụ **quản lý cả lớp**, không phải công cụ cá nhân.

Việc mình cần làm được:

- **Tạo tài khoản cho học sinh hàng loạt**: nhập danh sách (tên/email), hệ thống sinh tài khoản + mật khẩu tạm, hoặc tạo mã lớp để học sinh tự vào. Mình không muốn ngồi tạo tay từng em.
- **Xem tiến độ cả lớp trong một màn hình**: em nào đang học tới đâu, thuộc bao nhiêu từ, ai bỏ học mấy hôm nay, điểm quiz trung bình, ai đang đuối. Có thể xem chi tiết một em khi cần, và **xuất được ra file** (CSV) để chấm/báo cáo.
- **Cắm API key AI cho cả lớp mà học sinh KHÔNG thấy key**: đây là điều mình cực kỳ quan tâm. Mình bỏ tiền mua key OpenAI, nạp vào **một chỗ ở phía server**, cả lớp dùng chung trợ lý AI, nhưng **không em nào đọc/copy được key**. Key phải nằm server, không lộ ra trình duyệt, không nằm trong mã nguồn client.
- **Đặt giới hạn dùng AI**: mình lo học sinh spam làm cháy quota/tốn tiền. Mong có hạn mức (mỗi em bao nhiêu lượt/ngày), bật/tắt trợ lý AI theo lớp, và **xem được đã tiêu bao nhiêu**.
- **Phân vai rõ ràng (role)**: admin (mình), có thể có trợ giảng, và học sinh. Học sinh **không** được vào trang quản trị, không sửa được điểm, không thấy dữ liệu bạn khác.
- **Khoá / mở khoá / xoá tài khoản**: em nào nghỉ học, phá, hoặc dùng sai thì mình khoá lại; hết khoá thì xoá. Xoá phải **có xác nhận**, tránh lỡ tay mất dữ liệu cả em học chăm.
- **Đặt lại mật khẩu cho học sinh**: em nào quên mật khẩu, mình reset giúp được ngay tại chỗ, không phải nhờ kỹ thuật.
- **Phân quyền phải là THẬT**: mình biết bản hiện tại "admin/học sinh" chỉ chặn ở phía client — cái đó vô nghĩa, học sinh rành máy tính là lách được. Mình cần **server mới là nơi quyết định quyền**: mọi thao tác quản trị đều phải server kiểm tra token/vai, client chỉ là giao diện.

Kỳ vọng vận hành: **deploy được lên một server** cho cả lớp truy cập bằng đường link, chứ không phải mỗi mình chạy trên máy cá nhân rồi không ai vào được. Mình cũng muốn nó **chạy được local để thử trước** khi đưa cho học sinh, không phải phụ thuộc dịch vụ trả phí bên ngoài mới chạy nổi.

## Nhóm 3 — Học sinh

Em là học sinh trong lớp. Em không rành kỹ thuật, em chỉ muốn **đăng nhập là học được ngay**.

Em mong:

- **Đăng nhập đơn giản**: thầy/cô đưa em tài khoản (hoặc mã lớp), em nhập vào là vào thẳng phần học — flashcard, quiz, tra từ. Không phải cài đặt gì thêm.
- **Tiến độ tự lưu, không cần nghĩ**: em học ở lớp trên máy trường, về nhà mở điện thoại là **học tiếp đúng chỗ**, đúng lịch ôn. Em không muốn hiểu SRS là gì cũng chẳng sao, miễn nó nhắc em đúng từ cần ôn.
- **Dùng trợ lý AI mà không phải lo key**: em hỏi nghĩa từ, xin ví dụ, luyện đánh vần — AI trả lời hợp với **level của em**. Em **không cần** và cũng **không nên thấy** cái API key nào cả; đó là việc của thầy cô.
- **Không bị lạc**: giao diện đừng đổi khác lạ so với lúc chưa có tài khoản; chỉ cần thêm nút đăng nhập/đăng xuất.
- **Biết mình đang tiến bộ**: vẫn thấy streak, huy hiệu, số từ đã thuộc — để có động lực.

Nỗi lo của em: sợ lỡ tay bấm gì đó mất hết tiến độ; sợ điểm quiz kém bị bạn khác thấy; sợ trợ lý AI tự nhiên báo hết lượt mà không nói lý do (em muốn nó nói rõ "hôm nay hết lượt, mai học tiếp").

## Nhóm 4 — Nỗi lo chung & anti-features (điều KHÔNG được làm)

Cả ba nhóm bọn mình đều có mấy nỗi sợ giống nhau, và có những thứ nếu sản phẩm làm thì bọn mình sẽ bỏ dùng.

Bọn mình **sợ**:

- **Lộ dữ liệu / mật khẩu**: mật khẩu phải được **băm (hash)** đàng hoàng ở server, không bao giờ lưu dạng chữ thô, không log ra console. Bọn mình sợ kiểu "lỡ hack một phát lộ hết".
- **Lộ API key**: key OpenAI mà rò ra client là cô giáo mất tiền thật. Key phải ở server, guardrail cũng phải chạy ở server (chặn hỏi ngoài chủ đề từ vựng ngay tại backend), chứ chặn ở client thì học sinh mở DevTools là gọi thẳng được.
- **Mất tiến độ khi đổi máy / xoá cache**: đây là lý do chính bọn mình muốn có tài khoản. Nếu có tài khoản mà vẫn mất thì còn tệ hơn cũ.
- **Phân quyền giả**: "admin" mà chỉ ẩn nút ở client thì coi như không có. Bọn mình cần quyền được kiểm ở server.

Những thứ **đừng làm (anti-features)**:

- **Đừng bắt trả phí ngay / dựng paywall** mới cho học. Ít nhất phần học cốt lõi phải miễn phí; đừng vừa đăng nhập đã đòi nâng cấp Pro.
- **Đừng nhét quảng cáo**, nhất là quảng cáo lạ chèn giữa lúc học hay lúc làm quiz.
- **Đừng thu thập dữ liệu thừa**: đừng đòi số điện thoại, danh bạ, vị trí, quyền truy cập linh tinh. Chỉ xin đúng thứ cần cho việc học.
- **Đừng bán / chia sẻ dữ liệu học tập** cho bên thứ ba, đừng gắn tracker theo dõi.
- **Đừng bắt đăng nhập bằng mạng xã hội mới cho dùng** — nhiều học sinh không có, hoặc không muốn liên kết Facebook/Google.
- **Đừng làm quy trình đăng ký rườm rà** (xác minh nhiều lớp, captcha khó, bắt điền form dài).
- **Đừng để "xoá" là xoá vĩnh viễn không hỏi lại** — thao tác xoá tài khoản/tiến độ phải có xác nhận rõ ràng, tốt nhất là admin xoá được nhưng có bước cảnh báo.
- **Đừng ép online mới học được mọi thứ**: nếu mạng chập chờn, ít nhất phần flashcard/quiz đã tải nên vẫn xem được; chỉ AI và đồng bộ mới cần mạng.
- **Đừng thay đổi giao diện quen thuộc** chỉ vì thêm tài khoản — giữ nguyên trải nghiệm React/Vite hiện tại, chỉ bổ sung lớp đăng nhập và đồng bộ.

Kỳ vọng chung cuối cùng: có tài khoản thật, dữ liệu nằm **database thật ở server**, deploy được cho nhiều người vào bằng link, **chạy thử được ở local mà không cần dịch vụ trả phí bên ngoài**, và mọi thứ nhạy cảm (mật khẩu, API key, phân quyền, guardrail) đều nằm an toàn phía server — còn trải nghiệm học thì vẫn nhẹ nhàng, riêng tư và miễn phí như bọn mình đang quen.
