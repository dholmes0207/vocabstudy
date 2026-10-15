import type { Pair } from './legal'

// "What's new" (/changelog). Every entry is a real release, taken from the git
// history — newest first. Add one when a change is something a learner would
// notice; leave out fixes and internal work.

export interface Release {
  /** ISO day it went live. */
  date: string
  title: Pair
  items: Pair[]
}

export const RELEASES: Release[] = [
  {
    date: '2026-10-15',
    title: ['Góp ý ngay trong app và chuông thông báo', 'In-app feedback and a notification bell'],
    items: [
      [
        'Đọc truyện ngắn: 14 truyện tiếng Anh từ A1 đến B1 (đi chợ, khám bệnh, phỏng vấn xin việc, chuyển nhà…) — chạm vào từ để xem nghĩa, mở bản dịch, trả lời câu hỏi.',
        'Short stories: 14 English stories from A1 to B1 (the market, the doctor, a job interview, moving house…) — tap a word for its meaning, open the translation, answer questions.',
      ],
      [
        'Nghe – chép: nghe một câu ví dụ rồi gõ lại, xem từng từ bạn nghe đúng hay sót.',
        'Dictation: hear an example sentence, type it, and see which words you caught or missed.',
      ],
      [
        'Tiếng Hàn (beta): 182 từ sơ cấp — chào hỏi, số đếm, màu sắc, đi lại, ăn uống… — có cách đọc kiểu Việt và câu ví dụ. Chọn ở nút ngôn ngữ trên cùng.',
        'Korean (beta): 182 beginner words — greetings, numbers, colours, getting around, food… — with Vietnamese-style readings and example sentences. Pick it from the language button at the top.',
      ],
      [
        'Bảng chữ cái Hangul cho người học tiếng Hàn: nghe từng chữ, tự ghép chữ, kiểm tra nhanh (có cả đọc từ). Thêm 4 truyện ngắn tiếng Hàn — chạm vào từ, kể cả từ có tiểu từ hay đuôi chia, để xem nghĩa — và 12 bộ từ tiếng Hàn theo chủ đề. Khi học tiếng Hàn, menu chỉ còn những phần dùng được cho tiếng Hàn.',
        'The Hangul alphabet for Korean learners: hear each letter, build syllables, take a quick check (reading whole words too). Plus 4 short Korean stories — tap any word, particles and verb endings included, to see what it means — and 12 Korean topic decks. While learning Korean, the menus only show what works for Korean.',
      ],
      [
        'Ngữ pháp căn bản: 12 bài cho người mới (to be, các thì, a/an/the, giới từ, so sánh, câu hỏi…) — giải thích bằng tiếng Việt, kèm lỗi hay gặp và bài luyện.',
        'Grammar basics: 12 beginner lessons (to be, tenses, a/an/the, prepositions, comparisons, questions…) — explained in Vietnamese, with common mistakes and practice.',
      ],
      [
        'Học theo chủ đề: 19 bộ từ theo tình huống — công sở, nghề nghiệp, ăn uống, sức khoẻ, công nghệ, gia đình, thiên nhiên… Mỗi bộ có nút Học và Ôn riêng.',
        'Learn by topic: 19 decks for real situations — work, jobs, food, health, tech, family, nature… Each deck has its own Learn and Review.',
      ],
      [
        'Gửi góp ý ngay trong app (không cần mở email) — có thể cho phép trích dẫn kèm tên.',
        'Send feedback right in the app (no email needed) — and allow us to quote you if you like.',
      ],
      [
        'Chuông thông báo cạnh nút ngôn ngữ: cập nhật chính sách và những gì mới ra mắt.',
        'A notification bell beside the language button: policy updates and what just shipped.',
      ],
      [
        'Đăng ký (cả bằng Google) có bước chọn tên hiển thị; đổi tên bất cứ lúc nào trong Cài đặt.',
        'Signing up (Google too) now asks for your display name; change it any time in Settings.',
      ],
      [
        'Đăng nhập bằng Google; quên mật khẩu, đổi mật khẩu và tự xoá tài khoản.',
        'Sign in with Google; forgot password, change password and delete your account yourself.',
      ],
      [
        'Giao diện điện thoại gọn hơn: thanh trên cùng và trang Cài đặt không còn tràn màn hình.',
        'A tidier phone layout: the top bar and Settings no longer spill off the screen.',
      ],
    ],
  },
  {
    date: '2026-10-14',
    title: ['Chính sách và điều khoản theo luật mới', 'Policy and terms for the new laws'],
    items: [
      [
        'Chính sách bảo mật và Điều khoản sử dụng cập nhật theo Luật Bảo vệ dữ liệu cá nhân 2025 và Luật Trí tuệ nhân tạo 2025.',
        'The Privacy policy and Terms of use now follow Vietnam’s 2025 Personal Data Protection Law and AI Law.',
      ],
      [
        'Khi đăng ký, bạn tự tích ô đồng ý — không có gì được chọn sẵn.',
        'When you sign up, you tick the consent box yourself — nothing is pre-selected.',
      ],
      [
        'Ghi rõ nội dung nào do AI tạo, gồm cả giọng đọc phát âm.',
        'Clear labels for what AI produces, including the pronunciation voices.',
      ],
    ],
  },
  {
    date: '2026-10-13',
    title: ['Mẫu câu giao tiếp và diện mạo mới', 'Everyday phrases and a new look'],
    items: [
      [
        'Mẫu câu giao tiếp: 100 câu dùng được ngay trong 10 tình huống, có giọng đọc AI chuẩn Mỹ và bài luyện xếp câu.',
        'Everyday phrases: 100 ready-to-use phrases across 10 situations, with natural AI voices and sentence-building practice.',
      ],
      [
        'Trang giới thiệu, logo và đường dẫn gọn (vocastudy.app/phrases).',
        'A new homepage, logo and clean links (vocastudy.app/phrases).',
      ],
      [
        'Quên mật khẩu, đổi mật khẩu và tự xoá tài khoản ngay trong app.',
        'Forgot password, change password, and delete your account right in the app.',
      ],
      [
        'Trang Giới thiệu, Chính sách bảo mật và Điều khoản sử dụng.',
        'About, Privacy policy and Terms of use pages.',
      ],
    ],
  },
  {
    date: '2026-10-11',
    title: ['Giao diện tiếng Anh', 'English interface'],
    items: [
      [
        'Chuyển giao diện giữa tiếng Anh và tiếng Việt bất cứ lúc nào; trợ lý AI trả lời theo ngôn ngữ bạn chọn.',
        'Switch the interface between English and Vietnamese at any time; the AI tutor replies in your language.',
      ],
      [
        'Menu tài khoản mở ngay, không phải chờ tải gói từ.',
        'The account menu opens instantly instead of waiting for the word pack.',
      ],
      ['Tài khoản vào giai đoạn beta với danh sách chờ.', 'Accounts move to a beta waitlist.'],
    ],
  },
  {
    date: '2026-10-09',
    title: ['4.440 từ', '4,440 words'],
    items: [
      [
        'Thêm hàng trăm từ đời thường: cảm xúc, sức khoẻ, công sở, du lịch, sở thích…',
        'Hundreds more everyday words: feelings, health, work, travel, hobbies…',
      ],
      [
        '"Hôm nay còn bao nhiêu sức?" — chọn mức học vừa sức.',
        '"How much energy today?" — pick a session that fits.',
      ],
      [
        'Nghe trước những từ sắp học, rồi học luôn.',
        'Listen to the words coming up next, then learn them straight away.',
      ],
    ],
  },
  {
    date: '2026-10-08',
    title: ['Nghe, phát âm và giữ nhịp học', 'Listening, pronunciation and keeping the habit'],
    items: [
      [
        'Nghe thụ động: bấm một lần rồi cứ nghe, điều khiển từ màn hình khoá.',
        'Hands-free listening: tap once and listen, controlled from the lock screen.',
      ],
      [
        'Âm khó cho người Việt: 12 bài và trò thử tai.',
        'Hard sounds for Vietnamese speakers: 12 lessons and an ear test.',
      ],
      [
        'Khiên giữ chuỗi, mục tiêu nhỏ mỗi ngày, học nhanh 2 phút và quà nhãn dán.',
        'Streak shields, a small daily goal, 2-minute quick study and sticker gifts.',
      ],
      [
        'Nhắc học mỗi ngày qua lịch điện thoại; thống kê "7 ngày qua".',
        'A daily reminder through your phone calendar; a "last 7 days" summary.',
      ],
    ],
  },
  {
    date: '2026-10-01',
    title: ['Bầu trời sống động', 'A living sky'],
    items: [
      [
        'Nền trời sao, tuyết và sao băng phản hồi theo việc học — tắt được trong Cài đặt.',
        'A sky of stars, snow and meteors that reacts as you learn — you can turn it off in Settings.',
      ],
    ],
  },
  {
    date: '2026-09-24',
    title: ['Học sâu, nhớ lâu', 'Learn deeply, remember longer'],
    items: [
      [
        'Học theo nhóm 5 từ và tự nhớ lại thay vì tự chấm; trả lời sai thì được giảng.',
        'Learn in groups of 5 and recall instead of grading yourself; a wrong answer gets explained.',
      ],
      [
        'Ôn tập không còn "nhồi": chỉ câu trả lời đúng hạn mới đẩy từ lên.',
        'No more cramming: only reviews on schedule move a word up.',
      ],
      [
        'Trò chơi Ghép cặp và Xếp câu, Từ của ngày; vượt mốc 1.000 từ với các từ B1.',
        'Match and Order games, Word of the day; past 1,000 words with B1 vocabulary.',
      ],
    ],
  },
  {
    date: '2026-09-09',
    title: ['Học cả khi mất mạng', 'Learn offline'],
    items: [
      [
        'Sau lần mở đầu tiên, app vẫn chạy khi không có mạng.',
        'After the first visit, the app keeps working without a connection.',
      ],
    ],
  },
  {
    date: '2026-08-20',
    title: ['1.000 từ cơ bản', '1,000 core words'],
    items: [
      [
        'Đủ 1.000 từ cơ bản, mỗi từ có phiên âm, cách đọc kiểu Việt và giọng đọc AI chuẩn Mỹ.',
        'All 1,000 core words, each with IPA, a Vietnamese-letter respelling and a natural AI voice.',
      ],
    ],
  },
]
