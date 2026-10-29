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

from zh_pinyin import pinyin_line, syllables_for, word_mismatch

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
八 | bā | num. | other | tám | 我|八|点|去|学校。 | Tám giờ tôi đến trường. | 8️⃣
九 | jiǔ | num. | other | chín | 现在|九|点。 | Bây giờ là chín giờ. | 9️⃣
六 | liù | num. | other | sáu | 我|家|有|六|口|人。 | Nhà tôi có sáu người. | 6️⃣
七 | qī | num. | other | bảy | 一|个|星期|有|七|天。 | Một tuần có bảy ngày. | 7️⃣
四 | sì | num. | other | bốn | 我|有|四|本|书。 | Tôi có bốn quyển sách. | 4️⃣
五 | wǔ | num. | other | năm (số 5) | 我们|五|点|回|家。 | Năm giờ chúng tôi về nhà. | 5️⃣
岁 | suì | n. | noun | tuổi | 我|女儿|五|岁。 | Con gái tôi năm tuổi. | 🎂
号 | hào | n. | noun | ngày (trong tháng); số | 今天|几|号？ | Hôm nay ngày mấy? | 🗒️
分钟 | fēnzhōng | n. | noun | phút | 我|等|了|十|分钟。 | Tôi đã đợi mười phút. | ⏱️
电影 | diànyǐng | n. | noun | phim | 我|喜欢|看|电影。 | Tôi thích xem phim. | 🎬
后面 | hòumiàn | n. | noun | phía sau | 学校|后面|有|一|个|商店。 | Phía sau trường có một cửa hàng. | 🔙
前面 | qiánmiàn | n. | noun | phía trước | 医院|在|前面。 | Bệnh viện ở phía trước. | ⏩
里 | lǐ | n. | noun | trong, bên trong | 杯子|里|有|水。 | Trong cốc có nước. | 📥
上 | shàng | n. | noun | trên, phía trên | 猫|在|椅子|上。 | Con mèo ở trên ghế. | 🔝
下 | xià | n. | noun | dưới; sau, tới (下个月: tháng sau) | 下|个|月|我|去|北京。 | Tháng sau tôi đi Bắc Kinh. | ⬇️
哪 | nǎ | pron. | pronoun | nào | 你|是|哪|国|人？ | Bạn là người nước nào? | 🌏
怎么 | zěnme | pron. | pronoun | thế nào, sao (hỏi cách làm) | 去|医院|怎么|走？ | Đi đến bệnh viện thế nào? | 🧭
怎么样 | zěnmeyàng | pron. | pronoun | thế nào (hỏi tình hình, ý kiến) | 这个|菜|怎么样？ | Món này thế nào? | ⁉️
请 | qǐng | v. | verb | mời; xin, làm ơn | 请|进！ | Mời vào! | 🤗
同学 | tóngxué | n. | noun | bạn học | 他|是|我|的|同学。 | Cậu ấy là bạn học của tôi. | 🧑‍🎓
喂 | wèi | expr. | other | a lô (nghe điện thoại) | 喂，|你好！ | A lô, xin chào! | ☎️
些 | xiē | m. | other | một số, vài | 我|想|买|些|水果。 | Tôi muốn mua ít trái cây. | 🧺
一点儿 | yìdiǎnr | m. | other | một chút | 我|会|说|一点儿|汉语。 | Tôi biết nói một chút tiếng Trung. | 🤏
看见 | kànjiàn | v. | verb | nhìn thấy | 你|看见|我|的|猫|了|吗？ | Bạn có thấy con mèo của tôi không? | 👁️
哥哥 | gēge | n. | noun | anh trai | 我|哥哥|是|医生。 | Anh trai tôi là bác sĩ. | 👦
姐姐 | jiějie | n. | noun | chị gái | 我|姐姐|在|北京|工作。 | Chị gái tôi làm việc ở Bắc Kinh. | 👩‍💼
弟弟 | dìdi | n. | noun | em trai | 我|弟弟|今年|八|岁。 | Em trai tôi năm nay tám tuổi. | 🧒
妹妹 | mèimei | n. | noun | em gái | 我|妹妹|喜欢|猫。 | Em gái tôi thích mèo. | 👧🏻
孩子 | háizi | n. | noun | đứa trẻ; con (cái) | 孩子|在|睡觉。 | Đứa bé đang ngủ. | 👶
丈夫 | zhàngfu | n. | noun | chồng | 她|丈夫|是|老师。 | Chồng cô ấy là giáo viên. | 🤵
妻子 | qīzi | n. | noun | vợ | 我|妻子|会|说|汉语。 | Vợ tôi biết nói tiếng Trung. | 👰
身体 | shēntǐ | n. | noun | cơ thể; sức khoẻ | 你|身体|好|吗？ | Bạn có khoẻ không? | 💪
眼睛 | yǎnjing | n. | noun | mắt | 她|的|眼睛|很|大。 | Mắt cô ấy rất to. | 👀
生病 | shēngbìng | v. | verb | bị ốm | 我|生病|了。 | Tôi bị ốm rồi. | 🤒
药 | yào | n. | noun | thuốc | 你|要|吃|药。 | Bạn phải uống thuốc. | 💊
累 | lèi | adj. | adjective | mệt | 今天|我|很|累。 | Hôm nay tôi rất mệt. | 😩
休息 | xiūxi | v. | verb | nghỉ ngơi | 你|休息|一下|吧。 | Bạn nghỉ một chút đi. | 🛋️
颜色 | yánsè | n. | noun | màu sắc | 你|喜欢|什么|颜色？ | Bạn thích màu gì? | 🎨
红色 | hóngsè | n. | noun | màu đỏ | 我|喜欢|红色。 | Tôi thích màu đỏ. | 🔴
白色 | báisè | n. | noun | màu trắng | 这|件|衣服|是|白色|的。 | Bộ quần áo này màu trắng. | ⚪
黑色 | hēisè | n. | noun | màu đen | 他|的|猫|是|黑色|的。 | Con mèo của anh ấy màu đen. | ⚫
鸡蛋 | jīdàn | n. | noun | trứng gà | 我|早上|吃|鸡蛋。 | Buổi sáng tôi ăn trứng gà. | 🥚
牛奶 | niúnǎi | n. | noun | sữa bò | 孩子|每天|喝|牛奶。 | Ngày nào đứa bé cũng uống sữa. | 🍼
面条 | miàntiáo | n. | noun | mì sợi | 中午|我|吃|面条。 | Buổi trưa tôi ăn mì. | 🍜
鱼 | yú | n. | noun | cá | 妈妈|做|的|鱼|很|好吃。 | Cá mẹ nấu rất ngon. | 🐟
羊肉 | yángròu | n. | noun | thịt cừu | 北京|人|喜欢|吃|羊肉。 | Người Bắc Kinh thích ăn thịt cừu. | 🍖
西瓜 | xīguā | n. | noun | dưa hấu | 夏天|的|西瓜|很|好吃。 | Dưa hấu mùa hè rất ngon. | 🍉
饿 | è | adj. | adjective | đói | 我|饿|了。 | Tôi đói rồi. | 🤤
早上 | zǎoshang | n. | noun | sáng sớm | 我|早上|六|点|起床。 | Tôi dậy lúc sáu giờ sáng. | 🌅
晚上 | wǎnshang | n. | noun | buổi tối | 晚上|我|看|电视。 | Buổi tối tôi xem tivi. | 🌙
小时 | xiǎoshí | n. | noun | tiếng (đồng hồ) | 我|每天|工作|八|个|小时。 | Mỗi ngày tôi làm việc tám tiếng. | ⏳
时间 | shíjiān | n. | noun | thời gian | 现在|没有|时间|了。 | Bây giờ không còn thời gian nữa. | ⌛
每 | měi | pron. | pronoun | mỗi | 我|每|天|学习|汉语。 | Ngày nào tôi cũng học tiếng Trung. | 🔁
已经 | yǐjīng | adv. | adverb | đã … rồi | 我|已经|吃|饭|了。 | Tôi ăn cơm rồi. | ✔️
去年 | qùnián | n. | noun | năm ngoái | 我|去年|去|了|中国。 | Năm ngoái tôi đã đi Trung Quốc. | 📅
生日 | shēngrì | n. | noun | sinh nhật | 今天|是|我|的|生日。 | Hôm nay là sinh nhật tôi. | 🎂
便宜 | piányi | adj. | adjective | rẻ | 这|件|衣服|很|便宜。 | Bộ quần áo này rất rẻ. | 🏷️
贵 | guì | adj. | adjective | đắt | 这儿|的|咖啡|太|贵|了。 | Cà phê ở đây đắt quá. | 💸
卖 | mài | v. | verb | bán | 这个|商店|卖|水果。 | Cửa hàng này bán trái cây. | 🏪
件 | jiàn | m. | other | chiếc, bộ (lượng từ cho quần áo, sự việc) | 我|想|买|这|件|衣服。 | Tôi muốn mua bộ quần áo này. | 👕
两 | liǎng | num. | other | hai (đứng trước lượng từ) | 我|有|两|个|妹妹。 | Tôi có hai em gái. | ✌️
百 | bǎi | num. | other | trăm | 这|本|书|一百|块。 | Quyển sách này một trăm tệ. | 💯
手机 | shǒujī | n. | noun | điện thoại di động | 我|的|手机|在|哪儿？ | Điện thoại của tôi đâu rồi? | 📱
手表 | shǒubiǎo | n. | noun | đồng hồ đeo tay | 这|块|手表|很|贵。 | Chiếc đồng hồ này rất đắt. | ⌚
公共汽车 | gōnggòng qìchē | n. | noun | xe buýt | 我|坐|公共汽车|去|学校。 | Tôi đi xe buýt đến trường. | 🚌
路 | lù | n. | noun | đường, con đường | 这|条|路|很|长。 | Con đường này rất dài. | 🛣️
远 | yuǎn | adj. | adjective | xa | 学校|离|我|家|很|远。 | Trường cách nhà tôi rất xa. | 🔭
近 | jìn | adj. | adjective | gần | 医院|离|这儿|很|近。 | Bệnh viện cách đây rất gần. | 🤏
走 | zǒu | v. | verb | đi bộ; rời đi | 我们|走|吧！ | Chúng ta đi thôi! | 🚶
左边 | zuǒbian | n. | noun | bên trái | 商店|在|医院|左边。 | Cửa hàng ở bên trái bệnh viện. | ⬅️
右边 | yòubian | n. | noun | bên phải | 我|家|在|学校|右边。 | Nhà tôi ở bên phải trường học. | ➡️
机场 | jīchǎng | n. | noun | sân bay | 我们|坐|出租车|去|机场。 | Chúng tôi đi taxi ra sân bay. | 🛫
旅游 | lǚyóu | v. | verb | đi du lịch | 我|想|去|中国|旅游。 | Tôi muốn đi du lịch Trung Quốc. | 🧳
考试 | kǎoshì | n. | noun | kỳ thi, bài thi | 明天|有|汉语|考试。 | Ngày mai có bài thi tiếng Trung. | 📝
问题 | wèntí | n. | noun | câu hỏi; vấn đề | 我|有|一|个|问题。 | Tôi có một câu hỏi. | ❔
教室 | jiàoshì | n. | noun | phòng học | 老师|在|教室|里。 | Thầy giáo ở trong phòng học. | 🏫
公司 | gōngsī | n. | noun | công ty | 我|在|一|家|公司|工作。 | Tôi làm việc ở một công ty. | 🏢
上班 | shàngbān | v. | verb | đi làm | 爸爸|八|点|上班。 | Bố đi làm lúc tám giờ. | 💼
懂 | dǒng | v. | verb | hiểu | 你|懂|了|吗？ | Bạn hiểu chưa? | 💡
知道 | zhīdào | v. | verb | biết (một điều gì) | 我|不|知道。 | Tôi không biết. | 🤷
帮助 | bāngzhù | v./n. | verb | giúp đỡ; sự giúp đỡ | 谢谢|你|的|帮助！ | Cảm ơn sự giúp đỡ của bạn! | 🤲
介绍 | jièshào | v. | verb | giới thiệu | 我|来|介绍|一下。 | Để tôi giới thiệu một chút. | 🙌
运动 | yùndòng | v./n. | verb | tập thể thao; thể thao | 我|每天|都|运动。 | Ngày nào tôi cũng tập thể thao. | 🏋️
游泳 | yóuyǒng | v. | verb | bơi | 夏天|我|喜欢|游泳。 | Mùa hè tôi thích bơi. | 🏊
跑步 | pǎobù | v. | verb | chạy bộ | 他|早上|跑步。 | Anh ấy chạy bộ vào buổi sáng. | 🏃‍♂️
唱歌 | chànggē | v. | verb | hát | 她|很|喜欢|唱歌。 | Cô ấy rất thích hát. | 🎤
跳舞 | tiàowǔ | v. | verb | nhảy, khiêu vũ | 我们|去|跳舞|吧！ | Chúng ta đi nhảy đi! | 💃
踢足球 | tī zúqiú | v. | verb | đá bóng | 他|喜欢|踢足球。 | Cậu ấy thích đá bóng. | ⚽
玩 | wán | v. | verb | chơi | 孩子|在|外面|玩。 | Đứa trẻ đang chơi ở ngoài. | 🪁
晴 | qíng | adj. | adjective | (trời) nắng, quang | 今天|是|晴|天。 | Hôm nay trời nắng. | ☀️
雪 | xuě | n. | noun | tuyết | 北京|下|雪|了。 | Bắc Kinh có tuyết rơi rồi. | ❄️
高 | gāo | adj. | adjective | cao | 我|哥哥|很|高。 | Anh trai tôi rất cao. | 🦒
长 | cháng | adj. | adjective | dài | 她|的|头发|很|长。 | Tóc cô ấy rất dài. | 📏
新 | xīn | adj. | adjective | mới | 这|是|我|的|新|手机。 | Đây là điện thoại mới của tôi. | ✨
快 | kuài | adj. | adjective | nhanh | 他|走|得|很|快。 | Anh ấy đi rất nhanh. | ⚡
慢 | màn | adj. | adjective | chậm | 请|说|慢|一点儿。 | Xin nói chậm một chút. | 🐢
难 | nán | adj. | adjective | khó | 这个|问题|很|难。 | Câu hỏi này rất khó. | 🧩
有意思 | yǒu yìsi | adj. | adjective | thú vị, hay | 这|本|书|很|有意思。 | Quyển sách này rất thú vị. | 🤩
可以 | kěyǐ | v. | verb | có thể; được phép | 我|可以|坐|这儿|吗？ | Tôi ngồi đây được không? | 🙆
因为 | yīnwèi | conj. | conjunction | vì, bởi vì | 因为|下雨，|我|不|去|了。 | Vì trời mưa nên tôi không đi nữa. | 🔗
所以 | suǒyǐ | conj. | conjunction | cho nên, vì vậy | 我|很|累，|所以|想|休息。 | Tôi rất mệt nên muốn nghỉ ngơi. | 🔀
但是 | dànshì | conj. | conjunction | nhưng | 汉语|很|难，|但是|很|有意思。 | Tiếng Trung khó nhưng rất thú vị. | ⚖️
饭 | fàn | n. | noun | bữa ăn; cơm | 我们|一起|吃|饭|吧。 | Chúng ta cùng ăn cơm nhé. | 🍱
吧 | ba | part. | other | nhé, đi (rủ rê); chắc là (đoán) | 你|是|老师|吧？ | Bạn là giáo viên phải không? | 💬
口 | kǒu | m. | other | miệng; (lượng từ đếm người trong nhà) | 我|家|有|四|口|人。 | Nhà tôi có bốn người. | 👄
给 | gěi | v./prep. | verb | cho, đưa; cho (ai) | 妈妈|给|我|一|个|苹果。 | Mẹ cho tôi một quả táo. | 🎁
天 | tiān | n. | noun | ngày; trời | 我|在|北京|住|了|三|天。 | Tôi đã ở Bắc Kinh ba ngày. | 🗓️
春天 | chūntiān | n. | noun | mùa xuân | 春天|的|天气|很|好。 | Thời tiết mùa xuân rất đẹp. | 🌸
夏天 | xiàtiān | n. | noun | mùa hè | 北京|的|夏天|很|热。 | Mùa hè ở Bắc Kinh rất nóng. | 🏖️
秋天 | qiūtiān | n. | noun | mùa thu | 我|最|喜欢|秋天。 | Tôi thích mùa thu nhất. | 🍂
冬天 | dōngtiān | n. | noun | mùa đông | 冬天|我|喜欢|喝|热|茶。 | Mùa đông tôi thích uống trà nóng. | ⛄
杯 | bēi | m. | other | cốc, ly (lượng từ cho đồ uống) | 我|要|一|杯|咖啡。 | Tôi muốn một cốc cà phê. | 🧋
只 | zhī | m. | other | con (lượng từ cho con vật nhỏ) | 我|家|有|一|只|狗。 | Nhà tôi có một con chó. | 🐾
条 | tiáo | m. | other | con, cái (lượng từ cho vật dài) | 我|买|了|一|条|鱼。 | Tôi đã mua một con cá. | 🎏
张 | zhāng | m. | other | tờ, tấm (lượng từ cho vật phẳng) | 这|张|桌子|很|大。 | Cái bàn này rất to. | 📄
起床 | qǐchuáng | v. | verb | thức dậy, ra khỏi giường | 你|几|点|起床？ | Bạn mấy giờ dậy? | ⏰
今年 | jīnnián | n. | noun | năm nay | 你|今年|多|大？ | Năm nay bạn bao nhiêu tuổi? | 🎉
要 | yào | v. | verb | muốn; cần, phải | 我|要|这个。 | Tôi muốn cái này. | 🙋‍♂️
一下 | yíxià | expr. | other | một chút, thử (sau động từ) | 请|等|一下。 | Xin đợi một chút. | 🤏🏻
离 | lí | prep. | preposition | cách (bao xa) | 我|家|离|学校|很|近。 | Nhà tôi cách trường rất gần. | 📐
也 | yě | adv. | adverb | cũng | 我|也|是|学生。 | Tôi cũng là học sinh. | ➕
晚 | wǎn | adj. | adjective | muộn | 现在|太|晚|了。 | Bây giờ muộn quá rồi. | 🌃
越南 | Yuènán | n. | noun | Việt Nam | 越南|菜|很|好吃。 | Món ăn Việt Nam rất ngon. | 🇻🇳
音乐 | yīnyuè | n. | noun | âm nhạc | 这个|音乐|很|好听。 | Bản nhạc này rất hay. | 🎵
汉字 | Hànzì | n. | noun | chữ Hán | 汉字|很|有意思。 | Chữ Hán rất thú vị. | 🀄
开车 | kāichē | v. | verb | lái xe | 爸爸|开车|去|上班。 | Bố lái xe đi làm. | 🚗
门 | mén | n. | noun | cửa | 门|在|那儿。 | Cửa ở kia. | 🚪
用 | yòng | v. | verb | dùng | 我|用|手机|打电话。 | Tôi dùng điện thoại di động để gọi. | 🛠️
等 | děng | v. | verb | đợi, chờ | 我|在|这儿|等|你。 | Tôi đợi bạn ở đây. | ⏱️
进 | jìn | v. | verb | vào | 请|进！ | Mời vào! | 🚶‍♀️
外面 | wàimiàn | n. | noun | bên ngoài | 外面|下雨|了。 | Bên ngoài trời mưa rồi. | 🌧️
头发 | tóufa | n. | noun | tóc | 我|妹妹|的|头发|很|漂亮。 | Tóc em gái tôi rất đẹp. | 💇
一起 | yìqǐ | adv. | adverb | cùng nhau | 我们|一起|去|吧。 | Chúng ta cùng đi nhé. | 👯
带 | dài | v. | verb | mang theo; dẫn, đưa (ai đi) | 我|带|你|去|商店。 | Tôi dẫn bạn đi cửa hàng. | 🎒
白 | bái | adj. | adjective | trắng | 她|的|衣服|很|白。 | Quần áo cô ấy rất trắng. | 🤍
报纸 | bàozhǐ | n. | noun | báo (giấy) | 爸爸|每天|看|报纸。 | Ngày nào bố cũng đọc báo. | 📰
比 | bǐ | prep. | preposition | so với, hơn | 哥哥|比|我|高。 | Anh trai cao hơn tôi. | 📊
别 | bié | adv. | adverb | đừng | 别|走！ | Đừng đi! | ✋
出 | chū | v. | verb | ra | 他|出|去|了。 | Anh ấy ra ngoài rồi. | 🚪➡️
穿 | chuān | v. | verb | mặc; đi (giày) | 今天|很|冷，|你|要|多|穿|衣服。 | Hôm nay lạnh, bạn phải mặc thêm áo. | 🧥
船 | chuán | n. | noun | thuyền, tàu thuỷ | 我们|坐|船|去。 | Chúng tôi đi thuyền. | ⛴️
次 | cì | m. | other | lần (lượng từ) | 我|去|过|两|次|北京。 | Tôi đã đến Bắc Kinh hai lần. | 🔂
从 | cóng | prep. | preposition | từ (nơi, lúc) | 我|从|越南|来。 | Tôi đến từ Việt Nam. | 🛬
错 | cuò | adj. | adjective | sai | 对不起，|我|错|了。 | Xin lỗi, tôi sai rồi. | ❌
打篮球 | dǎ lánqiú | v. | verb | chơi bóng rổ | 他|喜欢|打篮球。 | Anh ấy thích chơi bóng rổ. | 🏀
大家 | dàjiā | pron. | pronoun | mọi người | 大家|好！ | Chào mọi người! | 👥
到 | dào | v. | verb | tới nơi, đến (đích) | 我|到|家|了。 | Tôi về đến nhà rồi. | 🏁
得 | de | part. | other | (trợ từ nối động từ với lời nhận xét) | 他|走|得|很|快。 | Anh ấy đi rất nhanh. | 🎯
第一 | dìyī | num. | other | thứ nhất | 这|是|我|第一|次|来|中国。 | Đây là lần đầu tiên tôi đến Trung Quốc. | 🥇
房间 | fángjiān | n. | noun | căn phòng | 我|的|房间|很|小。 | Phòng của tôi rất nhỏ. | 🛏️
非常 | fēicháng | adv. | adverb | vô cùng, cực kỳ | 今天|非常|热。 | Hôm nay nóng vô cùng. | 🔥
服务员 | fúwùyuán | n. | noun | người phục vụ | 服务员，|请|给|我|一|杯|茶。 | Phục vụ ơi, cho tôi một cốc trà. | 🧑‍🍳
告诉 | gàosu | v. | verb | nói cho biết, bảo | 请|告诉|我|你|的|名字。 | Hãy cho tôi biết tên bạn. | 🗣️
公斤 | gōngjīn | m. | other | ki-lô-gam (cân) | 我|买|了|两|公斤|苹果。 | Tôi đã mua hai cân táo. | ⚖️
还 | hái | adv. | adverb | vẫn, còn | 他|还|在|睡觉。 | Anh ấy vẫn đang ngủ. | 🔄
黑 | hēi | adj. | adjective | đen; tối | 外面|很|黑。 | Bên ngoài rất tối. | 🌑
红 | hóng | adj. | adjective | đỏ | 她|的|脸|很|红。 | Mặt cô ấy đỏ bừng. | 🍒
欢迎 | huānyíng | v. | verb | hoan nghênh, chào mừng | 欢迎|你|来|越南！ | Chào mừng bạn đến Việt Nam! | 🎊
回答 | huídá | v. | verb | trả lời | 请|回答|我|的|问题。 | Hãy trả lời câu hỏi của tôi. | 💬
就 | jiù | adv. | adverb | thì; ngay, liền | 我|马上|就|来。 | Tôi đến ngay. | ⏩
觉得 | juéde | v. | verb | cảm thấy, thấy rằng | 我|觉得|汉语|很|有意思。 | Tôi thấy tiếng Trung rất thú vị. | 🤔
开始 | kāishǐ | v. | verb | bắt đầu | 我们|开始|上|课|吧。 | Chúng ta bắt đầu vào học nhé. | 🚀
可能 | kěnéng | adv. | adverb | có lẽ, có thể | 明天|可能|下雨。 | Ngày mai có lẽ sẽ mưa. | 🌦️
课 | kè | n. | noun | bài học, tiết học | 今天|有|汉语|课。 | Hôm nay có tiết tiếng Trung. | 📘
快乐 | kuàilè | adj. | adjective | vui vẻ | 生日|快乐！ | Chúc mừng sinh nhật! | 🥳
忙 | máng | adj. | adjective | bận | 我|今天|很|忙。 | Hôm nay tôi rất bận. | 🏃‍♀️
男人 | nánrén | n. | noun | đàn ông | 那个|男人|是|我|的|老师。 | Người đàn ông kia là thầy giáo của tôi. | 👨‍💼
女人 | nǚrén | n. | noun | phụ nữ | 那个|女人|是|医生。 | Người phụ nữ kia là bác sĩ. | 👩‍⚕️
您 | nín | pron. | pronoun | ông, bà, ngài (lịch sự) | 您|好！ | Kính chào ông/bà! | 🙇‍♂️
旁边 | pángbiān | n. | noun | bên cạnh | 商店|在|学校|旁边。 | Cửa hàng ở cạnh trường học. | ↔️
票 | piào | n. | noun | vé | 我|买|了|两|张|票。 | Tôi đã mua hai vé. | 🎫
千 | qiān | num. | other | nghìn | 这个|手机|三|千|块。 | Chiếc điện thoại này ba nghìn tệ. | 🔢
让 | ràng | v. | verb | để, bảo (ai làm gì) | 妈妈|让|我|去|买|水果。 | Mẹ bảo tôi đi mua trái cây. | 👉
事情 | shìqing | n. | noun | việc, chuyện | 我|有|一|件|事情。 | Tôi có một việc. | 📌
送 | sòng | v. | verb | tặng; tiễn, đưa | 我|送|你|一|本|书。 | Tôi tặng bạn một quyển sách. | 💝
它 | tā | pron. | pronoun | nó (con vật, đồ vật) | 我|有|一|只|猫，|它|很|小。 | Tôi có một con mèo, nó rất nhỏ. | 🐈
踢 | tī | v. | verb | đá (bằng chân) | 别|踢|门！ | Đừng đá cửa! | 🦶
题 | tí | n. | noun | đề, câu (bài tập) | 这|道|题|很|难。 | Câu này rất khó. | ✏️
外 | wài | n. | noun | ngoài | 门|外|有|人。 | Ngoài cửa có người. | 🌳
完 | wán | v. | verb | xong, hết | 我|吃|完|了。 | Tôi ăn xong rồi. | 🏆
为 | wèi | prep. | preposition | vì, cho | 我|为|你|高兴。 | Tôi mừng cho bạn. | 🤗
问 | wèn | v. | verb | hỏi | 我|可以|问|你|一|个|问题|吗？ | Tôi hỏi bạn một câu được không? | 🙋‍♀️
希望 | xīwàng | v. | verb | hy vọng, mong | 我|希望|明天|不|下雨。 | Tôi hy vọng ngày mai không mưa. | 🌈
洗 | xǐ | v. | verb | rửa, giặt | 吃|饭|前|要|洗|手。 | Trước khi ăn phải rửa tay. | 🧼
向 | xiàng | prep. | preposition | về phía, hướng về | 向|左边|走。 | Đi về phía bên trái. | 🧭
笑 | xiào | v. | verb | cười | 她|笑|了。 | Cô ấy cười. | 😄
姓 | xìng | v. | verb | họ (là) | 我|姓|王。 | Tôi họ Vương. | 🪪
意思 | yìsi | n. | noun | ý nghĩa | 这个|字|是|什么|意思？ | Chữ này nghĩa là gì? | 💭
阴 | yīn | adj. | adjective | (trời) âm u, nhiều mây | 今天|是|阴|天。 | Hôm nay trời âm u. | ☁️
元 | yuán | m. | other | đồng (đơn vị tiền tệ) | 一|杯|茶|十|元。 | Một cốc trà mười đồng. | 💰
再 | zài | adv. | adverb | lại, nữa | 请|再|说|一|次。 | Xin nói lại một lần nữa. | 🔁
找 | zhǎo | v. | verb | tìm | 我|在|找|我|的|手机。 | Tôi đang tìm điện thoại. | 🔍
着 | zhe | part. | other | (trợ từ: đang, vẫn ở trạng thái) | 门|开|着。 | Cửa đang mở. | 🚪
真 | zhēn | adv. | adverb | thật, thật là | 你|真|漂亮！ | Bạn thật xinh! | 😍
正在 | zhèngzài | adv. | adverb | đang | 我|正在|吃|饭。 | Tôi đang ăn cơm. | ⏯️
准备 | zhǔnbèi | v. | verb | chuẩn bị | 我|在|准备|考试。 | Tôi đang chuẩn bị cho kỳ thi. | 📋
自行车 | zìxíngchē | n. | noun | xe đạp | 我|骑|自行车|去|学校。 | Tôi đạp xe đến trường. | 🚲
最 | zuì | adv. | adverb | nhất | 我|最|喜欢|夏天。 | Tôi thích mùa hè nhất. | 🏅
啊 | a | part. | other | à, quá, nhỉ (trợ từ cảm thán cuối câu) | 今天|天气|真|好|啊！ | Hôm nay trời đẹp quá! | 😮
把 | bǎ | prep. | preposition | (đưa tân ngữ lên trước động từ: đem, lấy) | 请|把|门|关|上。 | Làm ơn đóng cửa lại. | 🚪
被 | bèi | prep. | preposition | bị (câu bị động) | 我|的|自行车|被|人|骑|走|了。 | Xe đạp của tôi bị người ta lấy mất rồi. | 🚲
自己 | zìjǐ | pron. | pronoun | tự mình, bản thân | 我|自己|做|饭。 | Tôi tự nấu cơm. | 🙋
如果 | rúguǒ | conj. | conjunction | nếu | 如果|明天|下雨，|我|就|不|去|了。 | Nếu mai trời mưa thì tôi không đi nữa. | 🌧️
又 | yòu | adv. | adverb | lại (lặp lại, đã xảy ra) | 他|今天|又|迟到|了。 | Hôm nay anh ấy lại đến muộn. | 🔁
更 | gèng | adv. | adverb | càng, hơn nữa | 我|更|喜欢|喝|茶。 | Tôi thích uống trà hơn. | ⬆️
需要 | xūyào | v. | verb | cần (có), cần đến | 你|需要|帮助|吗？ | Bạn có cần giúp không? | 🆘
地 | de | part. | other | (trợ từ: nối trạng ngữ với động từ) | 他|高兴|地|笑|了。 | Anh ấy cười vui vẻ. | 🔗
才 | cái | adv. | adverb | mới (muộn hơn dự kiến) | 他|十|点|才|起床。 | Mười giờ anh ấy mới dậy. | ⏰
跟 | gēn | prep. | preposition | với, cùng (ai) | 我|跟|妈妈|去|商店。 | Tôi đi cửa hàng với mẹ. | 👩‍👦
像 | xiàng | v. | verb | giống (như) | 你|很|像|你|妈妈。 | Bạn rất giống mẹ bạn. | 🪞
还是 | háishi | conj. | conjunction | hay là (câu hỏi lựa chọn) | 你|喝|茶|还是|喝|咖啡？ | Bạn uống trà hay uống cà phê? | 🤔
认为 | rènwéi | v. | verb | cho rằng | 我|认为|他|说|得|对。 | Tôi cho rằng anh ấy nói đúng. | 💭
应该 | yīnggāi | v. | verb | nên | 你|应该|多|休息。 | Bạn nên nghỉ ngơi nhiều hơn. | 💡
位 | wèi | m. | other | vị (lượng từ lịch sự cho người) | 这|位|是|王|老师。 | Vị này là thầy Vương. | 🎩
种 | zhǒng | m. | other | loại, kiểu | 我|喜欢|这|种|水果。 | Tôi thích loại trái cây này. | 🍇
发现 | fāxiàn | v. | verb | phát hiện, nhận ra | 我|发现|钱包|不|见|了。 | Tôi phát hiện ví tiền không thấy đâu nữa. | 🔍
一定 | yídìng | adv. | adverb | nhất định, chắc chắn | 我|明天|一定|来。 | Mai tôi nhất định sẽ đến. | ✅
一直 | yìzhí | adv. | adverb | suốt, liên tục | 他|一直|在|学习。 | Anh ấy học suốt từ nãy đến giờ. | ➡️
为了 | wèile | prep. | preposition | để, vì (mục đích) | 为了|学|汉语，|他|去|了|中国。 | Để học tiếng Trung, anh ấy đã sang Trung Quốc. | 🎯
一样 | yíyàng | adj. | adjective | giống nhau | 我们|的|衣服|一样。 | Quần áo của chúng ta giống nhau. | 👯
世界 | shìjiè | n. | noun | thế giới | 我|想|去|看看|世界。 | Tôi muốn đi ngắm thế giới. | 🌍
而且 | érqiě | conj. | conjunction | mà còn, hơn nữa | 她|很|漂亮，|而且|很|聪明。 | Cô ấy rất xinh, mà còn rất thông minh. | ➕
重要 | zhòngyào | adj. | adjective | quan trọng | 身体|很|重要。 | Sức khỏe rất quan trọng. | ❗
必须 | bìxū | adv. | adverb | phải, bắt buộc | 你|必须|早|点|睡觉。 | Bạn phải đi ngủ sớm hơn. | ⚠️
地方 | dìfang | n. | noun | nơi, chỗ | 这|是|什么|地方？ | Đây là nơi nào? | 📍
老 | lǎo | adj. | adjective | già, cũ | 我|的|爷爷|很|老|了。 | Ông nội tôi già lắm rồi. | 👴
其他 | qítā | pron. | pronoun | (những người, cái) khác | 其他|人|都|走|了。 | Những người khác đi hết rồi. | 👥
比赛 | bǐsài | n. | noun | trận đấu, cuộc thi | 今天|有|足球|比赛。 | Hôm nay có trận đấu bóng đá. | 🏆
然后 | ránhòu | conj. | conjunction | sau đó | 我|先|吃|饭，|然后|看|书。 | Tôi ăn cơm trước, sau đó đọc sách. | 🔜
担心 | dānxīn | v. | verb | lo lắng | 别|担心，|我|没|事。 | Đừng lo, tôi không sao. | 😟
放 | fàng | v. | verb | đặt, để (vào đâu) | 把|书|放|在|桌子|上。 | Đặt sách lên bàn. | 📥
拿 | ná | v. | verb | cầm, lấy | 你|手|里|拿|着|什么？ | Trong tay bạn cầm cái gì vậy? | 🤲
为什么 | wèishénme | pron. | pronoun | tại sao | 你|为什么|不|高兴？ | Sao bạn không vui? | ❔
先 | xiān | adv. | adverb | trước (làm trước) | 你|先|走|吧。 | Bạn đi trước đi. | ⏮️
关系 | guānxi | n. | noun | quan hệ, mối quan hệ | 他们|的|关系|很|好。 | Quan hệ của họ rất tốt. | 🔗
出现 | chūxiàn | v. | verb | xuất hiện | 太阳|出现|了。 | Mặt trời xuất hiện rồi. | ☀️
了解 | liǎojiě | v. | verb | hiểu rõ, tìm hiểu | 我|很|了解|他。 | Tôi rất hiểu anh ấy. | 🧐
过去 | guòqù | n. | noun | quá khứ, trước đây | 过去|的|事|别|想|了。 | Chuyện đã qua đừng nghĩ nữa. | ⏳
参加 | cānjiā | v. | verb | tham gia | 我|想|参加|足球|比赛。 | Tôi muốn tham gia thi đấu bóng đá. | 🙋‍♀️
国家 | guójiā | n. | noun | đất nước, quốc gia | 越南|是|一|个|美丽|的|国家。 | Việt Nam là một đất nước xinh đẹp. | 🏳️
决定 | juédìng | v. | verb | quyết định | 我|决定|学|汉语。 | Tôi quyết định học tiếng Trung. | ✔️
分 | fēn | m. | other | phút (khi nói giờ); điểm (bài thi) | 现在|三|点|十|分。 | Bây giờ là ba giờ mười phút. | 🕒
选择 | xuǎnzé | v. | verb | lựa chọn | 你|选择|哪|个？ | Bạn chọn cái nào? | 🗳️
或者 | huòzhě | conj. | conjunction | hoặc (trong câu kể) | 我|周末|去|游泳|或者|跑步。 | Cuối tuần tôi đi bơi hoặc chạy bộ. | 🔀
机会 | jīhuì | n. | noun | cơ hội | 这|是|一|个|好|机会。 | Đây là một cơ hội tốt. | 🍀
别人 | biérén | pron. | pronoun | người khác | 不要|问|别人。 | Đừng hỏi người khác. | 🧑‍🤝‍🧑
站 | zhàn | v./n. | verb | đứng; bến, ga | 他|站|在|门口。 | Anh ấy đứng ở cửa. | 🧍
使 | shǐ | v. | verb | khiến, làm cho | 这|件|事|使|我|很|高兴。 | Chuyện này khiến tôi rất vui. | 😊
其实 | qíshí | adv. | adverb | thật ra | 其实|我|不|喜欢|喝|咖啡。 | Thật ra tôi không thích uống cà phê. | 🤫
以后 | yǐhòu | n. | noun | sau này, về sau | 以后|我|想|当|老师。 | Sau này tôi muốn làm giáo viên. | 🔮
要求 | yāoqiú | v./n. | verb | yêu cầu | 老师|要求|我们|每天|写|汉字。 | Thầy yêu cầu chúng tôi viết chữ Hán mỗi ngày. | 📋
信 | xìn | n. | noun | thư, lá thư | 我|给|妈妈|写|了|一|封|信。 | Tôi đã viết cho mẹ một lá thư. | ✉️
当然 | dāngrán | adv. | adverb | đương nhiên, tất nhiên | 我|当然|记得|你。 | Tất nhiên tôi nhớ bạn. | 👌
接 | jiē | v. | verb | đón; nghe (điện thoại) | 我|去|机场|接|朋友。 | Tôi ra sân bay đón bạn. | 🤝
相信 | xiāngxìn | v. | verb | tin, tin tưởng | 我|相信|你。 | Tôi tin bạn. | 🫶
花 | huā | n./v. | noun | hoa; tiêu (tiền, thời gian) | 这|些|花|真|漂亮！ | Những bông hoa này đẹp thật! | 🌸
虽然 | suīrán | conj. | conjunction | tuy, mặc dù | 虽然|下雨|了，|但是|他|还是|来|了。 | Tuy trời mưa nhưng anh ấy vẫn đến. | 🌂
解决 | jiějué | v. | verb | giải quyết | 这|个|问题|很|难|解决。 | Vấn đề này rất khó giải quyết. | 🛠️
关于 | guānyú | prep. | preposition | về (chủ đề gì) | 这|是|一|本|关于|中国|的|书。 | Đây là một cuốn sách về Trung Quốc. | 📖
完成 | wánchéng | v. | verb | hoàn thành | 我|完成|作业|了。 | Tôi làm xong bài tập rồi. | 🏁
结束 | jiéshù | v. | verb | kết thúc | 比赛|结束|了。 | Trận đấu kết thúc rồi. | 🔚
努力 | nǔlì | adj./v. | adjective | chăm chỉ, cố gắng | 他|学习|很|努力。 | Anh ấy học rất chăm chỉ. | 💪
以前 | yǐqián | n. | noun | trước kia, ngày trước | 我|以前|住|在|北京。 | Trước kia tôi sống ở Bắc Kinh. | 🕰️
办法 | bànfǎ | n. | noun | cách, biện pháp | 我|有|一|个|好|办法。 | Tôi có một cách hay. | 🧩
特别 | tèbié | adv./adj. | adverb | đặc biệt | 今天|特别|冷。 | Hôm nay lạnh đặc biệt. | 🌟
注意 | zhùyì | v. | verb | chú ý | 过|马路|要|注意|安全。 | Qua đường phải chú ý an toàn. | 🚸
讲 | jiǎng | v. | verb | kể, giảng | 妈妈|给|我|讲|故事。 | Mẹ kể chuyện cho tôi nghe. | 🗣️
离开 | líkāi | v. | verb | rời khỏi, rời đi | 他|昨天|离开|了|北京。 | Hôm qua anh ấy đã rời Bắc Kinh. | 🧳
万 | wàn | num. | other | vạn, mười nghìn | 这|个|手机|一|万|块。 | Cái điện thoại này mười nghìn tệ. | 💴
以为 | yǐwéi | v. | verb | tưởng (là), cứ ngỡ | 我|以为|你|不|来|了。 | Tôi cứ tưởng bạn không đến nữa. | 😅
越 | yuè | adv. | adverb | càng (越…越…) | 天气|越|来|越|冷|了。 | Trời càng ngày càng lạnh. | 📈
城市 | chéngshì | n. | noun | thành phố | 北京|是|一|个|大|城市。 | Bắc Kinh là một thành phố lớn. | 🌆
影响 | yǐngxiǎng | v./n. | verb | ảnh hưởng | 天气|影响|我|的|心情。 | Thời tiết ảnh hưởng đến tâm trạng của tôi. | 🌊
游戏 | yóuxì | n. | noun | trò chơi, game | 孩子|们|在|玩|游戏。 | Bọn trẻ đang chơi trò chơi. | 🎮
马 | mǎ | n. | noun | con ngựa | 他|会|骑|马。 | Anh ấy biết cưỡi ngựa. | 🐎
比较 | bǐjiào | adv./v. | adverb | khá, tương đối; so sánh | 今天|比较|热。 | Hôm nay khá nóng. | ⚖️
最近 | zuìjìn | n. | noun | dạo này, gần đây | 你|最近|忙|吗？ | Dạo này bạn có bận không? | 📆
换 | huàn | v. | verb | đổi, thay | 我|想|换|一|件|衣服。 | Tôi muốn thay một bộ quần áo khác. | 🔄
终于 | zhōngyú | adv. | adverb | cuối cùng (thì) | 我|终于|找|到|了|我|的|钱包。 | Cuối cùng tôi cũng tìm được ví tiền. | 🎉
脸 | liǎn | n. | noun | mặt, khuôn mặt | 我|每天|早上|洗|脸。 | Sáng nào tôi cũng rửa mặt. | 🙂
除了 | chúle | prep. | preposition | ngoài … ra | 除了|汉语，|我|还|学|英语。 | Ngoài tiếng Trung, tôi còn học tiếng Anh. | 🎒
总是 | zǒngshì | adv. | adverb | lúc nào cũng, luôn luôn | 他|总是|很|忙。 | Anh ấy lúc nào cũng bận. | ♾️
双 | shuāng | m. | other | đôi (lượng từ) | 我|买|了|一|双|鞋。 | Tôi mua một đôi giày. | 👟
突然 | tūrán | adj./adv. | adjective | đột nhiên, bất ngờ | 天|突然|黑|了。 | Trời đột nhiên tối sầm. | ⚡
检查 | jiǎnchá | v. | verb | kiểm tra | 医生|在|检查|我|的|身体。 | Bác sĩ đang khám sức khỏe cho tôi. | 🩺
米 | mǐ | n./m. | noun | gạo; mét | 我|家|离|学校|五|百|米。 | Nhà tôi cách trường năm trăm mét. | 📏
容易 | róngyì | adj. | adjective | dễ | 这|个|题|很|容易。 | Câu này rất dễ. | 🍰
明白 | míngbai | v. | verb | hiểu, hiểu ra | 你|明白|我|的|意思|吗？ | Bạn hiểu ý tôi không? | 💡
记得 | jìde | v. | verb | nhớ (còn nhớ) | 你|还|记得|我|吗？ | Bạn còn nhớ tôi không? | 🧠
辆 | liàng | m. | other | chiếc (lượng từ cho xe) | 门口|有|一|辆|车。 | Trước cửa có một chiếc xe. | 🚗
简单 | jiǎndān | adj. | adjective | đơn giản | 这|个|问题|很|简单。 | Vấn đề này rất đơn giản. | 🟢
半 | bàn | num. | other | rưỡi, một nửa | 现在|八|点|半。 | Bây giờ là tám giờ rưỡi. | 🌓
愿意 | yuànyì | v. | verb | bằng lòng, sẵn lòng | 你|愿意|跟|我|一起|去|吗？ | Bạn có muốn đi cùng tôi không? | 🙏
包 | bāo | n. | noun | túi, cặp | 我|的|包|很|重。 | Túi của tôi nặng lắm. | 👜
楼 | lóu | n. | noun | tòa nhà; tầng | 我|住|在|三|楼。 | Tôi ở tầng ba. | 🏢
清楚 | qīngchu | adj. | adjective | rõ ràng, rõ | 我|听|不|清楚。 | Tôi nghe không rõ. | 🔊
照片 | zhàopiàn | n. | noun | ảnh, tấm ảnh | 这|是|我|家|的|照片。 | Đây là ảnh gia đình tôi. | 📷
银行 | yínháng | n. | noun | ngân hàng | 我|去|银行|换|钱。 | Tôi đi ngân hàng đổi tiền. | 🏦
故事 | gùshi | n. | noun | câu chuyện, truyện | 这|个|故事|很|有意思。 | Câu chuyện này rất thú vị. | 📚
一般 | yìbān | adj. | adjective | bình thường; thường thì | 我|一般|七|点|起床。 | Tôi thường dậy lúc bảy giờ. | 📊
可爱 | kě'ài | adj. | adjective | đáng yêu, dễ thương | 这|只|小|狗|真|可爱！ | Con chó con này đáng yêu thật! | 🐶
新闻 | xīnwén | n. | noun | tin tức, thời sự | 爸爸|每天|看|新闻。 | Bố xem thời sự mỗi ngày. | 📰
声音 | shēngyīn | n. | noun | âm thanh, giọng nói | 她|的|声音|很|好听。 | Giọng cô ấy rất hay. | 🎙️
马上 | mǎshàng | adv. | adverb | ngay, lập tức | 我|马上|来！ | Tôi đến ngay! | ⏱️
表示 | biǎoshì | v. | verb | bày tỏ, biểu thị | 他|向|我|表示|感谢。 | Anh ấy bày tỏ lời cảm ơn với tôi. | 🙇
经过 | jīngguò | v./prep. | verb | đi qua; trải qua | 我|每天|经过|这|家|银行。 | Ngày nào tôi cũng đi qua ngân hàng này. | 🚶
历史 | lìshǐ | n. | noun | lịch sử | 我|喜欢|学|历史。 | Tôi thích học lịch sử. | 🏛️
哭 | kū | v. | verb | khóc | 孩子|哭|了。 | Đứa bé khóc rồi. | 😢
敢 | gǎn | v. | verb | dám | 我|不|敢|看。 | Tôi không dám xem. | 🫣
会议 | huìyì | n. | noun | cuộc họp, hội nghị | 下午|有|一|个|会议。 | Chiều nay có một cuộc họp. | 👔
经常 | jīngcháng | adv. | adverb | thường xuyên | 我|经常|去|图书馆。 | Tôi thường xuyên đến thư viện. | 📅
低 | dī | adj. | adjective | thấp | 这|张|桌子|太|低|了。 | Cái bàn này thấp quá. | ⬇️
节目 | jiémù | n. | noun | chương trình (TV, biểu diễn) | 这|个|电视|节目|很|好看。 | Chương trình TV này rất hay. | 📺
健康 | jiànkāng | adj./n. | adjective | khoẻ mạnh; sức khoẻ | 祝|你|身体|健康！ | Chúc bạn mạnh khoẻ! | 🍎
结婚 | jiéhūn | v. | verb | kết hôn, cưới | 他们|明年|结婚。 | Sang năm họ cưới. | 💍
短 | duǎn | adj. | adjective | ngắn | 她|的|头发|很|短。 | Tóc cô ấy rất ngắn. | ✂️
同意 | tóngyì | v. | verb | đồng ý | 我|同意|你|的|看法。 | Tôi đồng ý với quan điểm của bạn. | 🙆
教 | jiāo | v. | verb | dạy | 王|老师|教|我们|汉语。 | Thầy Vương dạy chúng tôi tiếng Trung. | 👩‍🏫
几乎 | jīhū | adv. | adverb | hầu như, gần như | 他|几乎|每天|都|跑步。 | Anh ấy hầu như ngày nào cũng chạy bộ. | 🌗
附近 | fùjìn | n. | noun | gần đây, lân cận | 附近|有|超市|吗？ | Gần đây có siêu thị không? | 🗺️
认真 | rènzhēn | adj. | adjective | nghiêm túc, chăm chú | 他|工作|很|认真。 | Anh ấy làm việc rất nghiêm túc. | 📝
脚 | jiǎo | n. | noun | bàn chân | 我|的|脚|很|疼。 | Chân tôi đau lắm. | 🦶
主要 | zhǔyào | adj. | adjective | chủ yếu, chính | 这|是|主要|的|问题。 | Đây là vấn đề chính. | 🥇
遇到 | yùdào | v. | verb | gặp (tình cờ), gặp phải | 我|在|路|上|遇到|了|老师。 | Tôi tình cờ gặp thầy giáo trên đường. | 🚶‍♀️
年轻 | niánqīng | adj. | adjective | trẻ | 我|的|妈妈|很|年轻。 | Mẹ tôi rất trẻ. | 🧑
久 | jiǔ | adj. | adjective | lâu | 好|久|不|见！ | Lâu rồi không gặp! | ⌛
画 | huà | v./n. | verb | vẽ; bức tranh | 她|在|画|一|只|猫。 | Cô bé đang vẽ một con mèo. | 🎨
表演 | biǎoyǎn | v./n. | verb | biểu diễn | 孩子|们|在|表演|节目。 | Bọn trẻ đang biểu diễn văn nghệ. | 🎭
刚才 | gāngcái | n. | noun | vừa nãy, lúc nãy | 刚才|我|很|忙。 | Lúc nãy tôi rất bận. | ⏪
办公室 | bàngōngshì | n. | noun | văn phòng | 王|老师|在|办公室。 | Thầy Vương đang ở văn phòng. | 🗄️
环境 | huánjìng | n. | noun | môi trường | 这|里|的|环境|很|好。 | Môi trường ở đây rất tốt. | 🌳
关心 | guānxīn | v. | verb | quan tâm | 妈妈|很|关心|我。 | Mẹ rất quan tâm đến tôi. | 💗
祝 | zhù | v. | verb | chúc | 祝|你|生日|快乐！ | Chúc bạn sinh nhật vui vẻ! | 🎂
层 | céng | m. | other | tầng (lượng từ) | 这|座|楼|有|二十|层。 | Toà nhà này có hai mươi tầng. | 🏗️
腿 | tuǐ | n. | noun | chân, cẳng chân | 他|的|腿|很|长。 | Chân anh ấy rất dài. | 🦵
坏 | huài | adj. | adjective | hỏng, xấu | 我|的|手机|坏|了。 | Điện thoại của tôi hỏng rồi. | 💔
鞋 | xié | n. | noun | giày | 这|双|鞋|多少|钱？ | Đôi giày này bao nhiêu tiền? | 👞
习惯 | xíguàn | n./v. | noun | thói quen; quen với | 我|习惯|早|睡|早|起。 | Tôi quen ngủ sớm dậy sớm. | 🔂
变化 | biànhuà | n./v. | noun | sự thay đổi; thay đổi | 这|里|的|变化|很|大。 | Nơi này thay đổi rất nhiều. | 🦋
周末 | zhōumò | n. | noun | cuối tuần | 周末|你|做|什么？ | Cuối tuần bạn làm gì? | 🏖️
忘记 | wàngjì | v. | verb | quên | 我|忘记|带|钥匙|了。 | Tôi quên mang chìa khoá rồi. | 🔑
打算 | dǎsuàn | v./n. | verb | định, dự định | 你|打算|什么|时候|回|家？ | Bạn định bao giờ về nhà? | 🗓️
小心 | xiǎoxīn | v./adj. | verb | cẩn thận | 小心|车！ | Cẩn thận xe! | 🚧
动物 | dòngwù | n. | noun | động vật, con vật | 你|喜欢|什么|动物？ | Bạn thích con vật nào? | 🐼
树 | shù | n. | noun | cây | 门|前|有|一|棵|树。 | Trước cửa có một cái cây. | 🌲
借 | jiè | v. | verb | mượn; cho mượn | 我|可以|借|你|的|笔|吗？ | Tôi mượn bút của bạn được không? | 🖊️
害怕 | hàipà | v. | verb | sợ | 我|害怕|狗。 | Tôi sợ chó. | 😨
鸟 | niǎo | n. | noun | chim | 树|上|有|一|只|鸟。 | Trên cây có một con chim. | 🐦
根据 | gēnjù | prep. | preposition | theo, căn cứ vào | 根据|天气|预报，|明天|下雨。 | Theo dự báo thời tiết, mai trời mưa. | 📑
作用 | zuòyòng | n. | noun | tác dụng | 这|种|药|很|有|作用。 | Loại thuốc này rất có tác dụng. | 💊
差 | chà | adj. | adjective | kém, tệ; thiếu | 我|的|汉语|很|差。 | Tiếng Trung của tôi rất kém. | 👎
一边 | yìbiān | adv. | adverb | vừa … vừa … | 他|一边|吃|饭，|一边|看|电视。 | Anh ấy vừa ăn cơm vừa xem TV. | 🍜
极 | jí | adv. | adverb | cực kỳ (…极了) | 这|个|菜|好吃|极|了！ | Món này ngon cực kỳ! | 🔥
举行 | jǔxíng | v. | verb | tổ chức (cuộc họp, buổi lễ) | 比赛|在|北京|举行。 | Cuộc thi được tổ chức ở Bắc Kinh. | 🎪
水平 | shuǐpíng | n. | noun | trình độ | 他|的|汉语|水平|很|高。 | Trình độ tiếng Trung của anh ấy rất cao. | 📶
照顾 | zhàogù | v. | verb | chăm sóc | 她|在|家|照顾|孩子。 | Cô ấy ở nhà chăm con. | 🤱
文化 | wénhuà | n. | noun | văn hoá | 我|对|中国|文化|很|感|兴趣。 | Tôi rất hứng thú với văn hoá Trung Quốc. | 🏮
疼 | téng | adj. | adjective | đau | 我|头|疼。 | Tôi đau đầu. | 🤕
奇怪 | qíguài | adj. | adjective | lạ, kỳ lạ | 这|件|事|很|奇怪。 | Chuyện này lạ thật. | 🤨
礼物 | lǐwù | n. | noun | quà, món quà | 这|是|给|你|的|礼物。 | Đây là quà tặng bạn. | 🎁
提高 | tígāo | v. | verb | nâng cao | 我|想|提高|汉语|水平。 | Tôi muốn nâng cao trình độ tiếng Trung. | 🚀
满意 | mǎnyì | adj. | adjective | hài lòng | 我|对|这|个|房间|很|满意。 | Tôi rất hài lòng với căn phòng này. | 😌
旧 | jiù | adj. | adjective | cũ | 这|是|我|的|旧|手机。 | Đây là điện thoại cũ của tôi. | 📼
司机 | sījī | n. | noun | tài xế | 我|爸爸|是|出租车|司机。 | Bố tôi là tài xế taxi. | 🚕
经理 | jīnglǐ | n. | noun | giám đốc, quản lý | 王|经理|在|开|会。 | Giám đốc Vương đang họp. | 💼
兴趣 | xìngqù | n. | noun | hứng thú, sở thích | 我|对|音乐|很|有|兴趣。 | Tôi rất có hứng thú với âm nhạc. | 🎵
帮忙 | bāngmáng | v. | verb | giúp một tay | 你|能|来|帮忙|吗？ | Bạn đến giúp một tay được không? | 🙌
见面 | jiànmiàn | v. | verb | gặp mặt | 我们|明天|见面|吧。 | Mai chúng ta gặp nhau nhé. | 🤗
成绩 | chéngjì | n. | noun | thành tích, điểm số | 他|的|考试|成绩|很|好。 | Kết quả thi của anh ấy rất tốt. | 🅰️
中间 | zhōngjiān | n. | noun | ở giữa | 我|坐|在|他们|中间。 | Tôi ngồi giữa họ. | ⏺️
聪明 | cōngming | adj. | adjective | thông minh | 这|个|孩子|很|聪明。 | Đứa trẻ này rất thông minh. | 🦉
多么 | duōme | adv. | adverb | biết bao, thật là | 今天|的|天气|多么|好|啊！ | Thời tiết hôm nay đẹp biết bao! | 🌈
灯 | dēng | n. | noun | đèn | 请|开|灯。 | Làm ơn bật đèn lên. | 🪔
太阳 | tàiyáng | n. | noun | mặt trời | 太阳|出来|了。 | Mặt trời lên rồi. | 🌅
方便 | fāngbiàn | adj. | adjective | tiện, thuận tiện | 坐|地铁|很|方便。 | Đi tàu điện ngầm rất tiện. | 🚇
糖 | táng | n. | noun | đường; kẹo | 我|喝|咖啡|不|放|糖。 | Tôi uống cà phê không cho đường. | 🍬
相同 | xiāngtóng | adj. | adjective | giống hệt, như nhau | 我们|的|想法|相同。 | Suy nghĩ của chúng tôi giống nhau. | 🟰
生气 | shēngqì | v. | verb | giận, tức giận | 妈妈|生气|了。 | Mẹ giận rồi. | 😠
公园 | gōngyuán | n. | noun | công viên | 我们|去|公园|走走|吧。 | Chúng ta đi dạo công viên đi. | 🏞️
热情 | rèqíng | adj. | adjective | nhiệt tình | 他|对|客人|很|热情。 | Anh ấy rất nhiệt tình với khách. | 🤩
河 | hé | n. | noun | sông | 这|条|河|很|长。 | Con sông này rất dài. | 🛶
搬 | bān | v. | verb | chuyển, dọn (nhà, đồ) | 我们|下|个|月|搬|家。 | Tháng sau chúng tôi chuyển nhà. | 📦
同事 | tóngshì | n. | noun | đồng nghiệp | 他|是|我|的|同事。 | Anh ấy là đồng nghiệp của tôi. | 👩‍💼
舒服 | shūfu | adj. | adjective | dễ chịu, thoải mái | 这|个|椅子|很|舒服。 | Cái ghế này rất thoải mái. | 🛋️
体育 | tǐyù | n. | noun | thể dục, thể thao | 我|最|喜欢|上|体育|课。 | Tôi thích nhất giờ thể dục. | 🏋️
胖 | pàng | adj. | adjective | béo, mập | 我|最近|胖|了。 | Dạo này tôi béo lên. | 🐷
干净 | gānjìng | adj. | adjective | sạch, sạch sẽ | 房间|很|干净。 | Căn phòng rất sạch sẽ. | 🧼
放心 | fàngxīn | v. | verb | yên tâm | 你|放心|吧，|我|会|小心|的。 | Bạn yên tâm đi, tôi sẽ cẩn thận. | 😮‍💨
甜 | tián | adj. | adjective | ngọt | 这|个|西瓜|很|甜。 | Quả dưa hấu này rất ngọt. | 🍉
安静 | ānjìng | adj. | adjective | yên tĩnh | 图书馆|里|很|安静。 | Trong thư viện rất yên tĩnh. | 🔇
作业 | zuòyè | n. | noun | bài tập về nhà | 今天|的|作业|很|多。 | Hôm nay bài tập nhiều lắm. | 📓
瘦 | shòu | adj. | adjective | gầy | 他|很|高，|也|很|瘦。 | Anh ấy cao và cũng rất gầy. | 🦴
绿 | lǜ | adj. | adjective | xanh lá | 春天|的|草|很|绿。 | Cỏ mùa xuân rất xanh. | 🟩
啤酒 | píjiǔ | n. | noun | bia | 你|喝|啤酒|吗？ | Bạn uống bia không? | 🍺
蛋糕 | dàngāo | n. | noun | bánh ngọt, bánh kem | 生日|蛋糕|很|好吃。 | Bánh sinh nhật rất ngon. | 🧁
新鲜 | xīnxiān | adj. | adjective | tươi | 这|些|水果|很|新鲜。 | Chỗ hoa quả này rất tươi. | 🥬
难过 | nánguò | adj. | adjective | buồn | 听|到|这|个|消息，|我|很|难过。 | Nghe tin này tôi rất buồn. | 😔
客人 | kèrén | n. | noun | khách | 今天|家|里|来|了|客人。 | Hôm nay nhà có khách. | 🛎️
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
    '八': 'bát', '九': 'cửu', '六': 'lục', '七': 'thất', '四': 'tứ', '五': 'ngũ', '岁': 'tuế',
    '号': 'hiệu', '分钟': 'phân chung', '电影': 'điện ảnh', '后面': 'hậu diện',
    '前面': 'tiền diện', '里': 'lý', '上': 'thượng', '下': 'hạ', '怎么': 'chẩm ma',
    '怎么样': 'chẩm ma dạng', '请': 'thỉnh', '同学': 'đồng học', '些': 'ta', '看见': 'khán kiến',
    '哥哥': 'ca ca',
    '姐姐': 'tỷ tỷ',
    '弟弟': 'đệ đệ',
    '妹妹': 'muội muội',
    '孩子': 'hài tử',
    '丈夫': 'trượng phu',
    '妻子': 'thê tử',
    '身体': 'thân thể',
    '眼睛': 'nhãn tình',
    '生病': 'sinh bệnh',
    '药': 'dược',
    '累': 'luỵ',
    '休息': 'hưu tức',
    '颜色': 'nhan sắc',
    '红色': 'hồng sắc',
    '白色': 'bạch sắc',
    '黑色': 'hắc sắc',
    '鸡蛋': 'kê đản',
    '牛奶': 'ngưu nãi',
    '面条': 'miến điều',
    '鱼': 'ngư',
    '羊肉': 'dương nhục',
    '西瓜': 'tây qua',
    '饿': 'ngạ',
    '早上': 'tảo thượng',
    '晚上': 'vãn thượng',
    '小时': 'tiểu thời',
    '时间': 'thời gian',
    '每': 'mỗi',
    '已经': 'dĩ kinh',
    '去年': 'khứ niên',
    '生日': 'sinh nhật',
    '便宜': 'tiện nghi',
    '贵': 'quý',
    '卖': 'mại',
    '件': 'kiện',
    '两': 'lưỡng',
    '百': 'bách',
    '手机': 'thủ cơ',
    '手表': 'thủ biểu',
    '公共汽车': 'công cộng khí xa',
    '路': 'lộ',
    '远': 'viễn',
    '近': 'cận',
    '走': 'tẩu',
    '左边': 'tả biên',
    '右边': 'hữu biên',
    '机场': 'cơ trường',
    '旅游': 'lữ du',
    '考试': 'khảo thí',
    '问题': 'vấn đề',
    '教室': 'giáo thất',
    '公司': 'công ty',
    '上班': 'thượng ban',
    '懂': 'đổng',
    '知道': 'tri đạo',
    '帮助': 'bang trợ',
    '介绍': 'giới thiệu',
    '运动': 'vận động',
    '游泳': 'du vịnh',
    '唱歌': 'xướng ca',
    '跳舞': 'khiêu vũ',
    '玩': 'ngoạn',
    '晴': 'tình',
    '雪': 'tuyết',
    '高': 'cao',
    '长': 'trường',
    '新': 'tân',
    '快': 'khoái',
    '慢': 'mạn',
    '难': 'nan',
    '有意思': 'hữu ý tư',
    '可以': 'khả dĩ',
    '因为': 'nhân vị',
    '所以': 'sở dĩ',
    '但是': 'đãn thị',
    '饭': 'phạn',
    '口': 'khẩu',
    '给': 'cấp',
    '天': 'thiên',
    '春天': 'xuân thiên',
    '夏天': 'hạ thiên',
    '秋天': 'thu thiên',
    '冬天': 'đông thiên',
    '杯': 'bôi',
    '只': 'chích',
    '条': 'điều',
    '张': 'trương',
    '起床': 'khởi sàng',
    '今年': 'kim niên',
    '要': 'yếu',
    '一下': 'nhất hạ',
    '离': 'ly',
    '也': 'dã',
    '晚': 'vãn',
    '越南': 'Việt Nam',
    '音乐': 'âm nhạc',
    '汉字': 'Hán tự',
    '开车': 'khai xa',
    '门': 'môn',
    '用': 'dụng',
    '等': 'đẳng',
    '进': 'tiến',
    '外面': 'ngoại diện',
    '头发': 'đầu phát',
    '一起': 'nhất khởi',
    '带': 'đới',
    '白': 'bạch',
    '报纸': 'báo chỉ',
    '比': 'tỷ',
    '别': 'biệt',
    '出': 'xuất',
    '穿': 'xuyên',
    '船': 'thuyền',
    '次': 'thứ',
    '从': 'tùng',
    '错': 'thác',
    '打篮球': 'đả lam cầu',
    '大家': 'đại gia',
    '到': 'đáo',
    '得': 'đắc',
    '第一': 'đệ nhất',
    '房间': 'phòng gian',
    '非常': 'phi thường',
    '服务员': 'phục vụ viên',
    '告诉': 'cáo tố',
    '公斤': 'công cân',
    '还': 'hoàn',
    '黑': 'hắc',
    '红': 'hồng',
    '欢迎': 'hoan nghênh',
    '回答': 'hồi đáp',
    '就': 'tựu',
    '觉得': 'giác đắc',
    '开始': 'khai thuỷ',
    '可能': 'khả năng',
    '课': 'khoá',
    '快乐': 'khoái lạc',
    '忙': 'mang',
    '男人': 'nam nhân',
    '女人': 'nữ nhân',
    '旁边': 'bàng biên',
    '票': 'phiếu',
    '千': 'thiên',
    '让': 'nhượng',
    '事情': 'sự tình',
    '送': 'tống',
    '它': 'tha',
    '题': 'đề',
    '外': 'ngoại',
    '完': 'hoàn',
    '为': 'vị',
    '问': 'vấn',
    '希望': 'hy vọng',
    '洗': 'tẩy',
    '向': 'hướng',
    '笑': 'tiếu',
    '姓': 'tính',
    '意思': 'ý tư',
    '阴': 'âm',
    '元': 'nguyên',
    '再': 'tái',
    '找': 'trảo',
    '着': 'trứ',
    '真': 'chân',
    '正在': 'chính tại',
    '准备': 'chuẩn bị',
    '自行车': 'tự hành xa',
    '最': 'tối',
    '啊': 'a',
    '把': 'bả',
    '被': 'bị',
    '自己': 'tự kỷ',
    '如果': 'như quả',
    '又': 'hựu',
    '更': 'cánh',
    '需要': 'nhu yếu',
    '地': 'địa',
    '才': 'tài',
    '跟': 'cân',
    '像': 'tượng',
    '还是': 'hoàn thị',
    '认为': 'nhận vi',
    '应该': 'ưng cai',
    '位': 'vị',
    '种': 'chủng',
    '发现': 'phát hiện',
    '一定': 'nhất định',
    '一直': 'nhất trực',
    '为了': 'vị liễu',
    '一样': 'nhất dạng',
    '世界': 'thế giới',
    '而且': 'nhi thả',
    '重要': 'trọng yếu',
    '必须': 'tất tu',
    '地方': 'địa phương',
    '老': 'lão',
    '其他': 'kỳ tha',
    '比赛': 'tỷ tái',
    '然后': 'nhiên hậu',
    '担心': 'đảm tâm',
    '放': 'phóng',
    '拿': 'nã',
    '为什么': 'vị thập ma',
    '先': 'tiên',
    '关系': 'quan hệ',
    '出现': 'xuất hiện',
    '了解': 'liễu giải',
    '过去': 'quá khứ',
    '参加': 'tham gia',
    '国家': 'quốc gia',
    '决定': 'quyết định',
    '分': 'phân',
    '选择': 'tuyển trạch',
    '或者': 'hoặc giả',
    '机会': 'cơ hội',
    '别人': 'biệt nhân',
    '站': 'trạm',
    '使': 'sử',
    '其实': 'kỳ thực',
    '以后': 'dĩ hậu',
    '要求': 'yêu cầu',
    '信': 'tín',
    '当然': 'đương nhiên',
    '接': 'tiếp',
    '相信': 'tương tín',
    '花': 'hoa',
    '虽然': 'tuy nhiên',
    '解决': 'giải quyết',
    '关于': 'quan vu',
    '完成': 'hoàn thành',
    '结束': 'kết thúc',
    '努力': 'nỗ lực',
    '以前': 'dĩ tiền',
    '办法': 'biện pháp',
    '特别': 'đặc biệt',
    '注意': 'chú ý',
    '讲': 'giảng',
    '离开': 'ly khai',
    '万': 'vạn',
    '以为': 'dĩ vi',
    '越': 'việt',
    '城市': 'thành thị',
    '影响': 'ảnh hưởng',
    '游戏': 'du hí',
    '马': 'mã',
    '比较': 'tỷ giảo',
    '最近': 'tối cận',
    '换': 'hoán',
    '终于': 'chung vu',
    '脸': 'kiểm',
    '总是': 'tổng thị',
    '双': 'song',
    '突然': 'đột nhiên',
    '检查': 'kiểm tra',
    '米': 'mễ',
    '容易': 'dung dịch',
    '明白': 'minh bạch',
    '记得': 'ký đắc',
    '辆': 'lượng',
    '简单': 'giản đơn',
    '半': 'bán',
    '愿意': 'nguyện ý',
    '包': 'bao',
    '楼': 'lâu',
    '清楚': 'thanh sở',
    '照片': 'chiếu phiến',
    '银行': 'ngân hàng',
    '故事': 'cố sự',
    '一般': 'nhất ban',
    '可爱': 'khả ái',
    '新闻': 'tân văn',
    '声音': 'thanh âm',
    '马上': 'mã thượng',
    '表示': 'biểu thị',
    '经过': 'kinh quá',
    '历史': 'lịch sử',
    '哭': 'khốc',
    '敢': 'cảm',
    '会议': 'hội nghị',
    '经常': 'kinh thường',
    '低': 'đê',
    '节目': 'tiết mục',
    '健康': 'kiện khang',
    '结婚': 'kết hôn',
    '短': 'đoản',
    '同意': 'đồng ý',
    '教': 'giáo',
    '几乎': 'cơ hồ',
    '附近': 'phụ cận',
    '认真': 'nhận chân',
    '脚': 'cước',
    '主要': 'chủ yếu',
    '遇到': 'ngộ đáo',
    '年轻': 'niên khinh',
    '久': 'cửu',
    '画': 'hoạ',
    '表演': 'biểu diễn',
    '刚才': 'cương tài',
    '办公室': 'biện công thất',
    '环境': 'hoàn cảnh',
    '关心': 'quan tâm',
    '祝': 'chúc',
    '层': 'tầng',
    '腿': 'thoái',
    '坏': 'hoại',
    '鞋': 'hài',
    '习惯': 'tập quán',
    '变化': 'biến hoá',
    '周末': 'chu mạt',
    '忘记': 'vong ký',
    '打算': 'đả toán',
    '小心': 'tiểu tâm',
    '动物': 'động vật',
    '树': 'thụ',
    '借': 'tá',
    '害怕': 'hại phạ',
    '鸟': 'điểu',
    '根据': 'căn cứ',
    '作用': 'tác dụng',
    '差': 'sai',
    '一边': 'nhất biên',
    '极': 'cực',
    '举行': 'cử hành',
    '水平': 'thuỷ bình',
    '照顾': 'chiếu cố',
    '文化': 'văn hoá',
    '疼': 'đông',
    '奇怪': 'kỳ quái',
    '礼物': 'lễ vật',
    '提高': 'đề cao',
    '满意': 'mãn ý',
    '旧': 'cựu',
    '司机': 'ty cơ',
    '经理': 'kinh lý',
    '兴趣': 'hứng thú',
    '帮忙': 'bang mang',
    '见面': 'kiến diện',
    '成绩': 'thành tích',
    '中间': 'trung gian',
    '聪明': 'thông minh',
    '多么': 'đa ma',
    '灯': 'đăng',
    '太阳': 'thái dương',
    '方便': 'phương tiện',
    '糖': 'đường',
    '相同': 'tương đồng',
    '生气': 'sinh khí',
    '公园': 'công viên',
    '热情': 'nhiệt tình',
    '河': 'hà',
    '搬': 'ban',
    '同事': 'đồng sự',
    '舒服': 'thư phục',
    '体育': 'thể dục',
    '胖': 'bàn',
    '干净': 'can tịnh',
    '放心': 'phóng tâm',
    '甜': 'điềm',
    '安静': 'an tĩnh',
    '作业': 'tác nghiệp',
    '瘦': 'sấu',
    '绿': 'lục',
    '蛋糕': 'đản cao',
    '新鲜': 'tân tiên',
    '难过': 'nan quá',
    '客人': 'khách nhân',
}

