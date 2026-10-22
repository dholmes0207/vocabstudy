#!/usr/bin/env python3
"""
Record the sentences the app reads aloud that are not a word, its example or an
everyday phrase: collocations ("Hay đi chung với"), grammar examples and
word-order answers, story lines, and what the pack pages say (Hangul, Pinyin,
measure words, numbers, Hán Việt, sayings), listed from the code in
scripts/audio-texts/screens.json by src/lib/screenTexts.test.ts. Same voices
as generate_audio.py.

These clips are not committed: there are some ten thousand of them, all derived
from public/data. They go straight to the R2 bucket (workflow "Record sentence
audio to R2", docs/design/audio-r2.md) as <code>/<voice>/t/<clipId>.mp3, named
after the text itself (clipId in src/lib/textHash.ts), so a rewritten sentence
gets a new clip and the app never plays a stale one. A sentence not recorded yet
404s and the app reads it with the browser's voice, as before.

Usage:
  python3 scripts/generate_text_audio.py --list --code en       # JSON list of texts
  python3 scripts/generate_text_audio.py --self-check           # clipId matches the app
  python3 scripts/generate_text_audio.py --code en --have keys.txt --out staging [--limit N]
      # record the clips not listed in keys.txt (bucket keys) into staging/
Requires: pip install edge-tts (only for recording)
"""
import argparse
import asyncio
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "public", "data")
SCREENS = os.path.join(ROOT, "scripts", "audio-texts", "screens.json")

# Must give the same names as clipId() in src/lib/textHash.ts (its test checks these).
SELF_CHECK = {
    "I have one sister.": "1ucfe6k-lk5ak1",
    "我\u200b要\u200b这个。": "1ecrvq0-1uy4hrr",
}


def text_hash(text: str) -> str:
    """FNV-1a over UTF-16 code units, base 36, as textHash() in the app."""
    h = 0x811C9DC5
    data = text.encode("utf-16-le")
    for i in range(0, len(data), 2):
        h ^= data[i] | (data[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while True:
        h, r = divmod(h, 36)
        out = digits[r] + out
        if h == 0:
            return out


def clip_id(text: str) -> str:
    return f"{text_hash(text)}-{text_hash(chr(1) + text)}"


def load(path: str):
    full = os.path.join(DATA, path)
    if not os.path.exists(full):
        return None
    with open(full, encoding="utf-8") as f:
        return json.load(f)


def texts_for(code: str) -> list[str]:
    """Every sentence the app passes to textAudio() for this pack."""
    texts: set[str] = set()
    pack = load(f"{code}.json") or {"words": []}
    for w in pack["words"]:
        for c in w.get("collocations") or []:
            texts.add(c["en"])
    grammar = load(f"grammar/{code}.json") or {"units": []}
    for u in grammar["units"]:
        for ex in u.get("examples", []):
            texts.add(ex["en"])
        for q in u.get("exercises", []):
            if q.get("type") == "order" and q.get("en"):
                texts.add(q["en"])
    reading = load(f"reading/{code}.json") or {"stories": []}
    for story in reading["stories"]:
        for s in story["sentences"]:
            texts.add(s["en"])
    if os.path.exists(SCREENS):
        with open(SCREENS, encoding="utf-8") as f:
            texts.update(json.load(f).get(code, []))
    return sorted(t for t in texts if t.strip())


async def record(code: str, have: set[str], out: str, concurrency: int, limit: int) -> int:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from generate_audio import speakable, synth, voices_for  # noqa: E402

    sem = asyncio.Semaphore(concurrency)
    jobs, paths = [], []
    for v in voices_for(code):
        folder = os.path.join(out, code, v["key"], "t")
        os.makedirs(folder, exist_ok=True)
        for text in texts_for(code):
            key = f"{code}/{v['key']}/t/{clip_id(text)}.mp3"
            if key in have:
                continue
            if limit and len(jobs) >= limit:
                break
            path = os.path.join(out, key)
            paths.append(path)
            jobs.append(synth(speakable(text), path, v["voice"], "+0%", sem))
    print(f"{code}: {len(jobs)} clips to record, {len(have)} already in the bucket")
    results = await asyncio.gather(*jobs)
    failed = [p for p, ok in zip(paths, results) if not ok]
    for p in failed:  # never upload an empty or broken file
        if os.path.exists(p):
            os.remove(p)
    print(f"{code}: recorded {len(jobs) - len(failed)}, failed {len(failed)}")
    return len(failed)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--code", default="en")
    ap.add_argument("--list", action="store_true", help="print the texts as JSON")
    ap.add_argument("--self-check", action="store_true", help="clipId agrees with the app")
    ap.add_argument("--have", help="file of bucket keys already recorded, one per line")
    ap.add_argument("--out", default="staging")
    ap.add_argument("--concurrency", type=int, default=8)
    ap.add_argument("--limit", type=int, default=0, help="record at most N clips (0 = all)")
    args = ap.parse_args()

    if args.self_check:
        bad = {t: clip_id(t) for t, want in SELF_CHECK.items() if clip_id(t) != want}
        if bad:
            print(f"clipId differs from the app: {bad}", file=sys.stderr)
            return 1
        print("clipId agrees with the app")
        return 0

    texts = texts_for(args.code)
    if args.list:
        print(json.dumps(texts, ensure_ascii=False))
        return 0

    # Two sentences sharing a name would play each other's clip: refuse.
    seen: dict[str, str] = {}
    for t in texts:
        other = seen.setdefault(clip_id(t), t)
        if other != t:
            print(f"clipId collision: {other!r} and {t!r}", file=sys.stderr)
            return 1

    have: set[str] = set()
    if args.have and os.path.exists(args.have):
        with open(args.have, encoding="utf-8") as f:
            have = {line.strip() for line in f if line.strip()}
    failed = asyncio.run(record(args.code, have, args.out, args.concurrency, args.limit))
    # A few failed clips are retried by the next run; only a wholesale failure is an error.
    batch = args.limit or len(texts)
    return 1 if failed and failed > batch // 10 else 0


if __name__ == "__main__":
    sys.exit(main())
