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
            'version': '0.5.0',
            'readingLabel': ['pinyin', 'pinyin'],
        },
        'words': words,
    }
    OUT.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(words)} words → {OUT.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
