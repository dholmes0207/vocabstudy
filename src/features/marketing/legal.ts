// Privacy policy and terms of use, in both interface languages
// (docs/design/landing.md). Written to match what the code actually does —
// keep it in step: a new data flow (analytics, a new processor, uploads) must
// be added here in the same change.

/** A Vietnamese/English pair. */
export type Pair = [vi: string, en: string]

export interface LegalSection {
  title: Pair
  paras?: Pair[]
  items?: Pair[]
}

export interface LegalDoc {
  title: Pair
  updated: string
  intro: Pair
  sections: LegalSection[]
}

export const LAST_UPDATED = '2026-10-13'

export const PRIVACY: LegalDoc = {
  title: ['Chính sách bảo mật', 'Privacy policy'],
  updated: LAST_UPDATED,
  intro: [
    'VocaStudy (vocastudy.app) giúp bạn học tiếng Anh. Trang này nói rõ chúng tôi thu thập dữ liệu gì, dùng vào việc gì và bạn có những quyền gì. Tóm tắt: chúng tôi chỉ giữ những gì cần cho việc học của bạn, không bán dữ liệu và không chạy quảng cáo.',
    'VocaStudy (vocastudy.app) helps you learn English. This page explains what data we collect, why, and what rights you have. In short: we keep only what your learning needs, never sell data and run no ads.',
  ],
  sections: [
    {
      title: ['1. Dữ liệu chúng tôi thu thập', '1. What we collect'],
      items: [
        [
          'Tài khoản (nếu bạn tạo): email, tên hiển thị bạn nhập, và mật khẩu — mật khẩu được nhà cung cấp xác thực mã hoá, chúng tôi không đọc được.',
          'Account (if you create one): your email, the display name you enter, and a password — the password is hashed by our authentication provider and we cannot read it.',
        ],
        [
          'Tiến độ học: từ đã học, lịch ôn, thống kê, chuỗi ngày, nhãn dán… Khi bạn đăng nhập, dữ liệu này được đồng bộ lên máy chủ để dùng trên nhiều thiết bị.',
          'Learning progress: words learned, review schedule, statistics, streak, stickers… When you are signed in it is synced to our servers so you can use several devices.',
        ],
        [
          'Câu hỏi gửi trợ lý AI: được chuyển tới OpenAI để tạo câu trả lời. Chúng tôi không lưu nội dung cuộc trò chuyện, chỉ đếm số lượt hỏi mỗi ngày để áp dụng hạn mức.',
          'Questions to the AI tutor: sent to OpenAI to generate an answer. We do not store the conversation; we only count questions per day to apply the daily limit.',
        ],
        [
          'Trên thiết bị của bạn: cài đặt, tiến độ, câu bạn tự đặt, tiến độ mẫu câu… được lưu trong bộ nhớ của trình duyệt, kèm bộ nhớ đệm để học khi mất mạng. Những dữ liệu này ở lại trên máy bạn.',
          'On your device: settings, progress, sentences you write, phrase progress… are kept in your browser’s storage, along with an offline cache. This data stays on your device.',
        ],
        [
          'Ghi âm luyện nói: chỉ nằm trong trình duyệt và không được tải lên máy chủ của chúng tôi. Tính năng chấm phát âm dùng nhận dạng giọng nói của trình duyệt — một số trình duyệt (ví dụ Chrome) gửi âm thanh tới máy chủ của nhà cung cấp trình duyệt để nhận dạng.',
          'Speaking recordings: stay in your browser and are never uploaded to our servers. Pronunciation scoring uses your browser’s speech recognition — some browsers (Chrome, for example) send the audio to the browser maker’s servers to recognise it.',
        ],
        [
          'Dữ liệu kỹ thuật: nhà cung cấp hạ tầng ghi nhật ký truy cập (như địa chỉ IP, loại trình duyệt) để vận hành và bảo vệ dịch vụ.',
          'Technical data: our hosting provider keeps access logs (such as IP address and browser type) to run and protect the service.',
        ],
      ],
    },
    {
      title: ['2. Chúng tôi dùng dữ liệu để', '2. How we use it'],
      items: [
        [
          'Cung cấp các bài học và lưu tiến độ của bạn.',
          'To provide lessons and keep your progress.',
        ],
        ['Đồng bộ giữa các thiết bị khi bạn đăng nhập.', 'To sync your devices when you sign in.'],
        ['Trả lời câu hỏi qua trợ lý AI.', 'To answer your questions through the AI tutor.'],
        [
          'Giữ an toàn: duyệt tài khoản mới, ngăn lạm dụng, áp dụng hạn mức.',
          'To keep the service safe: approving new accounts, preventing abuse, applying limits.',
        ],
        ['Trả lời khi bạn liên hệ với chúng tôi.', 'To reply when you contact us.'],
      ],
    },
    {
      title: ['3. Những điều chúng tôi không làm', '3. What we do not do'],
      items: [
        ['Không bán hay cho thuê dữ liệu của bạn.', 'We do not sell or rent your data.'],
        ['Không chạy quảng cáo.', 'We do not run ads.'],
        [
          'Không dùng cookie theo dõi hay công cụ phân tích của bên thứ ba.',
          'We do not use tracking cookies or third-party analytics.',
        ],
      ],
    },
    {
      title: ['4. Đối tác xử lý dữ liệu', '4. Service providers'],
      paras: [
        [
          'Chúng tôi dùng một số nhà cung cấp để vận hành dịch vụ. Họ chỉ xử lý dữ liệu theo yêu cầu của chúng tôi:',
          'We rely on a few providers to run the service. They process data only on our behalf:',
        ],
      ],
      items: [
        ['Supabase — tài khoản và cơ sở dữ liệu.', 'Supabase — accounts and database.'],
        ['Cloudflare — lưu trữ trang web và máy chủ.', 'Cloudflare — website hosting and servers.'],
        ['OpenAI — trợ lý AI.', 'OpenAI — the AI tutor.'],
        ['Google Fonts — phông chữ hiển thị.', 'Google Fonts — the typeface.'],
        [
          'Google Calendar — chỉ khi bạn tự chọn tạo nhắc học qua lịch Google.',
          'Google Calendar — only if you choose to add a study reminder there.',
        ],
      ],
    },
    {
      title: ['5. Lưu giữ và xoá dữ liệu', '5. Keeping and deleting data'],
      items: [
        [
          'Dữ liệu tài khoản được giữ cho tới khi bạn yêu cầu xoá. Gửi email tới contact@vocastudy.app — chúng tôi xoá trong vòng 30 ngày.',
          'Account data is kept until you ask us to delete it. Email contact@vocastudy.app and we delete it within 30 days.',
        ],
        [
          'Dữ liệu trên thiết bị: xoá trong Cài đặt → Vùng nguy hiểm → Đặt lại, hoặc xoá dữ liệu trang web trong trình duyệt.',
          'Data on your device: delete it in Settings → Danger zone → Reset, or clear this site’s data in your browser.',
        ],
        [
          'Bạn có thể tải toàn bộ tiến độ ra file bất cứ lúc nào: Cài đặt → Dữ liệu & sao lưu.',
          'You can download all your progress at any time: Settings → Data & backup.',
        ],
      ],
    },
    {
      title: ['6. Quyền của bạn', '6. Your rights'],
      paras: [
        [
          'Theo quy định về bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP), bạn có quyền được biết, truy cập, chỉnh sửa, xoá dữ liệu, rút lại sự đồng ý và phản đối việc xử lý. Hãy liên hệ contact@vocastudy.app để thực hiện các quyền này.',
          'Under Vietnam’s personal data protection rules (Decree 13/2023/ND-CP) you may be informed about, access, correct and delete your data, withdraw consent and object to processing. Contact contact@vocastudy.app to use these rights.',
        ],
      ],
    },
    {
      title: ['7. Bảo mật', '7. Security'],
      paras: [
        [
          'Kết nối luôn được mã hoá (HTTPS). Cơ sở dữ liệu chỉ cho mỗi người đọc và ghi dữ liệu của chính mình. Các khoá bí mật chỉ nằm trên máy chủ, không bao giờ ở trong ứng dụng.',
          'Connections are always encrypted (HTTPS). The database only lets each person read and write their own data. Secret keys live only on the server, never in the app.',
        ],
      ],
    },
    {
      title: ['8. Trẻ em', '8. Children'],
      paras: [
        [
          'Nếu bạn dưới 16 tuổi, hãy dùng VocaStudy với sự đồng ý của cha mẹ hoặc người giám hộ.',
          'If you are under 16, please use VocaStudy with the consent of a parent or guardian.',
        ],
      ],
    },
    {
      title: ['9. Thay đổi chính sách', '9. Changes'],
      paras: [
        [
          'Khi chính sách thay đổi, chúng tôi cập nhật ngày ở đầu trang. Thay đổi quan trọng sẽ được thông báo trong ứng dụng.',
          'When this policy changes we update the date at the top. Important changes are announced in the app.',
        ],
      ],
    },
    {
      title: ['10. Liên hệ', '10. Contact'],
      paras: [
        [
          'Mọi câu hỏi về quyền riêng tư: contact@vocastudy.app',
          'Any privacy question: contact@vocastudy.app',
        ],
      ],
    },
  ],
}