# Pinyin of each example, one syllable per Chinese character, in order
# (docs/design/chinese.md, bước 6). HSK textbook style: 一 and 不 carry their
# changed tone (一个 yí gè, 不客气 bú kèqi), a 3 + 3 pair keeps its written
# tones, neutral tones have no mark. The 儿 of 哪儿 / 这儿 / 那儿 joins the
# syllable before it and is written "r".
EXAMPLE_PINYIN = {
    '你好': 'nǐ hǎo hěn gāo xìng rèn shi nǐ',
    '谢谢': 'xiè xie nǐ',
    '不客气': 'xiè xie nǐ bú kè qi',
    '对不起': 'duì bu qǐ wǒ lái wǎn le',
    '没关系': 'duì bu qǐ méi guān xi',
    '再见': 'lǎo shī zài jiàn',
    '是': 'wǒ shì xué sheng',
    '不': 'wǒ bù hē chá',
    '没有': 'wǒ méi yǒu shí jiān',
    '有': 'nǐ yǒu shí jiān ma',
    '我': 'wǒ shì Yuè nán rén',
    '你': 'nǐ shì lǎo shī ma',
    '他': 'tā shì wǒ de lǎo shī',
    '她': 'tā shì yī shēng',
    '我们': 'wǒ men shì péng you',
    '什么': 'nǐ xiǎng chī shén me',
    '谁': 'tā shì shéi',
    '哪儿': 'nǐ qù nǎ r',
    '多少': 'nǐ yǒu duō shao qián',
    '这': 'zhè shì shén me',
    '那': 'nà shì wǒ men de xué xiào',
    '这儿': 'wǒ zài zhè r',
    '那儿': 'nǐ de shū zài nà r',
    '一': 'wǒ yǒu yì běn shū',
    '二': 'jīn tiān shì èr hào',
    '三': 'wǒ jiā yǒu sān kǒu rén',
    '十': 'xiàn zài shí diǎn',
    '几': 'nǐ jiā yǒu jǐ kǒu rén',
    '个': 'wǒ yǒu yí gè ér zi',
    '本': 'zhè běn shū hěn hǎo',
    '块': 'yì bēi kā fēi sān shí kuài',
    '人': 'zhè r yǒu hěn duō rén',
    '朋友': 'tā shì wǒ de hǎo péng you',
    '老师': 'wǒ men de lǎo shī hěn hǎo',
    '学生': 'tā shì wǒ de xué sheng',
    '医生': 'wǒ mā ma shì yī shēng',
    '爸爸': 'bà ba zài jiā',
    '妈妈': 'mā ma zuò de fàn hěn hǎo chī',
    '儿子': 'tā ér zi wǔ suì',
    '女儿': 'wǒ nǚ ér hěn piào liang',
    '先生': 'Wáng xiān sheng shì wǒ de lǎo shī',
    '小姐': 'Lǐ xiǎo jiě nǐ hǎo',
    '米饭': 'wǒ xǐ huan chī mǐ fàn',
    '茶': 'qǐng hē chá',
    '水': 'wǒ xiǎng hē shuǐ',
    '菜': 'zhè ge cài hěn hǎo chī',
    '水果': 'wǒ měi tiān chī shuǐ guǒ',
    '苹果': 'zhè ge píng guǒ hěn dà',
    '咖啡': 'wǒ xǐ huan hē kā fēi',
    '杯子': 'bēi zi zài zhuō zi shàng',
    '吃': 'nǐ chī fàn le ma',
    '喝': 'nǐ hē shén me',
    '饭店': 'wǒ men qù fàn diàn chī fàn',
    '好吃': 'Běi jīng cài hěn hǎo chī',
    '家': 'wǒ jiā zài Běi jīng',
    '学校': 'wǒ qù xué xiào',
    '医院': 'yī yuàn zài nǎ r',
    '商店': 'wǒ qù shāng diàn mǎi dōng xi',
    '中国': 'wǒ xiǎng qù Zhōng guó',
    '北京': 'Běi jīng hěn dà',
    '火车站': 'huǒ chē zhàn zài nà r',
    '今天': 'jīn tiān xīng qī yī',
    '明天': 'míng tiān jiàn',
    '昨天': 'zuó tiān wǒ qù le yī yuàn',
    '现在': 'xiàn zài jǐ diǎn',
    '点': 'wǒ qī diǎn qǐ chuáng',
    '年': 'wǒ zài Běi jīng zhù le sān nián',
    '月': 'xiàn zài shì shí yuè',
    '星期': 'jīn tiān xīng qī jǐ',
    '上午': 'wǒ shàng wǔ gōng zuò',
    '中午': 'zhōng wǔ wǒ chī mǐ fàn',
    '下午': 'xià wǔ wǒ qù shāng diàn',
    '时候': 'nǐ shén me shí hou huí jiā',
    '去': 'wǒ men qù Běi jīng ba',
    '来': 'nǐ míng tiān lái ma',
    '回': 'wǒ xiǎng huí jiā',
    '看': 'wǒ zài kàn shū',
    '听': 'wǒ xǐ huan tīng yīn yuè',
    '说': 'nǐ huì shuō Hàn yǔ ma',
    '读': 'qǐng dú zhè ge zì',
    '写': 'wǒ huì xiě Hàn zì',
    '买': 'wǒ xiǎng mǎi yì bēi kā fēi',
    '做': 'nǐ zài zuò shén me',
    '学习': 'wǒ zài xué xí Hàn yǔ',
    '工作': 'wǒ zài yī yuàn gōng zuò',
    '喜欢': 'wǒ xǐ huan Zhōng guó cài',
    '爱': 'wǒ ài wǒ de jiā',
    '想': 'wǒ xiǎng qù shāng diàn',
    '会': 'tā huì kāi chē',
    '能': 'nǐ néng lái ma',
    '叫': 'wǒ jiào Ān nà',
    '住': 'nǐ zhù zài nǎ r',
    '睡觉': 'wǒ shí yī diǎn shuì jiào',
    '打电话': 'wǒ gěi mā ma dǎ diàn huà',
    '认识': 'wǒ rèn shi tā',
    '开': 'qǐng kāi mén',
    '坐': 'qǐng zuò',
    '下雨': 'jīn tiān xià yǔ le',
    '在': 'tā zài jiā',
    '好': 'nǐ hǎo ma',
    '大': 'tā de jiā hěn dà',
    '小': 'zhè ge bēi zi hěn xiǎo',
    '多': 'shāng diàn lǐ rén hěn duō',
    '少': 'zhè r rén hěn shǎo',
    '热': 'jīn tiān hěn rè',
    '冷': 'Běi jīng de dōng tiān hěn lěng',
    '漂亮': 'tā hěn piào liang',
    '高兴': 'rèn shi nǐ hěn gāo xìng',
    '很': 'wǒ hěn lèi',
    '太': 'tài guì le',
    '都': 'wǒ men dōu xǐ huan hē chá',
    '书': 'wǒ de shū zài zhuō zi shàng',
    '钱': 'zhè ge duō shao qián',
    '衣服': 'wǒ xiǎng mǎi yī fu',
    '电脑': 'wǒ yòng diàn nǎo gōng zuò',
    '电视': 'bà ba zài kàn diàn shì',
    '东西': 'nǐ mǎi shén me dōng xi',
    '桌子': 'zhuō zi shàng yǒu yì běn shū',
    '椅子': 'yǐ zi zài zhè r',
    '汉语': 'Hàn yǔ bú tài nán',
    '字': 'zhè ge zì zěn me dú',
    '天气': 'jīn tiān tiān qì zěn me yàng',
    '名字': 'nǐ jiào shén me míng zi',
    '飞机': 'wǒ zuò fēi jī qù Běi jīng',
    '出租车': 'wǒ men zuò chū zū chē ba',
    '猫': 'wǒ jiā yǒu yì zhī māo',
    '狗': 'zhè zhī gǒu hěn xiǎo',
    '吗': 'nǐ shì Zhōng guó rén ma',
    '呢': 'wǒ hěn hǎo nǐ ne',
    '的': 'zhè shì wǒ de shū',
    '了': 'wǒ chī fàn le',
    '和': 'wǒ hé mā ma qù shāng diàn',
    '八': 'wǒ bā diǎn qù xué xiào',
    '九': 'xiàn zài jiǔ diǎn',
    '六': 'wǒ jiā yǒu liù kǒu rén',
    '七': 'yí gè xīng qī yǒu qī tiān',
    '四': 'wǒ yǒu sì běn shū',
    '五': 'wǒ men wǔ diǎn huí jiā',
    '岁': 'wǒ nǚ ér wǔ suì',
    '号': 'jīn tiān jǐ hào',
    '分钟': 'wǒ děng le shí fēn zhōng',
    '电影': 'wǒ xǐ huan kàn diàn yǐng',
    '后面': 'xué xiào hòu miàn yǒu yí gè shāng diàn',
    '前面': 'yī yuàn zài qián miàn',
    '里': 'bēi zi lǐ yǒu shuǐ',
    '上': 'māo zài yǐ zi shàng',
    '下': 'xià gè yuè wǒ qù Běi jīng',
    '哪': 'nǐ shì nǎ guó rén',
    '怎么': 'qù yī yuàn zěn me zǒu',
    '怎么样': 'zhè ge cài zěn me yàng',
    '请': 'qǐng jìn',
    '同学': 'tā shì wǒ de tóng xué',
    '喂': 'wèi nǐ hǎo',
    '些': 'wǒ xiǎng mǎi xiē shuǐ guǒ',
    '一点儿': 'wǒ huì shuō yì diǎn r Hàn yǔ',
    '看见': 'nǐ kàn jiàn wǒ de māo le ma',
    '哥哥': 'wǒ gē ge shì yī shēng',
    '姐姐': 'wǒ jiě jie zài Běi jīng gōng zuò',
    '弟弟': 'wǒ dì di jīn nián bā suì',
    '妹妹': 'wǒ mèi mei xǐ huan māo',
    '孩子': 'hái zi zài shuì jiào',
    '丈夫': 'tā zhàng fu shì lǎo shī',
    '妻子': 'wǒ qī zi huì shuō Hàn yǔ',
    '身体': 'nǐ shēn tǐ hǎo ma',
    '眼睛': 'tā de yǎn jing hěn dà',
    '生病': 'wǒ shēng bìng le',
    '药': 'nǐ yào chī yào',
    '累': 'jīn tiān wǒ hěn lèi',
    '休息': 'nǐ xiū xi yí xià ba',
    '颜色': 'nǐ xǐ huan shén me yán sè',
    '红色': 'wǒ xǐ huan hóng sè',
    '白色': 'zhè jiàn yī fu shì bái sè de',
    '黑色': 'tā de māo shì hēi sè de',
    '鸡蛋': 'wǒ zǎo shang chī jī dàn',
    '牛奶': 'hái zi měi tiān hē niú nǎi',
    '面条': 'zhōng wǔ wǒ chī miàn tiáo',
    '鱼': 'mā ma zuò de yú hěn hǎo chī',
    '羊肉': 'Běi jīng rén xǐ huan chī yáng ròu',
    '西瓜': 'xià tiān de xī guā hěn hǎo chī',
    '饿': 'wǒ è le',
    '早上': 'wǒ zǎo shang liù diǎn qǐ chuáng',
    '晚上': 'wǎn shang wǒ kàn diàn shì',
    '小时': 'wǒ měi tiān gōng zuò bā gè xiǎo shí',
    '时间': 'xiàn zài méi yǒu shí jiān le',
    '每': 'wǒ měi tiān xué xí Hàn yǔ',
    '已经': 'wǒ yǐ jīng chī fàn le',
    '去年': 'wǒ qù nián qù le Zhōng guó',
    '生日': 'jīn tiān shì wǒ de shēng rì',
    '便宜': 'zhè jiàn yī fu hěn pián yi',
    '贵': 'zhè r de kā fēi tài guì le',
    '卖': 'zhè ge shāng diàn mài shuǐ guǒ',
    '件': 'wǒ xiǎng mǎi zhè jiàn yī fu',
    '两': 'wǒ yǒu liǎng gè mèi mei',
    '百': 'zhè běn shū yì bǎi kuài',
    '手机': 'wǒ de shǒu jī zài nǎ r',
    '手表': 'zhè kuài shǒu biǎo hěn guì',
    '公共汽车': 'wǒ zuò gōng gòng qì chē qù xué xiào',
    '路': 'zhè tiáo lù hěn cháng',
    '远': 'xué xiào lí wǒ jiā hěn yuǎn',
    '近': 'yī yuàn lí zhè r hěn jìn',
    '走': 'wǒ men zǒu ba',
    '左边': 'shāng diàn zài yī yuàn zuǒ bian',
    '右边': 'wǒ jiā zài xué xiào yòu bian',
    '机场': 'wǒ men zuò chū zū chē qù jī chǎng',
    '旅游': 'wǒ xiǎng qù Zhōng guó lǚ yóu',
    '考试': 'míng tiān yǒu Hàn yǔ kǎo shì',
    '问题': 'wǒ yǒu yí gè wèn tí',
    '教室': 'lǎo shī zài jiào shì lǐ',
    '公司': 'wǒ zài yì jiā gōng sī gōng zuò',
    '上班': 'bà ba bā diǎn shàng bān',
    '懂': 'nǐ dǒng le ma',
    '知道': 'wǒ bù zhī dào',
    '帮助': 'xiè xie nǐ de bāng zhù',
    '介绍': 'wǒ lái jiè shào yí xià',
    '运动': 'wǒ měi tiān dōu yùn dòng',
    '游泳': 'xià tiān wǒ xǐ huan yóu yǒng',
    '跑步': 'tā zǎo shang pǎo bù',
    '唱歌': 'tā hěn xǐ huan chàng gē',
    '跳舞': 'wǒ men qù tiào wǔ ba',
    '踢足球': 'tā xǐ huan tī zú qiú',
    '玩': 'hái zi zài wài miàn wán',
    '晴': 'jīn tiān shì qíng tiān',
    '雪': 'Běi jīng xià xuě le',
    '高': 'wǒ gē ge hěn gāo',
    '长': 'tā de tóu fa hěn cháng',
    '新': 'zhè shì wǒ de xīn shǒu jī',
    '快': 'tā zǒu de hěn kuài',
    '慢': 'qǐng shuō màn yì diǎn r',
    '难': 'zhè ge wèn tí hěn nán',
    '有意思': 'zhè běn shū hěn yǒu yì si',
    '可以': 'wǒ kě yǐ zuò zhè r ma',
    '因为': 'yīn wèi xià yǔ wǒ bú qù le',
    '所以': 'wǒ hěn lèi suǒ yǐ xiǎng xiū xi',
    '但是': 'Hàn yǔ hěn nán dàn shì hěn yǒu yì si',
    '饭': 'wǒ men yì qǐ chī fàn ba',
    '吧': 'nǐ shì lǎo shī ba',
    '口': 'wǒ jiā yǒu sì kǒu rén',
    '给': 'mā ma gěi wǒ yí gè píng guǒ',
    '天': 'wǒ zài Běi jīng zhù le sān tiān',
    '春天': 'chūn tiān de tiān qì hěn hǎo',
    '夏天': 'Běi jīng de xià tiān hěn rè',
    '秋天': 'wǒ zuì xǐ huan qiū tiān',
    '冬天': 'dōng tiān wǒ xǐ huan hē rè chá',
    '杯': 'wǒ yào yì bēi kā fēi',
    '只': 'wǒ jiā yǒu yì zhī gǒu',
    '条': 'wǒ mǎi le yì tiáo yú',
    '张': 'zhè zhāng zhuō zi hěn dà',
    '起床': 'nǐ jǐ diǎn qǐ chuáng',
    '今年': 'nǐ jīn nián duō dà',
    '要': 'wǒ yào zhè ge',
    '一下': 'qǐng děng yí xià',
    '离': 'wǒ jiā lí xué xiào hěn jìn',
    '也': 'wǒ yě shì xué sheng',
    '晚': 'xiàn zài tài wǎn le',
    '越南': 'Yuè nán cài hěn hǎo chī',
    '音乐': 'zhè ge yīn yuè hěn hǎo tīng',
    '汉字': 'Hàn zì hěn yǒu yì si',
    '开车': 'bà ba kāi chē qù shàng bān',
    '门': 'mén zài nà r',
    '用': 'wǒ yòng shǒu jī dǎ diàn huà',
    '等': 'wǒ zài zhè r děng nǐ',
    '进': 'qǐng jìn',
    '外面': 'wài miàn xià yǔ le',
    '头发': 'wǒ mèi mei de tóu fa hěn piào liang',
    '一起': 'wǒ men yì qǐ qù ba',
    '带': 'wǒ dài nǐ qù shāng diàn',
    '白': 'tā de yī fu hěn bái',
    '报纸': 'bà ba měi tiān kàn bào zhǐ',
    '比': 'gē ge bǐ wǒ gāo',
    '别': 'bié zǒu',
    '出': 'tā chū qù le',
    '穿': 'jīn tiān hěn lěng nǐ yào duō chuān yī fu',
    '船': 'wǒ men zuò chuán qù',
    '次': 'wǒ qù guo liǎng cì Běi jīng',
    '从': 'wǒ cóng Yuè nán lái',
    '错': 'duì bu qǐ wǒ cuò le',
    '打篮球': 'tā xǐ huan dǎ lán qiú',
    '大家': 'dà jiā hǎo',
    '到': 'wǒ dào jiā le',
    '得': 'tā zǒu de hěn kuài',
    '第一': 'zhè shì wǒ dì yī cì lái Zhōng guó',
    '房间': 'wǒ de fáng jiān hěn xiǎo',
    '非常': 'jīn tiān fēi cháng rè',
    '服务员': 'fú wù yuán qǐng gěi wǒ yì bēi chá',
    '告诉': 'qǐng gào su wǒ nǐ de míng zi',
    '公斤': 'wǒ mǎi le liǎng gōng jīn píng guǒ',
    '还': 'tā hái zài shuì jiào',
    '黑': 'wài miàn hěn hēi',
    '红': 'tā de liǎn hěn hóng',
    '欢迎': 'huān yíng nǐ lái Yuè nán',
    '回答': 'qǐng huí dá wǒ de wèn tí',
    '就': 'wǒ mǎ shàng jiù lái',
    '觉得': 'wǒ jué de Hàn yǔ hěn yǒu yì si',
    '开始': 'wǒ men kāi shǐ shàng kè ba',
    '可能': 'míng tiān kě néng xià yǔ',
    '课': 'jīn tiān yǒu Hàn yǔ kè',
    '快乐': 'shēng rì kuài lè',
    '忙': 'wǒ jīn tiān hěn máng',
    '男人': 'nà ge nán rén shì wǒ de lǎo shī',
    '女人': 'nà ge nǚ rén shì yī shēng',
    '您': 'nín hǎo',
    '旁边': 'shāng diàn zài xué xiào páng biān',
    '票': 'wǒ mǎi le liǎng zhāng piào',
    '千': 'zhè ge shǒu jī sān qiān kuài',
    '让': 'mā ma ràng wǒ qù mǎi shuǐ guǒ',
    '事情': 'wǒ yǒu yí jiàn shì qing',
    '送': 'wǒ sòng nǐ yì běn shū',
    '它': 'wǒ yǒu yì zhī māo tā hěn xiǎo',
    '踢': 'bié tī mén',
    '题': 'zhè dào tí hěn nán',
    '外': 'mén wài yǒu rén',
    '完': 'wǒ chī wán le',
    '为': 'wǒ wèi nǐ gāo xìng',
    '问': 'wǒ kě yǐ wèn nǐ yí gè wèn tí ma',
    '希望': 'wǒ xī wàng míng tiān bú xià yǔ',
    '洗': 'chī fàn qián yào xǐ shǒu',
    '向': 'xiàng zuǒ bian zǒu',
    '笑': 'tā xiào le',
    '姓': 'wǒ xìng Wáng',
    '意思': 'zhè ge zì shì shén me yì si',
    '阴': 'jīn tiān shì yīn tiān',
    '元': 'yì bēi chá shí yuán',
    '再': 'qǐng zài shuō yí cì',
    '找': 'wǒ zài zhǎo wǒ de shǒu jī',
    '着': 'mén kāi zhe',
    '真': 'nǐ zhēn piào liang',
    '正在': 'wǒ zhèng zài chī fàn',
    '准备': 'wǒ zài zhǔn bèi kǎo shì',
    '自行车': 'wǒ qí zì xíng chē qù xué xiào',
    '最': 'wǒ zuì xǐ huan xià tiān',
    '啊': 'jīn tiān tiān qì zhēn hǎo a',
    '把': 'qǐng bǎ mén guān shàng',
    '被': 'wǒ de zì xíng chē bèi rén qí zǒu le',
    '自己': 'wǒ zì jǐ zuò fàn',
    '如果': 'rú guǒ míng tiān xià yǔ wǒ jiù bú qù le',
    '又': 'tā jīn tiān yòu chí dào le',
    '更': 'wǒ gèng xǐ huan hē chá',
    '需要': 'nǐ xū yào bāng zhù ma',
    '地': 'tā gāo xìng de xiào le',
    '才': 'tā shí diǎn cái qǐ chuáng',
    '跟': 'wǒ gēn mā ma qù shāng diàn',
    '像': 'nǐ hěn xiàng nǐ mā ma',
    '还是': 'nǐ hē chá hái shi hē kā fēi',
    '认为': 'wǒ rèn wéi tā shuō de duì',
    '应该': 'nǐ yīng gāi duō xiū xi',
    '位': 'zhè wèi shì Wáng lǎo shī',
    '种': 'wǒ xǐ huan zhè zhǒng shuǐ guǒ',
    '发现': 'wǒ fā xiàn qián bāo bú jiàn le',
    '一定': 'wǒ míng tiān yí dìng lái',
    '一直': 'tā yì zhí zài xué xí',
    '为了': 'wèi le xué Hàn yǔ tā qù le Zhōng guó',
    '一样': 'wǒ men de yī fu yí yàng',
    '世界': 'wǒ xiǎng qù kàn kan shì jiè',
    '而且': 'tā hěn piào liang ér qiě hěn cōng ming',
    '重要': 'shēn tǐ hěn zhòng yào',
    '必须': 'nǐ bì xū zǎo diǎn shuì jiào',
    '地方': 'zhè shì shén me dì fang',
    '老': 'wǒ de yé ye hěn lǎo le',
    '其他': 'qí tā rén dōu zǒu le',
    '比赛': 'jīn tiān yǒu zú qiú bǐ sài',
    '然后': 'wǒ xiān chī fàn rán hòu kàn shū',
    '担心': 'bié dān xīn wǒ méi shì',
    '放': 'bǎ shū fàng zài zhuō zi shàng',
    '拿': 'nǐ shǒu lǐ ná zhe shén me',
    '为什么': 'nǐ wèi shén me bù gāo xìng',
    '先': 'nǐ xiān zǒu ba',
    '关系': 'tā men de guān xi hěn hǎo',
    '出现': 'tài yáng chū xiàn le',
    '了解': 'wǒ hěn liǎo jiě tā',
    '过去': 'guò qù de shì bié xiǎng le',
    '参加': 'wǒ xiǎng cān jiā zú qiú bǐ sài',
    '国家': 'Yuè nán shì yí gè měi lì de guó jiā',
    '决定': 'wǒ jué dìng xué Hàn yǔ',
    '分': 'xiàn zài sān diǎn shí fēn',
    '选择': 'nǐ xuǎn zé nǎ gè',
    '或者': 'wǒ zhōu mò qù yóu yǒng huò zhě pǎo bù',
    '机会': 'zhè shì yí gè hǎo jī huì',
    '别人': 'bú yào wèn bié rén',
    '站': 'tā zhàn zài mén kǒu',
    '使': 'zhè jiàn shì shǐ wǒ hěn gāo xìng',
    '其实': 'qí shí wǒ bù xǐ huan hē kā fēi',
    '以后': 'yǐ hòu wǒ xiǎng dāng lǎo shī',
    '要求': 'lǎo shī yāo qiú wǒ men měi tiān xiě hàn zì',
    '信': 'wǒ gěi mā ma xiě le yì fēng xìn',
    '当然': 'wǒ dāng rán jì de nǐ',
    '接': 'wǒ qù jī chǎng jiē péng you',
    '相信': 'wǒ xiāng xìn nǐ',
    '花': 'zhè xiē huā zhēn piào liang',
    '虽然': 'suī rán xià yǔ le dàn shì tā hái shi lái le',
    '解决': 'zhè ge wèn tí hěn nán jiě jué',
    '关于': 'zhè shì yì běn guān yú zhōng guó de shū',
    '完成': 'wǒ wán chéng zuò yè le',
    '结束': 'bǐ sài jié shù le',
    '努力': 'tā xué xí hěn nǔ lì',
    '以前': 'wǒ yǐ qián zhù zài běi jīng',
    '办法': 'wǒ yǒu yí ge hǎo bàn fǎ',
    '特别': 'jīn tiān tè bié lěng',
    '注意': 'guò mǎ lù yào zhù yì ān quán',
    '讲': 'mā ma gěi wǒ jiǎng gù shi',
    '离开': 'tā zuó tiān lí kāi le běi jīng',
    '万': 'zhè ge shǒu jī yí wàn kuài',
    '以为': 'wǒ yǐ wéi nǐ bù lái le',
    '越': 'tiān qì yuè lái yuè lěng le',
    '城市': 'běi jīng shì yí ge dà chéng shì',
    '影响': 'tiān qì yǐng xiǎng wǒ de xīn qíng',
    '游戏': 'hái zi men zài wán yóu xì',
    '马': 'tā huì qí mǎ',
    '比较': 'jīn tiān bǐ jiào rè',
    '最近': 'nǐ zuì jìn máng ma',
    '换': 'wǒ xiǎng huàn yí jiàn yī fu',
    '终于': 'wǒ zhōng yú zhǎo dào le wǒ de qián bāo',
    '脸': 'wǒ měi tiān zǎo shang xǐ liǎn',
    '除了': 'chú le hàn yǔ wǒ hái xué yīng yǔ',
    '总是': 'tā zǒng shì hěn máng',
    '双': 'wǒ mǎi le yì shuāng xié',
    '突然': 'tiān tū rán hēi le',
    '检查': 'yī shēng zài jiǎn chá wǒ de shēn tǐ',
    '米': 'wǒ jiā lí xué xiào wǔ bǎi mǐ',
    '容易': 'zhè ge tí hěn róng yì',
    '明白': 'nǐ míng bai wǒ de yì si ma',
    '记得': 'nǐ hái jì de wǒ ma',
    '辆': 'mén kǒu yǒu yí liàng chē',
    '简单': 'zhè ge wèn tí hěn jiǎn dān',
    '半': 'xiàn zài bā diǎn bàn',
    '愿意': 'nǐ yuàn yì gēn wǒ yì qǐ qù ma',
    '包': 'wǒ de bāo hěn zhòng',
    '楼': 'wǒ zhù zài sān lóu',
    '清楚': 'wǒ tīng bu qīng chu',
    '照片': 'zhè shì wǒ jiā de zhào piàn',
    '银行': 'wǒ qù yín háng huàn qián',
    '故事': 'zhè ge gù shi hěn yǒu yì si',
    '一般': 'wǒ yì bān qī diǎn qǐ chuáng',
    '可爱': 'zhè zhī xiǎo gǒu zhēn kě ài',
    '新闻': 'bà ba měi tiān kàn xīn wén',
    '声音': 'tā de shēng yīn hěn hǎo tīng',
    '马上': 'wǒ mǎ shàng lái',
    '表示': 'tā xiàng wǒ biǎo shì gǎn xiè',
    '经过': 'wǒ měi tiān jīng guò zhè jiā yín háng',
    '历史': 'wǒ xǐ huan xué lì shǐ',
    '哭': 'hái zi kū le',
    '敢': 'wǒ bù gǎn kàn',
    '会议': 'xià wǔ yǒu yí ge huì yì',
    '经常': 'wǒ jīng cháng qù tú shū guǎn',
    '低': 'zhè zhāng zhuō zi tài dī le',
    '节目': 'zhè ge diàn shì jié mù hěn hǎo kàn',
    '健康': 'zhù nǐ shēn tǐ jiàn kāng',
    '结婚': 'tā men míng nián jié hūn',
    '短': 'tā de tóu fa hěn duǎn',
    '同意': 'wǒ tóng yì nǐ de kàn fǎ',
    '教': 'wáng lǎo shī jiāo wǒ men hàn yǔ',
    '几乎': 'tā jī hū měi tiān dōu pǎo bù',
    '附近': 'fù jìn yǒu chāo shì ma',
    '认真': 'tā gōng zuò hěn rèn zhēn',
    '脚': 'wǒ de jiǎo hěn téng',
    '主要': 'zhè shì zhǔ yào de wèn tí',
    '遇到': 'wǒ zài lù shang yù dào le lǎo shī',
    '年轻': 'wǒ de mā ma hěn nián qīng',
    '久': 'hǎo jiǔ bú jiàn',
    '画': 'tā zài huà yì zhī māo',
    '表演': 'hái zi men zài biǎo yǎn jié mù',
    '刚才': 'gāng cái wǒ hěn máng',
    '办公室': 'wáng lǎo shī zài bàn gōng shì',
    '环境': 'zhè lǐ de huán jìng hěn hǎo',
    '关心': 'mā ma hěn guān xīn wǒ',
    '祝': 'zhù nǐ shēng rì kuài lè',
    '层': 'zhè zuò lóu yǒu èr shí céng',
    '腿': 'tā de tuǐ hěn cháng',
    '坏': 'wǒ de shǒu jī huài le',
    '鞋': 'zhè shuāng xié duō shao qián',
    '习惯': 'wǒ xí guàn zǎo shuì zǎo qǐ',
    '变化': 'zhè lǐ de biàn huà hěn dà',
    '周末': 'zhōu mò nǐ zuò shén me',
    '忘记': 'wǒ wàng jì dài yào shi le',
    '打算': 'nǐ dǎ suàn shén me shí hou huí jiā',
    '小心': 'xiǎo xīn chē',
    '动物': 'nǐ xǐ huan shén me dòng wù',
    '树': 'mén qián yǒu yì kē shù',
    '借': 'wǒ kě yǐ jiè nǐ de bǐ ma',
    '害怕': 'wǒ hài pà gǒu',
    '鸟': 'shù shang yǒu yì zhī niǎo',
    '根据': 'gēn jù tiān qì yù bào míng tiān xià yǔ',
    '作用': 'zhè zhǒng yào hěn yǒu zuò yòng',
    '差': 'wǒ de hàn yǔ hěn chà',
    '一边': 'tā yì biān chī fàn yì biān kàn diàn shì',
    '极': 'zhè ge cài hǎo chī jí le',
    '举行': 'bǐ sài zài běi jīng jǔ xíng',
    '水平': 'tā de hàn yǔ shuǐ píng hěn gāo',
    '照顾': 'tā zài jiā zhào gù hái zi',
    '文化': 'wǒ duì zhōng guó wén huà hěn gǎn xìng qù',
    '疼': 'wǒ tóu téng',
    '奇怪': 'zhè jiàn shì hěn qí guài',
    '礼物': 'zhè shì gěi nǐ de lǐ wù',
    '提高': 'wǒ xiǎng tí gāo hàn yǔ shuǐ píng',
    '满意': 'wǒ duì zhè ge fáng jiān hěn mǎn yì',
    '旧': 'zhè shì wǒ de jiù shǒu jī',
    '司机': 'wǒ bà ba shì chū zū chē sī jī',
    '经理': 'wáng jīng lǐ zài kāi huì',
    '兴趣': 'wǒ duì yīn yuè hěn yǒu xìng qù',
    '帮忙': 'nǐ néng lái bāng máng ma',
    '见面': 'wǒ men míng tiān jiàn miàn ba',
    '成绩': 'tā de kǎo shì chéng jì hěn hǎo',
    '中间': 'wǒ zuò zài tā men zhōng jiān',
    '聪明': 'zhè ge hái zi hěn cōng ming',
    '多么': 'jīn tiān de tiān qì duō me hǎo a',
    '灯': 'qǐng kāi dēng',
    '太阳': 'tài yáng chū lai le',
    '方便': 'zuò dì tiě hěn fāng biàn',
    '糖': 'wǒ hē kā fēi bú fàng táng',
    '相同': 'wǒ men de xiǎng fǎ xiāng tóng',
    '生气': 'mā ma shēng qì le',
    '公园': 'wǒ men qù gōng yuán zǒu zou ba',
    '热情': 'tā duì kè rén hěn rè qíng',
    '河': 'zhè tiáo hé hěn cháng',
    '搬': 'wǒ men xià ge yuè bān jiā',
    '同事': 'tā shì wǒ de tóng shì',
    '舒服': 'zhè ge yǐ zi hěn shū fu',
    '体育': 'wǒ zuì xǐ huan shàng tǐ yù kè',
    '胖': 'wǒ zuì jìn pàng le',
    '干净': 'fáng jiān hěn gān jìng',
    '放心': 'nǐ fàng xīn ba wǒ huì xiǎo xīn de',
    '甜': 'zhè ge xī guā hěn tián',
    '安静': 'tú shū guǎn lǐ hěn ān jìng',
    '作业': 'jīn tiān de zuò yè hěn duō',
    '瘦': 'tā hěn gāo yě hěn shòu',
    '绿': 'chūn tiān de cǎo hěn lǜ',
    '啤酒': 'nǐ hē pí jiǔ ma',
    '蛋糕': 'shēng rì dàn gāo hěn hǎo chī',
    '新鲜': 'zhè xiē shuǐ guǒ hěn xīn xiān',
    '难过': 'tīng dào zhè ge xiāo xi wǒ hěn nán guò',
    '客人': 'jīn tiān jiā lǐ lái le kè rén',
}

