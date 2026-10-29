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
        你好 谢谢 不客气 对不起 没关系 再见 认识 高兴 叫 名字 先生
        小姐 请 喂 欢迎 您 大家 姓 快乐 祝 久 阿姨 叔叔
        ''',
    ),
    (
        'people',
        '👨‍👩‍👧',
        ('Con người & gia đình', 'People & family'),
        '''
        人 朋友 老师 学生 医生 爸爸 妈妈 儿子 女儿 先生 小姐 我
        你 他 她 我们 同学 哥哥 姐姐 弟弟 妹妹 孩子 丈夫 妻子
        头发 越南 大家 男人 女人 您 它 服务员 自己 别人 关系 其他
        年轻 结婚 关心 司机 经理 同事 客人 奶奶 爷爷 邻居 校长
        叔叔 阿姨
        ''',
    ),
    (
        'numbers',
        '🔢',
        ('Số đếm & lượng từ', 'Numbers & measure words'),
        '''
        一 二 三 四 五 六 七 八 九 十 几 个 本 两 百 千 万
        杯 只 条 张 口 件 位 种 双 辆 层 段 些 半 次
        ''',
    ),
    (
        'shopping',
        '🛍️',
        ('Mua sắm', 'Shopping'),
        '''
        块 多少 钱 买 东西 衣服 一点儿 便宜 贵 卖 手机 手表 要
        元 公斤 票 送 换 包 银行 鞋 角 一共 衬衫 裙子 裤子 帽子
        米 超市
        ''',
    ),
    (
        'food',
        '🍚',
        ('Ăn uống', 'Food & drink'),
        '''
        米饭 茶 水 菜 水果 苹果 咖啡 杯子 吃 喝 饭店 好吃 鸡蛋
        牛奶 面条 鱼 羊肉 西瓜 饿 卖 饭 杯 服务员 糖 甜 啤酒
        蛋糕 新鲜 碗 面包 香蕉 葡萄 果汁 饱 渴 筷子 盘子
        ''',
    ),
    (
        'restaurant',
        '🍽️',
        ('Ở nhà hàng', 'At the restaurant'),
        '''
        饭店 服务员 欢迎 菜 米饭 面条 鱼 羊肉 鸡蛋 茶 咖啡 水
        牛奶 杯 要 好吃 多少 钱 块 元 饿 啤酒 蛋糕 客人 菜单
        筷子 碗 盘子 果汁
        ''',
    ),
    (
        'places',
        '🚉',
        ('Đi lại & du lịch', 'Getting around & travel'),
        '''
        家 学校 医院 商店 中国 北京 火车站 饭店 飞机 出租车 去 来
        回 坐 住 公共汽车 路 走 机场 旅游 越南 开车 进 带 船
        自行车 出 到 从 地铁 宾馆 护照 行李箱 地图 站 骑 离开
        经过
        ''',
    ),
    (
        'directions',
        '🧭',
        ('Phương hướng & vị trí', 'Directions & position'),
        '''
        这儿 那儿 哪儿 前面 后面 里 上 下 左边 右边 外面 旁边 外
        向 中间 东 西 南 北方 附近 离 远 近 门 地方
        ''',
    ),
    (
        'city',
        '🏙️',
        ('Thành phố & nơi công cộng', 'Town & public places'),
        '''
        地方 世界 国家 城市 楼 层 银行 办公室 环境 公园 河 街道
        图书馆 电梯 超市 洗手间 商店 医院 饭店 宾馆 地铁 机场
        火车站
        ''',
    ),
    (
        'time',
        '⏰',
        ('Giờ giấc & ngày tháng', 'Clock & calendar'),
        '''
        今天 明天 昨天 现在 点 年 月 星期 上午 中午 下午 时候 岁
        号 分钟 早上 晚上 小时 时间 去年 生日 天 今年 晚 半 刻
        分 周末 节日
        ''',
    ),
    (
        'sequence',
        '⏳',
        ('Trước, sau & bao lâu', 'Before, after & how often'),
        '''
        每 已经 第一 次 再 正在 开始 完 过去 先 然后 以后 以前
        最近 终于 马上 刚才 久 经常 一会儿 总是 一直 又 才 就
        突然
        ''',
    ),
    (
        'daily-actions',
        '🏃',
        ('Sinh hoạt hằng ngày', 'Daily routine'),
        '''
        看 听 说 读 写 做 学习 工作 睡觉 打电话 开 坐 在 起床
        等 用 进 带 开车 给 穿 洗 找 送 问 回答 告诉 到 出
        准备 放 拿 关 骑 刷 洗澡 打扫 上网 迟到 换 借 接 看见
        ''',
    ),
    (
        'plans',
        '📝',
        ('Dự định & việc phải làm', 'Plans & getting things done'),
        '''
        会 能 要 应该 需要 必须 可以 打算 决定 选择 准备 开始
        完成 结束 解决 要求 参加 举行 提高 练习 锻炼 注意 检查
        发现 出现 影响 表示 遇到 见面 帮忙 照顾 搬 教 讲 让 使
        事情 结婚 祝
        ''',
    ),
    (
        'feelings',
        '💭',
        ('Cảm xúc & suy nghĩ', 'Feelings & thoughts'),
        '''
        喜欢 爱 想 笑 哭 觉得 希望 担心 害怕 生气 放心 关心 相信
        认为 以为 明白 了解 记得 忘记 着急 难过 高兴 快乐 满意
        愿意 敢 小心 同意 兴趣
        ''',
    ),
    (
        'home-things',
        '🏠',
        ('Đồ vật quanh nhà', 'Things at home'),
        '''
        家 书 字 桌子 椅子 杯子 电脑 电视 东西 衣服 猫 狗 手机
        手表 颜色 房间 报纸 信 包 照片 花 鞋 灯 礼物 糖 冰箱
        空调 伞 眼镜 照相机 盘子 碗 厨房 门 花园
        ''',
    ),
    (
        'describing',
        '🎭',
        ('Tính chất & miêu tả', 'Describing things & people'),
        '''
        好 大 小 多 少 漂亮 高 长 新 快 慢 难 有意思 错 真
        一样 重要 老 像 特别 容易 简单 清楚 可爱 低 短 坏 一般
        差 奇怪 旧 方便 相同 干净 安静 新鲜 有名 矮 年轻 聪明
        认真 努力 热情 忙 声音
        ''',
    ),
    (
        'health-colors',
        '🎨',
        ('Sức khoẻ & màu sắc', 'Health & colours'),
        '''
        身体 眼睛 生病 药 累 休息 医生 医院 睡觉 饿 颜色 红色
        白色 黑色 衣服 漂亮 白 黑 红 脸 检查 健康 脚 腿 害怕 疼
        胖 瘦 绿 舒服 蓝 黄 耳朵 鼻子 感冒 发烧 锻炼
        ''',
    ),
    (
        'weather-seasons',
        '🌦️',
        ('Thời tiết & bốn mùa', 'Weather & seasons'),
        '''
        天气 冷 热 下雨 雪 晴 阴 春天 夏天 秋天 冬天 外面 今天
        明天 可能 树 鸟 变化 环境 太阳 绿 云 刮 月亮 季节 春 夏
        秋 冬 草
        ''',
    ),
    (
        'school',
        '🏫',
        ('Trường lớp & học tập', 'School & study'),
        '''
        老师 学生 同学 学校 学习 汉语 字 考试 问题 教室 懂 知道
        写 读 汉字 课 题 意思 问 回答 历史 作业 成绩 班 数学
        年级 铅笔 词语 句子 字典 普通话 黑板 复习 练习 校长 教
        水平
        ''',
    ),
    (
        'work',
        '💼',
        ('Công việc', 'Work'),
        '''
        公司 上班 工作 帮助 介绍 报纸 机会 决定 办法 要求 完成
        会议 办公室 习惯 认真 新闻 经理 同事 文化 作用 电子 准备
        开始 选择 了解
        ''',
    ),
    (
        'hobbies',
        '⚽',
        ('Sở thích & thể thao', 'Hobbies & sport'),
        '''
        运动 游泳 跑步 唱歌 跳舞 踢足球 玩 旅游 看 听 电影 喜欢
        电视 书 音乐 打篮球 踢 比赛 参加 游戏 马 照片 故事 节目
        表演 画 动物 新闻 兴趣 体育 公园 爱好 爬山 熊猫 上网
        照相机
        ''',
    ),
    (
        'questions',
        '❓',
        ('Từ để hỏi', 'Question words'),
        '''
        什么 谁 哪儿 几 多少 吗 呢 怎么 怎么样 为什么 哪 这 那
        吧 啊 还是
        ''',
    ),
    (
        'grammar-words',
        '🧩',
        ('Từ ngữ pháp cơ bản', 'Core grammar words'),
        '''
        的 了 和 是 不 没有 有 都 也 一起 一下 比 别 得 着 还
        就 再 跟 把 被 地 给 从 向 离 为 为了 关于 根据 除了
        用 可能 可以 其他
        ''',
    ),
    (
        'connectors',
        '🔗',
        ('Liên từ & phó từ', 'Linking words & adverbs'),
        '''
        因为 所以 但是 如果 虽然 而且 或者 然后 其实 当然 一定
        一直 又 更 越 才 总是 几乎 比较 特别 极 多么 很 太 非常
        最 真 主要 一般 一边 每 已经 一共
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
