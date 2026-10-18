#!/usr/bin/env python3
"""Build public/data/grammar/zh.json — beginner Chinese grammar (docs/design/chinese.md).

Same shape as grammar/en.json and ko.json. Word-order exercises mark word
breaks with "|", turned into invisible zero-width spaces so the tiles are
real words; gap prompts are plain Chinese. Every example carries its pinyin
line ("read"), checked against the pack like the pack's own examples.

Usage:  python3 scripts/build_zh_pack.py && python3 scripts/build_grammar_zh.py
"""
import json
import sys
from pathlib import Path

from zh_pinyin import han_of, pinyin_line, syllables_for, word_mismatch

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / 'public' / 'data' / 'zh.json'
OUT = ROOT / 'public' / 'data' / 'grammar' / 'zh.json'
ZWSP = chr(0x200B)
PACK_READS = {w['word']: w['viRead'] for w in json.loads(PACK.read_text(encoding='utf-8'))['words']}
ERRORS: list[str] = []

# Each example: its word breaks, and one pinyin syllable per character (一 / 不
# carry their changed tone, neutral tones unmarked, erhua 儿 written "r").
EXAMPLE_PINYIN = {
    '我是学生。': ('我|是|学生。', 'wǒ shì xué sheng'),
    '他是我的老师。': ('他|是|我|的|老师。', 'tā shì wǒ de lǎo shī'),
    '她不是医生。': ('她|不|是|医生。', 'tā bú shì yī shēng'),
    '你是中国人吗？': ('你|是|中国|人|吗？', 'nǐ shì Zhōng guó rén ma'),
    '这是我的书。': ('这|是|我|的|书。', 'zhè shì wǒ de shū'),
    '我不喝咖啡。': ('我|不|喝|咖啡。', 'wǒ bù hē kā fēi'),
    '今天不冷。': ('今天|不|冷。', 'jīn tiān bù lěng'),
    '昨天我没去学校。': ('昨天|我|没|去|学校。', 'zuó tiān wǒ méi qù xué xiào'),
    '我没有时间。': ('我|没有|时间。', 'wǒ méi yǒu shí jiān'),
    '他不是医生。': ('他|不|是|医生。', 'tā bú shì yī shēng'),
    '你好吗？': ('你|好|吗？', 'nǐ hǎo ma'),
    '你叫什么名字？': ('你|叫|什么|名字？', 'nǐ jiào shén me míng zi'),
    '他是谁？': ('他|是|谁？', 'tā shì shéi'),
    '你去哪儿？': ('你|去|哪儿？', 'nǐ qù nǎ r'),
    '我很好，你呢？': ('我|很|好，|你|呢？', 'wǒ hěn hǎo nǐ ne'),
    '妈妈的衣服很漂亮。': ('妈妈|的|衣服|很|漂亮。', 'mā ma de yī fu hěn piào liang'),
    '我妈妈是医生。': ('我|妈妈|是|医生。', 'wǒ mā ma shì yī shēng'),
    '他是我很好的朋友。': ('他|是|我|很|好|的|朋友。', 'tā shì wǒ hěn hǎo de péng you'),
    '我有一个儿子。': ('我|有|一|个|儿子。', 'wǒ yǒu yí gè ér zi'),
    '桌子上有三本书。': ('桌子|上|有|三|本|书。', 'zhuō zi shàng yǒu sān běn shū'),
    '我想喝一杯茶。': ('我|想|喝|一|杯|茶。', 'wǒ xiǎng hē yì bēi chá'),
    '我家有一只猫。': ('我|家|有|一|只|猫。', 'wǒ jiā yǒu yì zhī māo'),
    '这个苹果很大。': ('这个|苹果|很|大。', 'zhè ge píng guǒ hěn dà'),
    '爸爸在家。': ('爸爸|在|家。', 'bà ba zài jiā'),
    '我在医院工作。': ('我|在|医院|工作。', 'wǒ zài yī yuàn gōng zuò'),
    '你住在哪儿？': ('你|住|在|哪儿？', 'nǐ zhù zài nǎ r'),
    '他在看电视。': ('他|在|看|电视。', 'tā zài kàn diàn shì'),
    '我在学校学习汉语。': ('我|在|学校|学习|汉语。', 'wǒ zài xué xiào xué xí Hàn yǔ'),
    '天气很好。': ('天气|很|好。', 'tiān qì hěn hǎo'),
    '她很漂亮。': ('她|很|漂亮。', 'tā hěn piào liang'),
    '太贵了！': ('太|贵|了！', 'tài guì le'),
    '我明天去北京。': ('我|明天|去|北京。', 'wǒ míng tiān qù Běi jīng'),
    '他晚上在家看电视。': ('他|晚上|在|家|看|电视。', 'tā wǎn shang zài jiā kàn diàn shì'),
    '昨天我在商店买了一件衣服。': ('昨天|我|在|商店|买|了|一|件|衣服。', 'zuó tiān wǒ zài shāng diàn mǎi le yí jiàn yī fu'),
    '我们中午在饭店吃饭。': ('我们|中午|在|饭店|吃|饭。', 'wǒ men zhōng wǔ zài fàn diàn chī fàn'),
    '我买了一本书。': ('我|买|了|一|本|书。', 'wǒ mǎi le yì běn shū'),
    '他已经回家了。': ('他|已经|回|家|了。', 'tā yǐ jīng huí jiā le'),
    '下雨了。': ('下雨|了。', 'xià yǔ le'),
    '你吃饭了吗？': ('你|吃|饭|了|吗？', 'nǐ chī fàn le ma'),
    '我会说汉语。': ('我|会|说|汉语。', 'wǒ huì shuō Hàn yǔ'),
    '他不会游泳。': ('他|不|会|游泳。', 'tā bú huì yóu yǒng'),
    '我生病了，不能去。': ('我|生病|了，|不|能|去。', 'wǒ shēng bìng le bù néng qù'),
    '你明天能来吗？': ('你|明天|能|来|吗？', 'nǐ míng tiān néng lái ma'),
    '我可以坐这儿吗？': ('我|可以|坐|这儿|吗？', 'wǒ kě yǐ zuò zhè r ma'),
    '因为下雨，所以我不去了。': ('因为|下雨，|所以|我|不|去|了。', 'yīn wèi xià yǔ suǒ yǐ wǒ bú qù le'),
    '我很累，所以想休息。': ('我|很|累，|所以|想|休息。', 'wǒ hěn lèi suǒ yǐ xiǎng xiū xi'),
    '因为今天是我的生日，我很高兴。': ('因为|今天|是|我|的|生日，|我|很|高兴。', 'yīn wèi jīn tiān shì wǒ de shēng rì wǒ hěn gāo xìng'),
    '汉语很难，但是很有意思。': ('汉语|很|难，|但是|很|有意思。', 'Hàn yǔ hěn nán dàn shì hěn yǒu yì si'),
    '这件衣服很漂亮，但是太贵了。': ('这|件|衣服|很|漂亮，|但是|太|贵|了。', 'zhè jiàn yī fu hěn piào liang dàn shì tài guì le'),
    '他走得很快。': ('他|走|得|很|快。', 'tā zǒu de hěn kuài'),
    '你说得很好。': ('你|说|得|很|好。', 'nǐ shuō de hěn hǎo'),
    '她唱歌唱得很好。': ('她|唱歌|唱|得|很|好。', 'tā chàng gē chàng de hěn hǎo'),
    '我今天起得很早。': ('我|今天|起|得|很|早。', 'wǒ jīn tiān qǐ de hěn zǎo'),
    '他汉语说得不太好。': ('他|汉语|说|得|不|太|好。', 'tā Hàn yǔ shuō de bú tài hǎo'),
    '哥哥比我高。': ('哥哥|比|我|高。', 'gē ge bǐ wǒ gāo'),
    '今天比昨天冷。': ('今天|比|昨天|冷。', 'jīn tiān bǐ zuó tiān lěng'),
    '这件衣服比那件贵一点儿。': ('这|件|衣服|比|那|件|贵|一点儿。', 'zhè jiàn yī fu bǐ nà jiàn guì yì diǎn r'),
    '坐飞机比坐火车快多了。': ('坐|飞机|比|坐|火车|快|多|了。', 'zuò fēi jī bǐ zuò huǒ chē kuài duō le'),
    '我没有哥哥高。': ('我|没有|哥哥|高。', 'wǒ méi yǒu gē ge gāo'),
    '我去过北京。': ('我|去|过|北京。', 'wǒ qù guo Běi jīng'),
    '你吃过羊肉吗？': ('你|吃|过|羊肉|吗？', 'nǐ chī guo yáng ròu ma'),
    '我没去过中国。': ('我|没|去|过|中国。', 'wǒ méi qù guo Zhōng guó'),
    '他学过两年汉语。': ('他|学|过|两|年|汉语。', 'tā xué guo liǎng nián Hàn yǔ'),
    '这个电影我看过两次。': ('这个|电影|我|看|过|两|次。', 'zhè ge diàn yǐng wǒ kàn guo liǎng cì'),
    '要下雨了。': ('要|下雨|了。', 'yào xià yǔ le'),
    '火车快到了。': ('火车|快|到|了。', 'huǒ chē kuài dào le'),
    '我们快要考试了。': ('我们|快|要|考试|了。', 'wǒ men kuài yào kǎo shì le'),
    '明天就要放假了。': ('明天|就|要|放假|了。', 'míng tiān jiù yào fàng jià le'),
    '电影快开始了。': ('电影|快|开始|了。', 'diàn yǐng kuài kāi shǐ le'),
}


