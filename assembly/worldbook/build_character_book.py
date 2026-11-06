#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""《惊悚乐园》咩咩全栈世界书构建/回读校验。
源：蓝灯、绿灯、46人物、46能力、28独立上下卷、26地点。
本程序不读取README/QA/施工说明，不修改冻结正文，不接MVU。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSEMBLY = ROOT / "assembly" / "worldbook"
MANIFEST = ASSEMBLY / "assembly_manifest.json"
DIST = ASSEMBLY / "dist" / "惊悚乐园_character_book.json"

FORMAL_PREFIX = ("蓝灯｜", "绿灯｜", "角色｜", "能力｜", "地点｜", "时间线｜")
TRIGGER_PREFIX = ("绿灯｜", "角色｜", "能力｜", "地点｜")
EXPECTED = {"蓝灯｜": 6, "绿灯｜": 29, "角色｜": 46,
            "能力｜": 46, "地点｜": 26, "时间线｜": 28}
ALLOWED_SOURCE = (
    r"worldbook/(?:blue/[^/]+\.md|green/[^/]+\.md|"
    r"characters/C\d{3}_[^/]+\.md|abilities/C\d{3}_[^/]+\.md|"
    r"timeline/\d\d_第[^/]+_[上下]\.md|"
    r"locations/P[01]/\d{3}_[^/]+\.md)"
)
EVIDENCE_RULES = [
    (r"【第[^】]*】", ""),
    (r"【主线第[^】]*】", ""),
    (r"【制卡[^】]*】", ""),
    (r"【原著[^】]*】", ""),
    (r"[:：]\s{2,}", ": "),
]


def require(ok: bool, message: str) -> None:
    if not ok:
        raise ValueError(message)


