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