def ex(zh, vi):
    entry = {'en': zh, 'vi': vi}
    if zh not in EXAMPLE_PINYIN:
        ERRORS.append(f'{zh}: no pinyin')
        return entry
    seg, pinyin = EXAMPLE_PINYIN[zh]
    if seg.replace('|', '') != zh:
        ERRORS.append(f'{zh}: word breaks spell "{seg}"')
    syllables, error = syllables_for(seg, pinyin)
    if error:
        ERRORS.append(f'{zh}: {error}')
        return entry
    for token in seg.split('|'):
        word = ''.join(han_of(token))
        if word in PACK_READS:
            mismatch = word_mismatch(word, seg, syllables, PACK_READS[word])
            if mismatch:
                ERRORS.append(f'{zh}: {mismatch}')
    entry['read'] = pinyin_line(seg, syllables, PACK_READS)
    return entry


def mi(wrong, right, why):
    return {'wrong': wrong, 'right': right, 'why': why}


def ch(prompt, options, answer, explain):
    return {'type': 'choice', 'prompt': prompt, 'options': options, 'answer': answer, 'explain': explain}


def od(zh, vi):
    return {'type': 'order', 'en': zh.replace('|', ZWSP), 'vi': vi}


UNITS = [
    {
        'id': 'zh-shi', 'emoji': '🙋', 'level': 'A1',
        'title': ['是: "là"', '是: "to be"'],
        'summary': ['Nói ai là ai, cái gì là cái gì.', 'Say who someone is or what something is.'],
        'explain': [
            '是 nghĩa là "là", nối hai danh từ: 我是学生 = tôi là học sinh.',
            'Phủ định là 不是 (không phải là): 他不是老师.',
            'Câu hỏi có / không thì thêm 吗 ở cuối: 你是中国人吗？',
            'Không đặt 是 trước tính từ: nói 我很好, không nói 我是好 (xem bài 很).',
        ],
        'patterns': ['A 是 B', 'A 不是 B', 'A 是 B 吗？'],
        'examples': [ex('我是学生。', 'Tôi là học sinh.'), ex('他是我的老师。', 'Anh ấy là thầy giáo của tôi.'),
                     ex('她不是医生。', 'Cô ấy không phải là bác sĩ.'), ex('你是中国人吗？', 'Bạn là người Trung Quốc à?'),
                     ex('这是我的书。', 'Đây là sách của tôi.')],
        'mistakes': [mi('我是很好。', '我很好。', 'Trước tính từ dùng 很, không dùng 是.'),
                     mi('他不老师。', '他不是老师。', 'Phủ định của 是 là 不是.')],
        'exercises': [
            ch('我___学生。', ['是', '很'], 0, 'Nối hai danh từ dùng 是.'),
            ch('她___医生，她是老师。', ['不是', '没有'], 0, 'Phủ định của 是 là 不是.'),
            ch('你是中国人___？', ['吗', '呢'], 0, 'Câu hỏi có / không thêm 吗.'),
            ch('这___我的书。', ['是', '在'], 0, 'Đây là sách của tôi → 是.'),
            ch('他___我的朋友。', ['是', '很'], 0, 'Anh ấy là bạn tôi → 是.'),
            od('我|是|越南|人。', 'Tôi là người Việt Nam.'),
            od('他|不|是|我|的|老师。', 'Anh ấy không phải là thầy giáo của tôi.'),
        ],
    },
    {
        'id': 'zh-bu-mei', 'emoji': '🙅', 'level': 'A1',
        'title': ['不 và 没: hai cách nói "không"', '不 and 没: two kinds of "not"'],
        'summary': ['不 cho thói quen, ý muốn, hiện tại; 没 cho việc đã qua và "không có".',
                    '不 for habits, wishes and now; 没 for the past and for "have not".'],
        'explain': [
            '不 phủ định thói quen, ý muốn, hiện tại và tương lai: 我不喝茶 (tôi không uống trà), 明天我不去.',
            '没 (没有) phủ định việc đã xảy ra: 昨天我没去 (hôm qua tôi đã không đi).',
            '"Không có" luôn là 没有, không bao giờ là 不有: 我没有钱.',
            '是 chỉ đi với 不: 不是, không nói 没是.',
        ],
        'patterns': ['不 + động từ / tính từ: 不喝, 不冷', '没 + động từ (đã không): 没去', '没有 + danh từ: 没有钱'],
        'examples': [ex('我不喝咖啡。', 'Tôi không uống cà phê.'), ex('今天不冷。', 'Hôm nay không lạnh.'),
                     ex('昨天我没去学校。', 'Hôm qua tôi không đến trường.'), ex('我没有时间。', 'Tôi không có thời gian.'),
                     ex('他不是医生。', 'Anh ấy không phải là bác sĩ.')],
        'mistakes': [mi('我不有钱。', '我没有钱。', '"Không có" là 没有, không dùng 不有.'),
                     mi('昨天我不去学校。', '昨天我没去学校。', 'Việc đã qua (hôm qua) phủ định bằng 没.')],
        'exercises': [
            ch('我___有钱。', ['不', '没'], 1, '有 chỉ phủ định bằng 没 → 没有.'),
            ch('我___喝茶，我喜欢喝咖啡。', ['不', '没'], 0, 'Thói quen, sở thích → 不.'),
            ch('昨天他___来。', ['不', '没'], 1, 'Việc đã qua → 没.'),
            ch('今天___冷。', ['不', '没'], 0, 'Tính từ phủ định bằng 不.'),
            ch('他___是老师。', ['不', '没'], 0, '是 đi với 不.'),
            od('我|没有|时间。', 'Tôi không có thời gian.'),
        ],
    },
    {
        'id': 'zh-questions', 'emoji': '❓', 'level': 'A1',
        'title': ['Câu hỏi: 吗 và từ để hỏi', 'Questions: 吗 and question words'],
        'summary': ['Hỏi có / không bằng 吗; hỏi thông tin bằng 什么, 谁, 哪儿, 几…',
                    'Yes / no questions with 吗; information questions with 什么, 谁, 哪儿, 几…'],
        'explain': [
            'Câu hỏi có / không: thêm 吗 vào cuối câu kể: 你是学生 → 你是学生吗？',
            'Câu có từ để hỏi (什么, 谁, 哪儿, 几, 多少) thì giữ trật tự câu kể và KHÔNG thêm 吗: 你叫什么名字？',
            'Từ để hỏi đứng đúng chỗ của thông tin cần hỏi: 他是谁？ (anh ấy là ai?), 你去哪儿？ (bạn đi đâu?)',
            '呢 dùng để hỏi lại "còn … thì sao?": 我很好，你呢？',
        ],
        'patterns': ['Câu kể + 吗？', 'Từ để hỏi ở chỗ cần hỏi, không có 吗', '…，你呢？'],
        'examples': [ex('你好吗？', 'Bạn khỏe không?'), ex('你叫什么名字？', 'Bạn tên là gì?'), ex('他是谁？', 'Anh ấy là ai?'),
                     ex('你去哪儿？', 'Bạn đi đâu?'), ex('我很好，你呢？', 'Tôi khỏe, còn bạn?')],
        'mistakes': [mi('你叫什么名字吗？', '你叫什么名字？', 'Câu đã có 什么 thì không thêm 吗.'),
                     mi('什么你叫名字？', '你叫什么名字？', 'Từ để hỏi đứng ở chỗ của thông tin cần hỏi, không đưa lên đầu câu.')],
        'exercises': [
            ch('你是老师___？', ['吗', '什么'], 0, 'Câu hỏi có / không → 吗.'),
            ch('你想吃___？', ['什么', '吗'], 0, 'Hỏi "ăn gì" → 什么, không thêm 吗.'),
            ch('他是___？', ['谁', '哪儿'], 0, 'Hỏi người → 谁.'),
            ch('医院在___？', ['哪儿', '几'], 0, 'Hỏi nơi chốn → 哪儿.'),
            ch('你家有___口人？', ['几', '什么'], 0, 'Hỏi số lượng nhỏ → 几.'),
            ch('我很好，你___？', ['呢', '吗'], 0, 'Hỏi lại "còn bạn?" → 呢.'),
            od('你|叫|什么|名字？', 'Bạn tên là gì?'),
        ],
    },
    {
        'id': 'zh-de', 'emoji': '🔗', 'level': 'A1',
        'title': ['的: "của"', '的: possession'],
        'summary': ['Người sở hữu + 的 + vật: 我的书 = sách của tôi.', 'Owner + 的 + thing: 我的书 = my book.'],
        'explain': [
            '的 nối người sở hữu với vật: 我的书 = sách của tôi. Trật tự ngược với tiếng Việt: người sở hữu đứng TRƯỚC.',
            'Với người thân và nơi thân thuộc thường bỏ 的: 我妈妈, 我家.',
            '的 cũng nối cụm tính từ với danh từ: 很好的朋友 (người bạn rất tốt).',
        ],
        'patterns': ['Người + 的 + vật: 我的书', '我 + người thân: 我妈妈'],
        'examples': [ex('这是我的书。', 'Đây là sách của tôi.'), ex('他是我的老师。', 'Anh ấy là thầy giáo của tôi.'),
                     ex('妈妈的衣服很漂亮。', 'Quần áo của mẹ rất đẹp.'), ex('我妈妈是医生。', 'Mẹ tôi là bác sĩ.'),
                     ex('他是我很好的朋友。', 'Anh ấy là người bạn rất tốt của tôi.')],
        'mistakes': [mi('书的我', '我的书', 'Người sở hữu đứng trước 的, vật đứng sau.'),
                     mi('这是书我。', '这是我的书。', 'Không đặt người sở hữu sau vật như tiếng Việt.')],
        'exercises': [
            ch('这是我___书。', ['的', '是'], 0, 'Sở hữu → 的.'),
            ch('他是我___朋友。', ['的', '了'], 0, 'Bạn của tôi → 我的朋友.'),
            ch('老师___名字是什么？', ['的', '吗'], 0, 'Tên của thầy → 老师的名字.'),
            ch('妈妈___衣服很漂亮。', ['的', '很'], 0, 'Quần áo của mẹ → 妈妈的衣服.'),
            ch('这是谁___书？', ['的', '吗'], 0, 'Sách của ai → 谁的书.'),
            od('这|是|我|的|书。', 'Đây là sách của tôi.'),
        ],
    },
    {
        'id': 'zh-measure', 'emoji': '🧮', 'level': 'A1',
        'title': ['Lượng từ: 个, 本, 杯, 只', 'Measure words: 个, 本, 杯, 只'],
        'summary': ['Số + lượng từ + danh từ: 三本书 = ba quyển sách.', 'Number + measure word + noun: 三本书 = three books.'],
        'explain': [
            'Giữa số đếm (hoặc 这 / 那) và danh từ phải có lượng từ: 一个人, 三本书 — giống "một CON mèo, ba QUYỂN sách" trong tiếng Việt.',
            '个 là lượng từ chung, dùng cho người và nhiều đồ vật: 一个苹果.',
            '本 cho sách vở (三本书), 杯 cho đồ uống (一杯茶), 只 cho nhiều con vật (一只猫).',
            'Đứng trước lượng từ, số hai là 两 chứ không phải 二: 两个人.',
        ],
        'patterns': ['Số + lượng từ + danh từ', '这 / 那 + lượng từ + danh từ: 这个苹果'],
        'examples': [ex('我有一个儿子。', 'Tôi có một đứa con trai.'), ex('桌子上有三本书。', 'Trên bàn có ba quyển sách.'),
                     ex('我想喝一杯茶。', 'Tôi muốn uống một cốc trà.'), ex('我家有一只猫。', 'Nhà tôi có một con mèo.'),
                     ex('这个苹果很大。', 'Quả táo này rất to.')],
        'mistakes': [mi('我有三书。', '我有三本书。', 'Thiếu lượng từ: số + lượng từ + danh từ.'),
                     mi('二个人', '两个人', 'Trước lượng từ, số hai là 两.')],
        'exercises': [
            ch('我有三___书。', ['本', '杯'], 0, 'Sách dùng 本.'),
            ch('我想喝一___咖啡。', ['杯', '本'], 0, 'Đồ uống dùng 杯.'),
            ch('他有一___儿子。', ['个', '本'], 0, 'Người dùng 个.'),
            ch('我家有一___猫。', ['只', '本'], 0, 'Nhiều con vật dùng 只.'),
            ch('这___苹果很好吃。', ['个', '杯'], 0, 'Quả táo dùng 个.'),
            od('我|有|两|个|朋友。', 'Tôi có hai người bạn.'),
        ],
    },
    {
        'id': 'zh-zai', 'emoji': '📍', 'level': 'A1',
        'title': ['在: ở đâu, đang làm gì', '在: where, and doing now'],
        'summary': ['在 + nơi chốn = "ở"; nơi chốn đứng trước động từ; 在 + động từ = "đang".',
                    '在 + place = "at"; the place comes before the verb; 在 + verb = "-ing".'],
        'explain': [
            '在 + nơi chốn = "ở …": 我在家 (tôi ở nhà).',
            'Làm việc gì ở đâu thì nơi chốn đứng TRƯỚC động từ: 我在学校学习 = tôi học ở trường (tiếng Việt nói "học ở trường").',
            '在 + động từ còn có nghĩa "đang": 我在看书 (tôi đang đọc sách).',
        ],
        'patterns': ['Ai + 在 + nơi chốn', 'Ai + 在 + nơi chốn + làm gì', 'Ai + 在 + động từ (đang)'],
        'examples': [ex('爸爸在家。', 'Bố đang ở nhà.'), ex('我在医院工作。', 'Tôi làm việc ở bệnh viện.'),
                     ex('你住在哪儿？', 'Bạn sống ở đâu?'), ex('他在看电视。', 'Anh ấy đang xem ti vi.'),
                     ex('我在学校学习汉语。', 'Tôi học tiếng Trung ở trường.')],
        'mistakes': [mi('我学习在学校。', '我在学校学习。', 'Nơi chốn với 在 đứng trước động từ.'),
                     mi('我是在家。', '我在家。', '"Ở" là 在, không cần thêm 是.')],
        'exercises': [
            ch('我___家。', ['在', '是'], 0, 'Ở nhà → 在家.'),
            ch('他___医院工作。', ['在', '是'], 0, 'Làm việc ở bệnh viện → 在医院工作.'),
            ch('你___做什么？', ['在', '是'], 0, 'Đang làm gì → 在 + động từ.'),
            ch('书___桌子上。', ['在', '有'], 0, 'Sách ở trên bàn → 在.'),
            ch('她___北京住了三年。', ['在', '是'], 0, 'Sống ở Bắc Kinh → 在北京.'),
            od('我|在|学校|学习|汉语。', 'Tôi học tiếng Trung ở trường.'),
        ],
    },
    {
        'id': 'zh-hen', 'emoji': '✨', 'level': 'A1',
        'title': ['很 + tính từ: câu miêu tả', '很 + adjective: describing'],
        'summary': ['Chủ ngữ + 很 + tính từ, không dùng 是: 天气很好.', 'Subject + 很 + adjective, no 是: 天气很好.'],
        'explain': [
            'Câu miêu tả: chủ ngữ + 很 + tính từ: 天气很好. Không đặt 是 trước tính từ.',
            '很 nghĩa gốc là "rất", nhưng trong câu miêu tả nó gần như bắt buộc và nghĩa nhẹ đi: 我很好 = tôi khỏe.',
            'Phủ định thì bỏ 很 và dùng 不: 今天不冷. Muốn nói "quá" thì dùng 太 … 了: 太贵了！',
        ],
        'patterns': ['Chủ ngữ + 很 + tính từ', 'Chủ ngữ + 不 + tính từ', '太 + tính từ + 了！'],
        'examples': [ex('天气很好。', 'Thời tiết rất đẹp.'), ex('这个苹果很大。', 'Quả táo này rất to.'),
                     ex('今天不冷。', 'Hôm nay không lạnh.'), ex('她很漂亮。', 'Cô ấy rất xinh.'), ex('太贵了！', 'Đắt quá!')],
        'mistakes': [mi('他是很高兴。', '他很高兴。', 'Trước tính từ không dùng 是.'),
                     mi('太贵！', '太贵了！', '太 thường đi với 了 ở cuối: 太 … 了.')],
        'exercises': [
            ch('她___漂亮。', ['很', '是'], 0, 'Tính từ đi với 很, không dùng 是.'),
            ch('今天___冷，很热。', ['不', '没'], 0, 'Phủ định tính từ → 不.'),
            ch('这个菜___好吃了！', ['太', '是'], 0, 'Khen "ngon quá" → 太 … 了.'),
            ch('我___高兴认识你。', ['很', '是'], 0, '很高兴: rất vui.'),
            ch('北京的冬天___冷。', ['很', '是'], 0, 'Tính từ đi với 很.'),
            od('今天|天气|很|好。', 'Hôm nay thời tiết rất đẹp.'),
        ],
    },
    {
        'id': 'zh-word-order', 'emoji': '🧭', 'level': 'A1',
        'title': ['Trật tự câu: thời gian, nơi chốn trước động từ', 'Word order: time and place before the verb'],
        'summary': ['Ai + khi nào + ở đâu + làm gì: 我明天在家学习.', 'Who + when + where + does what: 我明天在家学习.'],
        'explain': [
            'Tiếng Việt hay để thời gian và nơi chốn ở cuối câu: "Tôi học tiếng Trung ở trường vào buổi tối". Tiếng Trung đặt chúng TRƯỚC động từ: 我晚上在学校学习汉语.',
            'Thứ tự quen dùng: chủ ngữ + thời gian + 在 + nơi chốn + động từ + tân ngữ. Thời gian cũng có thể đứng đầu câu: 明天我去北京.',
            'Nơi làm việc gì đó (在 + nơi chốn) đứng trước động từ: nói 我在医院工作, không nói 我工作在医院. Chỉ vài động từ như 住, 坐 mới đi với 在 phía sau: 住在北京.',
        ],
        'patterns': ['Chủ ngữ + thời gian + động từ', 'Thời gian + chủ ngữ + động từ', 'Chủ ngữ + 在 + nơi chốn + động từ'],
        'examples': [ex('我明天去北京。', 'Ngày mai tôi đi Bắc Kinh.'), ex('他晚上在家看电视。', 'Buổi tối anh ấy xem tivi ở nhà.'),
                     ex('我在医院工作。', 'Tôi làm việc ở bệnh viện.'),
                     ex('昨天我在商店买了一件衣服。', 'Hôm qua tôi mua một bộ quần áo ở cửa hàng.'),
                     ex('我们中午在饭店吃饭。', 'Buổi trưa chúng tôi ăn cơm ở nhà hàng.')],
        'mistakes': [mi('我工作在医院。', '我在医院工作。', 'Nơi làm việc (在 + nơi chốn) đứng trước động từ.'),
                     mi('我去北京明天。', '我明天去北京。', 'Thời gian đứng trước động từ, không đặt ở cuối câu.')],
        'exercises': [
            ch('我们___吃饭。', ['在饭店', '饭店在'], 0, '在 + nơi chốn, đặt trước động từ: 在饭店吃饭.'),
            ch('___我去学校。', ['明天', '在'], 0, 'Thời gian có thể đứng đầu câu: 明天我去学校.'),
            ch('我晚上___看书。', ['在家', '家在'], 0, 'Nơi chốn là 在 + 家, đặt trước động từ 看.'),
            ch('我明天___。', ['去北京', '北京去'], 0, 'Nơi đến đứng sau 去: 去北京.'),
            ch('他___学习汉语。', ['在学校', '学校'], 0, 'Nói làm việc gì ở đâu thì cần 在: 在学校学习.'),
            od('我|明天|在|家|学习。', 'Ngày mai tôi học ở nhà.'),
        ],
    },
    {
        'id': 'zh-le', 'emoji': '✅', 'level': 'A1',
        'title': ['了: việc đã xảy ra', '了: something has happened'],
        'summary': ['Động từ + 了: việc đã làm. Phủ định: 没 + động từ, bỏ 了.', 'Verb + 了: an action that happened. Negative: 没 + verb, without 了.'],
        'explain': [
            'Đặt 了 sau động từ hoặc cuối câu để nói việc đã xảy ra: 我买了一本书 = tôi (đã) mua một quyển sách. Gần giống "đã … rồi" của tiếng Việt.',
            '了 không phải "thì quá khứ": thói quen trong quá khứ không dùng 了. 去年我每天跑步 (năm ngoái ngày nào tôi cũng chạy bộ) không có 了.',
            'Phủ định việc chưa xảy ra: 没 (hoặc 没有) + động từ, và BỎ 了: nói 我没去, không nói 我没去了.',
            '了 ở cuối câu còn báo một sự thay đổi: 下雨了 (trời mưa rồi), 我饿了 (tôi đói rồi).',
        ],
        'patterns': ['Động từ + 了 + tân ngữ', '… 了。(đã xảy ra, hoặc đã thay đổi)', '没 + động từ (không có 了)'],
        'examples': [ex('我买了一本书。', 'Tôi đã mua một quyển sách.'), ex('他已经回家了。', 'Anh ấy về nhà rồi.'),
                     ex('昨天我没去学校。', 'Hôm qua tôi không đi học.'), ex('下雨了。', 'Trời mưa rồi.'),
                     ex('你吃饭了吗？', 'Bạn ăn cơm chưa?')],
        'mistakes': [mi('我没去了。', '我没去。', 'Câu phủ định với 没 không có 了.'),
                     mi('去年我每天跑步了。', '去年我每天跑步。', 'Thói quen trong quá khứ không dùng 了.')],
        'exercises': [
            ch('我昨天买___一件衣服。', ['了', '没'], 0, 'Việc đã xảy ra: động từ + 了.'),
            ch('他昨天___来。', ['没', '不'], 0, 'Việc đã không xảy ra → 没, không dùng 不.'),
            ch('我饿___。', ['了', '的'], 0, '了 cuối câu báo thay đổi: 我饿了 = tôi đói rồi.'),
            ch('你吃饭___吗？', ['了', '没'], 0, 'Hỏi đã làm chưa: … 了吗？'),
            ch('我没___咖啡。', ['喝', '喝了'], 0, 'Sau 没 không dùng 了: 我没喝咖啡.'),
            od('我|已经|吃|饭|了。', 'Tôi ăn cơm rồi.'),
        ],
    },
    {
        'id': 'zh-can', 'emoji': '🛠️', 'level': 'A2',
        'title': ['会, 能, 可以: ba cách nói "có thể"', '会, 能, 可以: three kinds of "can"'],
        'summary': ['会 = biết (phải học mới làm được), 能 = làm được, 可以 = được phép.', '会 = know how (learned), 能 = able to, 可以 = allowed to.'],
        'explain': [
            'Tiếng Việt nói "biết", "được", "có thể"; tiếng Trung chia ra ba từ.',
            '会: kỹ năng phải học mới có: 我会说汉语 (tôi biết nói tiếng Trung), 他会游泳 (anh ấy biết bơi).',
            '能: làm được, có điều kiện để làm: 你明天能来吗？ (mai bạn đến được không?), 我生病了，不能去 (tôi ốm nên không đi được).',
            '可以: được phép, dùng khi xin phép: 我可以坐这儿吗？ (tôi ngồi đây được không?).',
            'Ranh giới giữa 能 và 可以 không cứng, người bản xứ đôi khi dùng thay nhau. Mẹo trên đủ cho người mới học.',
        ],
        'patterns': ['会 + động từ (biết làm)', '能 + động từ (làm được)', '可以 + động từ (được phép)'],
        'examples': [ex('我会说汉语。', 'Tôi biết nói tiếng Trung.'), ex('他不会游泳。', 'Anh ấy không biết bơi.'),
                     ex('我生病了，不能去。', 'Tôi ốm rồi, không đi được.'), ex('你明天能来吗？', 'Ngày mai bạn đến được không?'),
                     ex('我可以坐这儿吗？', 'Tôi ngồi đây được không?')],
        'mistakes': [mi('我会坐这儿吗？', '我可以坐这儿吗？', 'Xin phép → 可以, không dùng 会.'),
                     mi('我生病了，不会去。', '我生病了，不能去。', 'Không đi được vì một lý do (ốm) → 不能. 不会去 nghĩa là "sẽ không đi".')],
        'exercises': [
            ch('我___说汉语。', ['会', '可以'], 0, 'Biết một thứ tiếng là kỹ năng đã học → 会.'),
            ch('我___坐这儿吗？', ['可以', '会'], 0, 'Xin phép → 可以.'),
            ch('他生病了，不___来。', ['能', '会'], 0, 'Không đến được vì ốm → 不能.'),
            ch('妹妹___游泳，她学了两年。', ['会', '可以'], 0, 'Bơi là kỹ năng phải học → 会.'),
            ch('这儿___吃东西吗？', ['可以', '会'], 0, 'Hỏi có được phép không → 可以.'),
            od('我|会|说|一点儿|汉语。', 'Tôi biết nói một chút tiếng Trung.'),
        ],
    },
    {
        'id': 'zh-because', 'emoji': '🔗', 'level': 'A2',
        'title': ['因为…所以…, 但是: vì… nên…, nhưng', '因为…所以…, 但是: because… so…, but'],
        'summary': ['Giống "vì… nên…" của tiếng Việt: 因为下雨，所以我不去了.', 'Like Vietnamese "vì… nên…": 因为下雨，所以我不去了.'],
        'explain': [
            '因为 = vì, 所以 = nên. Thứ tự giống tiếng Việt: lý do trước, kết quả sau.',
            'Có thể dùng cả hai, hoặc chỉ một: 因为今天是我的生日，我很高兴 / 我很累，所以想休息.',
            '但是 = nhưng, nối hai ý trái nhau: 汉语很难，但是很有意思.',
        ],
        'patterns': ['因为 + lý do，所以 + kết quả', '…，所以 + kết quả', '…，但是 + ý trái lại'],
        'examples': [ex('因为下雨，所以我不去了。', 'Vì trời mưa nên tôi không đi nữa.'),
                     ex('我很累，所以想休息。', 'Tôi rất mệt nên muốn nghỉ ngơi.'),
                     ex('因为今天是我的生日，我很高兴。', 'Vì hôm nay là sinh nhật tôi nên tôi rất vui.'),
                     ex('汉语很难，但是很有意思。', 'Tiếng Trung khó nhưng rất thú vị.'),
                     ex('这件衣服很漂亮，但是太贵了。', 'Bộ quần áo này rất đẹp nhưng đắt quá.')],
        'mistakes': [mi('所以下雨，因为我不去了。', '因为下雨，所以我不去了。', '因为 đi với lý do, 所以 đi với kết quả.'),
                     mi('因为我很累，但是我想休息。', '因为我很累，所以我想休息。', 'Kết quả của một lý do → 所以; 但是 là "nhưng".')],
        'exercises': [
            ch('因为下雨，___我不去了。', ['所以', '但是'], 0, 'Kết quả → 所以.'),
            ch('___我饿了，我想吃饭。', ['因为', '所以'], 0, 'Lý do → 因为.'),
            ch('汉语很难，___很有意思。', ['但是', '所以'], 0, 'Hai ý trái nhau → 但是.'),
            ch('他生病了，___没去上班。', ['所以', '但是'], 0, 'Ốm nên không đi làm → 所以.'),
            ch('这个手机很好，___太贵了。', ['但是', '因为'], 0, 'Tốt nhưng đắt → 但是.'),
            od('因为|很|累，|所以|我|想|休息。', 'Vì rất mệt nên tôi muốn nghỉ ngơi.'),
        ],
    },
    {
        'id': 'zh-de-degree', 'emoji': '🏃', 'level': 'A2',
        'title': ['得: làm việc gì đó thế nào', '得: how well something is done'],
        'summary': ['Động từ + 得 + 很 + tính từ: 他走得很快 = anh ấy đi rất nhanh.', 'Verb + 得 + 很 + adjective: 他走得很快 = he walks fast.'],
        'explain': [
            'Muốn nhận xét một việc được làm thế nào (nhanh, chậm, giỏi…), đặt 得 sau động từ rồi đến lời nhận xét: 他走得很快 (anh ấy đi rất nhanh).',
            'Lời nhận xét thường có 很, 太 hoặc 不: 你说得很好, 她唱得不好.',
            'Nếu động từ có tân ngữ thì nhắc lại động từ: 他说汉语说得很好 (anh ấy nói tiếng Trung rất giỏi). Cũng có thể đưa tân ngữ lên trước: 他汉语说得很好.',
            '得 ở đây đọc nhẹ là "de", cùng âm với 的 nhưng là chữ khác: 的 đứng trước danh từ (我的书), 得 đứng sau động từ.',
        ],
        'patterns': ['Động từ + 得 + 很 + tính từ', 'Động từ + 得 + 不 + tính từ', 'Động từ + tân ngữ + động từ + 得 + …'],
        'examples': [ex('他走得很快。', 'Anh ấy đi rất nhanh.'), ex('你说得很好。', 'Bạn nói rất hay.'),
                     ex('她唱歌唱得很好。', 'Cô ấy hát rất hay.'), ex('我今天起得很早。', 'Hôm nay tôi dậy rất sớm.'),
                     ex('他汉语说得不太好。', 'Anh ấy nói tiếng Trung không giỏi lắm.')],
        'mistakes': [mi('他走很快。', '他走得很快。', 'Nhận xét cách làm một việc thì cần 得 sau động từ.'),
                     mi('他说汉语得很好。', '他说汉语说得很好。', 'Có tân ngữ thì nhắc lại động từ trước 得: 说汉语说得很好.')],
        'exercises': [
            ch('他跑___很快。', ['得', '的'], 0, 'Sau động từ, trước lời nhận xét → 得.'),
            ch('你写___很好。', ['得', '了'], 0, '写得很好: viết rất đẹp.'),
            ch('妹妹唱歌唱得___。', ['很好', '好很'], 0, 'Sau 得 là 很 + tính từ.'),
            ch('他游泳游得___好。', ['不', '没'], 0, 'Nhận xét phủ định → 不: 游得不好.'),
            ch('这是我___书。', ['的', '得'], 0, 'Sở hữu (của tôi) → 的; 得 chỉ đứng sau động từ.'),
            od('他|说|汉语|说|得|很|好。', 'Anh ấy nói tiếng Trung rất giỏi.'),
        ],
    },
    {
        'id': 'zh-bi', 'emoji': '⚖️', 'level': 'A2',
        'title': ['比: so sánh hơn', '比: comparing'],
        'summary': ['A 比 B + tính từ: 哥哥比我高 = anh trai cao hơn tôi.', 'A 比 B + adjective: 哥哥比我高 = my brother is taller than me.'],
        'explain': [
            'So sánh hơn: A + 比 + B + tính từ. 哥哥比我高 = anh trai cao hơn tôi. Thứ tự khác tiếng Việt: "比 B" đứng TRƯỚC tính từ.',
            'Câu có 比 không dùng 很: nói 他比我高, không nói 他比我很高. Muốn nói "hơn nhiều" thì thêm 多了 sau tính từ: 他比我高多了.',
            'Hơn một chút: thêm 一点儿 sau tính từ: 今天比昨天冷一点儿.',
            'Nói "A không bằng B": A + 没有 + B + tính từ: 我没有哥哥高 (tôi không cao bằng anh trai).',
        ],
        'patterns': ['A 比 B + tính từ', 'A 比 B + tính từ + 一点儿 / 多了', 'A 没有 B + tính từ'],
        'examples': [ex('哥哥比我高。', 'Anh trai cao hơn tôi.'), ex('今天比昨天冷。', 'Hôm nay lạnh hơn hôm qua.'),
                     ex('这件衣服比那件贵一点儿。', 'Bộ quần áo này đắt hơn bộ kia một chút.'),
                     ex('坐飞机比坐火车快多了。', 'Đi máy bay nhanh hơn đi tàu hoả nhiều.'),
                     ex('我没有哥哥高。', 'Tôi không cao bằng anh trai.')],
        'mistakes': [mi('他比我很高。', '他比我高。', 'Câu có 比 không dùng 很.'),
                     mi('我高比他。', '我比他高。', '"比 + B" đứng trước tính từ.')],
        'exercises': [
            ch('哥哥___我高。', ['比', '很'], 0, 'So sánh hơn → 比.'),
            ch('今天比昨天___。', ['热', '很热'], 0, 'Câu có 比 không dùng 很.'),
            ch('北京比这儿冷___。', ['多了', '很多'], 0, '"Hơn nhiều" → tính từ + 多了.'),
            ch('我___哥哥高。', ['没有', '很'], 0, 'A 没有 B + tính từ: A không bằng B.'),
            ch('这个苹果比那个大___。', ['一点儿', '很'], 0, 'Hơn một chút → tính từ + 一点儿.'),
            od('坐|飞机|比|坐|火车|快。', 'Đi máy bay nhanh hơn đi tàu hoả.'),
        ],
    },
    {
        'id': 'zh-guo', 'emoji': '🗺️', 'level': 'A2',
        'title': ['过: đã từng', '过: have done before'],
        'summary': ['Động từ + 过: đã từng làm (một lần nào đó): 我去过北京.', 'Verb + 过: have done it at some point: 我去过北京.'],
        'explain': [
            'Đặt 过 (đọc nhẹ "guo") ngay sau động từ để nói đã từng trải qua việc đó: 我去过北京 = tôi đã từng đến Bắc Kinh. Giống "đã từng" của tiếng Việt.',
            'Khác với 了: 了 kể một việc đã xảy ra (我昨天去了北京), còn 过 nói về trải nghiệm, không cần biết lúc nào.',
            'Phủ định: 没(有) + động từ + 过, GIỮ 过: 我没去过中国 (tôi chưa từng đến Trung Quốc).',
            'Hỏi: … 过 … 吗？ — 你吃过羊肉吗？ Muốn nói số lần thì thêm sau động từ: 看过两次.',
        ],
        'patterns': ['Động từ + 过 + tân ngữ', '没 + động từ + 过', 'Động từ + 过 + … 吗？'],
        'examples': [ex('我去过北京。', 'Tôi đã từng đến Bắc Kinh.'), ex('你吃过羊肉吗？', 'Bạn đã từng ăn thịt cừu chưa?'),
                     ex('我没去过中国。', 'Tôi chưa từng đến Trung Quốc.'), ex('他学过两年汉语。', 'Anh ấy từng học tiếng Trung hai năm.'),
                     ex('这个电影我看过两次。', 'Bộ phim này tôi đã xem hai lần.')],
        'mistakes': [mi('我没去中国过。', '我没去过中国。', '过 đứng ngay sau động từ, trước tân ngữ.'),
                     mi('我没去过了。', '我没去过。', 'Câu phủ định với 没 … 过 không thêm 了.')],
        'exercises': [
            ch('我吃___北京菜。', ['过', '在'], 0, 'Đã từng ăn → động từ + 过.'),
            ch('他没___过中国。', ['去', '去了'], 0, '没 + động từ + 过, không có 了.'),
            ch('你看___这本书吗？', ['过', '着'], 0, 'Hỏi đã từng đọc chưa → 过.'),
            ch('我___去过上海。', ['没', '不'], 0, 'Phủ định trải nghiệm → 没 … 过.'),
            ch('这个电影我看过两___。', ['次', '个'], 0, 'Số lần làm một việc → 次.'),
            od('我|没|吃|过|西瓜。', 'Tôi chưa từng ăn dưa hấu.'),
        ],
    },
    {
        'id': 'zh-yao-le', 'emoji': '⏳', 'level': 'A2',
        'title': ['要…了, 快…了: sắp', '要…了, 快…了: about to'],
        'summary': ['(快)要 + động từ + 了: việc sắp xảy ra: 要下雨了 = trời sắp mưa.', '(快)要 + verb + 了: something is about to happen: 要下雨了.'],
        'explain': [
            'Muốn nói "sắp", đặt 要 hoặc 快 (hoặc 快要) trước động từ và 了 ở cuối câu: 要下雨了, 火车快到了.',
            '了 cuối câu ở đây không phải "đã xong": nó báo một thay đổi sắp đến. Thiếu 了 thì câu nghe dở dang.',
            'Có mốc thời gian cụ thể (明天, 下个月…) thì dùng 就要 … 了, không dùng 快 … 了: 明天就要放假了.',
        ],
        'patterns': ['要 + động từ + 了', '快(要) + động từ + 了', 'Thời gian + 就要 + động từ + 了'],
        'examples': [ex('要下雨了。', 'Trời sắp mưa rồi.'), ex('火车快到了。', 'Tàu sắp đến rồi.'),
                     ex('我们快要考试了。', 'Chúng tôi sắp thi rồi.'), ex('明天就要放假了。', 'Ngày mai là được nghỉ rồi.'),
                     ex('电影快开始了。', 'Phim sắp bắt đầu rồi.')],
        'mistakes': [mi('要下雨。', '要下雨了。', '"Sắp" cần 了 ở cuối câu.'),
                     mi('明天快放假了。', '明天就要放假了。', 'Có mốc thời gian cụ thể → 就要 … 了.')],
        'exercises': [
            ch('要下雨___，我们回家吧。', ['了', '的'], 0, '要 … 了: sắp.'),
            ch('火车___到了。', ['快', '很'], 0, '快 … 了: sắp.'),
            ch('明天___要考试了。', ['就', '快'], 0, 'Có mốc thời gian (明天) → 就要 … 了.'),
            ch('电影快开始___。', ['了', '过'], 0, 'Câu "sắp" kết thúc bằng 了.'),
            ch('我们快___回家了。', ['要', '在'], 0, '快要 … 了: sắp.'),
            od('我|妹妹|快|要|起床|了。', 'Em gái tôi sắp dậy rồi.'),
        ],
    },
]


def main() -> int:
    errors = list(ERRORS)
    for u in UNITS:
        for e in u['exercises']:
            if e['type'] == 'choice' and '___' not in e['prompt']:
                errors.append(f"{u['id']}: no gap in {e['prompt']}")
            if e['type'] == 'order':
                n = len(e['en'].split(ZWSP))
                if not 3 <= n <= 10:
                    errors.append(f"{u['id']}: order needs 3–10 words: {e['en']}")
        if len(u['exercises']) < 5:
            errors.append(f"{u['id']}: fewer than 5 exercises")
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    OUT.write_text(json.dumps({'version': '1.0.0', 'units': UNITS}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(UNITS)} units, {sum(len(u["exercises"]) for u in UNITS)} exercises → {OUT.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
