import { POLICY_VERSION } from '@/lib/site'

// Privacy policy and terms of use, in both interface languages
// (docs/design/landing.md). Reviewed against Vietnamese law in October 2026
// (Personal Data Protection Law 91/2025/QH15, Decree 356/2025/ND-CP, AI Law
// 134/2025/QH15) and written to match what the code actually does — keep it in
// step: a new data flow (analytics, a new processor, uploads) must be added
// here in the same change, and an important change bumps POLICY_VERSION.

/** A Vietnamese/English pair. */
export type Pair = [vi: string, en: string]

export interface LegalSection {
  title: Pair
  /** Paragraphs before the list (e.g. the sentence that introduces it). */
  lead?: Pair[]
  items?: Pair[]
  /** Paragraphs after the list. */
  paras?: Pair[]
}

export interface LegalDoc {
  title: Pair
  updated: string
  intro: Pair
  sections: LegalSection[]
}

export const LAST_UPDATED = POLICY_VERSION

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
          'Tài khoản (nếu bạn tạo): email, tên hiển thị bạn nhập, mật khẩu, và thời điểm bạn đồng ý với Điều khoản và Chính sách này khi đăng ký. Mật khẩu được nhà cung cấp xác thực mã hoá, chúng tôi không đọc được.',
          'Account (if you create one): your email, the display name you enter, a password, and when you accepted these Terms and this Policy at sign-up. The password is hashed by our authentication provider and we cannot read it.',
        ],
        [
          'Đăng nhập bằng Google (nếu bạn chọn): Google gửi cho chúng tôi email, tên và ảnh đại diện của tài khoản Google. Chúng tôi chỉ dùng email và tên; không nhận mật khẩu Google và không truy cập dữ liệu nào khác trong tài khoản Google của bạn.',
          'Signing in with Google (if you choose it): Google sends us your Google account’s email, name and profile picture. We only use the email and name; we never receive your Google password and do not access anything else in your Google account.',
        ],
        [
          'Tiến độ học từ vựng: từ đã học, lịch ôn, thống kê, chuỗi ngày, nhãn dán… Khi bạn đăng nhập, phần này được đồng bộ lên máy chủ để dùng trên nhiều thiết bị.',
          'Vocabulary progress: words learned, review schedule, statistics, streak, stickers… When you are signed in, this is synced to our servers so you can use several devices.',
        ],
        [
          'Câu hỏi gửi trợ lý AI: được chuyển qua API tới OpenAI để tạo câu trả lời. Chúng tôi không lưu nội dung cuộc trò chuyện, chỉ đếm số lượt hỏi mỗi ngày để áp dụng hạn mức. Theo chính sách API của OpenAI, dữ liệu gửi qua API không được dùng để huấn luyện mô hình của họ; OpenAI có thể lưu tạm theo chính sách của họ để phát hiện lạm dụng. Dù vậy, bạn hãy tránh nhập thông tin cá nhân nhạy cảm vào khung trò chuyện.',
          'Questions to the AI tutor: sent through the API to OpenAI to generate an answer. We do not store the conversation; we only count questions per day to apply the daily limit. Under OpenAI’s API policy, data sent through the API is not used to train their models; OpenAI may keep it temporarily under its own policy to detect abuse. Even so, please do not type sensitive personal information into the chat.',
        ],
        [
          'Trên thiết bị của bạn: cài đặt, tiến độ, câu bạn tự đặt, tiến độ mẫu câu… được lưu trong bộ nhớ cục bộ của trình duyệt (Local Storage), kèm bộ nhớ đệm (Cache Storage) để học khi mất mạng. Câu bạn tự đặt và tiến độ mẫu câu hiện chỉ nằm trên máy bạn, không được đồng bộ.',
          'On your device: settings, progress, sentences you write, phrase progress… are kept in your browser’s local storage, along with an offline cache. Your own sentences and phrase progress currently stay on your device only and are not synced.',
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
        [
          'Trả lời và hỗ trợ khi bạn liên hệ với chúng tôi.',
          'To reply and help when you contact us.',
        ],
      ],
    },
    {
      title: ['3. Những điều chúng tôi không làm', '3. What we do not do'],
      items: [
        ['Không bán hay cho thuê dữ liệu của bạn.', 'We do not sell or rent your data.'],
        ['Không chạy quảng cáo.', 'We do not run ads.'],
        [
          'Không dùng cookie theo dõi hay quảng cáo, và không dùng công cụ phân tích hay thống kê của bên thứ ba. Chúng tôi chỉ dùng bộ nhớ cục bộ của trình duyệt cho mục đích kỹ thuật thiết yếu: giữ trạng thái đăng nhập, lưu cài đặt và giao diện, học khi mất mạng.',
          'We use no tracking or advertising cookies and no third-party analytics. We only use your browser’s local storage for what the app needs to work: keeping you signed in, remembering settings and appearance, and learning offline.',
        ],
      ],
    },
    {
      title: ['4. Đối tác xử lý và lưu trữ dữ liệu', '4. Service providers and storage'],
      lead: [
        [
          'Chúng tôi dùng một số nhà cung cấp hạ tầng để vận hành dịch vụ. Họ chỉ xử lý dữ liệu theo yêu cầu kỹ thuật của chúng tôi:',
          'We rely on a few infrastructure providers to run the service. They process data only as our service technically requires:',
        ],
      ],
      items: [
        [
          'Supabase — xác thực tài khoản và cơ sở dữ liệu.',
          'Supabase — account sign-in and database.',
        ],
        [
          'Google — đăng nhập bằng tài khoản Google, khi bạn chọn.',
          'Google — signing in with your Google account, if you choose it.',
        ],
        [
          'Cloudflare — lưu trữ trang web, máy chủ và bảo mật.',
          'Cloudflare — website hosting, servers and security.',
        ],
        ['OpenAI — tạo câu trả lời của trợ lý AI.', 'OpenAI — generating the AI tutor’s answers.'],
        [
          'Google Fonts — phông chữ hiển thị (trình duyệt của bạn tải trực tiếp từ máy chủ của Google).',
          'Google Fonts — the typeface (your browser downloads it directly from Google’s servers).',
        ],
        [
          'Google Calendar — chỉ khi bạn bấm tạo nhắc học: app mở trang tạo sự kiện của Google với nội dung điền sẵn. VocaStudy không kết nối tới và không đọc được lịch của bạn.',
          'Google Calendar — only when you tap to add a study reminder: the app opens Google’s new-event page with the details filled in. VocaStudy does not connect to or read your calendar.',
        ],
      ],
      paras: [
        [
          'Máy chủ của các nhà cung cấp trên đặt ở ngoài Việt Nam. Khi tạo tài khoản, bạn đồng ý để dữ liệu cần thiết cho các tính năng trực tuyến được chuyển ra nước ngoài, lưu trữ và xử lý trên hạ tầng này theo quy định của pháp luật.',
          'These providers’ servers are outside Vietnam. When you create an account, you agree that the data the online features need may be transferred abroad, stored and processed on this infrastructure in accordance with the law.',
        ],
      ],
    },
    {
      title: ['5. Lưu giữ và xoá dữ liệu', '5. Keeping and deleting data'],
      items: [
        [
          'Dữ liệu tài khoản được giữ cho tới khi bạn xoá tài khoản. Bạn tự xoá được trong Cài đặt → Vùng nguy hiểm → Xoá tài khoản: tài khoản, tiến độ đã đồng bộ và số lượt dùng trợ lý AI bị xoá khỏi cơ sở dữ liệu ngay lập tức. Bản sao lưu tự động của nhà cung cấp hạ tầng (nếu có) tự hết hạn theo chu kỳ thường lệ của họ.',
          'Account data is kept until you delete your account. You can do it yourself in Settings → Danger zone → Delete account: the account, its synced progress and its AI usage counts are removed from our database immediately. Infrastructure providers’ automatic backups, if any, expire on their normal schedule.',
        ],
        [
          'Không tự xoá được (ví dụ quên mật khẩu và không còn truy cập email)? Viết cho contact@vocastudy.app — chúng tôi phản hồi xác nhận trong vòng 02 ngày làm việc và hoàn tất việc xoá trong vòng 20 ngày.',
          'Can’t do it yourself (say, you lost access to your email)? Write to contact@vocastudy.app — we confirm within 2 working days and complete the deletion within 20 days.',
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
          'Theo Luật Bảo vệ dữ liệu cá nhân năm 2025 (Luật số 91/2025/QH15) và Nghị định 356/2025/NĐ-CP, bạn có quyền được biết, đồng ý hoặc rút lại sự đồng ý, xem, chỉnh sửa, yêu cầu cung cấp, xoá dữ liệu, yêu cầu hạn chế xử lý và phản đối việc xử lý dữ liệu cá nhân của mình. Hãy liên hệ contact@vocastudy.app để thực hiện các quyền này — chúng tôi phản hồi trong vòng 02 ngày làm việc.',
          'Under Vietnam’s Personal Data Protection Law 2025 (Law No. 91/2025/QH15) and Decree 356/2025/ND-CP, you may be informed; give or withdraw consent; view, correct, obtain and delete your data; ask us to restrict processing; and object to the processing of your personal data. Contact contact@vocastudy.app to use these rights — we reply within 2 working days.',
        ],
      ],
    },
    {
      title: ['7. Bảo mật', '7. Security'],
      paras: [
        [
          'Kết nối luôn được mã hoá (HTTPS). Cơ sở dữ liệu áp dụng phân quyền theo từng dòng (Row-Level Security), chỉ cho phép mỗi người đọc và ghi dữ liệu của chính mình. Các khoá bí mật chỉ nằm trên máy chủ, không bao giờ lộ ra trong ứng dụng ở trình duyệt.',
          'Connections are always encrypted (HTTPS). The database enforces row-level security, so each person can only read and write their own data. Secret keys live only on the server and are never exposed in the app in your browser.',
        ],
      ],
    },
    {
      title: ['8. Trẻ em', '8. Children'],
      paras: [
        [
          'Theo quy định pháp luật Việt Nam, nếu bạn dưới 16 tuổi (đặc biệt từ đủ 07 tuổi đến dưới 16 tuổi), việc tạo tài khoản và xử lý dữ liệu trên VocaStudy cần có sự đồng ý của cả bạn và cha mẹ hoặc người giám hộ hợp pháp.',
          'Under Vietnamese law, if you are under 16 (in particular from 7 to under 16), creating an account and processing your data on VocaStudy requires the consent of both you and a parent or legal guardian.',
        ],
      ],
    },
    {
      title: ['9. Thay đổi chính sách', '9. Changes'],
      paras: [
        [
          'Khi chính sách có cập nhật, chúng tôi sẽ đổi lại ngày ở đầu trang. Nếu có thay đổi quan trọng liên quan đến cách thu thập hoặc xử lý dữ liệu cá nhân, chúng tôi sẽ gửi thông báo ngay trong ứng dụng để bạn nắm rõ và chủ động xác nhận trước khi áp dụng.',
          'When this policy is updated, we change the date at the top. If an important change affects how we collect or process personal data, we will tell you in the app so you know what changes and can confirm it yourself before it applies.',
        ],
      ],
    },
    {
      title: ['10. Đơn vị vận hành và liên hệ', '10. Who runs VocaStudy, and contact'],
      paras: [
        [
          'VocaStudy là dự án độc lập, được phát triển và vận hành tại Hà Nội, Việt Nam. Mọi câu hỏi hoặc yêu cầu về quyền riêng tư, vui lòng liên hệ: contact@vocastudy.app',
          'VocaStudy is an independent project, developed and run in Hanoi, Vietnam. For any privacy question or request, contact: contact@vocastudy.app',
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
          'VocaStudy là ứng dụng học tiếng Anh hiện được cung cấp miễn phí trong giai đoạn thử nghiệm (beta). Tính năng và hạn mức sử dụng (như số lượt hỏi trợ lý AI mỗi ngày) có thể được thêm, điều chỉnh hoặc ngừng để sản phẩm tốt hơn và giữ hệ thống ổn định.',
          'VocaStudy is an English-learning app, currently free during its beta. Features and usage limits (such as AI tutor questions per day) may be added, adjusted or removed to improve the product and keep the service stable.',
        ],
      ],
    },
    {
      title: ['2. Tài khoản', '2. Accounts'],
      items: [
        [
          'Bạn có thể học mà không cần tài khoản. Tài khoản (bằng email hoặc Google) giúp đồng bộ tiến độ giữa các thiết bị và dùng trợ lý AI.',
          'You can learn without an account. An account (with email or Google) syncs your progress across devices and unlocks the AI tutor.',
        ],
        [
          'Trong giai đoạn beta, người đăng ký mới vào danh sách chờ và tài khoản được duyệt thủ công trước khi dùng. Chúng tôi có thể từ chối một đăng ký mà không cần nêu lý do.',
          'During the beta, new sign-ups join a waitlist and accounts are approved by hand before use. We may decline a sign-up without giving a reason.',
        ],
        [
          'Bạn chịu trách nhiệm giữ an toàn mật khẩu và bảo đảm thông tin đăng ký chính xác.',
          'You are responsible for keeping your password safe and your details accurate.',
        ],
      ],
    },
    {
      title: ['3. Sử dụng hợp lệ', '3. Acceptable use'],
      items: [
        [
          'Dùng trợ lý AI đúng mục đích học tiếng Anh; không cố vượt giới hạn, và không lợi dụng AI để tạo nội dung giả mạo, lừa dối, vi phạm pháp luật hoặc xâm phạm quyền hợp pháp của người khác.',
          'Use the AI tutor for learning English; do not try to bypass its limits, or use it to create fake, deceptive or unlawful content or content that infringes anyone’s rights.',
        ],
        [
          'Không tấn công, dò quét hay làm quá tải hệ thống; không thu thập dữ liệu tự động (scraping, crawling).',
          'Do not attack, probe or overload the service, or collect its content automatically (scraping, crawling).',
        ],
        [
          'Không dùng dịch vụ cho mục đích trái pháp luật.',
          'Do not use the service for anything unlawful.',
        ],
      ],
      paras: [
        [
          'Chúng tôi có thể tạm ngừng hoặc khoá tài khoản vi phạm các điều trên.',
          'We may suspend or lock accounts that break these rules.',
        ],
      ],
    },
    {
      title: ['4. Minh bạch về trí tuệ nhân tạo (AI)', '4. Transparency about AI'],
      paras: [
        [
          'Theo Luật Trí tuệ nhân tạo năm 2025 (Luật số 134/2025/QH15), chúng tôi thông báo rõ: câu trả lời của trợ lý AI và giọng đọc phát âm trong VocaStudy được tạo tự động bằng trí tuệ nhân tạo; một phần nội dung học (như câu ví dụ, mẹo ghi nhớ) được soạn với sự hỗ trợ của công cụ AI. Nội dung do AI tạo ra có thể chưa hoàn toàn chính xác — hãy dùng như gợi ý học tập, không thay thế giáo viên hay tài liệu chính thức.',
          'In line with Vietnam’s AI Law 2025 (Law No. 134/2025/QH15), we state clearly: the AI tutor’s answers and the pronunciation voices in VocaStudy are generated automatically by artificial intelligence, and part of the learning content (such as example sentences and memory tips) was written with the help of AI tools. AI-generated content may not be fully accurate — treat it as study help, not a replacement for a teacher or official materials.',
        ],
      ],
    },
    {
      title: ['5. Nội dung và quyền sở hữu', '5. Content and ownership'],
      items: [
        [
          'Giao diện, mã nguồn, cấu trúc bài học và bộ dữ liệu từ vựng, mẫu câu được biên soạn trên VocaStudy thuộc về VocaStudy. Bạn được dùng cho việc học cá nhân; không dùng vào mục đích thương mại, không sao chép hay phân phối lại hàng loạt.',
          'The interface, source code, lesson structure and the compiled word and phrase data belong to VocaStudy. You may use them for personal learning; not commercially, and not to copy or redistribute in bulk.',
        ],
        [
          'Những gì bạn tự tạo (ví dụ câu bạn tự đặt, ghi chú) vẫn thuộc về bạn. Với dữ liệu được đồng bộ khi bạn đăng nhập, bạn cho phép VocaStudy lưu trữ, sao lưu và hiển thị lại cho chính bạn trên các thiết bị — chỉ để vận hành tính năng đồng bộ.',
          'What you create yourself (such as your own sentences and notes) stays yours. For data synced while you are signed in, you allow VocaStudy to store, back up and show it back to you on your devices — only to run the sync feature.',
        ],
      ],
    },
    {
      title: ['6. Lưu ý trong giai đoạn thử nghiệm (beta)', '6. Good to know during the beta'],
      lead: [
        [
          'VocaStudy được xây dựng với mong muốn tạo ra một môi trường học tiếng Anh miễn phí, nhẹ nhàng và hữu ích cho mọi người. Vì ứng dụng đang trong giai đoạn thử nghiệm (beta) và liên tục được hoàn thiện, đôi lúc hệ thống có thể gặp lỗi kỹ thuật, gián đoạn tạm thời hoặc phụ thuộc vào đường truyền của các nhà cung cấp hạ tầng (máy chủ đám mây, dịch vụ AI).',
          'We built VocaStudy to be a free, gentle and useful place for anyone to learn English. Because the app is in beta and keeps improving, it may now and then hit a technical error, a short interruption, or a problem at one of our infrastructure providers (cloud servers, AI services).',
        ],
        [
          'Để việc học của bạn luôn an toàn và không bị ảnh hưởng bởi các sự cố ngoài ý muốn, bạn lưu ý giúp chúng tôi:',
          'To keep your learning safe from the unexpected, please keep in mind:',
        ],
      ],
      items: [
        [
          'Chủ động sao lưu tiến độ: hãy thỉnh thoảng tải file sao lưu về máy trong Cài đặt → Dữ liệu & sao lưu, đặc biệt nếu bạn chỉ học trên trình duyệt mà chưa tạo tài khoản đồng bộ — xoá dữ liệu trình duyệt hoặc hỏng thiết bị sẽ làm mất dữ liệu trên máy. Kể cả khi đã đăng nhập, câu bạn tự đặt và tiến độ mẫu câu vẫn chỉ nằm trên máy; file sao lưu giữ được cả hai.',
          'Back up your progress: now and then, download a backup file in Settings → Data & backup — especially if you learn in the browser without an account, since clearing browser data or losing the device erases what is stored on it. Even when signed in, your own sentences and phrase progress live only on the device; the backup file keeps both.',
        ],
        [
          'Giới hạn trách nhiệm: dịch vụ được cung cấp "như hiện có". Trong phạm vi pháp luật cho phép, VocaStudy không chịu trách nhiệm cho thiệt hại gián tiếp hay việc mất dữ liệu trên thiết bị phát sinh từ sự cố kỹ thuật ngoài tầm kiểm soát trong quá trình bạn dùng bản thử nghiệm này. Nếu gặp bất kỳ lỗi nào, hãy nhắn cho chúng tôi qua contact@vocastudy.app để cùng khắc phục.',
          'Limits of responsibility: the service is provided "as is". To the extent the law allows, VocaStudy is not liable for indirect damages or for data lost on your device because of technical problems beyond our control while you use this beta. If anything goes wrong, write to contact@vocastudy.app and we will fix it together.',
        ],
      ],
    },
    {
      title: ['7. Chấm dứt', '7. Ending'],
      items: [
        [
          'Bạn có thể ngừng dùng bất cứ lúc nào và tự xoá tài khoản trong Cài đặt → Vùng nguy hiểm, hoặc nhờ chúng tôi xoá qua contact@vocastudy.app.',
          'You can stop at any time and delete your account yourself in Settings → Danger zone, or ask us to at contact@vocastudy.app.',
        ],
        [
          'Chúng tôi có quyền tạm ngừng hoặc chấm dứt dịch vụ hay tài khoản nếu bạn vi phạm điều khoản, nếu tài khoản không hoạt động trong thời gian dài, hoặc khi giai đoạn thử nghiệm kết thúc — có thông báo trước hợp lý khi có thể.',
          'We may suspend or end the service or an account if you break these terms, if an account stays inactive for a long time, or when the beta ends — with reasonable notice where possible.',
        ],
      ],
    },
    {
      title: ['8. Luật áp dụng và giải quyết tranh chấp', '8. Governing law and disputes'],
      paras: [
        [
          'Các điều khoản này tuân theo pháp luật Việt Nam. Mọi tranh chấp trước hết được giải quyết bằng thương lượng, hoà giải; nếu không đạt được thoả thuận, tranh chấp sẽ được đưa ra Toà án có thẩm quyền tại Việt Nam.',
          'These terms are governed by the laws of Vietnam. Any dispute will first be settled by negotiation and mediation; if no agreement is reached, it will go to a competent court in Vietnam.',
        ],
      ],
    },
    {
      title: ['9. Thay đổi và liên hệ', '9. Changes and contact'],
      paras: [
        [
          'Khi điều khoản thay đổi, chúng tôi cập nhật ngày ở đầu trang và thông báo trong ứng dụng nếu có thay đổi quan trọng. Mọi câu hỏi xin gửi về: contact@vocastudy.app',
          'When these terms change we update the date at the top and announce important changes in the app. Questions: contact@vocastudy.app',
        ],
      ],
    },
  ],
}
