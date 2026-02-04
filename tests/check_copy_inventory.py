#!/usr/bin/env python3
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HTML_FILES = [
    os.path.join(ROOT, "index.html"),
    os.path.join(ROOT, "verify.html"),
    os.path.join(ROOT, "totbooks.html"),
]

LANG_FILE = os.path.join(ROOT, "src", "js", "modules", "lang.js")

ALLOWLIST_FILE = os.path.join(os.path.dirname(__file__), "copy_allowlist.txt")

I18N_ATTRS = {
    "data-i18n",
    "data-i18n-html",
    "data-i18n-title",
    "data-i18n-tip",
    "data-i18n-ph",
}

TEXT_ATTRS = {
    "title",
    "placeholder",
    "aria-label",
    "value",
}

SKIP_TAGS = {
    "script",
    "style",
    "svg",
    "path",
    "rect",
    "circle",
    "polygon",
    "line",
    "polyline",
    "use",
    "defs",
    "mask",
    "g",
}


def load_allowlist():
    patterns = []
    if not os.path.exists(ALLOWLIST_FILE):
        return patterns
    with open(ALLOWLIST_FILE, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            patterns.append(re.compile(s))
    return patterns


def is_allowed(text, allowlist):
    if not text:
        return True
    for pat in allowlist:
        if pat.search(text):
            return True
    return False


def load_lang_keys():
    keys = set()
    if not os.path.exists(LANG_FILE):
        return keys
    key_re = re.compile(r"^\s*([a-zA-Z0-9_]+)\s*:")
    with open(LANG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            m = key_re.match(line)
            if m:
                keys.add(m.group(1))
    return keys


class CopyLintParser(HTMLParser):
    def __init__(self, fname, allowlist):
        super().__init__()
        self.fname = fname
        self.allowlist = allowlist
        self.stack = []  # list of dicts: {tag, i18n}
        self.issues = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = {k: v for k, v in attrs}
        i18n_here = any(k in attrs_dict for k in I18N_ATTRS)
        parent_i18n = any(frame["i18n"] for frame in self.stack)
        self.stack.append({"tag": tag, "i18n": i18n_here or parent_i18n})

        if tag in SKIP_TAGS:
            return

        # attribute checks
        for attr in TEXT_ATTRS:
            val = attrs_dict.get(attr)
            if not val:
                continue
            # allow if matching data-i18n-* exists
            if attr == "placeholder" and "data-i18n-ph" in attrs_dict:
                continue
            if attr == "title" and ("data-i18n-title" in attrs_dict or "data-i18n-tip" in attrs_dict):
                continue
            if attr == "aria-label" and "data-i18n" in attrs_dict:
                continue
            if is_allowed(val.strip(), self.allowlist):
                continue
            self.issues.append((self.fname, f"@{attr}", val.strip()))

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        text = data.strip()
        if not text:
            return
        if is_allowed(text, self.allowlist):
            return
        if self.stack and self.stack[-1]["tag"] in SKIP_TAGS:
            return
        if self.stack and self.stack[-1]["i18n"]:
            return
        self.issues.append((self.fname, "text", text))


def lint_html():
    allowlist = load_allowlist()
    all_issues = []
    for path in HTML_FILES:
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            parser = CopyLintParser(path, allowlist)
            parser.feed(f.read())
            all_issues.extend(parser.issues)
    return all_issues


def lint_keys():
    keys = load_lang_keys()
    missing = []
    if not keys:
        return missing
    attr_re = re.compile(r"data-i18n(?:-html|-ph|-title|-tip)?=\"([^\"]+)\"")
    for path in HTML_FILES:
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        for m in attr_re.finditer(content):
            key = m.group(1).strip()
            if key and key not in keys:
                missing.append((path, key))
    return missing


def main():
    issues = lint_html()
    missing = lint_keys()

    if issues:
        print("Hardcoded copy found (must be in inventory):")
        for fname, kind, text in issues:
            print(f"- {fname} :: {kind} :: {text}")
    if missing:
        print("Missing i18n keys (not in lang.js):")
        for fname, key in missing:
            print(f"- {fname} :: {key}")

    if issues or missing:
        sys.exit(1)

    print("Copy inventory check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
