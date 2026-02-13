#!/usr/bin/env python3
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANG_FILE = ROOT / "src/js/modules/lang.js"
LANG_CODES = ("pt", "en-uk", "es", "fr")


def find_lang_block(text: str, lang_code: str):
    if lang_code == "en-uk":
        start = re.search(r'"en-uk"\s*:\s*\{', text)
    else:
        start = re.search(rf'\b{re.escape(lang_code)}\s*:\s*\{{', text)
    if not start:
        return None

    i = start.end() - 1
    depth = 0
    in_string = False
    quote = ""
    escaped = False

    for j in range(i, len(text)):
        ch = text[j]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                in_string = False
        else:
            if ch in ('"', "'"):
                in_string = True
                quote = ch
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return i + 1, j
    return None


def keys_for_lang(text: str, lang_code: str):
    bounds = find_lang_block(text, lang_code)
    if not bounds:
        return None
    start, end = bounds
    block = text[start:end]
    key_re = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:", re.MULTILINE)
    return {match.group(1) for match in key_re.finditer(block)}


def main():
    text = LANG_FILE.read_text(encoding="utf-8")
    lang_keys = {}
    issues = []

    for code in LANG_CODES:
        keys = keys_for_lang(text, code)
        if keys is None:
            issues.append(f"language block not found: {code}")
            continue
        lang_keys[code] = keys

    if issues:
        print("Lang schema check failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    base = lang_keys["pt"]
    for code in LANG_CODES:
        if code == "pt":
            continue
        missing = sorted(base - lang_keys[code])
        extra = sorted(lang_keys[code] - base)
        for key in missing:
            issues.append(f"{code}: missing key '{key}' (present in pt)")
        for key in extra:
            issues.append(f"{code}: extra key '{key}' (not present in pt)")

    if issues:
        print("Lang schema check failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Lang schema check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
