#!/usr/bin/env python3
"""Build public/data/topics/zh.json — the Chinese "Học theo chủ đề" decks.

Same idea as build_topics.py: each deck is a hand-sorted list of headwords that
exist in public/data/zh.json. Every word of the pack sits in at least one deck; the script
says which ones are left over.

Usage:  python3 scripts/build_topics_zh.py
Fails (and writes nothing) if a headword is missing from the pack.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / 'public' / 'data' / 'zh.json'
OUT = ROOT / 'public' / 'data' / 'topics' / 'zh.json'

# (id, emoji, (Vietnamese title, English title), headwords)
TOPICS = [
    (
        'greetings',
        '👋',
        ('Chào hỏi & lịch sự', 'Greetings & manners'),
        '''
        你好 谢谢 不客气 对不起 没关系 再见 认识 高兴 叫 名字 先生 小姐
        请 喂
        欢迎 您 大家 姓 快乐
        祝 久
        ''',
    ),
    (
        'people',
        '👨‍👩‍👧',
        ('Con người & gia đình', 'People & family'),
        '''
        人 朋友 老师 学生 医生 爸爸 妈妈 儿子 女儿 先生 小姐 我
        你 他 她 我们 同学
        哥哥 姐姐 弟弟 妹妹 孩子 丈夫 妻子
        头发 越南
        大家 男人 女人 您 它 服务员
        自己 别人 关系 其他
        年轻 结婚 关心
        司机 经理 同事 客人
        ''',
    ),
    (
        'food',
        '🍚',
        ('Ăn uống', 'Food & drink'),
        '''
        米饭 茶 水 菜 水果 苹果 咖啡 杯子 吃 喝 饭店 好吃
        鸡蛋 牛奶 面条 鱼 羊肉 西瓜 饿 卖
        饭 杯
        服务员
        糖 甜 啤酒 蛋糕 新鲜
        ''',
    ),
    (
        'places',
        '🏙️',
        ('Nơi chốn & đi lại', 'Places & getting around'),
        '''
        家 学校 医院 商店 中国 北京 火车站 饭店 这儿 那儿 哪儿 飞机
        出租车 去 来 回 坐 住 前面 后面 里 上 下
        公共汽车 路 远 近 走 左边 右边 机场 旅游
        门 外面 越南 开车 进 带 离
        船 自行车 房间 旁边 外 出 到 从 向
        地方 世界 国家 站
        城市 楼 银行
        附近 办公室 环境 层
        中间 公园 河
        ''',
    ),
    (
        'time',
        '⏰',
        ('Thời gian', 'Time'),
        '''
        今天 明天 昨天 现在 点 年 月 星期 上午 中午 下午 时候
        岁 号 分钟
        早上 晚上 小时 时间 每 已经 去年 生日
        天 今年 春天 夏天 秋天 冬天 晚 起床
        第一 次 再 正在 开始 完
        过去 分 先 然后
        以后 以前 最近 半 终于
        马上 刚才 周末 久 经常
        ''',
    ),
    (
        'shopping',
        '🛍️',
        ('Số đếm & mua sắm', 'Numbers & shopping'),
        '''
        一 二 三 四 五 六 七 八 九 十 几 个 本 块 多少 钱 买 东西
        衣服 些 一点儿
        两 百 便宜 贵 卖 件 手机 手表
        杯 只 条 张 口 要
        千 元 公斤 票 送
        位 种
        万 双 辆 米 换 包 银行
        鞋 层
        ''',
    ),
    (
        'daily-actions',
        '🏃',
        ('Hoạt động hằng ngày', 'Everyday actions'),
        '''
        看 听 说 读 写 做 学习 汉语 工作 睡觉 打电话 开
        坐 在 喜欢 爱 想 会 能 看见 电影
        起床 等 用 进 带 开车 给 要
        穿 洗 找 送 笑 问 回答 告诉 让 到 出 开始 完 准备 踢
        觉得 事情 希望
        需要 认为 应该 发现 担心 放 拿 出现 了解 参加 决定 选择 站 像
        要求 接 相信 解决 完成 结束 注意 讲 离开 换 检查 明白 记得 愿意 影响
        表示 经过 哭 敢 结婚 同意 教 遇到 关心 祝 忘记 打算 小心 借 害怕 画 表演
        举行 照顾 提高 帮忙 见面 搬 生气 放心
        ''',
    ),
    (
        'home-things',
        '🏠',
        ('Đồ vật quanh nhà', 'Things at home'),
        '''
        家 书 字 桌子 椅子 杯子 电脑 电视 东西 衣服 猫 狗
        手机 手表 颜色
        房间 报纸
        信 包 照片 花
        鞋
        灯 礼物 糖
        ''',
    ),
    (
        'describing',
        '🌤️',
        ('Miêu tả & thời tiết', 'Describing & weather'),
        '''
        好 大 小 多 少 热 冷 漂亮 高兴 很 太 天气
        下雨
        高 长 新 快 慢 难 有意思 累 饿 晴 雪 便宜 贵 远 近
        春天 夏天 秋天 冬天 晚
        错 忙 快乐 非常 真 最 阴 白 黑 红
        一样 重要 老 像
        努力 特别 容易 简单 清楚 突然
        可爱 低 短 年轻 坏 认真 健康 一般 变化 声音
        差 奇怪 满意 旧 聪明 方便 相同 热情 舒服 胖 干净 甜 安静 瘦 新鲜 难过 疼
        ''',
    ),
    (
        'grammar-words',
        '❓',
        ('Từ để hỏi & từ ngữ pháp', 'Question & grammar words'),
        '''
        什么 谁 哪儿 几 多少 吗 呢 的 了 和 是 不
        没有 有 都 这 那 哪 怎么 怎么样
        可以 因为 所以 但是 已经 每
        吧 也 一起 一下 要 给 离 用
        比 别 得 着 还 就 再 正在 为 向 从 可能
        啊 把 被 如果 又 更 地 才 跟 还是 一定 一直 为了 而且 必须 其他 然后 为什么 先 或者 使
        其实 当然 虽然 关于 以为 越 比较 终于 除了 总是 特别
        一般 马上 几乎 经常 刚才 主要
        根据 一边 极 多么
        ''',
    ),
    (
        'health-colors',
        '🎨',
        ('Sức khoẻ & màu sắc', 'Health & colours'),
        '''
        身体 眼睛 生病 药 累 休息 医生 医院 睡觉 饿 颜色 红色
        白色 黑色 衣服 漂亮
        白 黑 红
        脸 检查
        健康 脚 腿 害怕
        疼 胖 瘦 绿 舒服
        ''',
    ),
    (
        'school-work',
        '💼',
        ('Học tập & công việc', 'Study & work'),
        '''
        老师 学生 同学 学校 学习 汉语 字 考试 问题 教室 公司 上班
        工作 懂 知道 帮助 介绍 写 读
        汉字
        课 题 报纸 意思 问 回答 准备 开始
        机会 决定 选择 了解
        办法 要求 完成 简单 容易
        历史 会议 办公室 习惯 认真 教 新闻
        水平 作业 成绩 经理 同事 文化 兴趣 作用
        ''',
    ),
    (
        'hobbies',
        '⚽',
        ('Sở thích & thể thao', 'Hobbies & sport'),
        '''
        运动 游泳 跑步 唱歌 跳舞 踢足球 玩 旅游 看 听 电影 喜欢
        电视 书
        音乐
        打篮球 踢
        比赛 参加
        游戏 马 照片
        故事 节目 表演 画 动物 新闻
        兴趣 体育 公园
        ''',
    ),
    (
        'weather-seasons',
        '🌦️',
        ('Thời tiết & bốn mùa', 'Weather & seasons'),
        '''
        天气 冷 热 下雨 雪 晴 阴 春天 夏天 秋天 冬天 外面
        今天 明天 可能
        树 鸟 变化 环境
        太阳 绿
        ''',
    ),
    (
        'restaurant',
        '🍽️',
        ('Ở nhà hàng', 'At the restaurant'),
        '''
        饭店 服务员 欢迎 菜 米饭 面条 鱼 羊肉 鸡蛋 茶 咖啡 水
        牛奶 杯 要 好吃 多少 钱 块 元 饿
        啤酒 蛋糕 客人
        ''',
    ),
]


def main() -> int:
    words = json.loads(PACK.read_text(encoding='utf-8'))['words']
    by_word = {w['word']: w['id'] for w in words}
    topics, missing, used = [], [], set()
    for tid, emoji, (vi, en), headwords in TOPICS:
        ids = []
        for hw in headwords.split():
            wid = by_word.get(hw)
            if wid is None:
                missing.append(f'{tid}: {hw}')
            elif wid not in ids:
                ids.append(wid)
                used.add(hw)
        topics.append({'id': tid, 'emoji': emoji, 'title': [vi, en], 'wordIds': ids})
    if missing:
        print('Not in the pack:\n  ' + '\n  '.join(missing), file=sys.stderr)
        return 1
    data = {
        'version': 1,
        'note': 'Generated by scripts/build_topics_zh.py — edit the lists there, not this file.',
        'topics': topics,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for t in topics:
        print(f"{t['id']:<17} {len(t['wordIds']):>3} words")
    left = [w for w in by_word if w not in used]
    print('Not in any deck:', ', '.join(left) if left else 'none')
    return 0


if __name__ == '__main__':
    sys.exit(main())
