#!/usr/bin/env python3
"""Patch existing entries of a language pack by id — the safe way to fix or
deepen words already in public/data/<code>.json (which stays the single source
of truth).

Usage:
  python3 scripts/patch_words.py <patch.json> [--code en] [--dry-run]

The patch is a JSON object keyed by word id:

  {
    "298": { "meaning": "cần", "exampleEn": "I need a new phone.", "exampleVi": "…" },
    "215": { "collocations": [{"en": "make a decision", "vi": "đưa ra quyết định"}],
             "family": [{"word": "decide", "vi": "quyết định (động từ)"}],
             "tip": "…", "emoji": "🤔" }
  }

Rules (the script refuses the whole patch if any entry breaks one):
  * the id must exist; `id` and `word` can never be changed here;
  * only the fields below may be set, each with the right shape;
  * a value of null removes an optional field.

After changing an example sentence, run scripts/generate_audio.py: it notices
the sentence changed and re-records just that clip (src/lib/dataset.test.ts
fails until it does).
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TEXT_FIELDS = {"meaning", "exampleEn", "exampleVi", "pos", "tip", "emoji", "ipa", "viRead"}
PAIR_FIELDS = {"collocations": ("en", "vi"), "family": ("word", "vi")}
OPTIONAL = {"tip", "emoji", "collocations", "family"}
POS_CATEGORIES = {
    "noun", "verb", "adjective", "adverb", "preposition", "conjunction",
    "pronoun", "determiner", "article", "other",
}


def validate(wid: str, fields: dict, errors: list[str]) -> None:
    for key, value in fields.items():
        where = f"id {wid}.{key}"
        if key in ("id", "word"):
            errors.append(f"{where}: không được đổi id/word bằng patch")
        elif value is None:
            if key not in OPTIONAL:
                errors.append(f"{where}: chỉ trường tuỳ chọn mới được xoá (null)")
        elif key in TEXT_FIELDS:
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{where}: phải là chuỗi khác rỗng")
        elif key == "posCategory":
            if value not in POS_CATEGORIES:
                errors.append(f"{where}: '{value}' không phải từ loại hợp lệ")
        elif key in PAIR_FIELDS:
            a, b = PAIR_FIELDS[key]
            ok = isinstance(value, list) and value and all(
                isinstance(x, dict)
                and set(x) == {a, b}
                and all(isinstance(x[k], str) and x[k].strip() for k in (a, b))
                for x in value
            )
            if not ok:
                errors.append(f"{where}: phải là danh sách [{{'{a}': …, '{b}': …}}] khác rỗng")
        else:
            errors.append(f"{where}: trường không được hỗ trợ")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("patch")
    ap.add_argument("--code", default="en")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    pack_path = ROOT / "public" / "data" / f"{args.code}.json"
    pack = json.loads(pack_path.read_text(encoding="utf-8"))
    by_id = {str(w["id"]): w for w in pack["words"]}
    patch = json.loads(Path(args.patch).read_text(encoding="utf-8"))
    if not isinstance(patch, dict):
        sys.exit("Patch phải là object { id: { field: value } }")

    errors: list[str] = []
    for wid, fields in patch.items():
        if wid not in by_id:
            errors.append(f"id {wid}: không tồn tại")
        elif not isinstance(fields, dict):
            errors.append(f"id {wid}: phải là object")
        else:
            validate(wid, fields, errors)
    if errors:
        print("\n".join(errors), file=sys.stderr)
        sys.exit(f"Từ chối patch: {len(errors)} lỗi, chưa ghi gì.")

    changed = 0
    for wid, fields in patch.items():
        w = by_id[wid]
        for key, value in fields.items():
            if value is None:
                changed += key in w
                w.pop(key, None)
            elif w.get(key) != value:
                w[key] = value
                changed += 1

    print(f"{len(patch)} từ, {changed} trường thay đổi.")
    if not args.dry_run:
        pack_path.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
