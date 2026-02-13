#!/usr/bin/env python3
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANG_FILE = ROOT / "src/js/modules/lang.js"


def extract_languages(text: str):
    m = re.search(r"languages\s*:\s*\[(.*?)\]\s*,\s*db\s*:\s*\{", text, re.DOTALL)
    if not m:
        return None
    chunk = m.group(1)
    return re.findall(r"code\s*:\s*'([^']+)'", chunk)


def extract_db_block(text: str):
    m = re.search(r"db\s*:\s*\{", text)
    if not m:
        return None
    i = m.end() - 1
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
                    return text[i + 1 : j]
    return None


def extract_top_level_db_keys(db_text: str):
    keys = []
    depth = 0
    in_string = False
    quote = ""
    escaped = False
    start_line = 0

    for idx, ch in enumerate(db_text):
        if ch == "\n":
            start_line = idx + 1
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                in_string = False
            continue
        if ch in ('"', "'"):
            in_string = True
            quote = ch
            continue
        if ch == "{":
            depth += 1
            continue
        if ch == "}":
            depth -= 1
            continue
        if depth != 0:
            continue

        if ch.isspace():
            continue
        line = db_text[start_line : db_text.find("\n", start_line) if db_text.find("\n", start_line) != -1 else len(db_text)]
        m = re.match(r"\s*(?:\"([^\"]+)\"|([A-Za-z_][A-Za-z0-9_-]*))\s*:\s*\{", line)
        if m:
            keys.append(m.group(1) or m.group(2))
    return keys


def main():
    text = LANG_FILE.read_text(encoding="utf-8")
    lang_codes = extract_languages(text)
    if lang_codes is None:
        print("Lang codes check failed:\n- could not parse languages array")
        return 1

    db = extract_db_block(text)
    if db is None:
        print("Lang codes check failed:\n- could not parse db block")
        return 1

    db_keys = extract_top_level_db_keys(db)
    issues = []

    missing_in_db = sorted(set(lang_codes) - set(db_keys))
    extra_in_db = sorted(set(db_keys) - set(lang_codes))

    for code in missing_in_db:
        issues.append(f"language code '{code}' listed in languages[] but missing in db")
    for code in extra_in_db:
        issues.append(f"db language '{code}' exists but is missing in languages[]")

    if issues:
        print("Lang codes check failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Lang codes check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
