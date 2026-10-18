"""Pinyin lines for Chinese sentences (docs/design/chinese.md, bước 6–7).

Shared by build_zh_pack.py (word examples) and build_reading_zh.py (stories).
A sentence is written with "|" between words and its pinyin one syllable per
Chinese character, so a wrong count is caught mechanically; the line shown to
the learner is put back together along the word breaks.
"""
import re

# Chinese punctuation as it reads in a pinyin line.
PUNCT = {'，': ',', '。': '.', '？': '?', '！': '!', '：': ':', '、': ','}
# Their tone follows the next character (一个 yí gè, 不客气 bú kèqi).
TONE_FREE = {'一', '不'}


def is_han(c: str) -> bool:
    return 0x4E00 <= ord(c) <= 0x9FFF


def han_of(text: str) -> list[str]:
    return [c for c in text if is_han(c)]


def flat(reading: str) -> str:
    return reading.replace(' ', '').replace("'", '').lower()


def syllables_for(sentence: str, pinyin: str) -> tuple[list[str], str | None]:
    """The syllables, or an error when they do not pair up with the characters."""
    syllables = pinyin.split()
    han = han_of(sentence.replace('|', ''))
    if len(syllables) != len(han):
        return syllables, f'{len(han)} characters but {len(syllables)} pinyin syllables'
    return syllables, None


def word_mismatch(word: str, sentence: str, syllables: list[str], reading: str) -> str | None:
    """Error when the syllables of `word` inside the sentence differ from its pack reading."""
    if word in TONE_FREE:
        return None
    at = ''.join(han_of(sentence.replace('|', ''))).find(word)
    if at < 0:
        return None
    got = ''.join(syllables[at : at + len(word)])
    return None if flat(got) == flat(reading) else f'"{word}" reads "{got}", the pack says "{reading}"'


def pinyin_line(sentence: str, syllables: list[str], pack_reads: dict[str, str]) -> str:
    """"我|喜欢|喝|咖啡。" + syllables → "Wǒ xǐhuan hē kāfēi."."""
    out, i = [], 0
    for token in sentence.split('|'):
        chars = han_of(token)
        if not chars:
            out.append(''.join(PUNCT.get(c, c) for c in token))
            continue
        part = syllables[i : i + len(chars)]
        i += len(chars)
        # A pack word written in two parts keeps its spacing ("nǐ hǎo", "dǎ diànhuà").
        spaced = pack_reads.get(''.join(chars), '')
        read = spaced if ' ' in spaced and flat(spaced) == flat(''.join(part)) else ''.join(part)
        head = ''.join(c for c in token[: token.index(chars[0])] if not is_han(c))
        tail = ''.join(PUNCT.get(c, c) for c in token[token.rindex(chars[-1]) + 1 :])
        out.append(head + read + tail)
    # Capital letter to open each sentence, after any opening quote — and to open
    # a quotation after a colon ('Tā shuō: “Nǐ hǎo.”').
    return re.sub(
        r'(^|[.!?]["”]?\s+|:\s+(?=["“]))(["“]?)(\w)',
        lambda m: m.group(1) + m.group(2) + m.group(3).upper(),
        ' '.join(out),
    )