def git_blob_sha(raw: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\x00" + raw).hexdigest()


def read_frozen_source(spec: dict) -> str:
    rel = spec["source_path"]
    require(bool(re.fullmatch(ALLOWED_SOURCE, rel)), f"来源路径不在正式正文白名单: {rel}")
    path = ROOT / rel
    require(path.is_file(), f"遗漏正式源码: {rel}")
    raw = path.read_bytes()
    require(git_blob_sha(raw) == spec["source_sha"], f"冻结正文SHA不符: {rel}")
    txt = raw.decode("utf-8").strip()
    if rel.startswith("worldbook/timeline/"):
        pieces = re.findall(r"<world_timeline>[\s\S]*?</world_timeline>", txt)
        require(len(pieces) == 1, f"上下卷必须各有且只有一个XML块: {rel}")
        lines = []
        for item in pieces[0].splitlines():
            item = item.strip()
            if not item.startswith("-事件"):
                continue
            for pattern, repl in EVIDENCE_RULES:
                item = re.sub(pattern, repl, item)
            lines.append(item)
        require(len(lines) >= 3, f"时间线事件不足: {rel}")
        require(sum(bool(re.match(r"^-事件[^:：]+[:：]\s*沙盒模式\s*\(", item)) for item in lines) == 1,
                f"沙盒事件有误: {rel}")
        return "<world_timeline>\n" + "\n".join(lines) + "\n</world_timeline>"
    return txt


def assemble() -> dict:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    require(manifest.get("schema") == "thriller_worldbook_assembly_manifest_v1",
            "manifest schema不匹配")
    metas = manifest["entries"]
    require(len(metas) == 201, f"条目数量变化: {len(metas)}")
    entries, used_paths = [], set()
    for spec in metas:
        item = {k: v for k, v in spec.items() if k not in
                ("source_path", "source_sha", "inline_content")}
        if "source_path" in spec:
            require(spec["source_path"] not in used_paths,
                    f"正文重复收录: {spec['source_path']}")
            used_paths.add(spec["source_path"])
            item["content"] = read_frozen_source(spec)
        else:
            item["content"] = spec["inline_content"]
        entries.append(item)
    require(len(used_paths) == 181, f"正式正文遗漏或增多: {len(used_paths)}")
    book = dict(manifest["book_meta"])
    book["entries"] = entries
    check(book)
    return book


def check(book: dict) -> None:
    entries = book["entries"]
    require(len(entries) == 201, "运行书不为201条")
    ids = [e["id"] for e in entries]
    require(len(ids) == len(set(ids)), "世界书id重复")
    kinds = Counter()
    for entry in entries:
        for prefix in EXPECTED:
            if entry["comment"].startswith(prefix):
                kinds[prefix] += 1
                break
    require(all(kinds[p] == n for p, n in EXPECTED.items()),
            f"正文分区数不符: {dict(kinds)}")
    timeline = [e for e in entries if e["comment"].startswith("时间线｜")]
    require(len(timeline) == 28, "上/下卷未独立")
    enabled = [e for e in timeline if e["enabled"]]
    require(len(enabled) == 1 and enabled[0]["comment"].startswith("时间线｜第一卷（上）"),
            "默认只能启用第一卷（上）")
    require(all(e["position"] == "at_depth" and e["extensions"]["depth"] == 0
                and e["constant"] and not e["selective"] for e in timeline),
            "时间线深度/常驻配置有误")
    for e in timeline:
        c = e["content"]
        require(c.startswith("<world_timeline>\n") and c.endswith("\n</world_timeline>"),
                f"时间线结构异常: {e['comment']}")
        require(len(re.findall(r"^-事件[^:：]+[:：]\s*沙盒模式\s*\(", c, re.M)) == 1,
                f"沙盒模式异常: {e['comment']}")
        require(not re.search(r"【第[^】]*】|^\s*#|施工说明|显示层拆分", c, re.M),
                f"工程说明混入时间线: {e['comment']}")
    markers = [e for e in entries if e["comment"].startswith("【") and
               (":起始】" in e["comment"] or ":结尾】" in e["comment"])]
    require(len(markers) == 14 and all(not e["content"] for e in markers),
            "七大区起止标记缺漏或含说明正文")
    for prefix in TRIGGER_PREFIX:
        for e in entries:
            if not e["comment"].startswith(prefix):
                continue
            x = e["extensions"]
            require(e["enabled"] and not e["constant"] and e["selective"] and
                    e["use_regex"] and bool(e["keys"]) and
                    x["prevent_recursion"] and x["exclude_recursion"],
                    f"触发/双防递归配置不全: {e['comment']}")
            scope = "<status>" if prefix == "地点｜" else "<story_scene>"
            require(scope in e["keys"][0], f"缺触发限域: {e['comment']}")
    require(book.get("recursive_scanning") is False, "禁止全书递归扫描")
    require(entries[0]["comment"] == "🗑️清空局部变量(别关)" and
            entries[0]["position"] == "before_char" and
            entries[0]["insertion_order"] == 556,
            "清空局部变量入口异常")
    require(all(not e["enabled"] for e in entries if e["comment"] in
                ("日常记忆存储", "重大记忆存储", "玩家身世背景")),
            "记忆占位条目默认应关闭")
    require(all(entries[i]["insertion_order"] >= entries[i + 1]["insertion_order"]
                for i in range(len(entries) - 1)), "全栈段位倒序")
    require(not any(re.search(r"复制本条|【待替换】|粘贴单个|^#\s|【第\d+章", e["content"], re.M)
                    for e in entries), "模板/说明/证据混进运行内容")
    require(not any(re.search(r"initvar|MVU_ZOD|MagVarUpdate|变量更新规则", e["comment"], re.I)
                    for e in entries), "不允许MVU条目")
    require(sum(e["comment"].startswith("状态栏｜") for e in entries) == 1,
            "悬浮球原生数据格式规则应唯一")
    require(sum(e["comment"].startswith("战斗思维链｜") for e in entries) == 1,
            "战斗判定规则应唯一")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="从冻结源及manifest重建正式JSON")
    args = ap.parse_args()
    book = assemble()
    if args.write:
        DIST.parent.mkdir(parents=True, exist_ok=True)
        DIST.write_text(json.dumps(book, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    else:
        require(DIST.is_file(), "缺少已提交的正式character_book")
        existing = json.loads(DIST.read_text(encoding="utf-8"))
        if existing != book:
            if existing.keys() != book.keys():
                print("DIFF_ROOT_KEYS", sorted(set(existing) ^ set(book)))
            for idx, (left, right) in enumerate(zip(existing["entries"], book["entries"])):
                if left != right:
                    print("DIFF_ENTRY", idx, left.get("comment"), right.get("comment"))
                    for field in sorted(set(left) | set(right)):
                        if left.get(field) != right.get(field):
                            print("DIFF_FIELD", field, repr(left.get(field))[:500],
                                  "VS", repr(right.get(field))[:500])
                    break
            require(False, "运行世界书与冻结源码/manifest不同步")
    print(json.dumps({"result":"PASS","entries":201,"formal":181,
        "timelines":28,"default_enabled":"第一卷（上）",
        "trigger_double_guard":147,"mvu":False},ensure_ascii=False))


if __name__ == "__main__":
    main()
