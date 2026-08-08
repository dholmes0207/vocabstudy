#!/usr/bin/env python3
"""
Pre-render high-quality Neural TTS audio for a VocabStudy language pack using
edge-tts (Microsoft Edge online neural voices — free, no API key).

Supports MULTIPLE voices. For each voice it writes:
  public/audio/<code>/<voiceKey>/w<id>.mp3   -> the headword
  public/audio/<code>/<voiceKey>/e<id>.mp3   -> the example sentence
and a manifest the app reads to offer a voice picker:
  public/audio/<code>/index.json  -> { "default": <key>, "voices": [...] }

The app plays these static files (letting the user choose a voice) and only
falls back to the browser's Web Speech API when no audio exists. The script is
resumable — it skips files that already exist.

Usage:
  python3 scripts/generate_audio.py                     # all voices, words+examples (en)
  python3 scripts/generate_audio.py --voices aria       # only the "aria" voice
  python3 scripts/generate_audio.py --code en --no-examples
  python3 scripts/generate_audio.py --limit 20          # quick test on first 20

To add/change voices, edit VOICES below (pick from `edge-tts --list-voices`).
Requires: pip install edge-tts
"""
import argparse
import asyncio
import json
import os
import sys

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Voices offered to the user. First entry is the default. `key` is the folder
# name and the value stored in settings; `label` is shown in the UI.
VOICES = [
    {"key": "aria", "voice": "en-US-AriaNeural", "label": "Aria — Nữ (Mỹ) 🇺🇸"},
    {"key": "guy", "voice": "en-US-GuyNeural", "label": "Guy — Nam (Mỹ) 🇺🇸"},
]

# Optional per-word pronunciation overrides for the WORD clip (examples always
# read naturally in context). Map a headword to the exact text to synthesize.
# NOTE: a lone "a" is read by every TTS as the letter name /eɪ/ rather than the
# article /ə/; adding a carrier word ("a dog") is the only way to get the article
# sound, but per user preference we keep "a / an" read plainly (no override).
PRON_OVERRIDES: dict[str, str] = {}


def word_text(word: str) -> str:
    if word in PRON_OVERRIDES:
        return PRON_OVERRIDES[word]
    # "anybody / anyone" -> "anybody, anyone" so the voice doesn't read a slash.
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
    ap.add_argument("--voices", default="", help="comma-separated voice keys (default: all in VOICES)")
    ap.add_argument("--rate", default="+0%", help="speaking rate, e.g. -10%")
    ap.add_argument("--concurrency", type=int, default=8)
    ap.add_argument("--limit", type=int, default=0, help="only first N words (0 = all)")
    ap.add_argument("--no-examples", action="store_true", help="skip example sentences")
    args = ap.parse_args()

    selected = set(k.strip() for k in args.voices.split(",") if k.strip())
    voices = [v for v in VOICES if not selected or v["key"] in selected]
    if not voices:
        sys.exit(f"No matching voices. Available keys: {[v['key'] for v in VOICES]}")

    pack_path = os.path.join(ROOT, "public", "data", f"{args.code}.json")
    with open(pack_path, encoding="utf-8") as f:
        pack = json.load(f)
    words = pack["words"]
    if args.limit:
        words = words[: args.limit]

    code_dir = os.path.join(ROOT, "public", "audio", args.code)
    os.makedirs(code_dir, exist_ok=True)

    # Write/refresh the voice manifest the app reads.
    manifest = {"default": VOICES[0]["key"], "voices": [{"key": v["key"], "label": v["label"], "voice": v["voice"]} for v in VOICES]}
    with open(os.path.join(code_dir, "index.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    sem = asyncio.Semaphore(args.concurrency)
    tasks = []
    for v in voices:
        out_dir = os.path.join(code_dir, v["key"])
        os.makedirs(out_dir, exist_ok=True)
        for w in words:
            wid = w["id"]
            wpath = os.path.join(out_dir, f"w{wid}.mp3")
            if not os.path.exists(wpath):
                tasks.append(synth(word_text(w["word"]), wpath, v["voice"], args.rate, sem))
            if not args.no_examples and w.get("exampleEn"):
                epath = os.path.join(out_dir, f"e{wid}.mp3")
                if not os.path.exists(epath):
                    tasks.append(synth(w["exampleEn"], epath, v["voice"], args.rate, sem))

    planned = len(tasks)
    print(f"Voices: {[v['key'] for v in voices]} | words: {len(words)} | files to generate: {planned}")
    if not tasks:
        print("Nothing to do — all files already exist.")
        return

    done = 0
    for coro in asyncio.as_completed(tasks):
        await coro
        done += 1
        if done % 100 == 0 or done == planned:
            print(f"  {done}/{planned} generated…", flush=True)

    total = 0
    size = 0
    for v in voices:
        d = os.path.join(code_dir, v["key"])
        for n in os.listdir(d):
            if n.endswith(".mp3"):
                total += 1
                size += os.path.getsize(os.path.join(d, n))
    print(f"Done. {total} files across {len(voices)} voice(s) ({size / 1e6:.1f} MB).")


if __name__ == "__main__":
    asyncio.run(main())
