#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the final v3 card from the audited, frozen 201-entry worldbook.
Cover and PNG encoding are handled separately; the user's first selected cover is never edited.
"""
from __future__ import annotations
import json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]
BOOK = ROOT / "assembly/worldbook/dist/惊悚乐园_character_book.json"
OUT = ROOT / "assembly/card/dist/惊悚乐园_v1.0.0_正式角色卡.json"

MAIN = """<opening>
（说明:正常开场·自由身份与地点）
（时间:以当前唯一启用的【时间线】半卷为锚点；默认为第一卷（上））
2055年的S市。霓虹灯照着湿漉漉的街道，神经连接游戏的广告铺满了商业街的屏幕。梦公司新推出的《惊悚乐园》正在引起话题——有人对它的恐怖体验赞不绝口，有人觉得那只是一场昂贵的恶作剧。

你可以是刚接触这款游戏的人，也可以选择以其他符合当前时代与剧情进度的身份进入这座城市。现在没有任何强制的队伍、任务或预定结局。你与封不觉是否认识、如何相遇，以及准备从现实还是游戏世界开始，都由你的行动决定。

输入[随机开始]，由系统抽取起点；也可以直接说出你的身份、地点和第一步行动。

<!--
[Spawn Roulette / 仅在用户输入[随机开始]时执行]
地点池（仅在当前半卷真实允许的区域抽取，概率和为100%）：
- S市街道与商业区 30%：广告屏与来往车流交错，现实社会秩序有效；★
- S市普通公寓 20%：书桌、电脑与神经连接设备安静待机；★
- 《惊悚乐园》初始登录空间 25%：系统提示音与电梯门，功能按当前版本解锁；★★
- S市游戏相关线下场所 15%：玩家正在讨论内测体验和装备；★
- 梦公司总部外围公共区域 10%：企业办公楼、安保与访客通道；★★
身份池（无先验关系）：普通新玩家35%，自由职业者20%，游戏爱好者20%，打工族15%，独立调查者10%。
卷入风险池：低卷入80%，一般卷入17%，稀有异常线索3%。
步骤：先按概率决定身份和地点，再以原著时代的现实科技、声音、光线与环境细节起笔；尊重现实与游戏世界分隔。
禁止：开场直接掌握里世界或高位存在的秘密；不得提前获得后期装备、天赋、魂意或赛事结果；不得在默认第一卷（上）提前启用之后的版本功能。
主角封不觉及其他46名正式人物依真实地点和剧情条件出场，不随机强制相识。
-->
</opening>"""

ALT_ONE = """<opening>
（说明:备选开场·游戏初体验）
（时间:以当前唯一启用的【时间线】半卷为锚点；默认初期版本）
神经连接设备的指示灯亮起，视野中的现实陈设渐渐淡去。系统正在等待你确认身份，一道通向初始服务空间的电梯门停在面前。

这一次从游戏开始。角色创建、可用模式、专精与设备限制均以当前启用的半卷时间线为准；没有获得的物品不会凭空出现在行囊中。

输入[随机开始]开始，或者描述你怎样使用设备并进入游戏。

<!--
玩家身份池：首次登录的普通新玩家65%，已有基础经验的爱好者25%，关注游戏机制的研究型玩家10%。
游戏体验池：教程与基础规则70%，陌生玩家交谈25%，稀有异常征兆5%。
不得把未开放的公测机制、终章秘密、后期技能或超规格权限设为开局既定事实。现实时间与游戏主观时钟分离；对封不觉的相遇不能强行预设。
-->
</opening>"""

ALT_TWO = """<opening>
（说明:备选开场·现实都市沙盒）
（时间:以当前唯一启用的【时间线】半卷为锚点）
S市的早晨与往常没有太大不同。便利店自动门开合，公寓楼里传出电视声，来往行人忙于自己的工作。城市的一角，封不觉仍在琢磨一件看似无关紧要、却有些说不通的事。

你可以从普通市民、邻居、访客、自由职业者或偶然路过的陌生人开始。你的第一句话会决定是否与他接触；也可以暂时不接触任何原著主角，自行探索这座城市。

输入[随机开始]开始，或者直接选择现实地点与行动。

