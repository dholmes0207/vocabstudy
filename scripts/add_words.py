#!/usr/bin/env python3
"""Merge newly generated word entries into public/data/en.json (reusable helper for growing the pack in batches).

Reads new entries (list of {word,pos,posCategory,meaning,exampleEn,exampleVi})
from the path in argv[1], appends the ones not already present (by lowercased
word), assigns fresh contiguous ids after the current max, sets ipa/viRead to ""
(filled later by generate_phonetics.py), and updates meta.count.
"""
import json
import sys
from pathlib import Path

EN = Path("public/data/en.json")


def main(new_path):
    pack = json.loads(EN.read_text(encoding="utf-8"))
    words = pack["words"]
    existing = {w["word"].strip().lower() for w in words}
    max_id = max(w["id"] for w in words)

    new = json.loads(Path(new_path).read_text(encoding="utf-8"))
    if isinstance(new, dict):
        new = new.get("entries", [])

    added, skipped_dup, skipped_bad = [], [], []
    for e in new:
        w = (e.get("word") or "").strip()
        key = w.lower()
        if not w or not (e.get("meaning") or "").strip() or not (e.get("exampleEn") or "").strip():
            skipped_bad.append(w)
            continue
        if key in existing:
            skipped_dup.append(w)
            continue
        existing.add(key)
        max_id += 1
        added.append({
            "id": max_id,
            "word": w,
            "ipa": "",
            "viRead": "",
            "pos": e.get("pos", "").strip() or "other",
            "posCategory": e.get("posCategory", "other"),
            "meaning": e.get("meaning", "").strip(),
            "exampleEn": e.get("exampleEn", "").strip(),
            "exampleVi": e.get("exampleVi", "").strip(),
        })

    words.extend(added)
    pack["meta"]["count"] = len(words)
    EN.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"added: {len(added)} | skipped dup: {len(skipped_dup)} | skipped bad: {len(skipped_bad)}")
    if skipped_dup:
        print("  dup:", skipped_dup)
    if skipped_bad:
        print("  bad:", skipped_bad)
    print(f"new meta.count: {pack['meta']['count']}  (ids {added[0]['id']}..{added[-1]['id']})" if added else "nothing added")


if __name__ == "__main__":
    main(sys.argv[1])
