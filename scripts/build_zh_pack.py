#!/usr/bin/env python3
"""Build public/data/zh.json — the Chinese (Mandarin, simplified) beta pack.

Each row: headword | pinyin | pos | category | Vietnamese meaning |
example with word breaks marked "|" | example translation | emoji.
Chinese has no spaces, so the "|" breaks become invisible zero-width spaces
(U+200B) in the pack: screens show the sentence untouched, and tokenize()
gets the words the author chose (docs/design/chinese.md).

Usage:  python3 scripts/build_zh_pack.py
Fails (and writes nothing) if an example lacks its headword, a meaning repeats
or a pinyin has letters pinyin does not use.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'data' / 'zh.json'
ZWSP = '\u200b'

ROWS = '''
你好 | nǐ hǎo | expr. | other | xin chào | 你好，|很|高兴|认识|你。 | Xin chào, rất vui được làm quen với bạn. | 👋
谢谢 | xièxie | expr. | other | cảm ơn | 谢谢|你！ | Cảm ơn bạn! | 🙏
不客气 | bú kèqi | expr. | other | không có gì (đáp lời cảm ơn) | “谢谢|你！”|“不客气。” | “Cảm ơn bạn!” “Không có gì.” | 😊
对不起 | duìbuqǐ | expr. | other | xin lỗi | 对不起，|我|来|晚|了。 | Xin lỗi, tôi đến muộn. | 🙇
没关系 | méi guānxi | expr. | other | không sao | “对不起。”|“没关系。” | “Xin lỗi.” “Không sao.” | 👌
再见 | zàijiàn | expr. | other | tạm biệt | 老师，|再见！ | Em chào thầy ạ! | 👋
是 | shì | v. | verb | là | 我|是|学生。 | Tôi là học sinh. | 🟰
不 | bù | adv. | adverb | không (phủ định) | 我|不|喝|茶。 | Tôi không uống trà. | 🚫
没有 | méiyǒu | v. | verb | không có; chưa | 我|没有|时间。 | Tôi không có thời gian. | 🈳
有 | yǒu | v. | verb | có | 你|有|时间|吗？ | Bạn có thời gian không? | ✅
我 | wǒ | pron. | pronoun | tôi | 我|是|越南|人。 | Tôi là người Việt Nam. | 🙋
你 | nǐ | pron. | pronoun | bạn, anh, chị (ngôi thứ hai) | 你|是|老师|吗？ | Bạn là giáo viên à? | 🫵
他 | tā | pron. | pronoun | anh ấy, ông ấy | 他|是|我|的|老师。 | Anh ấy là thầy giáo của tôi. | 👨
她 | tā | pron. | pronoun | cô ấy, bà ấy | 她|是|医生。 | Cô ấy là bác sĩ. | 👩
我们 | wǒmen | pron. | pronoun | chúng tôi, chúng ta | 我们|是|朋友。 | Chúng tôi là bạn. | 👫
什么 | shénme | pron. | pronoun | cái gì | 你|想|吃|什么？ | Bạn muốn ăn gì? | ❓
谁 | shéi | pron. | pronoun | ai | 他|是|谁？ | Anh ấy là ai? | 🕵️
哪儿 | nǎr | pron. | pronoun | ở đâu | 你|去|哪儿？ | Bạn đi đâu? | 🗺️
多少 | duōshao | pron. | pronoun | bao nhiêu | 你|有|多少|钱？ | Bạn có bao nhiêu tiền? | 🔢
这 | zhè | pron. | pronoun | này, đây | 这|是|什么？ | Đây là cái gì? | 👇
那 | nà | pron. | pronoun | kia, đó | 那|是|我们|的|学校。 | Kia là trường của chúng tôi. | 👉
这儿 | zhèr | pron. | pronoun | ở đây | 我|在|这儿。 | Tôi ở đây. | 📌
那儿 | nàr | pron. | pronoun | ở kia | 你|的|书|在|那儿。 | Sách của bạn ở kia. | 📍
一 | yī | num. | other | một | 我|有|一|本|书。 | Tôi có một quyển sách. | 1️⃣
二 | èr | num. | other | hai | 今天|是|二|号。 | Hôm nay là ngày mùng hai. | 2️⃣
三 | sān | num. | other | ba | 我|家|有|三|口|人。 | Nhà tôi có ba người. | 3️⃣
十 | shí | num. | other | mười | 现在|十|点。 | Bây giờ là mười giờ. | 🔟
几 | jǐ | pron. | pronoun | mấy | 你|家|有|几|口|人？ | Nhà bạn có mấy người? | 🤔
个 | gè | m. | other | cái, chiếc (lượng từ chung) | 我|有|一|个|儿子。 | Tôi có một đứa con trai. | 🧮
本 | běn | m. | other | quyển (lượng từ cho sách) | 这|本|书|很|好。 | Quyển sách này rất hay. | 📚
块 | kuài | m. | other | đồng, tệ (đơn vị tiền, khẩu ngữ) | 一|杯|咖啡|三十|块。 | Một cốc cà phê ba mươi tệ. | 💴
人 | rén | n. | noun | người | 这儿|有|很|多|人。 | Ở đây có rất nhiều người. | 🧑
朋友 | péngyou | n. | noun | bạn bè | 他|是|我|的|好|朋友。 | Anh ấy là bạn tốt của tôi. | 🤝
老师 | lǎoshī | n. | noun | giáo viên | 我们|的|老师|很|好。 | Thầy giáo của chúng tôi rất tốt. | 🧑‍🏫
学生 | xuésheng | n. | noun | học sinh, sinh viên | 他|是|我|的|学生。 | Cậu ấy là học trò của tôi. | 🎒
医生 | yīshēng | n. | noun | bác sĩ | 我|妈妈|是|医生。 | Mẹ tôi là bác sĩ. | 🩺
爸爸 | bàba | n. | noun | bố | 爸爸|在|家。 | Bố đang ở nhà. | 👨‍🦱
妈妈 | māma | n. | noun | mẹ | 妈妈|做|的|饭|很|好吃。 | Cơm mẹ nấu rất ngon. | 👩‍🦱
儿子 | érzi | n. | noun | con trai | 他|儿子|五|岁。 | Con trai anh ấy năm tuổi. | 👦
女儿 | nǚ'ér | n. | noun | con gái | 我|女儿|很|漂亮。 | Con gái tôi rất xinh. | 👧
先生 | xiānsheng | n. | noun | ông, ngài; chồng | 王|先生|是|我|的|老师。 | Ông Vương là thầy giáo của tôi. | 🎩
小姐 | xiǎojiě | n. | noun | cô (gọi phụ nữ trẻ) | 李|小姐，|你好！ | Chào cô Lý! | 💁
米饭 | mǐfàn | n. | noun | cơm | 我|喜欢|吃|米饭。 | Tôi thích ăn cơm. | 🍚
茶 | chá | n. | noun | trà | 请|喝|茶。 | Mời anh uống trà. | 🍵
水 | shuǐ | n. | noun | nước | 我|想|喝|水。 | Tôi muốn uống nước. | 💧
菜 | cài | n. | noun | món ăn; rau | 这个|菜|很|好吃。 | Món này rất ngon. | 🥬
水果 | shuǐguǒ | n. | noun | trái cây | 我|每天|吃|水果。 | Ngày nào tôi cũng ăn trái cây. | 🍇
苹果 | píngguǒ | n. | noun | quả táo | 这个|苹果|很|大。 | Quả táo này rất to. | 🍎
咖啡 | kāfēi | n. | noun | cà phê | 我|喜欢|喝|咖啡。 | Tôi thích uống cà phê. | ☕
杯子 | bēizi | n. | noun | cái cốc | 杯子|在|桌子|上。 | Cái cốc ở trên bàn. | 🥛
吃 | chī | v. | verb | ăn | 你|吃|饭|了|吗？ | Bạn ăn cơm chưa? | 🍽️
喝 | hē | v. | verb | uống | 你|喝|什么？ | Bạn uống gì? | 🥤
饭店 | fàndiàn | n. | noun | nhà hàng; khách sạn | 我们|去|饭店|吃|饭。 | Chúng tôi đi nhà hàng ăn cơm. | 🏨
好吃 | hǎochī | adj. | adjective | ngon | 北京|菜|很|好吃。 | Món Bắc Kinh rất ngon. | 😋
家 | jiā | n. | noun | nhà, gia đình | 我|家|在|北京。 | Nhà tôi ở Bắc Kinh. | 🏠
学校 | xuéxiào | n. | noun | trường học | 我|去|学校。 | Tôi đi đến trường. | 🏫
医院 | yīyuàn | n. | noun | bệnh viện | 医院|在|哪儿？ | Bệnh viện ở đâu? | 🏥
商店 | shāngdiàn | n. | noun | cửa hàng | 我|去|商店|买|东西。 | Tôi đi cửa hàng mua đồ. | 🏪
中国 | Zhōngguó | n. | noun | Trung Quốc | 我|想|去|中国。 | Tôi muốn đi Trung Quốc. | 🇨🇳
北京 | Běijīng | n. | noun | Bắc Kinh | 北京|很|大。 | Bắc Kinh rất rộng lớn. | 🏯
火车站 | huǒchēzhàn | n. | noun | ga tàu hoả | 火车站|在|那儿。 | Ga tàu ở đằng kia. | 🚉
今天 | jīntiān | n. | noun | hôm nay | 今天|星期|一。 | Hôm nay là thứ Hai. | 📅
明天 | míngtiān | n. | noun | ngày mai | 明天|见！ | Mai gặp nhé! | 🌅
昨天 | zuótiān | n. | noun | hôm qua | 昨天|我|去|了|医院。 | Hôm qua tôi đã đi bệnh viện. | ⏪
现在 | xiànzài | n. | noun | bây giờ | 现在|几|点？ | Bây giờ là mấy giờ? | ⏰
点 | diǎn | m. | other | giờ (lúc mấy giờ) | 我|七|点|起床。 | Tôi dậy lúc bảy giờ. | 🕖
年 | nián | n. | noun | năm | 我|在|北京|住|了|三|年。 | Tôi đã sống ở Bắc Kinh ba năm. | 🗓️
月 | yuè | n. | noun | tháng | 现在|是|十|月。 | Bây giờ là tháng mười. | 🌙
星期 | xīngqī | n. | noun | tuần; thứ (trong tuần) | 今天|星期|几？ | Hôm nay thứ mấy? | 📆
上午 | shàngwǔ | n. | noun | buổi sáng | 我|上午|工作。 | Buổi sáng tôi làm việc. | 🌤️
中午 | zhōngwǔ | n. | noun | buổi trưa | 中午|我|吃|米饭。 | Buổi trưa tôi ăn cơm. | 🕛
下午 | xiàwǔ | n. | noun | buổi chiều | 下午|我|去|商店。 | Buổi chiều tôi đi cửa hàng. | 🌇
时候 | shíhou | n. | noun | lúc, khi | 你|什么|时候|回|家？ | Khi nào bạn về nhà? | ⏳
去 | qù | v. | verb | đi (đến) | 我们|去|北京|吧。 | Chúng ta đi Bắc Kinh nhé. | 🧳
来 | lái | v. | verb | đến, tới | 你|明天|来|吗？ | Mai bạn có đến không? | 🚶
回 | huí | v. | verb | về, trở về | 我|想|回|家。 | Tôi muốn về nhà. | 🔙
看 | kàn | v. | verb | xem, nhìn | 我|在|看|书。 | Tôi đang đọc sách. | 👀
听 | tīng | v. | verb | nghe | 我|喜欢|听|音乐。 | Tôi thích nghe nhạc. | 🎧
说 | shuō | v. | verb | nói | 你|会|说|汉语|吗？ | Bạn có biết nói tiếng Trung không? | 🗣️
读 | dú | v. | verb | đọc (thành tiếng) | 请|读|这个|字。 | Hãy đọc chữ này. | 📖
写 | xiě | v. | verb | viết | 我|会|写|汉字。 | Tôi biết viết chữ Hán. | ✍️
买 | mǎi | v. | verb | mua | 我|想|买|一|杯|咖啡。 | Tôi muốn mua một cốc cà phê. | 🛒
做 | zuò | v. | verb | làm | 你|在|做|什么？ | Bạn đang làm gì? | 🛠️
学习 | xuéxí | v. | verb | học | 我|在|学习|汉语。 | Tôi đang học tiếng Trung. | 📝
工作 | gōngzuò | v./n. | verb | làm việc; công việc | 我|在|医院|工作。 | Tôi làm việc ở bệnh viện. | 💼
喜欢 | xǐhuan | v. | verb | thích | 我|喜欢|中国|菜。 | Tôi thích món Trung Quốc. | ❤️
爱 | ài | v. | verb | yêu | 我|爱|我|的|家。 | Tôi yêu gia đình mình. | 💕
想 | xiǎng | v. | verb | muốn; nhớ, nghĩ | 我|想|去|商店。 | Tôi muốn đi cửa hàng. | 💭
会 | huì | v. | verb | biết (làm gì, nhờ học) | 他|会|开车。 | Anh ấy biết lái xe. | 🚗
能 | néng | v. | verb | có thể (có khả năng, được phép) | 你|能|来|吗？ | Bạn đến được không? | 💪
叫 | jiào | v. | verb | gọi, tên là | 我|叫|安娜。 | Tôi tên là Anna. | 📛
住 | zhù | v. | verb | sống, ở | 你|住|在|哪儿？ | Bạn sống ở đâu? | 🏡
睡觉 | shuìjiào | v. | verb | ngủ | 我|十一|点|睡觉。 | Tôi đi ngủ lúc mười một giờ. | 😴
打电话 | dǎ diànhuà | v. | verb | gọi điện thoại | 我|给|妈妈|打电话。 | Tôi gọi điện cho mẹ. | 📞
认识 | rènshi | v. | verb | quen biết | 我|认识|他。 | Tôi quen anh ấy. | 🫱
开 | kāi | v. | verb | mở; lái | 请|开|门。 | Làm ơn mở cửa. | 🚪
坐 | zuò | v. | verb | ngồi; đi (xe, tàu) | 请|坐！ | Mời ngồi! | 🪑
下雨 | xià yǔ | v. | verb | mưa (trời mưa) | 今天|下雨|了。 | Hôm nay trời mưa rồi. | 🌧️
在 | zài | v./prep. | verb | ở; đang | 他|在|家。 | Anh ấy ở nhà. | 🏘️
好 | hǎo | adj. | adjective | tốt, khỏe, hay | 你|好|吗？ | Bạn khỏe không? | 👍
大 | dà | adj. | adjective | to, lớn | 他|的|家|很|大。 | Nhà anh ấy rất rộng. | 🐘
小 | xiǎo | adj. | adjective | nhỏ, bé | 这个|杯子|很|小。 | Cái cốc này rất nhỏ. | 🐭
多 | duō | adj. | adjective | nhiều | 商店|里|人|很|多。 | Trong cửa hàng rất đông người. | ➕
少 | shǎo | adj. | adjective | ít | 这儿|人|很|少。 | Ở đây ít người. | ➖
热 | rè | adj. | adjective | nóng | 今天|很|热。 | Hôm nay rất nóng. | 🔥
冷 | lěng | adj. | adjective | lạnh | 北京|的|冬天|很|冷。 | Mùa đông ở Bắc Kinh rất lạnh. | 🥶
漂亮 | piàoliang | adj. | adjective | đẹp, xinh | 她|很|漂亮。 | Cô ấy rất xinh. | 🌸
高兴 | gāoxìng | adj. | adjective | vui | 认识|你|很|高兴。 | Rất vui được biết bạn. | 😄
很 | hěn | adv. | adverb | rất | 我|很|累。 | Tôi rất mệt. | 💯
太 | tài | adv. | adverb | quá | 太|贵|了！ | Đắt quá! | 😲
都 | dōu | adv. | adverb | đều | 我们|都|喜欢|喝|茶。 | Chúng tôi đều thích uống trà. | 🙌
书 | shū | n. | noun | sách | 我|的|书|在|桌子|上。 | Sách của tôi ở trên bàn. | 📕
钱 | qián | n. | noun | tiền | 这个|多少|钱？ | Cái này bao nhiêu tiền? | 💵
衣服 | yīfu | n. | noun | quần áo | 我|想|买|衣服。 | Tôi muốn mua quần áo. | 👕
电脑 | diànnǎo | n. | noun | máy tính | 我|用|电脑|工作。 | Tôi làm việc bằng máy tính. | 💻
电视 | diànshì | n. | noun | ti vi | 爸爸|在|看|电视。 | Bố đang xem ti vi. | 📺
东西 | dōngxi | n. | noun | đồ, đồ vật | 你|买|什么|东西？ | Bạn mua đồ gì? | 🛍️
桌子 | zhuōzi | n. | noun | cái bàn | 桌子|上|有|一|本|书。 | Trên bàn có một quyển sách. |
椅子 | yǐzi | n. | noun | cái ghế | 椅子|在|这儿。 | Cái ghế ở đây. | 🪑
汉语 | Hànyǔ | n. | noun | tiếng Trung (tiếng Hán) | 汉语|不|太|难。 | Tiếng Trung không khó lắm. | 🀄
字 | zì | n. | noun | chữ | 这个|字|怎么|读？ | Chữ này đọc thế nào? | 🔤
天气 | tiānqì | n. | noun | thời tiết | 今天|天气|怎么样？ | Hôm nay thời tiết thế nào? | 🌤️
名字 | míngzi | n. | noun | tên | 你|叫|什么|名字？ | Bạn tên là gì? | 🏷️
飞机 | fēijī | n. | noun | máy bay | 我|坐|飞机|去|北京。 | Tôi đi Bắc Kinh bằng máy bay. | ✈️
出租车 | chūzūchē | n. | noun | taxi | 我们|坐|出租车|吧。 | Chúng ta đi taxi nhé. | 🚕
猫 | māo | n. | noun | con mèo | 我|家|有|一|只|猫。 | Nhà tôi có một con mèo. | 🐱
狗 | gǒu | n. | noun | con chó | 这|只|狗|很|小。 | Con chó này rất nhỏ. | 🐶
吗 | ma | part. | other | (trợ từ hỏi có / không) | 你|是|中国|人|吗？ | Bạn là người Trung Quốc à? | ❔
呢 | ne | part. | other | (trợ từ: còn … thì sao?) | 我|很|好，|你|呢？ | Tôi khỏe, còn bạn? | 💬
的 | de | part. | other | (trợ từ sở hữu: của) | 这|是|我|的|书。 | Đây là sách của tôi. | 🔗
了 | le | part. | other | (trợ từ: đã, rồi) | 我|吃|饭|了。 | Tôi ăn cơm rồi. | ✔️
和 | hé | conj. | conjunction | và | 我|和|妈妈|去|商店。 | Tôi và mẹ đi cửa hàng. | 🤲
'''

# Âm Hán Việt, one syllable per character (docs/design/chinese.md). Left out on
# purpose: particles (吗 呢 的 了), the loanword 咖啡, the spoken 哪儿 / 这儿 /
# 那儿, and words with 吃, whose reading differs between dictionaries.
HAN_VIET = {
    '你好': 'nễ hảo', '谢谢': 'tạ tạ', '不客气': 'bất khách khí', '对不起': 'đối bất khởi',
    '没关系': 'một quan hệ', '再见': 'tái kiến', '是': 'thị', '不': 'bất', '没有': 'một hữu',
    '有': 'hữu', '我': 'ngã', '你': 'nễ', '他': 'tha', '她': 'tha', '我们': 'ngã môn',
    '什么': 'thập ma', '谁': 'thuỳ', '多少': 'đa thiểu', '这': 'giá', '那': 'na',
    '一': 'nhất', '二': 'nhị', '三': 'tam', '十': 'thập', '几': 'kỷ', '个': 'cá', '本': 'bản',
    '块': 'khối', '人': 'nhân', '朋友': 'bằng hữu', '老师': 'lão sư', '学生': 'học sinh',
    '医生': 'y sinh', '爸爸': 'bá bá', '妈妈': 'ma ma', '儿子': 'nhi tử', '女儿': 'nữ nhi',
    '先生': 'tiên sinh', '小姐': 'tiểu thư', '米饭': 'mễ phạn', '茶': 'trà', '水': 'thuỷ',
    '菜': 'thái', '水果': 'thuỷ quả', '苹果': 'bình quả', '杯子': 'bôi tử', '喝': 'hát',
    '饭店': 'phạn điếm', '家': 'gia', '学校': 'học hiệu', '医院': 'y viện',
    '商店': 'thương điếm', '中国': 'Trung Quốc', '北京': 'Bắc Kinh', '火车站': 'hoả xa trạm',
    '今天': 'kim thiên', '明天': 'minh thiên', '昨天': 'tạc thiên', '现在': 'hiện tại',
    '点': 'điểm', '年': 'niên', '月': 'nguyệt', '星期': 'tinh kỳ', '上午': 'thượng ngọ',
    '中午': 'trung ngọ', '下午': 'hạ ngọ', '时候': 'thời hậu', '去': 'khứ', '来': 'lai',
    '回': 'hồi', '看': 'khán', '听': 'thính', '说': 'thuyết', '读': 'độc', '写': 'tả',
    '买': 'mãi', '做': 'tố', '学习': 'học tập', '工作': 'công tác', '喜欢': 'hỉ hoan',
    '爱': 'ái', '想': 'tưởng', '会': 'hội', '能': 'năng', '叫': 'khiếu', '住': 'trú',
    '睡觉': 'thuỵ giác', '打电话': 'đả điện thoại', '认识': 'nhận thức', '开': 'khai',
    '坐': 'toạ', '下雨': 'hạ vũ', '在': 'tại', '好': 'hảo', '大': 'đại', '小': 'tiểu',
    '多': 'đa', '少': 'thiểu', '热': 'nhiệt', '冷': 'lãnh', '漂亮': 'phiêu lượng',
    '高兴': 'cao hứng', '很': 'ngận', '太': 'thái', '都': 'đô', '书': 'thư', '钱': 'tiền',
    '衣服': 'y phục', '电脑': 'điện não', '电视': 'điện thị', '东西': 'đông tây',
    '桌子': 'trác tử', '椅子': 'ỷ tử', '汉语': 'Hán ngữ', '字': 'tự', '天气': 'thiên khí',
    '名字': 'danh tự', '飞机': 'phi cơ', '出租车': 'xuất tô xa', '猫': 'miêu', '狗': 'cẩu',
    '和': 'hoà',
}

PINYIN = re.compile(r"^[a-zA-ZüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈŌÓǑÒ' ]+$")


def main() -> int:
    words, errors, meanings = [], [], {}
    for n, line in enumerate(l for l in ROWS.strip().split('\n') if l.strip()):
        # Columns are " | "; a bare "|" inside the example is a word break. The
        # trailing space keeps an empty last column (no emoji) a column.
        cells = [c.strip() for c in (line.rstrip() + ' ').split(' | ')]
        if len(cells) != 8:
            errors.append(f'row {n + 1}: {len(cells)} cells: {line}')
            continue
        word, pinyin, pos, cat, meaning, example, vi, emoji = cells
        sentence = example.replace('|', '')
        if word not in sentence:
            errors.append(f'{word}: not in its example {sentence}')
        if not PINYIN.match(pinyin):
            errors.append(f'{word}: odd pinyin {pinyin!r}')
        if meaning in meanings:
            errors.append(f'{word}: meaning "{meaning}" repeats {meanings[meaning]}')
        meanings[meaning] = word
        entry = {
            'id': n + 1,
            'word': word,
            'ipa': '',
            'viRead': pinyin,
            'pos': pos,
            'posCategory': cat,
            'meaning': meaning,
            'exampleEn': example.replace('|', ZWSP),
            'exampleVi': vi,
        }
        if emoji:
            entry['emoji'] = emoji
        hv = HAN_VIET.get(word)
        if hv:
            if len(hv.split()) != len(word):
                errors.append(f'{word}: Hán Việt "{hv}" needs one syllable per character')
            entry['hanViet'] = hv
        words.append(entry)
    unknown = sorted(set(HAN_VIET) - {w['word'] for w in words})
    errors += [f'Hán Việt for a word not in the pack: {w}' for w in unknown]
    heads = [w['word'] for w in words]
    errors += [f'{h}: listed twice' for h in sorted({h for h in heads if heads.count(h) > 1})]
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    pack = {
        'meta': {
            'code': 'zh',
            'name': 'Chinese',
            'flag': '🇨🇳',
            'nativeName': 'Tiếng Trung',
            'learnerLang': 'vi',
            'learnerLangName': 'Tiếng Việt',
            'ttsLang': 'zh-CN',
            'count': len(words),
            'source': 'VocaStudy (beta)',
            'version': '0.2.0',
            'readingLabel': ['pinyin', 'pinyin'],
        },
        'words': words,
    }
    OUT.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(words)} words → {OUT.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