<!--
现实地点池：S市普通街区40%，住宅与邻近公共区域25%，商业街20%，梦公司相关公共场所15%。
现实身份池：居民30%，邻里或来客20%，游戏关注者25%，调查者10%，其他守法职业15%。
日常卷入80%，小型悬疑17%，稀有异常线索3%；不强制玩家与封不觉熟识，不提前揭露后期超自然真相。
-->
</opening>"""


def require(value, message):
    if not value:
        raise ValueError(message)


def main():
    book = json.loads(BOOK.read_text(encoding="utf-8"))
    entries = book["entries"]
    counters = Counter()
    for e in entries:
        for category in ("蓝灯｜", "绿灯｜", "角色｜", "能力｜", "时间线｜", "地点｜"):
            if e["comment"].startswith(category):
                counters[category] += 1
                break
    expected = {"蓝灯｜":6,"绿灯｜":29,"角色｜":46,"能力｜":46,"时间线｜":28,"地点｜":26}
    require(len(entries) == 201, f"worldbook size: {len(entries)}")
    for key,count in expected.items():
        require(counters[key] == count, f"{key} count {counters[key]} != {count}")
    timelines = [e for e in entries if e["comment"].startswith("时间线｜")]
    enabled = [e for e in timelines if e["enabled"]]
    require(len(enabled)==1 and enabled[0]["comment"].startswith("时间线｜第一卷（上）"),
            "default active timeline must be only first upper half")
    triggers = [e for e in entries if e["comment"].startswith(("绿灯｜", "角色｜", "能力｜", "地点｜"))]
    require(len(triggers)==147 and all(e["extensions"]["prevent_recursion"] and
            e["extensions"]["exclude_recursion"] for e in triggers), "dual recursion guards")
    require(book["recursive_scanning"] is False, "worldbook recursion must remain off")
    require(all(e.get("content","").strip() for e in entries if e["comment"].startswith(tuple(expected))),
            "empty formal source entry")
    require(all(x not in str(book) for x in ("【待替换】", "复制本条后", "LOCATION_TEMPLATE.md")),
            "tooling leak into worldbook")
    data = {
      "name": "惊悚乐园",
      "description": "三天两觉《惊悚乐园》原著沙盒角色卡。现实S市、神经连接游戏、剧本与主宇宙均遵循原著规则；世界书含6蓝灯、29绿灯、46正式人物与46能力、14母卷拆分的28条独立时间线、26个地点。无MVU。",
      "personality": "开放式群像互动：由当前场景和已启用的时间线决定封不觉、王叹之、黎若雨及其他原著人物如何行动。封不觉的冷静推理、毒舌与不按常理出牌须保持；不得把所有NPC变成同一口吻，也不可强制玩家采用原著主角身份。",
      "scenario": "2055年的S市与梦公司《惊悚乐园》世界。玩家可从现实或当前版本允许的游戏场景自由开始；原著主线提供背景与发展时序，玩家的行为可以产生合乎世界规则的变化，但已发生事实、当前拥有的能力与物品不能因对话凭空改写。仅启用当前半卷，跨卷切换时先关闭上一半卷。原生文字状态记录封不觉的实际等级、装备、行囊、技能与专精；黑红扑克悬浮球为另外可选的酒馆助手角色脚本。",
      "first_mes": MAIN,
      "mes_example": "",
      "creator_notes": "咩咩制卡·全栈 v1.0.0／无MVU。保留世界书201条，28条上/下卷独立开关，默认仅第一卷（上）。黑红扑克悬浮球另以酒馆助手角色脚本导入，并非MVU或角色卡内嵌脚本。封面为用户在本对话中确定的第一张原图。",
      "system_prompt": "",
      "post_history_instructions": "",
      "alternate_greetings": [ALT_ONE, ALT_TWO],
      "tags": ["惊悚乐园", "Thriller Paradise", "原著", "沙盒", "咩咩制卡", "无MVU"],
      "creator": "",
      "character_version": "1.0.0",
      "extensions": {},
      "character_book": book
    }
    card = {"spec":"chara_card_v3","spec_version":"3.0","data":data}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(card,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    result = {"result":"PASS","json_path":str(OUT.relative_to(ROOT)),
      "worldbook_entries":len(entries),"formal_entries":181,
      "timeline_entries":28,"enabled_timeline":enabled[0]["comment"],
      "recursion_guards":len(triggers),"greetings":1+len(data["alternate_greetings"]),
      "mvu":False,"cover_embedded":False}
    (OUT.parent / "惊悚乐园_v1.0.0_装卡QA.json").write_text(
        json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(result,ensure_ascii=False))


if __name__ == "__main__":
    main()