def example_reading(word: str, example: str, pack_reads: dict, errors: list) -> str | None:
    """Pinyin line for one example ("我|喜欢|喝|咖啡。" → "Wǒ xǐhuan hē kāfēi.")."""
    syllables, error = syllables_for(example, EXAMPLE_PINYIN.get(word, ''))
    if error:
        errors.append(f'{word}: {error}')
        return None
    mismatch = word_mismatch(word, example, syllables, pack_reads[word])
    if mismatch:
        errors.append(f'{word}: {mismatch}')
    return pinyin_line(example, syllables, pack_reads)


PINYIN = re.compile(r"^[a-zA-ZüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈŌÓǑÒ' ]+$")


def main() -> int:
    words, errors, meanings = [], [], {}
    pack_reads = {
        c[0]: c[1]
        for c in ([x.strip() for x in (l.rstrip() + ' ').split(' | ')] for l in ROWS.strip().split('\n') if l.strip())
    }
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
        if word in EXAMPLE_PINYIN:
            read = example_reading(word, example, pack_reads, errors)
            if read:
                entry['exampleRead'] = read
        hv = HAN_VIET.get(word)
        if hv:
            if len(hv.split()) != len(word):
                errors.append(f'{word}: Hán Việt "{hv}" needs one syllable per character')
            entry['hanViet'] = hv
        words.append(entry)
    missing = sorted({w['word'] for w in words} - set(EXAMPLE_PINYIN))
    errors += [f'{w}: example has no pinyin' for w in missing]
    unknown = sorted((set(HAN_VIET) | set(EXAMPLE_PINYIN)) - {w['word'] for w in words})
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
            'version': '0.7.0',
            'readingLabel': ['pinyin', 'pinyin'],
        },
        'words': words,
    }
    OUT.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(words)} words → {OUT.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