export const TERMS: LegalDoc = {
  title: ['Điều khoản sử dụng', 'Terms of use'],
  updated: LAST_UPDATED,
  intro: [
    'Khi dùng VocaStudy, bạn đồng ý với các điều khoản dưới đây. Chúng tôi viết ngắn gọn và dễ hiểu nhất có thể.',
    'By using VocaStudy you agree to the terms below. We have kept them as short and plain as we can.',
  ],
  sections: [
    {
      title: ['1. Dịch vụ', '1. The service'],
      paras: [
        [
          'VocaStudy là ứng dụng học tiếng Anh miễn phí, đang trong giai đoạn thử nghiệm (beta). Tính năng có thể được thêm, thay đổi hoặc ngừng để sản phẩm tốt hơn.',
          'VocaStudy is a free English-learning app, currently in beta. Features may be added, changed or removed as the product improves.',
        ],
      ],
    },
    {
      title: ['2. Tài khoản', '2. Accounts'],
      items: [
        [
          'Bạn có thể học mà không cần tài khoản. Tài khoản giúp đồng bộ tiến độ và dùng trợ lý AI.',
          'You can learn without an account. An account syncs your progress and unlocks the AI tutor.',
        ],
        [
          'Trong giai đoạn beta, tài khoản mới được quản trị viên duyệt trước khi dùng.',
          'During the beta, new accounts are approved by an administrator before use.',
        ],
        [
          'Bạn chịu trách nhiệm giữ an toàn mật khẩu và thông tin đăng ký chính xác.',
          'You are responsible for keeping your password safe and your details accurate.',
        ],
      ],
    },
    {
      title: ['3. Sử dụng hợp lệ', '3. Acceptable use'],
      items: [
        [
          'Dùng trợ lý AI cho việc học tiếng Anh; không cố vượt giới hạn hay dùng vào mục đích khác.',
          'Use the AI tutor for learning English; do not try to bypass its limits or use it for other purposes.',
        ],
        [
          'Không tấn công, dò quét hay làm quá tải hệ thống; không thu thập dữ liệu tự động.',
          'Do not attack, probe or overload the service, or scrape its content automatically.',
        ],
        [
          'Không dùng dịch vụ cho mục đích trái pháp luật.',
          'Do not use the service for anything unlawful.',
        ],
      ],
      paras: [
        [
          'Chúng tôi có thể khoá tài khoản vi phạm các điều trên.',
          'We may lock accounts that break these rules.',
        ],
      ],
    },
    {
      title: ['4. Trợ lý AI', '4. The AI tutor'],
      paras: [
        [
          'Câu trả lời do trí tuệ nhân tạo tạo ra và có thể chưa chính xác. Hãy dùng như một gợi ý học tập, không thay thế giáo viên hay tài liệu chính thức.',
          'Answers are generated by artificial intelligence and may be wrong. Treat them as study help, not a replacement for a teacher or official materials.',
        ],
      ],
    },
    {
      title: ['5. Nội dung và quyền sở hữu', '5. Content and ownership'],
      items: [
        [
          'Bài học, dữ liệu từ vựng, mẫu câu, giọng đọc và thiết kế thuộc về VocaStudy. Bạn được dùng cho việc học cá nhân, không vì mục đích thương mại.',
          'Lessons, word data, phrases, recordings and design belong to VocaStudy. You may use them for personal learning, not commercially.',
        ],
        [
          'Những gì bạn tự tạo (ví dụ câu bạn tự đặt) vẫn thuộc về bạn.',
          'What you create yourself (such as your own sentences) stays yours.',
        ],
      ],
    },
    {
      title: ['6. Không bảo đảm', '6. No warranty'],
      paras: [
        [
          'Dịch vụ được cung cấp "như hiện có". Chúng tôi cố gắng để dịch vụ luôn ổn định nhưng không bảo đảm không bao giờ gián đoạn hay mất dữ liệu — hãy dùng tính năng sao lưu trong Cài đặt. Trong phạm vi pháp luật cho phép, VocaStudy không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ.',
          'The service is provided "as is". We work to keep it reliable but cannot promise it will never be interrupted or lose data — use the backup feature in Settings. To the extent the law allows, VocaStudy is not liable for indirect damages arising from use of the service.',
        ],
      ],
    },
    {
      title: ['7. Chấm dứt', '7. Ending'],
      paras: [
        [
          'Bạn có thể ngừng dùng bất cứ lúc nào và yêu cầu xoá tài khoản qua contact@vocastudy.app.',
          'You can stop at any time and ask us to delete your account at contact@vocastudy.app.',
        ],
      ],
    },
    {
      title: ['8. Luật áp dụng', '8. Governing law'],
      paras: [
        [
          'Các điều khoản này tuân theo pháp luật Việt Nam.',
          'These terms are governed by the laws of Vietnam.',
        ],
      ],
    },
    {
      title: ['9. Thay đổi và liên hệ', '9. Changes and contact'],
      paras: [
        [
          'Khi điều khoản thay đổi, chúng tôi cập nhật ngày ở đầu trang. Câu hỏi: contact@vocastudy.app',
          'When these terms change we update the date at the top. Questions: contact@vocastudy.app',
        ],
      ],
    },
  ],
}
