#!/usr/bin/env python3
"""
Pre-render neural TTS for the everyday-phrases pack ("Mẫu câu giao tiếp"),
in the same voices as the word audio (see generate_audio.py).

Writes public/audio/<code>/<voiceKey>/p<id>.mp3 for every phrase in
public/data/phrases/<code>.json. Resumable: existing clips are skipped unless
the phrase text changed — the text each clip was recorded from is kept in
scripts/audio-texts/phrases-<code>.json, and src/lib/phrases.test.ts fails while
any clip is missing or stale.

Usage:
  python3 scripts/generate_phrase_audio.py            # en, all voices
  python3 scripts/generate_phrase_audio.py --code en --voices aria
  python3 scripts/generate_phrase_audio.py --code ko  # Korean phrases, Korean voices
Requires: pip install edge-tts
"""
import argparse
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_audio import ROOT, speakable, synth, voices_for  # noqa: E402


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--code", default="en")
    ap.add_argument("--voices", nargs="*", help="voice keys (default: all)")
    ap.add_argument("--rate", default="-5%", help="a touch slower than normal speech")
    args = ap.parse_args()

    pack_path = os.path.join(ROOT, "public", "data", "phrases", f"{args.code}.json")
    with open(pack_path, encoding="utf-8") as f:
        pack = json.load(f)
    phrases = [p for t in pack["topics"] for p in t["phrases"]]

    texts_path = os.path.join(ROOT, "scripts", "audio-texts", f"phrases-{args.code}.json")
    recorded: dict[str, str] = {}
    if os.path.exists(texts_path):
        with open(texts_path, encoding="utf-8") as f:
            recorded = json.load(f)

    voices = [v for v in voices_for(args.code) if not args.voices or v["key"] in args.voices]
    sem = asyncio.Semaphore(6)
    jobs = []
    for v in voices:
        folder = os.path.join(ROOT, "public", "audio", args.code, v["key"])
        os.makedirs(folder, exist_ok=True)
        for p in phrases:
            path = os.path.join(folder, f"p{p['id']}.mp3")
            fresh = os.path.exists(path) and recorded.get(str(p["id"])) == p["en"]
            if not fresh:
                jobs.append(synth(speakable(p["en"]), path, v["voice"], args.rate, sem))

    print(f"{len(phrases)} phrases × {len(voices)} voices — {len(jobs)} clips to record")
    results = await asyncio.gather(*jobs)
    if not all(results):
        sys.exit("some clips failed — run again to retry")

    for p in phrases:
        recorded[str(p["id"])] = p["en"]
    with open(texts_path, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(recorded.items(), key=lambda kv: int(kv[0]))), f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
