#!/usr/bin/env python3
import os
import re
import sys
from collections import Counter


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


FILE_SIZE_BUDGETS = {
    "index.html": 140_000,
    "mobile.html": 20_000,
    "verify.html": 45_000,
    "totbooks.html": 60_000,
    os.path.join("src", "js", "app.js"): 190_000,
    os.path.join("src", "css", "components.css"): 160_000,  # Ajustado: atual 154471
}

LINE_BUDGETS = {
    os.path.join("src", "js", "app.js"): 4_500,
    os.path.join("src", "css", "components.css"): 6_500,  # Ajustado: atual 6368
}

MAIN_HTML = [
    "index.html",
    "mobile.html",
    "verify.html",
    "totbooks.html",
]

JS_RUNTIME_FILES = [
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

REQUIRED_INDEX_IDS = [
    "manifestoModal",
    "manifestoText",
    "manifestoAccept",
    "manifestoLangToggle",
    "manifestoSupport",
]


def read_text(rel_path):
    path = os.path.join(ROOT, rel_path)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def check_file_size(issues):
    for rel, limit in FILE_SIZE_BUDGETS.items():
        path = os.path.join(ROOT, rel)
        size = os.path.getsize(path)
        if size > limit:
            issues.append(f"{rel}: size {size} > budget {limit}")


def check_line_count(issues):
    for rel, limit in LINE_BUDGETS.items():
        path = os.path.join(ROOT, rel)
        with open(path, "r", encoding="utf-8") as f:
            line_count = sum(1 for _ in f)
        if line_count > limit:
            issues.append(f"{rel}: lines {line_count} > budget {limit}")


def check_inline_styles(issues):
    for rel in MAIN_HTML:
        text = read_text(rel)
        count = len(re.findall(r'style="', text))
        if count:
            issues.append(f"{rel}: inline style attributes found ({count})")


def check_inline_event_handlers(issues):
    script_block = re.compile(r"<script\b[^>]*>.*?</script>", flags=re.IGNORECASE | re.DOTALL)
    inline_handler = re.compile(r"\son[a-zA-Z0-9_-]+\s*=", flags=re.IGNORECASE)
    for rel in MAIN_HTML:
        text = read_text(rel)
        html_only = script_block.sub("", text)
        matches = inline_handler.findall(html_only)
        if matches:
            issues.append(f"{rel}: inline event handlers found ({len(matches)})")


def check_duplicate_ids(issues):
    for rel in MAIN_HTML:
        text = read_text(rel)
        ids = re.findall(r'\bid\s*=\s*"([^"]+)"', text)
        duplicates = [key for key, value in Counter(ids).items() if value > 1]
        if duplicates:
            issues.append(f"{rel}: duplicated ids: {', '.join(duplicates)}")


def check_lazy_iframes(issues):
    text = read_text("index.html")
    for frame_id in ("booksFrame", "verifyFrame"):
        pattern = re.compile(rf'<iframe[^>]*id="{frame_id}"[^>]*\ssrc\s*=', re.IGNORECASE)
        if pattern.search(text):
            issues.append(f"index.html: iframe {frame_id} must be lazy-loaded via data-src (no src attribute)")


def check_modal_aria_hidden(issues):
    for rel in MAIN_HTML:
        text = read_text(rel)
        modal_tags = re.findall(
            r'<[^>]*class="[^"]*\bmodal-overlay\b[^"]*"[^>]*>',
            text,
            flags=re.IGNORECASE,
        )
        for tag in modal_tags:
            if re.search(r"\baria-hidden\s*=", tag, flags=re.IGNORECASE):
                continue
            modal_id = re.search(r'\bid\s*=\s*"([^"]+)"', tag)
            ident = modal_id.group(1) if modal_id else "(without-id)"
            issues.append(f"{rel}: modal-overlay {ident} missing aria-hidden attribute")


def check_mobile_overlay_aria_hidden(issues):
    text = read_text("mobile.html")
    for overlay_id in ("mobileGate", "qrScanModal", "qrStreamModal", "bookModal"):
        pattern = re.compile(
            rf'<[^>]*id="{overlay_id}"[^>]*class="[^"]*\boverlay\b[^"]*"[^>]*>',
            re.IGNORECASE,
        )
        match = pattern.search(text)
        if not match:
            issues.append(f"mobile.html: overlay {overlay_id} not found")
            continue
        tag = match.group(0)
        if re.search(r"\baria-hidden\s*=", tag, flags=re.IGNORECASE):
            continue
        issues.append(f"mobile.html: overlay {overlay_id} missing aria-hidden attribute")


def check_direct_modal_active_toggles(issues):
    add_pat = re.compile(
        r'getElementById\(\s*["\'][^"\']*Modal[^"\']*["\']\s*\)\.classList\.add\(\s*["\']active["\']\s*\)'
    )
    remove_pat = re.compile(
        r'getElementById\(\s*["\'][^"\']*Modal[^"\']*["\']\s*\)\.classList\.remove\(\s*["\']active["\']\s*\)'
    )
    for rel in JS_RUNTIME_FILES:
        text = read_text(rel)
        if add_pat.search(text) or remove_pat.search(text):
            issues.append(
                f"{rel}: direct classList add/remove on *Modal id detected; use setModalActive helper"
            )


def check_required_index_ids(issues):
    text = read_text("index.html")
    for required_id in REQUIRED_INDEX_IDS:
        pattern = re.compile(rf'\bid\s*=\s*"{re.escape(required_id)}"')
        if pattern.search(text):
            continue
        issues.append(f"index.html: required id missing: {required_id}")


def check_js_modal_id_wiring(issues):
    html_ids = set()
    for rel in MAIN_HTML:
        html_ids.update(re.findall(r'\bid\s*=\s*"([^"]+)"', read_text(rel)))

    get_id_pattern = re.compile(r'getElementById\(\s*["\']([A-Za-z0-9_-]+)["\']\s*\)')
    seen = set()
    for rel in JS_RUNTIME_FILES:
        text = read_text(rel)
        for dom_id in get_id_pattern.findall(text):
            if not (dom_id.endswith("Modal") or dom_id == "gatekeeper"):
                continue
            if dom_id in seen:
                continue
            seen.add(dom_id)
            if dom_id in html_ids:
                continue
            issues.append(f"{rel}: getElementById('{dom_id}') not found in main HTML ids")


def main():
    issues = []
    check_file_size(issues)
    check_line_count(issues)
    check_inline_styles(issues)
    check_inline_event_handlers(issues)
    check_duplicate_ids(issues)
    check_lazy_iframes(issues)
    check_modal_aria_hidden(issues)
    check_mobile_overlay_aria_hidden(issues)
    check_direct_modal_active_toggles(issues)
    check_required_index_ids(issues)
    check_js_modal_id_wiring(issues)

    if issues:
        print("UIX budget check failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("UIX budget check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
