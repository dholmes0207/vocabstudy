#!/usr/bin/env python3
"""Expand a compact batch of new words into the entry list add_words.py reads.

A batch is written by hand (or by a model) as a JSON array of rows — one row
per word, positional to keep it short enough to review at a glance:

  [word, pos, posCategory, meaning, exampleEn, exampleVi,
   [[collocation, vi], ...], [[family word, vi], ...], tip, emoji]

Every extension word is stage 2 (see src/lib/dataset.test.ts). Usage:

  python3 scripts/compact_batch.py batch.json entries.json
  python3 scripts/add_words.py entries.json
  python3 scripts/generate_phonetics.py --missing-only   # then CHECK the IPA
  python3 scripts/generate_audio.py
"""
import json
import sys
from pathlib import Path


def expand(row):
    word, pos, cat, meaning, ex_en, ex_vi, cols, fam, tip, emoji = row
    entry = {
        "word": word,
        "pos": pos,
        "posCategory": cat,
        "meaning": meaning,
        "exampleEn": ex_en,
        "exampleVi": ex_vi,
        "collocations": [{"en": en, "vi": vi} for en, vi in cols],
        "tip": tip,
        "stage": 2,
    }
    if fam:
        entry["family"] = [{"word": w, "vi": vi} for w, vi in fam]
    if emoji:
        entry["emoji"] = emoji
    return entry


def main(src, dst):
    rows = json.loads(Path(src).read_text(encoding="utf-8"))
    entries = [expand(r) for r in rows]
    Path(dst).write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(entries)} entries")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
