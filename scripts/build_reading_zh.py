#!/usr/bin/env python3
"""Build public/data/reading/zh.json — short Chinese stories (docs/design/chinese.md).

Sentences mark word breaks with "|"; they become invisible zero-width spaces,
so the reading screen can make each word tappable while showing the sentence
unbroken. Words of the Chinese pack get their meaning on tap; names and words
outside the pack simply are not tappable. Each sentence also gets its pinyin
line ("read"), checked syllable by syllable against the pack.

Usage:  python3 scripts/build_zh_pack.py && python3 scripts/build_reading_zh.py
"""
import json
import sys
from pathlib import Path

from zh_pinyin import han_of, pinyin_line, syllables_for, word_mismatch

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / 'public' / 'data' / 'zh.json'
OUT = ROOT / 'public' / 'data' / 'reading' / 'zh.json'
ZWSP = chr(0x200B)

STORIES = [
    {
        'id': 'zh-my-day',
        'emoji': '🌞',
        'level': 'A1',
        'title': ['Một ngày của tôi', '我的一天'],
        'sentences': [
            ('我|叫|安娜，|我|是|学生。', 'Tôi tên là Anna, tôi là học sinh.'),
            ('我|上午|七|点|去|学校。', 'Bảy giờ sáng tôi đến trường.'),
            ('中午|我|和|朋友|吃|米饭。', 'Buổi trưa tôi ăn cơm với bạn.'),
            ('下午|我|在|家|学习|汉语。', 'Buổi chiều tôi học tiếng Trung ở nhà.'),
            ('我|很|喜欢|汉语。', 'Tôi rất thích tiếng Trung.'),
            ('我|十一|点|睡觉。', 'Mười một giờ tôi đi ngủ.'),
        ],
        'questions': [
            {'q': 'Anna là ai?', 'options': ['Giáo viên', 'Học sinh', 'Bác sĩ'], 'answer': 1},
            {'q': 'Buổi trưa Anna ăn gì?', 'options': ['Cơm', 'Táo', 'Bánh mì'], 'answer': 0},
            {
                'q': 'Buổi chiều Anna làm gì?',
                'options': ['Đi mua sắm', 'Học tiếng Trung ở nhà', 'Xem ti vi'],
                'answer': 1,
            },
        ],
    },
    {
        'id': 'zh-shopping',
        'emoji': '🛍️',
        'level': 'A1',
        'title': ['Ở cửa hàng', '在商店'],
        'sentences': [
            ('今天|星期|六。', 'Hôm nay là thứ Bảy.'),
            ('我|和|妈妈|去|商店|买|东西。', 'Tôi và mẹ đi cửa hàng mua đồ.'),
            ('商店|里|人|很|多。', 'Trong cửa hàng rất đông người.'),
            ('妈妈|想|买|衣服。', 'Mẹ muốn mua quần áo.'),
            ('我|想|买|一|个|杯子。', 'Tôi muốn mua một cái cốc.'),
            ('“这个|杯子|多少|钱？”', '“Cái cốc này bao nhiêu tiền?”'),
            ('“二十|块。”', '“Hai mươi tệ.”'),
            ('杯子|很|漂亮，|我|很|高兴。', 'Cái cốc rất đẹp, tôi rất vui.'),
        ],
        'questions': [
            {'q': 'Hôm nay là thứ mấy?', 'options': ['Thứ Hai', 'Thứ Bảy', 'Chủ nhật'], 'answer': 1},
            {'q': 'Mẹ muốn mua gì?', 'options': ['Quần áo', 'Cái cốc', 'Táo'], 'answer': 0},
            {
                'q': 'Cái cốc giá bao nhiêu?',
                'options': ['Mười tệ', 'Hai mươi tệ', 'Ba mươi tệ'],
                'answer': 1,
            },
        ],
    },
    {
        'id': 'zh-rainy-day',
        'emoji': '🌧️',
        'level': 'A1',
        'title': ['Trời mưa rồi', '下雨了'],
        'sentences': [
            ('今天|下雨|了。', 'Hôm nay trời mưa.'),
            ('天气|很|冷。', 'Thời tiết rất lạnh.'),
            ('我|没有|去|学校。', 'Tôi không đến trường.'),
            ('我|在|家|看|电视。', 'Tôi ở nhà xem ti vi.'),
            ('我|的|猫|在|椅子|上|睡觉。', 'Con mèo của tôi đang ngủ trên ghế.'),
            ('中午|妈妈|做|的|菜|很|好吃。', 'Buổi trưa, món mẹ nấu rất ngon.'),
            ('下雨|的|时候，|在|家|也|很|好。', 'Trời mưa thì ở nhà cũng thật dễ chịu.'),
        ],
        'questions': [
            {
                'q': 'Hôm nay thời tiết thế nào?',
                'options': ['Nắng và nóng', 'Mưa và lạnh', 'Đẹp và mát'],
                'answer': 1,
            },
            {
                'q': 'Con mèo đang làm gì?',
                'options': ['Ăn cơm', 'Ngủ trên ghế', 'Xem ti vi'],
                'answer': 1,
            },
            {'q': 'Hôm nay tôi có đến trường không?', 'options': ['Có', 'Không'], 'answer': 1},
        ],
    },
    {
        'id': 'zh-my-family',
        'emoji': '👨‍👩‍👧‍👦',
        'level': 'A1',
        'title': ['Gia đình tôi', '我的家'],
        'sentences': [
            ('我|家|有|五|口|人。', 'Nhà tôi có năm người.'),
            ('爸爸，|妈妈，|哥哥，|妹妹|和|我。', 'Bố, mẹ, anh trai, em gái và tôi.'),
            ('爸爸|是|医生，|他|在|医院|工作。', 'Bố là bác sĩ, bố làm việc ở bệnh viện.'),
            ('妈妈|是|老师。', 'Mẹ là giáo viên.'),
            ('哥哥|很|高，|他|喜欢|踢足球。', 'Anh trai rất cao, anh ấy thích đá bóng.'),
            ('妹妹|今年|六|岁，|她|喜欢|唱歌。', 'Em gái năm nay sáu tuổi, em thích hát.'),
            ('晚上|我们|一起|吃|饭。', 'Buổi tối cả nhà cùng ăn cơm.'),
            ('我|爱|我|的|家。', 'Tôi yêu gia đình tôi.'),
        ],
        'questions': [
            {'q': 'Nhà tôi có mấy người?', 'options': ['Bốn người', 'Năm người', 'Sáu người'], 'answer': 1},
            {'q': 'Bố làm nghề gì?', 'options': ['Giáo viên', 'Bác sĩ', 'Tài xế'], 'answer': 1},
            {'q': 'Em gái thích làm gì?', 'options': ['Hát', 'Bơi', 'Đá bóng'], 'answer': 0},
        ],
    },
    {
        'id': 'zh-sick-day',
        'emoji': '🤒',
        'level': 'A2',
        'title': ['Tôi bị ốm', '我生病了'],
        'sentences': [
            ('今天|早上|我|很|累。', 'Sáng nay tôi rất mệt.'),
            ('我|生病|了，|不|能|去|上班。', 'Tôi bị ốm, không đi làm được.'),
            ('我|给|公司|打电话。', 'Tôi gọi điện cho công ty.'),
            ('妻子|带|我|去|医院。', 'Vợ đưa tôi đến bệnh viện.'),
            ('医生|说：|“你|要|多|休息，|多|喝|水。”', 'Bác sĩ nói: “Anh phải nghỉ ngơi nhiều, uống nhiều nước.”'),
            ('医生|给|我|药。', 'Bác sĩ cho tôi thuốc.'),
            ('下午|我|在|家|睡觉。', 'Buổi chiều tôi ngủ ở nhà.'),
            ('晚上，|我|的|身体|好|多|了。', 'Đến tối, tôi đã khoẻ hơn nhiều.'),
        ],
        'questions': [
            {'q': 'Vì sao hôm nay tôi không đi làm?', 'options': ['Vì trời mưa', 'Vì bị ốm', 'Vì là chủ nhật'], 'answer': 1},
            {'q': 'Ai đưa tôi đến bệnh viện?', 'options': ['Vợ', 'Mẹ', 'Bạn'], 'answer': 0},
            {
                'q': 'Bác sĩ dặn gì?',
                'options': ['Đi làm sớm', 'Nghỉ ngơi và uống nhiều nước', 'Tập thể thao'],
                'answer': 1,
            },
        ],
    },
    {
        'id': 'zh-beijing-trip',
        'emoji': '🧳',
        'level': 'A2',
        'title': ['Du lịch Bắc Kinh', '去北京旅游'],
        'sentences': [
            ('去年|夏天，|我|和|朋友|去|北京|旅游。', 'Mùa hè năm ngoái, tôi và bạn đi du lịch Bắc Kinh.'),
            ('我们|坐|飞机|去，|很|快。', 'Chúng tôi đi máy bay, rất nhanh.'),
            ('我们|坐|出租车|去|饭店。', 'Chúng tôi đi taxi về khách sạn.'),
            ('北京|很|大，|人|也|很|多。', 'Bắc Kinh rất rộng, người cũng rất đông.'),
            ('我们|每天|走|很|多|路。', 'Ngày nào chúng tôi cũng đi bộ rất nhiều.'),
            ('北京|菜|很|好吃，|但是|太|贵|了。', 'Món Bắc Kinh rất ngon nhưng đắt quá.'),
            ('我|买|了|一|件|红色|的|衣服。', 'Tôi đã mua một bộ quần áo màu đỏ.'),
            ('北京|旅游|很|有意思！', 'Du lịch Bắc Kinh rất thú vị!'),
        ],
        'questions': [
            {'q': 'Họ đi Bắc Kinh bằng gì?', 'options': ['Tàu hoả', 'Máy bay', 'Xe buýt'], 'answer': 1},
            {'q': 'Món ăn Bắc Kinh thế nào?', 'options': ['Ngon nhưng đắt', 'Rẻ và ngon', 'Không ngon'], 'answer': 0},
            {
                'q': 'Tôi đã mua gì?',
                'options': ['Một chiếc đồng hồ', 'Một bộ quần áo màu đỏ', 'Một quyển sách'],
                'answer': 1,
            },
        ],
    },
]


