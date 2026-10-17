#!/usr/bin/env python3
"""Build public/data/grammar/ko.json — Korean grammar (docs/design/grammar.md).

Each choice exercise that picks a particle (이에요/예요, 은/는, 이/가, 을/를)
is checked against the noun in front of the gap: a final consonant (받침) takes
the first form, a vowel ending the second. Word-order sentences must have 3–10
words.

Usage:  python3 -B scripts/build_grammar_ko.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'data' / 'grammar' / 'ko.json'

UNITS = [
    {
        "id": "ko-ieyo",
        "emoji": "🙋",
        "level": "A1",
        "title": [
            "이에요 / 예요: \"là\"",
            "이에요 / 예요: \"to be\""
        ],
        "summary": [
            "Nói ai là ai, cái gì là cái gì.",
            "Say who someone is or what something is."
        ],
        "explain": [
            "Danh từ + 이에요 / 예요 nghĩa là \"là …\", cách nói lịch sự dùng hằng ngày: 학생이에요 = (tôi) là học sinh.",
            "Danh từ kết thúc bằng phụ âm (có 받침) thì thêm 이에요: 학생이에요, 사람이에요. Kết thúc bằng nguyên âm thì thêm 예요: 의사예요, 친구예요.",
            "Câu hỏi giữ nguyên, chỉ lên giọng ở cuối: 학생이에요? = (bạn) là học sinh à?",
            "Chủ ngữ hay được bỏ khi đã rõ: 저는 마이예요, hoặc chỉ 마이예요."
        ],
        "patterns": [
            "N (có 받침) + 이에요: 학생이에요",
            "N (không 받침) + 예요: 의사예요",
            "N + 이에요? / 예요? (câu hỏi)"
        ],
        "examples": [
            {
                "en": "저는 학생이에요.",
                "vi": "Tôi là học sinh."
            },
            {
                "en": "이 사람은 제 친구예요.",
                "vi": "Người này là bạn tôi."
            },
            {
                "en": "엄마는 의사예요.",
                "vi": "Mẹ tôi là bác sĩ."
            },
            {
                "en": "이거 뭐예요?",
                "vi": "Cái này là gì?"
            },
            {
                "en": "여기는 병원이에요.",
                "vi": "Đây là bệnh viện."
            }
        ],
        "mistakes": [
            {
                "wrong": "학생예요.",
                "right": "학생이에요.",
                "why": "학생 kết thúc bằng phụ âm ㅇ (có 받침) nên dùng 이에요."
            },
            {
                "wrong": "친구이에요.",
                "right": "친구예요.",
                "why": "친구 kết thúc bằng nguyên âm nên dùng 예요."
            }
        ],
        "exercises": [
            {
                "type": "choice",
                "prompt": "저는 학생___.",
                "options": [
                    "이에요",
                    "예요"
                ],
                "answer": 0,
                "explain": "학생 có 받침 → 이에요."
            },
            {
                "type": "choice",
                "prompt": "제 동생은 의사___.",
                "options": [
                    "이에요",
                    "예요"
                ],
                "answer": 1,
                "explain": "의사 không có 받침 → 예요."
            },
            {
                "type": "choice",
                "prompt": "이거 커피___?",
                "options": [
                    "이에요",
                    "예요"
                ],
                "answer": 1,
                "explain": "커피 kết thúc bằng nguyên âm → 예요."
            },
            {
                "type": "choice",
                "prompt": "여기는 은행___.",
                "options": [
                    "이에요",
                    "예요"
                ],
                "answer": 0,
                "explain": "은행 có 받침 ㅇ → 이에요."
            },
            {
                "type": "choice",
                "prompt": "그 사람은 제 친구___.",
                "options": [
                    "이에요",
                    "예요"
                ],
                "answer": 1,
                "explain": "친구 không có 받침 → 예요."
            },
            {
                "type": "order",
                "en": "제 이름은 마이예요.",
                "vi": "Tên tôi là Mai."
            },
            {
                "type": "order",
                "en": "이 사람은 제 친구예요.",
                "vi": "Người này là bạn tôi."
            }
        ]
    },
    {
        "id": "ko-eun-neun",
        "emoji": "🏷️",
        "level": "A1",
        "title": [
            "은 / 는: nói về ai, về cái gì",
            "은 / 는: the topic marker"
        ],
        "summary": [
            "Đánh dấu điều đang nói tới, hay dùng khi giới thiệu và so sánh.",
            "Marks what you are talking about — for introductions and contrasts."
        ],
        "explain": [
            "은 / 는 gắn sau danh từ với nghĩa \"còn về …\": 저는 마이예요 = (còn) tôi là Mai.",
            "Danh từ có 받침 + 은 (사람은, 오늘은); không có 받침 + 는 (저는, 친구는).",
            "Dùng khi giới thiệu, khi chuyển sang chủ đề mới và khi so sánh: 커피는 좋아해요. 우유는 안 좋아해요."
        ],
        "patterns": [
            "N (có 받침) + 은",
            "N (không 받침) + 는"
        ],
        "examples": [
            {
                "en": "저는 베트남 사람이에요.",
                "vi": "Tôi là người Việt Nam."
            },
            {
                "en": "오늘은 주말이에요.",
                "vi": "Hôm nay là cuối tuần."
            },
            {
                "en": "제 이름은 마이예요.",
                "vi": "Tên tôi là Mai."
            },
            {
                "en": "커피는 좋아해요. 우유는 안 좋아해요.",
                "vi": "Cà phê thì tôi thích. Sữa thì không."
            }
        ],
        "mistakes": [
            {
                "wrong": "저은 학생이에요.",
                "right": "저는 학생이에요.",
                "why": "저 không có 받침 → 는."
            },
            {
                "wrong": "오늘는 바빠요.",
                "right": "오늘은 바빠요.",
                "why": "오늘 có 받침 ㄹ → 은."
            }
        ],
        "exercises": [
            {
                "type": "choice",
                "prompt": "저___ 마이예요.",
                "options": [
                    "은",
                    "는"
                ],
                "answer": 1,
                "explain": "저 không có 받침 → 는."
            },
            {
                "type": "choice",
                "prompt": "오늘___ 일요일이에요.",
                "options": [
                    "은",
                    "는"
                ],
                "answer": 0,
                "explain": "오늘 có 받침 → 은."
            },
            {
                "type": "choice",
                "prompt": "제 이름___ 지수예요.",
                "options": [
                    "은",
                    "는"
                ],
                "answer": 0,
                "explain": "이름 có 받침 ㅁ → 은."
            },
            {
                "type": "choice",
                "prompt": "친구___ 서울에 살아요.",
                "options": [
                    "은",
                    "는"
                ],
                "answer": 1,
                "explain": "친구 không có 받침 → 는."
            },
            {
                "type": "choice",
                "prompt": "한국어___ 어려워요.",
                "options": [
                    "은",
                    "는"
                ],
                "answer": 1,
                "explain": "한국어 kết thúc bằng nguyên âm → 는."
            },
            {
                "type": "order",
                "en": "제 이름은 지수예요.",
                "vi": "Tên tôi là Ji-su."
            }
        ]
    },
    {
        "id": "ko-i-ga",
        "emoji": "👉",
        "level": "A1",
        "title": [
            "이 / 가: chủ ngữ của câu",
            "이 / 가: the subject marker"
        ],
        "summary": [
            "Chỉ ai, cái gì như thế nào, có hay không có.",
            "Shows who or what is something, or has or lacks something."
        ],
        "explain": [
            "이 / 가 gắn sau chủ ngữ, nhất là khi miêu tả: 날씨가 좋아요 (thời tiết đẹp), 사람이 많아요 (đông người).",
            "Danh từ có 받침 + 이 (시간이, 사람이); không có 받침 + 가 (날씨가, 친구가).",
            "Với 있다 / 없다 (có / không có) gần như luôn dùng 이 / 가: 돈이 없어요 = tôi không có tiền."
        ],
        "patterns": [
            "N (có 받침) + 이",
            "N (không 받침) + 가",
            "N + 이 / 가 있어요 / 없어요"
        ],
        "examples": [
            {
                "en": "날씨가 좋아요.",
                "vi": "Thời tiết đẹp."
            },
            {
                "en": "시간이 없어요.",
                "vi": "Tôi không có thời gian."
            },
            {
                "en": "사람이 많아요.",
                "vi": "Đông người quá."
            },
            {
                "en": "머리가 아파요.",
                "vi": "Tôi đau đầu."
            },
            {
                "en": "동생이 있어요.",
                "vi": "Tôi có em."
            }
        ],
        "mistakes": [
            {
                "wrong": "시간가 없어요.",
                "right": "시간이 없어요.",
                "why": "시간 có 받침 ㄴ → 이."
            },
            {
                "wrong": "날씨이 추워요.",
                "right": "날씨가 추워요.",
                "why": "날씨 không có 받침 → 가."
            }
        ],
        "exercises": [
            {
                "type": "choice",
                "prompt": "돈___ 없어요.",
                "options": [
                    "이",
                    "가"
                ],
                "answer": 0,
                "explain": "돈 có 받침 → 이."
            },
            {
                "type": "choice",
                "prompt": "배___ 고파요.",
                "options": [
                    "이",
                    "가"
                ],
                "answer": 1,
                "explain": "배 không có 받침 → 가."
            },
            {
                "type": "choice",
                "prompt": "사과___ 맛있어요.",
                "options": [
                    "이",
                    "가"
                ],
                "answer": 1,
                "explain": "사과 không có 받침 → 가."
            },
            {
                "type": "choice",
                "prompt": "책___ 있어요.",
                "options": [
                    "이",
                    "가"
                ],
                "answer": 0,
                "explain": "책 có 받침 → 이."
            },
            {
                "type": "choice",
                "prompt": "날씨___ 더워요.",
                "options": [
                    "이",
                    "가"
                ],
                "answer": 1,
                "explain": "날씨 không có 받침 → 가."
            },
            {
                "type": "order",
                "en": "오늘 날씨가 좋아요.",
                "vi": "Hôm nay trời đẹp."
            }
        ]
    },
    {
        "id": "ko-eul-reul",
        "emoji": "🎯",
        "level": "A1",
        "title": [
            "을 / 를: tân ngữ (thứ được ăn, uống, xem…)",
            "을 / 를: the object marker"
        ],
        "summary": [
            "Đánh dấu thứ chịu tác động của động từ: ăn cơm, xem phim.",
            "Marks what the verb acts on: eat rice, watch a film."
        ],
        "explain": [
            "Tiếng Hàn đặt động từ ở cuối câu: 저는 밥을 먹어요 = tôi + cơm + ăn → tôi ăn cơm.",
            "을 / 를 gắn sau thứ được ăn, uống, xem, mua…: 밥을 먹어요, 영화를 봐요.",
            "Danh từ có 받침 + 을 (밥을, 책을); không có 받침 + 를 (커피를, 영화를).",
            "Khi nói nhanh, người Hàn hay bỏ 을 / 를: 밥 먹어요."
        ],
        "patterns": [
            "N (có 받침) + 을 + động từ",
            "N (không 받침) + 를 + động từ"
        ],
        "examples": [
            {
                "en": "저는 커피를 마셔요.",
                "vi": "Tôi uống cà phê."
            },
            {
                "en": "주말에 영화를 봐요.",
                "vi": "Cuối tuần tôi xem phim."
            },
            {
                "en": "동생이 책을 읽어요.",
                "vi": "Em tôi đọc sách."
            },
            {
                "en": "시장에서 과일을 사요.",
                "vi": "Tôi mua trái cây ở chợ."
            }
        ],
        "mistakes": [
            {
                "wrong": "저는 먹어요 밥을.",
                "right": "저는 밥을 먹어요.",
                "why": "Động từ luôn đứng cuối câu."
            },
            {
                "wrong": "커피을 마셔요.",
                "right": "커피를 마셔요.",
                "why": "커피 không có 받침 → 를."
            }
        ],
        "exercises": [
            {
                "type": "choice",
                "prompt": "물___ 마셔요.",
                "options": [
                    "을",
                    "를"
                ],
                "answer": 0,
                "explain": "물 có 받침 ㄹ → 을."
            },
            {
                "type": "choice",
                "prompt": "음악___ 들어요.",
                "options": [
                    "을",
                    "를"
                ],
                "answer": 0,
                "explain": "음악 có 받침 ㄱ → 을."
            },
            {
                "type": "choice",
                "prompt": "우유___ 사요.",
                "options": [
                    "을",
                    "를"
                ],
                "answer": 1,
                "explain": "우유 không có 받침 → 를."
            },
            {
                "type": "choice",
                "prompt": "한국어___ 배워요.",
                "options": [
                    "을",
                    "를"
                ],
                "answer": 1,
                "explain": "한국어 kết thúc bằng nguyên âm → 를."
            },
            {
                "type": "choice",
                "prompt": "사진___ 찍어요.",
                "options": [
                    "을",
                    "를"
                ],
                "answer": 0,
                "explain": "사진 có 받침 ㄴ → 을."
            },
            {
                "type": "order",
                "en": "저는 밥을 먹어요.",
                "vi": "Tôi ăn cơm."
            },
            {
                "type": "order",
                "en": "동생이 책을 읽어요.",
                "vi": "Em tôi đọc sách."
            }
        ]
    },
    {
        "id": "ko-e-eseo",
        "emoji": "📍",
        "level": "A1",
        "title": [
            "에 và 에서: đi đâu, làm ở đâu",
            "에 and 에서: where to, where at"
        ],
        "summary": [
            "에 cho nơi đến và nơi có; 에서 cho nơi diễn ra hành động.",
            "에 for where you go or where something is; 에서 for where something happens."
        ],
        "explain": [
            "에 đi với động từ di chuyển (가다, 오다) và với 있다 / 없다: 학교에 가요 (đi đến trường), 집에 있어요 (ở nhà).",
            "에서 đi với hành động diễn ra tại một nơi: 학교에서 공부해요 (học ở trường), 식당에서 먹어요 (ăn ở quán).",
            "에 còn dùng cho thời gian: 아침에, 주말에, 일곱 시에.",
            "Cả hai không đổi theo 받침: 집에, 회사에서."
        ],
        "patterns": [
            "Nơi + 에 + 가다 / 오다 / 있다",
            "Nơi + 에서 + hành động",
            "Thời gian + 에"
        ],
        "examples": [
            {
                "en": "저는 회사에 가요.",
                "vi": "Tôi đi đến công ty."
            },
            {
                "en": "회사에서 일해요.",
                "vi": "Tôi làm việc ở công ty."
            },
            {
                "en": "동생은 집에 있어요.",
                "vi": "Em tôi đang ở nhà."
            },
            {
                "en": "도서관에서 책을 읽어요.",
                "vi": "Tôi đọc sách ở thư viện."
            },
            {
                "en": "주말에 공원에 가요.",
                "vi": "Cuối tuần tôi đi công viên."
            }
        ],
        "mistakes": [
            {
                "wrong": "학교에 공부해요.",
                "right": "학교에서 공부해요.",
                "why": "Học là hành động diễn ra ở trường → 에서."
            },
            {
                "wrong": "시장에서 가요.",
                "right": "시장에 가요.",
                "why": "가다 là đi đến đâu → 에."
            }
        ],
        "exercises": [
            {
                "type": "choice",
                "prompt": "식당___ 밥을 먹어요.",
                "options": [
                    "에",
                    "에서"
                ],
                "answer": 1,
                "explain": "Ăn là hành động diễn ra ở quán → 에서."
            },
            {
                "type": "choice",
                "prompt": "내일 한국___ 가요.",
                "options": [
                    "에",
                    "에서"
                ],
                "answer": 0,
                "explain": "가다 (đi đến) → 에."
            },
            {
                "type": "choice",
                "prompt": "화장실이 어디___ 있어요?",
                "options": [
                    "에",
                    "에서"
                ],
                "answer": 0,
                "explain": "있다 (ở, có) → 에."
            },
            {
                "type": "choice",
                "prompt": "공원___ 걸어요.",
                "options": [
                    "에",
                    "에서"
                ],
                "answer": 1,
                "explain": "Đi bộ diễn ra trong công viên → 에서."
            },
            {
                "type": "choice",
                "prompt": "아침___ 커피를 마셔요.",
                "options": [
                    "에",
                    "에서"
                ],
                "answer": 0,
                "explain": "Thời gian (buổi sáng) → 에."
            },
            {
                "type": "order",
                "en": "저는 은행에서 일해요.",
                "vi": "Tôi làm việc ở ngân hàng."
            }
        ]
    },
    {
        "id": "ko-ayo-eoyo",
        "emoji": "🔧",
        "level": "A1",
        "title": [
            "Đuôi -아요 / -어요: nói lịch sự hằng ngày",
            "-아요 / -어요: the everyday polite ending"
        ],
        "summary": [
            "Chia động từ, tính từ ở thì hiện tại, cách nói lịch sự.",
            "Turn a verb or adjective into a polite present-tense sentence."
        ],
        "explain": [
            "Bỏ 다 ở cuối từ gốc để lấy thân: 가다 → 가, 먹다 → 먹.",
            "Nguyên âm cuối của thân là ㅏ hoặc ㅗ thì thêm 아요: 살다 → 살아요, 좋다 → 좋아요. Còn lại thì thêm 어요: 먹다 → 먹어요, 읽다 → 읽어요.",
            "Từ có 하다 thành 해요: 공부하다 → 공부해요, 일하다 → 일해요.",
            "Thân kết thúc bằng nguyên âm thì hai nguyên âm gộp lại: 가 + 아요 → 가요, 오 + 아요 → 와요, 마시 + 어요 → 마셔요.",
            "Cùng một câu dùng được để kể và để hỏi (lên giọng ở cuối): 먹어요? = ăn không?"
        ],
        "patterns": [
            "Thân có ㅏ / ㅗ + 아요: 살아요, 좋아요",
            "Thân khác + 어요: 먹어요, 읽어요",
            "하다 → 해요: 공부해요"
        ],
        "examples": [
            {
                "en": "저는 서울에 살아요.",
                "vi": "Tôi sống ở Seoul."
            },
            {
                "en": "매일 한국어를 공부해요.",
                "vi": "Ngày nào tôi cũng học tiếng Hàn."
            },
            {
                "en": "친구가 와요.",
                "vi": "Bạn tôi đến."
            },
            {
                "en": "김치가 맛있어요.",
                "vi": "Kim chi ngon."
            },
            {
                "en": "물을 마셔요.",
                "vi": "Tôi uống nước."
            }
        ],
        "mistakes": [
            {
                "wrong": "먹아요.",
                "right": "먹어요.",
                "why": "Nguyên âm của 먹 là ㅓ, không phải ㅏ / ㅗ → 어요."
            },
            {
                "wrong": "공부하어요.",
                "right": "공부해요.",
                "why": "하다 luôn thành 해요."
            },
            {
                "wrong": "가아요.",
                "right": "가요.",
                "why": "가 + 아요: hai ㅏ gộp làm một → 가요."
            }
        ],
        "exercises": [
            {
                "type": "choice",
                "prompt": "저는 아침에 빵을 (먹다 →) ___.",
                "options": [
                    "먹아요",
                    "먹어요",
                    "먹해요"
                ],
                "answer": 1,
                "explain": "먹 có nguyên âm ㅓ → 어요."
            },
            {
                "type": "choice",
                "prompt": "동생은 서울에 (살다 →) ___.",
                "options": [
                    "살아요",
                    "살어요",
                    "살해요"
                ],
                "answer": 0,
                "explain": "살 có nguyên âm ㅏ → 아요."
            },
            {
                "type": "choice",
                "prompt": "매일 한국어를 (공부하다 →) ___.",
                "options": [
                    "공부하요",
                    "공부해요",
                    "공부하어요"
                ],
                "answer": 1,
                "explain": "하다 → 해요."
            },
            {
                "type": "choice",
                "prompt": "이 책은 정말 (좋다 →) ___.",
                "options": [
                    "좋아요",
                    "좋어요",
                    "좋해요"
                ],
                "answer": 0,
                "explain": "좋 có nguyên âm ㅗ → 아요."
            },
            {
                "type": "choice",
                "prompt": "친구가 집에 (오다 →) ___.",
                "options": [
                    "오어요",
                    "와요",
                    "오요"
                ],
                "answer": 1,
                "explain": "오 + 아요 gộp thành 와요."
            },
            {
                "type": "order",
                "en": "저는 매일 운동해요.",
                "vi": "Ngày nào tôi cũng tập thể dục."
            }
        ]
    },
    {
        "id": "ko-an",
        "emoji": "🙅",
        "level": "A1",
        "title": [
            "안: nói \"không\"",
            "안: saying \"not\""
        ],
        "summary": [
            "Đặt 안 trước động từ, tính từ để phủ định.",
            "Put 안 before a verb or adjective to say \"not\"."
        ],
        "explain": [
            "안 đứng ngay trước động từ hoặc tính từ: 가요 → 안 가요 (không đi), 비싸요 → 안 비싸요 (không đắt).",
            "Với danh từ + 하다, 안 đứng ngay trước 해요: 공부해요 → 공부 안 해요, 운동해요 → 운동 안 해요.",
            "있다 (có) có từ phủ định riêng là 없다 (không có); 알다 (biết) thì dùng 모르다 (không biết)."
        ],
        "patterns": [
            "안 + động từ / tính từ: 안 먹어요",
            "N + 안 해요: 공부 안 해요",
            "있어요 ↔ 없어요, 알아요 ↔ 몰라요"
        ],
        "examples": [
            {
                "en": "저는 술을 안 마셔요.",
                "vi": "Tôi không uống rượu."
            },
            {
                "en": "오늘은 안 바빠요.",
                "vi": "Hôm nay tôi không bận."
            },
            {
                "en": "주말에는 일 안 해요.",
                "vi": "Cuối tuần tôi không làm việc."
            },
            {
                "en": "이 가방은 안 비싸요.",
                "vi": "Cái túi này không đắt."
            },
            {
                "en": "시간이 없어요.",
                "vi": "Tôi không có thời gian."
            }
        ],
        "mistakes": [
            {
                "wrong": "저는 마셔요 안.",
                "right": "저는 안 마셔요.",
                "why": "안 đứng trước động từ."
            },
            {
                "wrong": "안 공부해요.",
                "right": "공부 안 해요.",
                "why": "Với danh từ + 하다, đặt 안 ngay trước 해요."
            },
            {
                "wrong": "돈이 안 있어요.",
                "right": "돈이 없어요.",
                "why": "Phủ định của 있다 là 없다."
            }
        ],
        "exercises": [
            {
                "type": "choice",
                "prompt": "커피를 ___.",
                "options": [
                    "안 마셔요",
                    "마셔요 안"
                ],
                "answer": 0,
                "explain": "안 đứng trước động từ."
            },
            {
                "type": "choice",
                "prompt": "오늘은 ___.",
                "options": [
                    "운동 안 해요",
                    "운동해요 안"
                ],
                "answer": 0,
                "explain": "Danh từ + 안 해요."
            },
            {
                "type": "choice",
                "prompt": "돈이 ___.",
                "options": [
                    "안 있어요",
                    "없어요"
                ],
                "answer": 1,
                "explain": "Phủ định của 있다 là 없다."
            },
            {
                "type": "choice",
                "prompt": "그 사람을 ___.",
                "options": [
                    "안 알아요",
                    "몰라요"
                ],
                "answer": 1,
                "explain": "\"Không biết\" dùng 모르다 → 몰라요."
            },
            {
                "type": "choice",
                "prompt": "이 옷은 ___ 비싸요.",
                "options": [
                    "안",
                    "않"
                ],
                "answer": 0,
                "explain": "Phủ định ngắn: đặt 안 trước tính từ."
            },
            {
                "type": "order",
                "en": "저는 술을 안 마셔요.",
                "vi": "Tôi không uống rượu."
            }
        ]
    },
    # --- A2 (17/10/2026) -------------------------------------------------
    {
        "id": "ko-past", "emoji": "⏪", "level": "A2",
        "title": ["-았어요 / -었어요: thì quá khứ", "-았어요 / -었어요: the past tense"],
        "summary": ["Kể việc đã xảy ra.", "Say what happened."],
        "explain": [
            "Kể việc đã xảy ra: thân + 았어요 / 었어요, chọn giống đuôi hiện tại -아요 / -어요.",
            "Thân có ㅏ hoặc ㅗ thì thêm 았어요: 가다 → 갔어요, 오다 → 왔어요. Còn lại thêm 었어요: 먹다 → 먹었어요, 마시다 → 마셨어요.",
            "하다 thành 했어요: 공부했어요, 일했어요.",
            "Thường đi với từ chỉ thời gian đã qua: 어제 (hôm qua), 지난주 (tuần trước), 아까 (lúc nãy).",
        ],
        "patterns": ["Thân có ㅏ / ㅗ + 았어요: 갔어요, 봤어요", "Thân khác + 었어요: 먹었어요, 읽었어요", "하다 → 했어요"],
        "examples": [
            {"en": "어제 친구를 만났어요.", "vi": "Hôm qua tôi đã gặp bạn."},
            {"en": "아침에 빵을 먹었어요.", "vi": "Buổi sáng tôi đã ăn bánh mì."},
            {"en": "주말에 영화를 봤어요.", "vi": "Cuối tuần tôi đã xem phim."},
            {"en": "어제 한국어를 공부했어요.", "vi": "Hôm qua tôi đã học tiếng Hàn."},
            {"en": "지난주에 비가 왔어요.", "vi": "Tuần trước trời đã mưa."},
        ],
        "mistakes": [
            {"wrong": "먹았어요.", "right": "먹었어요.", "why": "Nguyên âm của 먹 là ㅓ, không phải ㅏ / ㅗ → 었어요."},
            {"wrong": "공부하었어요.", "right": "공부했어요.", "why": "하다 luôn thành 했어요."},
            {"wrong": "어제 학교에 가요.", "right": "어제 학교에 갔어요.", "why": "Việc hôm qua phải dùng đuôi quá khứ."},
        ],
        "exercises": [
            {"type": "choice", "prompt": "어제 친구를 (만나다 →) ___.", "options": ["만났어요", "만나었어요", "만나요"], "answer": 0, "explain": "만나 + 았어요: hai ㅏ gộp làm một → 만났어요."},
            {"type": "choice", "prompt": "아침에 커피를 (마시다 →) ___.", "options": ["마셨어요", "마시았어요", "마셔요"], "answer": 0, "explain": "마시 + 었어요 → 마셨어요."},
            {"type": "choice", "prompt": "어제 한국어를 (공부하다 →) ___.", "options": ["공부했어요", "공부하었어요", "공부해요"], "answer": 0, "explain": "하다 → 했어요."},
            {"type": "choice", "prompt": "주말에 책을 (읽다 →) ___.", "options": ["읽었어요", "읽았어요", "읽어요"], "answer": 0, "explain": "읽 có nguyên âm ㅣ → 었어요."},
            {"type": "choice", "prompt": "어제 친구가 집에 (오다 →) ___.", "options": ["왔어요", "오었어요", "와요"], "answer": 0, "explain": "오 + 았어요 gộp thành 왔어요."},
            {"type": "order", "en": "어제 친구를 만났어요.", "vi": "Hôm qua tôi đã gặp bạn."},
        ],
    },
    {
        "id": "ko-want", "emoji": "💭", "level": "A2",
        "title": ["-고 싶어요: muốn làm gì", "-고 싶어요: wanting to do something"],
        "summary": ["Nói điều mình muốn làm.", "Say what you want to do."],
        "explain": [
            "Thân động từ + 고 싶어요 = muốn làm gì: 가다 → 가고 싶어요 (muốn đi).",
            "Không đổi theo nguyên âm: 먹고 싶어요, 보고 싶어요, 공부하고 싶어요.",
            "Hỏi người khác muốn gì: 뭐 먹고 싶어요? (Bạn muốn ăn gì?)",
            "보고 싶어요 còn có nghĩa là \"nhớ (ai đó)\": 엄마가 보고 싶어요 = tôi nhớ mẹ.",
        ],
        "patterns": ["Thân + 고 싶어요", "뭐 + động từ + 고 싶어요? (muốn … gì?)"],
        "examples": [
            {"en": "한국에 가고 싶어요.", "vi": "Tôi muốn đi Hàn Quốc."},
            {"en": "뭐 먹고 싶어요?", "vi": "Bạn muốn ăn gì?"},
            {"en": "커피를 마시고 싶어요.", "vi": "Tôi muốn uống cà phê."},
            {"en": "오늘은 집에서 쉬고 싶어요.", "vi": "Hôm nay tôi muốn nghỉ ở nhà."},
            {"en": "엄마가 보고 싶어요.", "vi": "Tôi nhớ mẹ."},
        ],
        "mistakes": [
            {"wrong": "가요 싶어요.", "right": "가고 싶어요.", "why": "Dùng thân động từ (bỏ 다) + 고 싶어요, không dùng dạng đã chia."},
            {"wrong": "먹다 싶어요.", "right": "먹고 싶어요.", "why": "Bỏ 다 rồi mới thêm 고 싶어요."},
        ],
        "exercises": [
            {"type": "choice", "prompt": "한국어를 배우___ 싶어요.", "options": ["고", "어"], "answer": 0, "explain": "Thân + 고 싶어요."},
            {"type": "choice", "prompt": "뭐 ___ 싶어요?", "options": ["먹고", "먹어"], "answer": 0, "explain": "먹다 → 먹고 싶어요."},
            {"type": "choice", "prompt": "주말에 영화를 (보다 →) ___.", "options": ["보고 싶어요", "봐고 싶어요", "보다 싶어요"], "answer": 0, "explain": "보 + 고 싶어요."},
            {"type": "choice", "prompt": "피곤해요. 집에서 (쉬다 →) ___.", "options": ["쉬고 싶어요", "쉬어 싶어요", "쉬다 싶어요"], "answer": 0, "explain": "쉬 + 고 싶어요."},
            {"type": "choice", "prompt": "물을 (마시다 →) ___.", "options": ["마시고 싶어요", "마셔고 싶어요", "마시다 싶어요"], "answer": 0, "explain": "마시 + 고 싶어요."},
            {"type": "order", "en": "한국에 가고 싶어요.", "vi": "Tôi muốn đi Hàn Quốc."},
        ],
    },
    {
        "id": "ko-future", "emoji": "🗓️", "level": "A2",
        "title": ["-(으)ㄹ 거예요: sẽ làm gì", "-(으)ㄹ 거예요: plans and the future"],
        "summary": ["Nói dự định, việc sẽ làm.", "Say what you are going to do."],
        "explain": [
            "Nói việc sẽ làm: thân kết thúc bằng nguyên âm + ㄹ 거예요; thân kết thúc bằng phụ âm + 을 거예요.",
            "가다 → 갈 거예요, 보다 → 볼 거예요; 먹다 → 먹을 거예요, 읽다 → 읽을 거예요.",
            "하다 thành 할 거예요: 공부할 거예요.",
            "Thân có ㄹ ở cuối thì chỉ thêm 거예요: 살다 → 살 거예요, 만들다 → 만들 거예요.",
        ],
        "patterns": ["Thân (nguyên âm) + ㄹ 거예요: 갈 거예요", "Thân (phụ âm) + 을 거예요: 먹을 거예요", "하다 → 할 거예요"],
        "examples": [
            {"en": "내일 친구를 만날 거예요.", "vi": "Ngày mai tôi sẽ gặp bạn."},
            {"en": "주말에 영화를 볼 거예요.", "vi": "Cuối tuần tôi sẽ xem phim."},
            {"en": "저녁에 김치를 먹을 거예요.", "vi": "Buổi tối tôi sẽ ăn kim chi."},
            {"en": "내년에 한국에 갈 거예요.", "vi": "Năm sau tôi sẽ đi Hàn Quốc."},
            {"en": "오늘 밤에 공부할 거예요.", "vi": "Tối nay tôi sẽ học bài."},
        ],
        "mistakes": [
            {"wrong": "먹 거예요.", "right": "먹을 거예요.", "why": "먹 kết thúc bằng phụ âm → 을 거예요."},
            {"wrong": "가을 거예요.", "right": "갈 거예요.", "why": "가 kết thúc bằng nguyên âm → ㄹ gắn vào dưới: 갈."},
        ],
        "exercises": [
            {"type": "choice", "prompt": "내일 학교에 (가다 →) ___.", "options": ["갈 거예요", "가을 거예요", "갔어요"], "answer": 0, "explain": "Ngày mai → tương lai; 가 + ㄹ 거예요 → 갈 거예요."},
            {"type": "choice", "prompt": "저녁에 밥을 (먹다 →) ___.", "options": ["먹을 거예요", "먹 거예요", "먹었어요"], "answer": 0, "explain": "먹 có phụ âm cuối → 을 거예요."},
            {"type": "choice", "prompt": "주말에 친구를 (만나다 →) ___.", "options": ["만날 거예요", "만나을 거예요", "만나 거예요"], "answer": 0, "explain": "만나 + ㄹ 거예요 → 만날 거예요."},
            {"type": "choice", "prompt": "내일 한국어를 (공부하다 →) ___.", "options": ["공부할 거예요", "공부하을 거예요", "공부해 거예요"], "answer": 0, "explain": "하다 → 할 거예요."},
            {"type": "choice", "prompt": "이 책을 (읽다 →) ___.", "options": ["읽을 거예요", "읽 거예요", "일 거예요"], "answer": 0, "explain": "읽 có phụ âm cuối → 을 거예요."},
            {"type": "order", "en": "내일 친구를 만날 거예요.", "vi": "Ngày mai tôi sẽ gặp bạn."},
        ],
    },
    {
        "id": "ko-ji-anayo", "emoji": "🚫", "level": "A2",
        "title": ["-지 않아요: phủ định dạng dài", "-지 않아요: the long negative"],
        "summary": ["Một cách nói \"không\" nữa, trang trọng hơn 안 một chút.", "Another way to say \"not\", a little more formal than 안."],
        "explain": [
            "Ngoài 안 + động từ, còn có cách phủ định dài: thân + 지 않아요. 가다 → 가지 않아요, 먹다 → 먹지 않아요.",
            "Hai cách cùng nghĩa; -지 않아요 nghe trang trọng hơn một chút và hay gặp trong văn viết.",
            "Với từ có 하다, cứ thêm vào thân: 공부하지 않아요, 일하지 않아요.",
            "Quá khứ: -지 않았어요 — 어제 가지 않았어요 (hôm qua tôi đã không đi).",
        ],
        "patterns": ["Thân + 지 않아요", "Thân + 지 않았어요 (quá khứ)"],
        "examples": [
            {"en": "저는 술을 마시지 않아요.", "vi": "Tôi không uống rượu."},
            {"en": "오늘은 춥지 않아요.", "vi": "Hôm nay không lạnh."},
            {"en": "이 가방은 비싸지 않아요.", "vi": "Cái túi này không đắt."},
            {"en": "주말에는 일하지 않아요.", "vi": "Cuối tuần tôi không làm việc."},
            {"en": "어제 학교에 가지 않았어요.", "vi": "Hôm qua tôi không đi học."},
        ],
        "mistakes": [
            {"wrong": "가지 안아요.", "right": "가지 않아요.", "why": "Viết 않아요 (phụ âm cuối ㄶ), không phải 안아요."},
            {"wrong": "먹다지 않아요.", "right": "먹지 않아요.", "why": "Bỏ 다 rồi mới thêm 지 않아요."},
        ],
        "exercises": [
            {"type": "choice", "prompt": "저는 고기를 먹___ 않아요.", "options": ["지", "고"], "answer": 0, "explain": "Thân + 지 않아요."},
            {"type": "choice", "prompt": "오늘은 바쁘지 ___.", "options": ["않아요", "안아요"], "answer": 0, "explain": "Chính tả: 않아요."},
            {"type": "choice", "prompt": "이 영화는 재미있___ 않아요.", "options": ["지", "어"], "answer": 0, "explain": "Thân + 지 않아요."},
            {"type": "choice", "prompt": "어제 학교에 가지 ___.", "options": ["않았어요", "않아요"], "answer": 0, "explain": "Việc hôm qua → 않았어요."},
            {"type": "choice", "prompt": "주말에는 (일하다 →) ___.", "options": ["일하지 않아요", "일하 않아요", "일지 않아요"], "answer": 0, "explain": "일하 + 지 않아요."},
            {"type": "order", "en": "저는 술을 마시지 않아요.", "vi": "Tôi không uống rượu."},
        ],
    },
]

PARTICLE_PAIRS = {('이에요', '예요'), ('은', '는'), ('이', '가'), ('을', '를')}


def has_final(syllable: str) -> bool:
    return (ord(syllable) - 0xAC00) % 28 != 0


def main() -> int:
    errors = []
    for u in UNITS:
        if len(u['exercises']) < 5:
            errors.append(f"{u['id']}: fewer than 5 exercises")
        for e in u['exercises']:
            if e['type'] == 'choice':
                if '___' not in e['prompt']:
                    errors.append(f"{u['id']}: no gap in {e['prompt']}")
                if tuple(e['options']) in PARTICLE_PAIRS:
                    noun = re.search(r'([가-힣]+)___', e['prompt']).group(1)
                    if e['answer'] != (0 if has_final(noun[-1]) else 1):
                        errors.append(f"{u['id']}: {e['prompt']} — check 받침 of {noun}")
            elif not 3 <= len(e['en'].split()) <= 10:
                errors.append(f"{u['id']}: order needs 3–10 words: {e['en']}")
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    OUT.write_text(
        json.dumps({'version': '1.0.0', 'units': UNITS}, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    print(f"{len(UNITS)} units, {sum(len(u['exercises']) for u in UNITS)} exercises → {OUT.relative_to(ROOT)}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
