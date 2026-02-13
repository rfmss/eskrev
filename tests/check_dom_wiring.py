#!/usr/bin/env python3
import os
import re
import sys


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS_FILES = [
    os.path.join("src", "js", "app.js"),
    os.path.join("src", "js", "modules", "auth.js"),
    os.path.join("src", "js", "modules", "editor.js"),
    os.path.join("src", "js", "modules", "mobile.js"),
    os.path.join("src", "js", "modules", "qr_transfer.js"),
    os.path.join("src", "js", "modules", "ui.js"),
    os.path.join("src", "js", "modules", "reset_flow.js"),
    os.path.join("src", "js", "modules", "modal_accessibility.js"),
    os.path.join("src", "mobile", "mobile.js"),
]

HTML_FILES = [
    "index.html",
    "mobile.html",
    "verify.html",
    "totbooks.html",
]

ALLOWLIST_FILE = os.path.join("tests", "dom_wiring_allowlist.txt")


def read_text(rel_path):
    with open(os.path.join(ROOT, rel_path), "r", encoding="utf-8") as f:
        return f.read()


def load_allowlist():
    text = read_text(ALLOWLIST_FILE)
    return {
        line.strip()
        for line in text.splitlines()
        if line.strip() and not line.strip().startswith("#")
    }


def collect_html_ids():
    html_ids = set()
    for rel in HTML_FILES:
        html_ids.update(re.findall(r'\bid\s*=\s*"([^"]+)"', read_text(rel)))
    return html_ids


def collect_js_id_uses():
    uses = {}
    pattern = re.compile(r'getElementById\(\s*["\']([A-Za-z0-9_-]+)["\']\s*\)')
    for rel in JS_FILES:
        for match in pattern.findall(read_text(rel)):
            uses.setdefault(match, set()).add(rel)
    return uses


def collect_dynamic_ids():
    dynamic_ids = set()
    pattern = re.compile(r'\.id\s*=\s*["\']([A-Za-z0-9_-]+)["\']')
    for rel in JS_FILES:
        dynamic_ids.update(pattern.findall(read_text(rel)))
    return dynamic_ids


def main():
    allowlist = load_allowlist()
    html_ids = collect_html_ids()
    uses = collect_js_id_uses()
    dynamic_ids = collect_dynamic_ids()

    missing = sorted(
        dom_id
        for dom_id in uses
        if dom_id not in html_ids and dom_id not in dynamic_ids
    )
    unexpected = [dom_id for dom_id in missing if dom_id not in allowlist]
    stale_allowlist = sorted(dom_id for dom_id in allowlist if dom_id not in missing)

    if unexpected or stale_allowlist:
        print("DOM wiring check failed:")
        if unexpected:
            print("- Missing IDs not in allowlist:")
            for dom_id in unexpected:
                refs = ", ".join(sorted(uses.get(dom_id, [])))
                print(f"  - {dom_id} <- {refs}")
        if stale_allowlist:
            print("- Stale allowlist entries (remove from tests/dom_wiring_allowlist.txt):")
            for dom_id in stale_allowlist:
                print(f"  - {dom_id}")
        return 1

    print(f"DOM wiring check passed. unresolved_ids={len(missing)} allowlisted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
