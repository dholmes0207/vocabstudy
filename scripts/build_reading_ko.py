#!/usr/bin/env python3
"""Build public/data/reading/ko.json — short Korean stories (docs/design/reading.md).

Korean words change shape (particles: 시장에서; endings: 마셔요), so each
sentence lists its taps by hand as token → headword; this script turns the
headwords into pack ids and refuses a token the sentence does not have or a
headword the pack does not have.

Usage:  python3 scripts/build_reading_ko.py
"""
import json, re, sys
pack = json.load(open('public/data/ko.json'))
ids = {w['word']: w['id'] for w in pack['words']}

S = [
  {
    "id": "ko-minsu-day", "emoji": "🌞", "level": "A1",
    "title": ["Một ngày của Min-su", "민수의 하루"],
    "sentences": [
      ("민수는 아침 일곱 시에 일어나요.", "Min-su dậy lúc bảy giờ sáng.", {"아침": "아침", "일어나요": "일어나다"}),
      ("아침에 빵을 먹고 우유를 마셔요.", "Buổi sáng cậu ăn bánh mì và uống sữa.", {"아침에": "아침", "빵을": "빵", "먹고": "먹다", "우유를": "우유", "마셔요": "마시다"}),
      ("그리고 지하철로 회사에 가요.", "Rồi cậu đi tàu điện ngầm đến công ty.", {"지하철로": "지하철", "회사에": "회사", "가요": "가다"}),
      ("회사에서 열심히 일해요.", "Ở công ty, cậu làm việc chăm chỉ.", {"회사에서": "회사", "일해요": "일하다"}),
      ("오후에 친구를 만나요.", "Buổi chiều cậu gặp bạn.", {"오후에": "오후", "친구를": "친구", "만나요": "만나다"}),
      ("저녁에 집에서 쉬어요.", "Buổi tối cậu nghỉ ngơi ở nhà.", {"저녁에": "저녁", "집에서": "집", "쉬어요": "쉬다"}),
      ("밤에는 한국어를 공부해요.", "Ban đêm cậu học tiếng Hàn.", {"밤에는": "밤", "한국어를": "한국어", "공부해요": "공부하다"}),
    ],
    "questions": [
      {"q": "Min-su dậy lúc mấy giờ?", "options": ["Sáu giờ", "Bảy giờ", "Tám giờ"], "answer": 1},
      {"q": "Min-su đi làm bằng gì?", "options": ["Xe buýt", "Tàu điện ngầm", "Taxi"], "answer": 1},
      {"q": "Buổi tối Min-su làm gì?", "options": ["Nghỉ ngơi ở nhà", "Đi chợ", "Gặp bạn"], "answer": 0},
    ],
  },
  {
    "id": "ko-market", "emoji": "🛒", "level": "A1",
    "title": ["Ở chợ", "시장에서"],
    "sentences": [
      ("오늘은 주말이에요.", "Hôm nay là cuối tuần.", {"오늘은": "오늘", "주말이에요": "주말"}),
      ("엄마와 시장에 가요.", "Tôi đi chợ với mẹ.", {"엄마와": "엄마", "시장에": "시장", "가요": "가다"}),
      ("시장에는 사람이 많아요.", "Chợ rất đông người.", {"시장에는": "시장", "사람이": "사람", "많아요": "많다"}),
      ("과일이 아주 싸요.", "Trái cây rất rẻ.", {"과일이": "과일", "싸요": "싸다"}),
      ("엄마가 사과를 보고 물어요.", "Mẹ nhìn táo rồi hỏi.", {"엄마가": "엄마", "사과를": "사과", "보고": "보다"}),
      ("\"이 사과 얼마예요?\"", "\"Chỗ táo này bao nhiêu tiền?\"", {"사과": "사과", "얼마예요": "얼마"}),
      ("\"만 원이에요.\"", "\"Mười nghìn won.\"", {"원이에요": "원"}),
      ("우리는 사과를 사고 생선도 사요.", "Chúng tôi mua táo và mua cả cá.", {"사과를": "사과", "사고": "사다", "생선도": "생선", "사요": "사다"}),
    ],
    "questions": [
      {"q": "Hôm nay là ngày gì?", "options": ["Thứ Hai", "Cuối tuần", "Sinh nhật"], "answer": 1},
      {"q": "Ở chợ, cái gì rất rẻ?", "options": ["Trái cây", "Thịt", "Quần áo"], "answer": 0},
      {"q": "Táo giá bao nhiêu?", "options": ["Một nghìn won", "Mười nghìn won", "Một trăm nghìn won"], "answer": 1},
    ],
  },
  {
    "id": "ko-rainy-day", "emoji": "🌧️", "level": "A1",
    "title": ["Ngày mưa", "비 오는 날"],
    "sentences": [
      ("오늘은 비가 와요.", "Hôm nay trời mưa.", {"오늘은": "오늘", "비가": "비", "와요": "오다"}),
      ("날씨가 추워요.", "Trời lạnh.", {"날씨가": "날씨", "추워요": "춥다"}),
      ("그래서 집에 있어요.", "Vì thế tôi ở nhà.", {"집에": "집", "있어요": "있다"}),
      ("동생과 영화를 봐요.", "Tôi xem phim với em.", {"동생과": "동생", "영화를": "영화", "봐요": "보다"}),
      ("영화가 정말 재미있어요.", "Bộ phim thật thú vị.", {"영화가": "영화", "재미있어요": "재미있다"}),
      ("저녁에는 라면을 먹어요.", "Buổi tối chúng tôi ăn mì gói.", {"저녁에는": "저녁", "라면을": "라면", "먹어요": "먹다"}),
      ("비 오는 날도 좋아요.", "Ngày mưa cũng thật dễ chịu.", {"비": "비", "오는": "오다", "좋아요": "좋다"}),
    ],
    "questions": [
      {"q": "Hôm nay thời tiết thế nào?", "options": ["Nắng và nóng", "Mưa và lạnh", "Có tuyết"], "answer": 1},
      {"q": "Tôi xem phim với ai?", "options": ["Bạn", "Em", "Bố"], "answer": 1},
      {"q": "Buổi tối ăn gì?", "options": ["Cơm", "Mì gói", "Bánh mì"], "answer": 1},
    ],
  },
  {
    "id": "ko-new-friend", "emoji": "🤝", "level": "A1",
    "title": ["Người bạn mới", "새 친구"],
    "sentences": [
      ("저는 마이예요. 베트남 사람이에요.", "Tôi là Mai. Tôi là người Việt Nam.", {"사람이에요": "사람"}),
      ("지금 서울에 살아요.", "Bây giờ tôi sống ở Seoul.", {"지금": "지금", "살아요": "살다"}),
      ("학교에서 한국어를 배워요.", "Tôi học tiếng Hàn ở trường.", {"학교에서": "학교", "한국어를": "한국어", "배워요": "배우다"}),
      ("어제 학교에서 새 친구를 만났어요.", "Hôm qua tôi gặp một người bạn mới ở trường.", {"어제": "어제", "학교에서": "학교", "친구를": "친구", "만났어요": "만나다"}),
      ("친구 이름은 지수예요.", "Bạn ấy tên là Ji-su.", {"친구": "친구", "이름은": "이름"}),
      ("지수는 정말 친절해요.", "Ji-su rất tử tế.", {"친절해요": "친절하다"}),
      ("우리는 주말에 같이 공원에 가요.", "Cuối tuần chúng tôi cùng đi công viên.", {"주말에": "주말", "공원에": "공원", "가요": "가다"}),
    ],
    "questions": [
      {"q": "Mai đang sống ở đâu?", "options": ["Hà Nội", "Seoul", "Busan"], "answer": 1},
      {"q": "Bạn mới tên là gì?", "options": ["Min-su", "Ji-su", "Hoa"], "answer": 1},
      {"q": "Cuối tuần hai người đi đâu?", "options": ["Công viên", "Chợ", "Biển"], "answer": 0},
    ],
  },
  {
    "id": "ko-cafe", "emoji": "☕", "level": "A1",
    "title": ["Ở quán cà phê", "카페에서"],
    "sentences": [
      ("오늘 친구와 카페에 가요.", "Hôm nay tôi đi quán cà phê với bạn.", {"오늘": "오늘", "친구와": "친구", "가요": "가다"}),
      ("저는 커피를 마시고 친구는 차를 마셔요.", "Tôi uống cà phê, còn bạn tôi uống trà.", {"커피를": "커피", "마시고": "마시다", "친구는": "친구", "차를": "차", "마셔요": "마시다"}),
      ("빵도 하나 사요.", "Chúng tôi mua thêm một cái bánh mì.", {"빵도": "빵", "하나": "하나", "사요": "사다"}),
      ("커피가 조금 비싸요.", "Cà phê hơi đắt.", {"커피가": "커피", "비싸요": "비싸다"}),
      ("하지만 정말 맛있어요.", "Nhưng thật sự rất ngon.", {"맛있어요": "맛있다"}),
      ("우리는 음악을 듣고 이야기해요.", "Chúng tôi nghe nhạc và trò chuyện.", {"음악을": "음악", "듣고": "듣다"}),
      ("정말 행복한 주말이에요.", "Thật là một cuối tuần hạnh phúc.", {"행복한": "행복하다", "주말이에요": "주말"}),
    ],
    "questions": [
      {"q": "Tôi uống gì?", "options": ["Trà", "Cà phê", "Sữa"], "answer": 1},
      {"q": "Họ mua thêm gì?", "options": ["Bánh mì", "Kim chi", "Táo"], "answer": 0},
      {"q": "Cà phê ở quán thế nào?", "options": ["Rẻ và ngon", "Hơi đắt nhưng ngon", "Không ngon"], "answer": 1},
    ],
  },
  {
    "id": "ko-hospital", "emoji": "🏥", "level": "A1",
    "title": ["Đi bệnh viện", "병원에 가요"],
    "sentences": [
      ("아침에 머리가 아파요.", "Buổi sáng tôi bị đau đầu.", {"아침에": "아침", "머리가": "머리", "아파요": "아프다"}),
      ("그래서 회사에 안 가요.", "Vì vậy tôi không đi làm.", {"회사에": "회사", "가요": "가다"}),
      ("택시를 타고 병원에 가요.", "Tôi đi taxi đến bệnh viện.", {"택시를": "택시", "타고": "타다", "병원에": "병원", "가요": "가다"}),
      ("의사가 정말 친절해요.", "Bác sĩ rất tử tế.", {"의사가": "의사", "친절해요": "친절하다"}),
      ("약을 받고 집에 와요.", "Tôi nhận thuốc rồi về nhà.", {"받고": "받다", "집에": "집", "와요": "오다"}),
      ("물을 많이 마시고 쉬어요.", "Tôi uống nhiều nước và nghỉ ngơi.", {"물을": "물", "많이": "많다", "마시고": "마시다", "쉬어요": "쉬다"}),
      ("저녁에는 조금 괜찮아요.", "Đến tối tôi thấy đỡ hơn một chút.", {"저녁에는": "저녁", "괜찮아요": "괜찮아요"}),
    ],
    "questions": [
      {"q": "Buổi sáng tôi bị làm sao?", "options": ["Đau bụng", "Đau đầu", "Đau chân"], "answer": 1},
      {"q": "Tôi đến bệnh viện bằng gì?", "options": ["Xe buýt", "Taxi", "Tàu điện ngầm"], "answer": 1},
      {"q": "Về nhà tôi làm gì?", "options": ["Uống nhiều nước và nghỉ ngơi", "Đi làm", "Nấu ăn"], "answer": 0},
    ],
  },
  # --- A2 (17/10/2026): past tense, -고 싶어요, -(으)ㄹ 거예요 ---------------
  {
    "id": "ko-last-weekend", "emoji": "📸", "level": "A2",
    "title": ["Cuối tuần trước", "지난 주말"],
    "sentences": [
      ("지난 주말에 친구와 바다에 갔어요.", "Cuối tuần trước tôi đã đi biển với bạn.", {"주말에": "주말", "친구와": "친구", "바다에": "바다", "갔어요": "가다"}),
      ("날씨가 정말 좋았어요.", "Thời tiết thật đẹp.", {"날씨가": "날씨", "좋았어요": "좋다"}),
      ("우리는 바다에서 사진을 많이 찍었어요.", "Chúng tôi đã chụp rất nhiều ảnh ở biển.", {"바다에서": "바다", "사진을": "사진", "많이": "많다"}),
      ("점심에 식당에서 생선을 먹었어요.", "Buổi trưa chúng tôi ăn cá ở nhà hàng.", {"식당에서": "식당", "생선을": "생선", "먹었어요": "먹다"}),
      ("생선이 아주 맛있었어요.", "Món cá rất ngon.", {"생선이": "생선", "맛있었어요": "맛있다"}),
      ("저녁에 버스를 타고 집에 왔어요.", "Buổi tối chúng tôi đi xe buýt về nhà.", {"저녁에": "저녁", "버스를": "버스", "타고": "타다", "집에": "집", "왔어요": "오다"}),
      ("조금 피곤했지만 정말 행복했어요.", "Hơi mệt nhưng thật sự rất vui.", {"피곤했지만": "피곤하다", "행복했어요": "행복하다"}),
    ],
    "questions": [
      {"q": "Cuối tuần trước họ đã đi đâu?", "options": ["Núi", "Biển", "Công viên"], "answer": 1},
      {"q": "Buổi trưa họ ăn gì?", "options": ["Thịt", "Cá", "Mì gói"], "answer": 1},
      {"q": "Họ về nhà bằng gì?", "options": ["Taxi", "Xe buýt", "Tàu điện ngầm"], "answer": 1},
    ],
  },
  {
    "id": "ko-trip-plan", "emoji": "✈️", "level": "A2",
    "title": ["Kế hoạch đi Hàn Quốc", "한국 여행 계획"],
    "sentences": [
      ("저는 한국에 가고 싶어요.", "Tôi muốn đi Hàn Quốc.", {"가고": "가다"}),
      ("그래서 요즘 한국어를 열심히 배워요.", "Vì vậy dạo này tôi chăm chỉ học tiếng Hàn.", {"한국어를": "한국어", "배워요": "배우다"}),
      ("내년 여름에 비행기를 타고 서울에 갈 거예요.", "Mùa hè năm sau tôi sẽ đi máy bay đến Seoul.", {"여름에": "여름", "비행기를": "비행기", "타고": "타다", "갈": "가다"}),
      ("서울에서는 호텔에서 잘 거예요.", "Ở Seoul tôi sẽ ngủ ở khách sạn.", {"호텔에서": "호텔", "잘": "자다"}),
      ("시장에서 김치를 사고 싶어요.", "Tôi muốn mua kim chi ở chợ.", {"시장에서": "시장", "김치를": "김치", "사고": "사다"}),
      ("그리고 한국 친구도 만날 거예요.", "Tôi cũng sẽ gặp người bạn Hàn Quốc.", {"친구도": "친구", "만날": "만나다"}),
      ("저는 지금 정말 행복해요.", "Bây giờ tôi thật sự rất vui.", {"지금": "지금", "행복해요": "행복하다"}),
    ],
    "questions": [
      {"q": "Tôi muốn đi đâu?", "options": ["Nhật Bản", "Hàn Quốc", "Trung Quốc"], "answer": 1},
      {"q": "Khi nào tôi sẽ đi?", "options": ["Mùa đông năm nay", "Mùa hè năm sau", "Tuần sau"], "answer": 1},
      {"q": "Ở Seoul tôi sẽ ngủ ở đâu?", "options": ["Nhà bạn", "Khách sạn", "Ký túc xá"], "answer": 1},
    ],
  },
]

