#!/usr/bin/env python3
"""
Pre-render high-quality Neural TTS audio for a VocaStudy language pack using
edge-tts (Microsoft Edge online neural voices — free, no API key).

Supports MULTIPLE voices. For each voice it writes:
  public/audio/<code>/<voiceKey>/w<id>.mp3   -> the headword
  public/audio/<code>/<voiceKey>/e<id>.mp3   -> the example sentence
and a manifest the app reads to offer a voice picker:
  public/audio/<code>/index.json  -> { "default": <key>, "voices": [...] }

The app plays these static files (letting the user choose a voice) and only
falls back to the browser's Web Speech API when no audio exists. The script is
resumable — it skips files that already exist.

Example clips must say what the card shows. The sentence each clip was recorded
from is kept in scripts/audio-texts/<code>.json; when an example is rewritten
(scripts/patch_words.py) the next run notices the mismatch and re-records just
that clip, for every voice. src/lib/dataset.test.ts fails while any clip is
stale. `--seed-texts` records the current sentences for clips that already
exist, without synthesising anything (one-off bootstrap).

Usage:
  python3 scripts/generate_audio.py                     # all voices, words+examples (en)
  python3 scripts/generate_audio.py --voices aria       # only the "aria" voice
  python3 scripts/generate_audio.py --code en --no-examples
  python3 scripts/generate_audio.py --limit 20          # quick test on first 20
  python3 scripts/generate_audio.py --seed-texts        # bootstrap the sentence record

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
    ap.add_argument("--seed-texts", action="store_true", help="record current sentences for existing clips, synthesise nothing")
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

    # Which sentence each example clip was recorded from (shared by all voices).
    texts_path = os.path.join(ROOT, "scripts", "audio-texts", f"{args.code}.json")
    os.makedirs(os.path.dirname(texts_path), exist_ok=True)
    texts: dict[str, str] = {}
    if os.path.exists(texts_path):
        with open(texts_path, encoding="utf-8") as f:
            texts = json.load(f)

    def save_texts() -> None:
        ordered = {k: texts[k] for k in sorted(texts, key=int)}
        with open(texts_path, "w", encoding="utf-8") as f:
            json.dump(ordered, f, ensure_ascii=False, indent=2)
            f.write("\n")

    if args.seed_texts:
        seeded = 0
        for w in words:
            clips = [os.path.join(code_dir, v["key"], f"e{w['id']}.mp3") for v in VOICES]
            if w.get("exampleEn") and all(os.path.exists(c) for c in clips) and str(w["id"]) not in texts:
                texts[str(w["id"])] = w["exampleEn"]
                seeded += 1
        save_texts()
        print(f"Seeded {seeded} sentence(s) into {os.path.relpath(texts_path, ROOT)}.")
        return

    sem = asyncio.Semaphore(args.concurrency)
    tasks = []
    # id -> list of pending example tasks; the record is updated only when every
    # voice re-recorded the new sentence.
    example_jobs: dict[str, list] = {}
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
                stale = texts.get(str(wid)) != w["exampleEn"]
                if not os.path.exists(epath) or stale:
                    task = asyncio.ensure_future(synth(w["exampleEn"], epath, v["voice"], args.rate, sem))
                    example_jobs.setdefault(str(wid), []).append(task)
                    tasks.append(task)

    planned = len(tasks)
    print(f"Voices: {[v['key'] for v in voices]} | words: {len(words)} | files to generate: {planned}")
    if not tasks:
        print("Nothing to do — all files already exist and match their sentences.")
        return

    done = 0
    for coro in asyncio.as_completed(tasks):
        await coro
        done += 1
        if done % 100 == 0 or done == planned:
            print(f"  {done}/{planned} generated…", flush=True)

    by_id = {str(w["id"]): w for w in words}
    for wid, jobs in example_jobs.items():
        if all(j.result() for j in jobs) and len(jobs) == len(voices) == len(VOICES):
            texts[wid] = by_id[wid]["exampleEn"]
    save_texts()

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
