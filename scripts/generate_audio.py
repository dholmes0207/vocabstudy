#!/usr/bin/env python3
"""
Pre-render high-quality Neural TTS audio for a VocabStudy language pack using
edge-tts (Microsoft Edge online neural voices — free, no API key).

For each word it writes:
  public/audio/<code>/w<id>.mp3   -> the headword
  public/audio/<code>/e<id>.mp3   -> the example sentence

The app plays these static files and falls back to the browser's Web Speech
API when a file is missing, so partial runs are fine (the script is resumable —
it skips files that already exist).

Usage:
  python3 scripts/generate_audio.py                # all words + examples (en)
  python3 scripts/generate_audio.py --voice en-US-JennyNeural
  python3 scripts/generate_audio.py --code en --no-examples
  python3 scripts/generate_audio.py --limit 20     # quick test on first 20

Requires: pip install edge-tts
"""
import argparse
import asyncio
import json
import os
import sys

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def clean_word(word: str) -> str:
    # "a / an" -> "a, an" so the voice doesn't read the slash.
    return ", ".join(p.strip() for p in word.split("/") if p.strip())


async def synth(text: str, path: str, voice: str, rate: str, sem: asyncio.Semaphore) -> bool:
    async with sem:
        for attempt in range(3):
            try:
                communicate = edge_tts.Communicate(text, voice, rate=rate)
                await communicate.save(path)
                if os.path.getsize(path) > 0:
                    return True
            except Exception as e:  # network hiccup -> retry
                if attempt == 2:
                    print(f"  ! failed: {path} ({e})", file=sys.stderr)
                await asyncio.sleep(1.5 * (attempt + 1))
        return False


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--code", default="en", help="language pack code (default en)")
    ap.add_argument("--voice", default="en-US-AriaNeural", help="edge-tts voice name")
    ap.add_argument("--rate", default="+0%", help="speaking rate, e.g. -10%")
    ap.add_argument("--concurrency", type=int, default=8)
    ap.add_argument("--limit", type=int, default=0, help="only first N words (0 = all)")
    ap.add_argument("--no-examples", action="store_true", help="skip example sentences")
    args = ap.parse_args()

    pack_path = os.path.join(ROOT, "public", "data", f"{args.code}.json")
    with open(pack_path, encoding="utf-8") as f:
        pack = json.load(f)
    words = pack["words"]
    if args.limit:
        words = words[: args.limit]

    out_dir = os.path.join(ROOT, "public", "audio", args.code)
    os.makedirs(out_dir, exist_ok=True)

    sem = asyncio.Semaphore(args.concurrency)
    tasks = []
    planned = 0
    for w in words:
        wid = w["id"]
        wpath = os.path.join(out_dir, f"w{wid}.mp3")
        if not os.path.exists(wpath):
            tasks.append(synth(clean_word(w["word"]), wpath, args.voice, args.rate, sem))
            planned += 1
        if not args.no_examples and w.get("exampleEn"):
            epath = os.path.join(out_dir, f"e{wid}.mp3")
            if not os.path.exists(epath):
                tasks.append(synth(w["exampleEn"], epath, args.voice, args.rate, sem))
                planned += 1

    print(f"Voice: {args.voice} | words: {len(words)} | files to generate: {planned}")
    if not tasks:
        print("Nothing to do — all files already exist.")
        return

    done = 0
    for coro in asyncio.as_completed(tasks):
        await coro
        done += 1
        if done % 50 == 0 or done == planned:
            print(f"  {done}/{planned} generated…", flush=True)

    total = len([n for n in os.listdir(out_dir) if n.endswith(".mp3")])
    size_mb = sum(os.path.getsize(os.path.join(out_dir, n)) for n in os.listdir(out_dir)) / 1e6
    print(f"Done. {total} files in {out_dir} ({size_mb:.1f} MB).")


if __name__ == "__main__":
    asyncio.run(main())
