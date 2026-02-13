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

    i = start.end() - 1  # '{'
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


def duplicate_keys(block_text: str):
    key_re = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:", re.MULTILINE)
    seen = {}
    dupes = []
    for match in key_re.finditer(block_text):
        key = match.group(1)
        line = block_text.count("\n", 0, match.start()) + 1
        if key in seen:
            dupes.append((key, seen[key], line))
        else:
            seen[key] = line
    return dupes


def main():
    text = LANG_FILE.read_text(encoding="utf-8")
    issues = []

    for code in LANG_CODES:
        block = find_lang_block(text, code)
        if not block:
            issues.append(f"language block not found: {code}")
            continue
        start, end = block
        dupes = duplicate_keys(text[start:end])
        for key, first_line, duplicate_line in dupes:
            issues.append(
                f"{code}: duplicate key '{key}' (first at local line {first_line}, duplicated at local line {duplicate_line})"
            )

    if issues:
        print("Lang duplicate-key check failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Lang duplicate-key check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