# Pinyin of each sentence, one syllable per character (same conventions as the
# pack's examples: 一 / 不 carry their changed tone, neutral tones unmarked).
SENTENCE_PINYIN = {
    '我|叫|安娜，|我|是|学生。': 'wǒ jiào Ān nà wǒ shì xué sheng',
    '我|上午|七|点|去|学校。': 'wǒ shàng wǔ qī diǎn qù xué xiào',
    '中午|我|和|朋友|吃|米饭。': 'zhōng wǔ wǒ hé péng you chī mǐ fàn',
    '下午|我|在|家|学习|汉语。': 'xià wǔ wǒ zài jiā xué xí Hàn yǔ',
    '我|很|喜欢|汉语。': 'wǒ hěn xǐ huan Hàn yǔ',
    '我|十一|点|睡觉。': 'wǒ shí yī diǎn shuì jiào',
    '今天|星期|六。': 'jīn tiān xīng qī liù',
    '我|和|妈妈|去|商店|买|东西。': 'wǒ hé mā ma qù shāng diàn mǎi dōng xi',
    '商店|里|人|很|多。': 'shāng diàn lǐ rén hěn duō',
    '妈妈|想|买|衣服。': 'mā ma xiǎng mǎi yī fu',
    '我|想|买|一|个|杯子。': 'wǒ xiǎng mǎi yí gè bēi zi',
    '“这个|杯子|多少|钱？”': 'zhè ge bēi zi duō shao qián',
    '“二十|块。”': 'èr shí kuài',
    '杯子|很|漂亮，|我|很|高兴。': 'bēi zi hěn piào liang wǒ hěn gāo xìng',
    '今天|下雨|了。': 'jīn tiān xià yǔ le',
    '天气|很|冷。': 'tiān qì hěn lěng',
    '我|没有|去|学校。': 'wǒ méi yǒu qù xué xiào',
    '我|在|家|看|电视。': 'wǒ zài jiā kàn diàn shì',
    '我|的|猫|在|椅子|上|睡觉。': 'wǒ de māo zài yǐ zi shàng shuì jiào',
    '中午|妈妈|做|的|菜|很|好吃。': 'zhōng wǔ mā ma zuò de cài hěn hǎo chī',
    '下雨|的|时候，|在|家|也|很|好。': 'xià yǔ de shí hou zài jiā yě hěn hǎo',
    '我|家|有|五|口|人。': 'wǒ jiā yǒu wǔ kǒu rén',
    '爸爸，|妈妈，|哥哥，|妹妹|和|我。': 'bà ba mā ma gē ge mèi mei hé wǒ',
    '爸爸|是|医生，|他|在|医院|工作。': 'bà ba shì yī shēng tā zài yī yuàn gōng zuò',
    '妈妈|是|老师。': 'mā ma shì lǎo shī',
    '哥哥|很|高，|他|喜欢|踢足球。': 'gē ge hěn gāo tā xǐ huan tī zú qiú',
    '妹妹|今年|六|岁，|她|喜欢|唱歌。': 'mèi mei jīn nián liù suì tā xǐ huan chàng gē',
    '晚上|我们|一起|吃|饭。': 'wǎn shang wǒ men yì qǐ chī fàn',
    '我|爱|我|的|家。': 'wǒ ài wǒ de jiā',
    '今天|早上|我|很|累。': 'jīn tiān zǎo shang wǒ hěn lèi',
    '我|生病|了，|不|能|去|上班。': 'wǒ shēng bìng le bù néng qù shàng bān',
    '我|给|公司|打电话。': 'wǒ gěi gōng sī dǎ diàn huà',
    '妻子|带|我|去|医院。': 'qī zi dài wǒ qù yī yuàn',
    '医生|说：|“你|要|多|休息，|多|喝|水。”': 'yī shēng shuō nǐ yào duō xiū xi duō hē shuǐ',
    '医生|给|我|药。': 'yī shēng gěi wǒ yào',
    '下午|我|在|家|睡觉。': 'xià wǔ wǒ zài jiā shuì jiào',
    '晚上，|我|的|身体|好|多|了。': 'wǎn shang wǒ de shēn tǐ hǎo duō le',
    '去年|夏天，|我|和|朋友|去|北京|旅游。': 'qù nián xià tiān wǒ hé péng you qù Běi jīng lǚ yóu',
    '我们|坐|飞机|去，|很|快。': 'wǒ men zuò fēi jī qù hěn kuài',
    '我们|坐|出租车|去|饭店。': 'wǒ men zuò chū zū chē qù fàn diàn',
    '北京|很|大，|人|也|很|多。': 'Běi jīng hěn dà rén yě hěn duō',
    '我们|每天|走|很|多|路。': 'wǒ men měi tiān zǒu hěn duō lù',
    '北京|菜|很|好吃，|但是|太|贵|了。': 'Běi jīng cài hěn hǎo chī dàn shì tài guì le',
    '我|买|了|一|件|红色|的|衣服。': 'wǒ mǎi le yí jiàn hóng sè de yī fu',
    '北京|旅游|很|有意思！': 'Běi jīng lǚ yóu hěn yǒu yì si',
}


def main() -> int:
    words = json.loads(PACK.read_text(encoding='utf-8'))['words']
    pack_reads = {w['word']: w['viRead'] for w in words}
    stories, errors = [], []
    for s in STORIES:
        sentences = []
        for zh, vi in s['sentences']:
            syllables, error = syllables_for(zh, SENTENCE_PINYIN.get(zh, ''))
            if error:
                errors.append(f'{zh}: {error}')
                continue
            # Every pack word in the sentence must read as the pack reads it.
            for token in zh.split('|'):
                word = ''.join(han_of(token))
                if word in pack_reads:
                    mismatch = word_mismatch(word, zh, syllables, pack_reads[word])
                    if mismatch:
                        errors.append(f'{zh}: {mismatch}')
            sentences.append(
                {'en': zh.replace('|', ZWSP), 'vi': vi, 'read': pinyin_line(zh, syllables, pack_reads)}
            )
        stories.append({**s, 'sentences': sentences})
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    OUT.write_text(
        json.dumps({'version': '1.0.0', 'stories': stories}, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    print(f'{len(stories)} stories → {OUT.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
