#!/usr/bin/env python3
"""
Populate each word with:
  - ipa    : IPA transcription (General American) via eng-to-ipa
  - viRead : an approximate Vietnamese-style reading ("cách đọc") derived from
             the CMU Pronouncing Dictionary (ARPAbet), stressed syllable in CAPS.

Also fixes a few PDF-extraction artifacts (words/examples split mid-word).

Rewrites public/data/en.json in place (the single source of truth — the app
fetches it directly) and prints the audio files that must be re-generated
because their text changed.

Requires: pip install eng-to-ipa cmudict
"""
import json
import sys
import os
import re

import eng_to_ipa as ipa_lib
import cmudict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CMU = cmudict.dict()

# --- Fix extraction artifacts (word wrapped across a line -> stray space) ------
# NOTE: keyed by the ORIGINAL padded-dataset ids. Ids 442/668/894 were
# duplicate "deep" rows removed in the F2 dedup — dropped here so they can't
# collide with (and clobber) the freshly-added words that now reuse those ids.
CORRECTIONS = {
    23: {"word": "administration", "exampleEn": "She works in business administration."},
    139: {"exampleEn": "The audience applauded enthusiastically."},
    216: {"exampleEn": "Deep understanding."},
}

# --- ARPAbet -> Vietnamese approximation ---------------------------------------
VOWEL = {
    "AA": "a", "AE": "e", "AH": "ơ", "AO": "o", "AW": "ao", "AY": "ai", "EH": "e",
    "ER": "ơ", "EY": "ây", "IH": "i", "IY": "i", "OW": "âu", "OY": "oi", "UH": "u", "UW": "u",
}
# A stressed long vowel is doubled so the pairs Vietnamese learners mix up stay
# apart: sheep SHIIP / ship SHIP, leave LIIV / live LIV, food PHUUĐ / foot PHUT.
# Unstressed ones (the -y of "happy", the u of "to") stay single; see _vr_token.
LONG_STRESSED = {"IY": "ii", "UW": "uu"}
CONS = {
    "B": "b", "CH": "ch", "D": "đ", "DH": "đ", "F": "ph", "G": "g", "HH": "h", "JH": "gi",
    "K": "k", "L": "l", "M": "m", "N": "n", "NG": "ng", "P": "p", "R": "r", "S": "s",
    "SH": "sh", "T": "t", "TH": "th", "V": "v", "W": "w", "Y": "y", "Z": "d", "ZH": "zh",
}
VOWELS = set(VOWEL)


def _base(ph: str) -> str:
    return ph.rstrip("012")


def _is_vowel(ph: str) -> bool:
    return _base(ph) in VOWELS


def _vr_token(word: str) -> str:
    key = word.lower().strip(".,!?;:'\"")
    if key not in CMU:
        return ""
    phs = CMU[key][0]
    vidx = [i for i, p in enumerate(phs) if _is_vowel(p)]
    if not vidx:
        return ""
    syls = []
    prev = 0
    for k, vi in enumerate(vidx):
        cons = phs[prev:vi]
        if k > 0 and len(cons) >= 2:  # split cluster: 1 coda to prev, rest onset
            syls[-1]["coda"] += cons[:1]
            cons = cons[1:]
        syls.append({"onset": cons, "vowel": phs[vi], "coda": []})
        prev = vi + 1
    if prev < len(phs):
        syls[-1]["coda"] += phs[prev:]
    out = []
    for s in syls:
        t = "".join(CONS.get(_base(p), "") for p in s["onset"])
        v = _base(s["vowel"])
        # Primary stress, or secondary stress in a closed syllable (ath-LEET,
        # SEA-food). An open one with secondary stress — the -ty of "ability" —
        # sounds short in speech, so it stays single.
        stressed = s["vowel"].endswith("1") or (s["vowel"].endswith("2") and bool(s["coda"]))
        t += (LONG_STRESSED.get(v) if stressed else None) or VOWEL.get(v, "")
        t += "".join(CONS.get(_base(p), "") for p in s["coda"])
        out.append(t.upper() if s["vowel"].endswith("1") else t)
    return "-".join(out)


def viet_read(word: str) -> str:
    groups = [g.strip() for g in word.split("/")]
    parts = []
    for g in groups:
        toks = [_vr_token(t) for t in g.split()]
        joined = " ".join(t for t in toks if t)
        if joined:
            parts.append(joined)
    return " / ".join(parts)


def ipa_of(word: str) -> str:
    groups = [g.strip() for g in word.split("/")]
    res = [ipa_lib.convert(g).replace("*", "").strip() for g in groups]
    return " / ".join(r for r in res if r)


def main() -> None:
    # --missing-only: fill ipa/viRead just for words that have none (new words
    # appended by add_words.py). Never re-applies CORRECTIONS, so it cannot undo
    # later edits made with patch_words.py.
    missing_only = "--missing-only" in sys.argv
    src = os.path.join(ROOT, "public", "data", "en.json")
    with open(src, encoding="utf-8") as f:
        pack = json.load(f)

    changed_audio = []  # (kind, id): kind in {'w','e'}
    for w in pack["words"]:
        if missing_only:
            if not w.get("ipa"):
                w["ipa"] = ipa_of(w["word"])
            if not w.get("viRead"):
                w["viRead"] = viet_read(w["word"])
            continue
        fix = CORRECTIONS.get(w["id"])
        if fix:
            if "word" in fix and fix["word"] != w["word"]:
                w["word"] = fix["word"]
                changed_audio.append(("w", w["id"]))
            if "exampleEn" in fix and fix["exampleEn"] != w["exampleEn"]:
                w["exampleEn"] = fix["exampleEn"]
                changed_audio.append(("e", w["id"]))
        w["ipa"] = ipa_of(w["word"])
        w["viRead"] = viet_read(w["word"])

    # stats
    missing_ipa = [w["id"] for w in pack["words"] if not w["ipa"]]
    missing_vr = [w["id"] for w in pack["words"] if not w["viRead"]]
    print(f"words: {len(pack['words'])}")
    print(f"missing ipa: {len(missing_ipa)} {missing_ipa[:10]}")
    print(f"missing viRead: {len(missing_vr)} {missing_vr[:10]}")
    print("sample:")
    for i in (0, 1, 22, 138, 215):
        w = pack["words"][i]
        print(f"  [{w['id']}] {w['word']!r}  ipa={w['ipa']!r}  viRead={w['viRead']!r}")

    with open(src, "w", encoding="utf-8") as f:
        json.dump(pack, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"\nWrote {src}")

    # Report audio to regenerate
    if changed_audio:
        print("\nAudio files whose text changed (delete + rerun generate_audio.py):")
        for kind, wid in changed_audio:
            print(f"  {kind}{wid}.mp3")


if __name__ == "__main__":
    main()
