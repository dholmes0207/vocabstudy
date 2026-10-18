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
    date: '2026-10-19',
    title: ['Buổi học đầu dễ hơn, cách đọc rõ hơn', 'An easier first lesson, clearer readings'],
    items: [
      [
        'Bấm "Học 5 từ đầu tiên" là vào bài ngay. Mỗi bài có tối đa một phần ba là từ ngữ pháp (the, of, is…), phần còn lại là từ dễ hình dung như look, go, little.',
        'Tap "Learn your first 5 words" and the lesson starts right away. At most a third of a lesson are grammar words (the, of, is…); the rest are words you can picture, like look, go, little.',
      ],
      [
        'Cách đọc kiểu Việt viết đôi nguyên âm dài: sheep đọc SHIIP, ship đọc SHIP; leave LIIV, live LIV; food PHUUĐ, foot PHUT.',
        'The Vietnamese-letter readings now double long vowels: sheep reads SHIIP, ship reads SHIP; leave LIIV, live LIV; food PHUUĐ, foot PHUT.',
      ],
      [
        'Câu nói hay mỗi ngày trên Trang chủ giờ theo ngôn ngữ bạn đang học: tiếng Hàn, tiếng Trung có câu riêng.',
        'The daily saying on Home now follows the language you are learning, with its own Korean and Chinese sayings.',
      ],
      [
        'Chữ phụ đậm hơn, dễ đọc hơn khi ra ngoài trời, ở cả giao diện sáng và tối.',
        'Secondary text is darker and easier to read outdoors, in both light and dark themes.',
      ],
    ],
  },
  {
    date: '2026-10-18',
    title: [
      '"Mình biết từ này rồi" và trang giới thiệu cho mọi người',
      '"I already know this word", and the introduction for everyone',
    ],
    items: [
      [
        'Gói tiếng Trung tăng từ 156 lên 234 từ: thêm từ đời thường ngoài HSK 1 — anh chị em, màu sắc, thuốc và sức khoẻ, xe buýt, trái/phải, đắt/rẻ, thi cử, công ty, bơi, hát, 因为 / 所以 / 但是… — và 3 bộ chủ đề mới: Sức khoẻ & màu sắc, Học tập & công việc, Sở thích & thể thao.',
        'The Chinese pack grows from 156 to 234 words: everyday words beyond HSK 1 — siblings, colours, medicine and health, the bus, left/right, cheap/expensive, exams, the office, swimming, singing, 因为 / 所以 / 但是… — and 3 new topic decks: Health & colours, Study & work, Hobbies & sport.',
      ],
      [
        'Tiếng Trung: không cần bàn phím chữ Hán nữa — ở Nghe – chép và câu điền từ, gõ bính âm không dấu (ví dụ "xiexie" cho 谢谢) cũng được chấm, rồi app hiện lại chữ Hán.',
        'Chinese: no Chinese keyboard needed — in dictation and gap questions you can type pinyin without tones (say "xiexie" for 谢谢), and the app shows the characters afterwards.',
      ],
      [
        'Học tiếng Hàn, tiếng Trung mà máy chưa có bàn phím Hàn hay bàn phím bính âm: dưới ô gõ có hướng dẫn thêm bàn phím cho đúng loại máy, kèm nút "Làm không cần gõ" — Nghe – chép thành xếp thẻ chữ, câu điền từ thành câu chọn đáp án.',
        'Learning Korean or Chinese without a Hangul or pinyin keyboard yet: under the typing box there are steps to add one for your device, plus "Do it without typing" — dictation becomes tapping tiles in order, and gap questions become multiple choice.',
      ],
      [
        'Nghe – chép theo truyện: trong trang đọc truyện, bấm "Nghe – chép" để chép lần lượt mọi câu của truyện. Bài ngữ pháp cũng có "Nghe – chép ví dụ".',
        'Story dictation: on a story, tap "Dictation" to write the whole story sentence by sentence. Grammar lessons have "Dictation: the examples" too.',
      ],
      [
        'Thẻ từ tiếng Trung và tiếng Hàn có mục "Cùng chữ Hán Việt": học 学生 (học sinh) là thấy ngay chữ 学 còn có trong 学校, 学习, 同学. Từ trong danh sách HSK 1 có nhãn HSK 1.',
        'Chinese and Korean word cards show "Same Sino-Vietnamese character": learn 学生 and see 学 in 学校, 学习 and 同学 too. HSK 1 words carry an HSK 1 badge.',
      ],
      [
        'Đọc truyện: chạm vào biểu tượng dịch cuối câu để xem nghĩa riêng câu đó, nút "Đọc chậm" khi nghe, và nút "Truyện tiếp theo" khi đọc xong.',
        'Stories: tap the translate icon at the end of a sentence for that sentence only, a "Slow" button for listening, and "Next story" when you finish.',
      ],
      [
        'Đang ở chỗ đông người? Ở câu nghe, bấm "Hiện không nghe được": trong 15 phút câu nghe thành câu đọc, không phát tiếng.',
        'Somewhere you can’t play sound? On a listening question, tap "Can’t listen now": for 15 minutes listening questions become reading ones, silently.',
      ],
      [
        'Cuối buổi Ôn tập và Quiz giờ có tóm tắt thay đổi: bao nhiêu từ đã thuộc, lên bậc, hay cần học lại.',
        'The end of Review and Quiz now shows what changed: words mastered, moved up, or to relearn.',
      ],
      [
        'Trên thẻ làm quen có nút "Nói thử từ này" để luyện phát âm ngay tại chỗ, không phải sang trang Luyện nói.',
        'Meet cards have "Try saying it" to practise pronunciation right there, without going to the Speaking page.',
      ],
      [
        'Trang Học có "Đã biết bộ N rồi?": làm 8 câu, đúng 7 thì bỏ qua cả bộ — các từ được hỏi lại sau 5 ngày để chắc chắn.',
        'Learn has "Already know set N?": answer 8 questions, get 7 right and skip the whole set — its words are checked again in 5 days.',
      ],
      [
        'Trên thẻ làm quen của bài học có nút "Mình biết từ này rồi": từ đó được bỏ qua trong bài, và app hỏi lại sau 5 ngày để chắc chắn. Không tính là đã thuộc cho tới khi bạn trả lời đúng.',
        'Meet cards now have "I already know this word": the word is skipped in the lesson and checked again in 5 days. It doesn’t count as mastered until you answer it.',
      ],
      [
        'Vào vocastudy.app giờ luôn mở trang giới thiệu. Nếu đã từng học, bạn thấy nút "Tiếp tục học" để vào thẳng app. App cài trên điện thoại vẫn mở vào phần học như cũ.',
        'vocastudy.app now always opens on the introduction. If you have studied before, a "Continue learning" button takes you straight in. The installed app still opens straight to your lessons.',
      ],
    ],
  },
  {
    date: '2026-10-17',
    title: [
      'Lộ trình HSK 1 / TOPIK I, kiểm tra trình độ, lưu từ khi đọc',
      'HSK 1 / TOPIK I roadmaps, a placement check, saving words while reading',
    ],
    items: [
      [
        'Bài ngữ pháp có thêm mục "Nói thành tiếng": nghe mẫu, bấm micro và đọc to 3 câu ví dụ. App chấm cả câu và tô đỏ chữ chưa nghe rõ, dùng được cho tiếng Anh, tiếng Hàn và tiếng Trung.',
        'Grammar lessons now have "Say it aloud": hear the model, tap the mic and read three examples. The app scores the whole sentence and marks the words that did not come through — in English, Korean and Chinese.',
      ],
      [
        'Lộ trình luyện thi HSK 1 (tiếng Trung) và TOPIK I (tiếng Hàn): thông tin kỳ thi có nguồn, 6 bước theo thứ tự nên học kèm chỗ bạn đã tới, và bài kiểm tra từ vựng 20 câu (10 nghe, 10 đọc). Từ làm sai có thể lưu lại để học.',
        'Exam roadmaps for HSK 1 (Chinese) and TOPIK I (Korean): exam facts with sources, six steps in the order to learn them with how far you have got, and a 20-question vocabulary check (10 listening, 10 reading). Save the words you miss to learn them.',
      ],
      [
        'Kiểm tra trình độ khoảng 3 phút ở trang Học: chọn nghĩa đúng của từ dễ trước, khó dần. Bài học sau đó bắt đầu từ chỗ bạn chưa chắc, không phải học lại từ "hello". Không cộng XP, không đổi lịch ôn.',
        'A 3-minute placement check on the Learn page: pick the meaning of easy words first, then harder ones. Lessons then start where you are no longer sure, not back at "hello". No XP, no change to your reviews.',
      ],
      [
        'Đọc truyện gặp từ chưa biết? Chạm vào từ, bấm "Lưu để học". Từ đó chờ bạn ở trang Học và được học như mọi từ mới: làm quen, tự nhớ lại, rồi vào lịch ôn. Dùng được cho cả tiếng Anh, tiếng Hàn và tiếng Trung.',
        'Met a word you don’t know in a story? Tap it and press "Save to learn". It waits for you on the Learn page and is learned like any new word: meet it, recall it, then it joins your reviews. Works in English, Korean and Chinese.',
      ],
      [
        'Mọi câu ví dụ tiếng Trung có thêm dòng pinyin ngay bên dưới — trên thẻ học, thẻ lật và Nghe thụ động — để đọc được ngay cả khi chưa thuộc chữ Hán.',
        'Every Chinese example sentence now has a pinyin line right under it — on learning cards, flashcards and hands-free listening — so you can read it before you know the characters.',
      ],
      [
        'Nghe – chép tiếng Trung có thêm gợi ý pinyin, đúng thứ cần để gõ bằng bộ gõ pinyin.',
        'Chinese dictation has a pinyin hint — exactly what you need to type with a pinyin keyboard.',
      ],
      [
        'Truyện ngắn tiếng Trung có nút "pinyin": bật lên để thấy cách đọc dưới từng câu. Ví dụ trong các bài ngữ pháp tiếng Trung cũng có pinyin.',
        'Chinese short stories have a "pinyin" button: turn it on to see how each sentence reads. Chinese grammar examples have pinyin too.',
      ],
      [
        'Gói tiếng Trung tăng lên 156 từ, phủ đủ 150 từ HSK 1: thêm số đếm 4–9, 上 / 下 / 里 / 前面 / 后面, 怎么, 怎么样, 请, 喂, 电影…',
        'The Chinese pack grows to 156 words and now covers all 150 HSK 1 words: numbers 4–9, 上 / 下 / 里 / 前面 / 后面, 怎么, 怎么样, 请, 喂, 电影…',
      ],
      [
        'Tiếng Hàn có thêm 4 bài ngữ pháp A2: thì quá khứ -았/었어요, muốn làm gì -고 싶어요, dự định -(으)ㄹ 거예요, phủ định dài -지 않아요.',
        'Korean gets 4 A2 grammar lessons: the past tense -았/었어요, wanting -고 싶어요, plans -(으)ㄹ 거예요 and the long negative -지 않아요.',
      ],
      [
        'Thêm 2 truyện tiếng Hàn A2 ("Cuối tuần trước", "Kế hoạch đi Hàn Quốc") và 10 từ rất hay gặp (저, 정말, 그리고, 그래서, 요즘…) — gói tiếng Hàn có 192 từ, các truyện chạm được nhiều từ hơn.',
        'Two A2 Korean stories ("Last weekend", "A trip to Korea") and 10 very common words (저, 정말, 그리고, 그래서, 요즘…) — the Korean pack has 192 words, and more of each story is tappable.',
      ],
      [
        'Trang chủ có lối vào thẳng tiếng Hàn và tiếng Trung; đường dẫn /home?lang=ko hay /home?lang=zh mở app ngay ở ngôn ngữ đó.',
        'The home page links straight to Korean and Chinese; /home?lang=ko or /home?lang=zh opens the app in that language.',
      ],
      [
        'VocaStudy giờ giới thiệu mình là nơi người Việt học nhiều ngoại ngữ: trang chủ có mục "Bạn muốn học ngôn ngữ nào?", trang Về chúng tôi viết lại, và bạn có thể gợi ý ngôn ngữ muốn học tiếp theo.',
        'VocaStudy now presents itself as a place for Vietnamese speakers to learn many languages: the home page asks "Which language do you want to learn?", the About page is rewritten, and you can suggest the next language.',
      ],
    ],
  },
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
        'Tiếng Trung (beta): 132 từ sơ cấp HSK 1 có pinyin, âm Hán Việt, nghĩa tiếng Việt và câu ví dụ — học, ôn, ghép cặp, xếp câu, nghe – chép đều dùng được — cùng trang Pinyin & thanh điệu (4 thanh, biến điệu, phụ âm đầu, kiểm tra nhanh) 10 bộ từ theo chủ đề, 7 bài ngữ pháp (是, 不/没, câu hỏi, 的, lượng từ, 在, 很) và 3 truyện ngắn chạm-để-xem-nghĩa. Từ Hán Hàn trong gói tiếng Hàn cũng có âm Hán Việt (학생 = học sinh); Tra cứu tìm được không cần dấu, theo pinyin hay âm Hán Việt. Chọn ở nút ngôn ngữ trên cùng.',
        'Chinese (beta): 132 HSK 1 beginner words with pinyin, Sino-Vietnamese readings, Vietnamese meanings and example sentences — learning, reviews, matching, sentence building and dictation all work — plus a Pinyin & tones page (the four tones, tone changes, initials, a quick check) 10 topic decks, 7 grammar lessons (是, 不/没, questions, 的, measure words, 在, 很) and 3 tap-to-translate short stories. Sino-Korean words now show their Sino-Vietnamese reading too (학생 = học sinh), and the dictionary finds words without accents, by pinyin or by Sino-Vietnamese reading. Pick it from the language button at the top.',
      ],
      [
        'Bảng chữ cái Hangul cho người học tiếng Hàn: nghe từng chữ, tự ghép chữ, kiểm tra nhanh (có cả đọc từ). Thêm 6 truyện ngắn tiếng Hàn — chạm vào từ, kể cả từ có tiểu từ hay đuôi chia, để xem nghĩa — cùng 12 bộ từ theo chủ đề và 7 bài ngữ pháp tiếng Hàn (tiểu từ 은/는, 이/가, 을/를, 에/에서, đuôi -아요/-어요, phủ định 안). Khi học tiếng Hàn, menu chỉ còn những phần dùng được cho tiếng Hàn.',
        'The Hangul alphabet for Korean learners: hear each letter, build syllables, take a quick check (reading whole words too). Plus 6 short Korean stories — tap any word, particles and verb endings included, to see what it means — plus 12 Korean topic decks and 7 Korean grammar lessons (the particles 은/는, 이/가, 을/를, 에/에서, the -아요/-어요 ending, 안 for "not"). While learning Korean, the menus only show what works for Korean.',
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
