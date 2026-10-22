#!/usr/bin/env python3
"""Build public/data/phrases/zh.json — everyday Chinese phrases (docs/design/phrases.md).

Each phrase is written with "|" between words, which become invisible zero-width
spaces: the sentence shows unbroken, while "Xếp câu" can still cut it into word
tiles. Its pinyin is given one syllable per Chinese character, so a wrong count
is caught mechanically, and every pack word in it must read as the pack reads it.

Ids follow the Korean pack's layout in their own range (PHRASE_ID_BASE in
src/lib/phrases.ts): topic n numbers its phrases from 3000 + 10 * (n - 1) + 1.

Usage:  python3 scripts/build_phrases_zh.py
"""
import json
import sys
from pathlib import Path

from zh_pinyin import han_of, pinyin_line, syllables_for, word_mismatch

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / 'public' / 'data' / 'zh.json'
OUT = ROOT / 'public' / 'data' / 'phrases' / 'zh.json'
ZWSP = chr(0x200B)
ID_BASE = 3000

# (sentence, pinyin, meaning, tip). Every meaning differs from every other, or
# "nghe rồi chọn nghĩa" would have two right answers; close cousins go in the tip.
TOPICS = [
    {
        'id': 'greetings',
        'emoji': '👋',
        'title': 'Chào hỏi & làm quen',
        'titleEn': 'Greetings & introductions',
        'phrases': [
            ('你好！', 'nǐ hǎo', 'Xin chào!', 'Chào người lớn tuổi hay khách hàng thì nói 您好 (nín hǎo) cho lễ phép.'),
            ('认识|你|很|高兴。', 'rèn shi nǐ hěn gāo xìng', 'Rất vui được làm quen với bạn.', ''),
            (
                '我|叫|阮|兰，|你|叫|什么|名字？',
                'wǒ jiào Ruǎn Lán nǐ jiào shén me míng zi',
                'Mình tên là Nguyễn Lan, bạn tên gì?',
                'Tên tiếng Việt thường có chữ Hán tương ứng: họ Nguyễn là 阮 (Ruǎn), Lan là 兰 (Lán).',
            ),
            ('你|是|哪|国|人？', 'nǐ shì nǎ guó rén', 'Bạn là người nước nào?', 'Đáp: 我是越南人。'),
            ('我|是|越南|人。', 'wǒ shì Yuè nán rén', 'Mình là người Việt Nam.', ''),
            ('好久|不|见！', 'hǎo jiǔ bú jiàn', 'Lâu lắm không gặp!', '不 đọc thành bú khi đứng trước thanh 4 (见 jiàn).'),
            ('最近|怎么样？', 'zuì jìn zěn me yàng', 'Dạo này thế nào?', 'Hỏi người quen. Đáp: 挺好的 (khá ổn).'),
            ('再见！', 'zài jiàn', 'Tạm biệt!', 'Bạn bè hay nói 拜拜 (bái bái).'),
            ('明天|见！', 'míng tiān jiàn', 'Mai gặp lại nhé!', ''),
        ],
    },
    {
        'id': 'understanding',
        'emoji': '👂',
        'title': 'Khi chưa nghe rõ',
        'titleEn': "When you didn't catch it",
        'phrases': [
            ('请|再|说|一|遍。', 'qǐng zài shuō yí biàn', 'Bạn nói lại lần nữa giúp mình.', ''),
            ('请|说|慢|一点。', 'qǐng shuō màn yì diǎn', 'Bạn nói chậm một chút giúp mình.', ''),
            ('我|听|不|懂。', 'wǒ tīng bu dǒng', 'Mình nghe không hiểu.', ''),
            (
                '我|会|说|一点|汉语。',
                'wǒ huì shuō yì diǎn Hàn yǔ',
                'Mình nói được một chút tiếng Trung.',
                '汉语 và 中文 đều là tiếng Trung; 中文 hay dùng khi nói về chữ viết.',
            ),
            ('这个|用|中文|怎么|说？', 'zhè ge yòng Zhōng wén zěn me shuō', 'Cái này tiếng Trung nói thế nào?', 'Chỉ vào đồ vật rồi hỏi.'),
            ('这|是|什么|意思？', 'zhè shì shén me yì si', 'Cái này nghĩa là gì?', ''),
            ('你|会|说|英语|吗？', 'nǐ huì shuō Yīng yǔ ma', 'Bạn nói được tiếng Anh không?', ''),
            (
                '请|写|在|这里。',
                'qǐng xiě zài zhè lǐ',
                'Bạn viết vào đây giúp mình.',
                'Đưa sổ hay điện thoại khi nghe không kịp: đọc chữ Hán thường dễ hơn nghe.',
            ),
        ],
    },
    {
        'id': 'polite',
        'emoji': '🙏',
        'title': 'Lịch sự hằng ngày',
        'titleEn': 'Everyday courtesy',
        'phrases': [
            ('谢谢！', 'xiè xie', 'Cảm ơn!', ''),
            ('不|客气。', 'bú kè qi', 'Không có gì.', 'Đáp lại lời cảm ơn. Cũng nói 不用谢 (bú yòng xiè).'),
            ('对不起。', 'duì bu qǐ', 'Xin lỗi.', 'Xin lỗi khi mình làm sai. Muốn nhờ hay hỏi ai thì dùng 不好意思.'),
            ('没|关系。', 'méi guān xi', 'Không sao đâu.', 'Đáp lại lời xin lỗi.'),
            (
                '不|好意思。',
                'bù hǎo yì si',
                'Ngại quá, phiền bạn chút.',
                'Nhẹ hơn 对不起: khi làm phiền ai, xin đi qua chỗ đông hay bắt đầu hỏi người lạ.',
            ),
            ('服务员！', 'fú wù yuán', 'Bạn phục vụ ơi!', 'Gọi nhân viên trong quán.'),
            ('等|一下。', 'děng yí xià', 'Đợi một chút.', ''),
            ('麻烦|你|了。', 'má fan nǐ le', 'Làm phiền bạn rồi.', 'Nói khi nhờ ai giúp, hay để cảm ơn sau khi được giúp.'),
            ('辛苦|了！', 'xīn kǔ le', 'Vất vả rồi!', 'Nói với người vừa làm việc cho mình, hay với đồng nghiệp lúc tan làm.'),
        ],
    },
    {
        'id': 'food',
        'emoji': '🍜',
        'title': 'Gọi món & đồ uống',
        'titleEn': 'Ordering food & drinks',
        'phrases': [
            ('请|给|我|看看|菜单。', 'qǐng gěi wǒ kàn kan cài dān', 'Cho mình xem thực đơn.', ''),
            ('我|要|这个。', 'wǒ yào zhè ge', 'Cho mình món này.', 'Chỉ vào món trên thực đơn. 我要… là "cho tôi…", dùng được ở mọi nơi.'),
            (
                '请|给|我|一|杯|水。',
                'qǐng gěi wǒ yì bēi shuǐ',
                'Cho mình xin một cốc nước.',
                'Nhiều quán mang nước ấm hay trà; muốn nước đá thì nói 冰水 (bīng shuǐ).',
            ),
            ('这个|辣|不|辣？', 'zhè ge là bu là', 'Món này có cay không?', 'Hỏi kiểu "cay không cay": ghép khẳng định với phủ định.'),
            ('不要|放|辣椒。', 'bú yào fàng là jiāo', 'Đừng cho ớt nhé.', ''),
            ('很|好吃！', 'hěn hǎo chī', 'Ngon lắm!', ''),
            ('买单！', 'mǎi dān', 'Tính tiền nhé!', 'Gọi ở bàn khi muốn trả tiền. Cũng nói 结账 (jié zhàng).'),
            ('请|帮|我|打包。', 'qǐng bāng wǒ dǎ bāo', 'Gói mang về giúp mình.', ''),
            ('我|吃|素。', 'wǒ chī sù', 'Mình ăn chay.', ''),
        ],
    },
    {
        'id': 'shopping',
        'emoji': '🛍️',
        'title': 'Mua sắm',
        'titleEn': 'Shopping',
        'phrases': [
            ('这个|多少|钱？', 'zhè ge duō shao qián', 'Cái này bao nhiêu tiền?', ''),
            ('太|贵|了！', 'tài guì le', 'Đắt quá!', ''),
            (
                '便宜|一点|吧。',
                'pián yi yì diǎn ba',
                'Bớt cho mình chút đi.',
                'Chỉ nên mặc cả ở chợ, không mặc cả ở cửa hàng có giá niêm yết.',
            ),
            ('有|别的|颜色|吗？', 'yǒu bié de yán sè ma', 'Có màu khác không?', ''),
            ('可以|试试|吗？', 'kě yǐ shì shi ma', 'Mình thử được không?', 'Thử quần áo cũng nói 试穿 (shì chuān).'),
            (
                '可以|用|微信|付|吗？',
                'kě yǐ yòng Wēi xìn fù ma',
                'Trả bằng WeChat được không?',
                'Ở Trung Quốc người ta trả tiền chủ yếu bằng điện thoại: WeChat Pay hay Alipay (支付宝).',
            ),
            ('我|只是|看看。', 'wǒ zhǐ shì kàn kan', 'Mình chỉ xem thôi.', 'Đáp khi nhân viên hỏi bạn cần gì.'),
            ('就|要|这个|吧。', 'jiù yào zhè ge ba', 'Vậy mình lấy cái này.', ''),
        ],
    },
    {
        'id': 'directions',
        'emoji': '🧭',
        'title': 'Hỏi đường',
        'titleEn': 'Asking the way',
        'phrases': [
            ('洗手间|在|哪里？', 'xǐ shǒu jiān zài nǎ lǐ', 'Nhà vệ sinh ở đâu?', ''),
            ('地铁站|在|哪里？', 'dì tiě zhàn zài nǎ lǐ', 'Ga tàu điện ngầm ở đâu?', ''),
            ('离|这里|远|吗？', 'lí zhè lǐ yuǎn ma', 'Cách đây có xa không?', ''),
            ('走路|能|到|吗？', 'zǒu lù néng dào ma', 'Đi bộ tới được không?', ''),
            ('一直|往|前|走。', 'yì zhí wǎng qián zǒu', 'Cứ đi thẳng.', ''),
            ('往|右|拐。', 'wǎng yòu guǎi', 'Rẽ phải.', 'Rẽ trái là 往左拐 (wǎng zuǒ guǎi).'),
            ('我|迷路|了。', 'wǒ mí lù le', 'Mình bị lạc đường.', ''),
            (
                '这|路|车|去|王府井|吗？',
                'zhè lù chē qù Wáng fǔ jǐng ma',
                'Xe buýt tuyến này có đi Vương Phủ Tỉnh không?',
                '路 ở đây là tuyến xe buýt. Thay 王府井 bằng nơi bạn muốn đến.',
            ),
        ],
    },
    {
        'id': 'travel',
        'emoji': '🏨',
        'title': 'Đi lại & khách sạn',
        'titleEn': 'Getting around & hotels',
        'phrases': [
            ('我|预订|了|房间。', 'wǒ yù dìng le fáng jiān', 'Mình đã đặt phòng trước rồi.', ''),
            ('我|要|办|入住。', 'wǒ yào bàn rù zhù', 'Mình muốn làm thủ tục nhận phòng.', ''),
            ('WiFi|密码|是|多少？', 'mì mǎ shì duō shao', 'Mật khẩu wifi là gì?', ''),
            ('可以|寄存|行李|吗？', 'kě yǐ jì cún xíng li ma', 'Mình gửi hành lý được không?', ''),
            (
                '师傅，|去|这个|地方。',
                'shī fu qù zhè ge dì fang',
                'Bác tài ơi, cho mình đến chỗ này.',
                '师傅 là cách gọi tài xế hay thợ. Đưa địa chỉ trên điện thoại kèm câu này.',
            ),
            ('到|机场|要|多长|时间？', 'dào jī chǎng yào duō cháng shí jiān', 'Đến sân bay mất bao lâu?', ''),
            ('我|在|这里|下车。', 'wǒ zài zhè lǐ xià chē', 'Mình xuống ở đây.', ''),
            ('能|帮|我|拍|张|照|吗？', 'néng bāng wǒ pāi zhāng zhào ma', 'Chụp giúp mình tấm ảnh được không?', ''),
        ],
    },
    {
        'id': 'feelings',
        'emoji': '💭',
        'title': 'Cảm xúc & ý kiến',
        'titleEn': 'Feelings & opinions',
        'phrases': [
            ('好|啊！', 'hǎo a', 'Được đấy!', 'Đồng ý với một lời rủ: "được, làm vậy đi".'),
            ('太|好|了！', 'tài hǎo le', 'Tuyệt quá!', ''),
            ('我|累|了。', 'wǒ lèi le', 'Mình mệt rồi.', ''),
            ('我|饿|了。', 'wǒ è le', 'Mình đói rồi.', ''),
            ('真的|吗？', 'zhēn de ma', 'Thật à?', ''),
            ('我|也|是。', 'wǒ yě shì', 'Mình cũng vậy.', ''),
            ('别|担心。', 'bié dān xīn', 'Đừng lo.', ''),
            ('生日|快乐！', 'shēng rì kuài lè', 'Chúc mừng sinh nhật!', ''),
            ('恭喜|恭喜！', 'gōng xǐ gōng xǐ', 'Chúc mừng nhé!', 'Chúc mừng chuyện vui: thi đỗ, có việc mới, cưới hỏi.'),
        ],
    },
]


def main() -> int:
    words = json.loads(PACK.read_text(encoding='utf-8'))['words']
    pack_reads = {w['word']: w['viRead'] for w in words}
    topics, errors = [], []
    for n, t in enumerate(TOPICS):
        phrases = []
        for i, (zh, pinyin, vi, note) in enumerate(t['phrases']):
            syllables, error = syllables_for(zh, pinyin)
            if error:
                errors.append(f'{zh}: {error}')
                continue
            for token in zh.split('|'):
                word = ''.join(han_of(token))
                if word in pack_reads:
                    mismatch = word_mismatch(word, zh, syllables, pack_reads[word])
                    if mismatch:
                        errors.append(f'{zh}: {mismatch}')
            phrase = {
                'id': ID_BASE + 10 * n + i + 1,
                'en': zh.replace('|', ZWSP),
                'read': pinyin_line(zh, syllables, pack_reads),
                'vi': vi,
            }
            if note:
                phrase['note'] = note
            phrases.append(phrase)
        topics.append({**t, 'phrases': phrases})
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    OUT.write_text(
        json.dumps({'version': '1.0.0', 'topics': topics}, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    print(f'{sum(len(t["phrases"]) for t in topics)} phrases → {OUT.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
