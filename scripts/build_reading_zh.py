#!/usr/bin/env python3
"""Build public/data/reading/zh.json — short Chinese stories (docs/design/chinese.md).

Sentences mark word breaks with "|"; they become invisible zero-width spaces,
so the reading screen can make each word tappable while showing the sentence
unbroken. Words of the Chinese pack get their meaning on tap; names and words
outside the pack simply are not tappable.

Usage:  python3 scripts/build_reading_zh.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
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
]


def main() -> int:
    stories = []
    for s in STORIES:
        sentences = [{'en': zh.replace('|', ZWSP), 'vi': vi} for zh, vi in s['sentences']]
        stories.append({**s, 'sentences': sentences})
    OUT.write_text(
        json.dumps({'version': '1.0.0', 'stories': stories}, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    print(f'{len(stories)} stories → {OUT.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