def bare(tok):
    return re.sub(r'^[^\w]+|[^\w]+$', '', tok)

# Words that never change shape (or always carry the same particle), tapped in
# every story without listing them sentence by sentence.
COMMON = {
    '저는': '저', '정말': '정말', '아주': '아주', '조금': '조금', '같이': '같이',
    '그리고': '그리고', '그래서': '그래서', '요즘': '요즘', '열심히': '열심히', '내년': '내년',
}

out = []
errs = []
for st in S:
    sents = []
    for ko, vi, gl in st['sentences']:
        toks = [bare(t) for t in ko.split()]
        gl = {**{t: COMMON[t] for t in toks if t in COMMON}, **gl}
        g = {}
        for tok, head in gl.items():
            if tok not in toks: errs.append(f"{st['id']}: token {tok} not in {ko}")
            if head not in ids: errs.append(f"{st['id']}: headword {head} not in pack")
            else: g[tok] = ids[head]
        sents.append({"en": ko, "vi": vi, "gloss": g})
    out.append({**{k: st[k] for k in ('id', 'emoji', 'level', 'title')}, "sentences": sents, "questions": st['questions']})
    n = sum(len(s['en'].split()) for s in sents)
    k = sum(len(s['gloss']) for s in sents)
    print(st['id'], f"{k}/{n} = {k/n:.0%}")
if errs:
    print('\n'.join(errs)); sys.exit(1)
json.dump({"version": "1.0.0", "stories": out}, open('public/data/reading/ko.json', 'w'), ensure_ascii=False, indent=2)
print('written')
