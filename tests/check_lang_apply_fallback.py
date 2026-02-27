#!/usr/bin/env python3
"""
DEPRECATED TRIPWIRE (regex-based source check).

This check is intentionally brittle and may fail on harmless refactors.
It exists as a temporary guard while browser runtime is unavailable in
sandbox/default CI environments (see docs/rfc/RFC-0001-F1-status.md).
Official behavior coverage lives in:
tests/test_lang_apply_behavior_playwright.py
Removal criterion: delete this file and its pytest wrapper when CI can run
RUN_BROWSER_TESTS=1 reliably on every pipeline.
"""

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LANG_FILE = ROOT / "src/js/modules/lang.js"


def assert_pattern(text: str, pattern: str, label: str, issues: list[str]):
    if not re.search(pattern, text, re.DOTALL):
        issues.append(label)


def main():
    text = LANG_FILE.read_text(encoding="utf-8")
    issues: list[str] = []

    # Core fallback contract:
    # - missing key returns undefined (silent fallback, no throw)
    # - apply() only writes when translated value exists
    assert_pattern(
        text,
        r"getScopedText\(key,\s*currentDict\)\s*\{.*?if\s*\(!key\)\s*return\s+undefined;.*?return\s+currentDict\[key\];",
        "getScopedText must keep silent fallback behavior for missing keys",
        issues,
    )
    assert_pattern(
        text,
        r"translateNodeList\(nodeList,\s*keyAttr,\s*resolver\)\s*\{.*?if\s*\(val\)\s*el\.innerText\s*=\s*val;",
        "data-i18n must write via innerText only when translation exists",
        issues,
    )
    assert_pattern(
        text,
        r"apply\(\)\s*\{.*?translateNodeList\(\s*document\.querySelectorAll\('\[data-i18n\]'\)",
        "apply() must process [data-i18n]",
        issues,
    )
    assert_pattern(
        text,
        r"translateAttrNodeList\(\s*document\.querySelectorAll\('\[data-i18n-html\]'\).*?if\s*\(val\)\s*el\.innerHTML\s*=\s*val;",
        "innerHTML must be restricted to [data-i18n-html] opt-in path",
        issues,
    )
    assert_pattern(
        text,
        r"translateAttrNodeList\(\s*document\.querySelectorAll\('\[data-i18n-title\]'\)",
        "apply() must process [data-i18n-title]",
        issues,
    )
    assert_pattern(
        text,
        r"translateAttrNodeList\(\s*document\.querySelectorAll\('input\[data-i18n-ph\],\s*textarea\[data-i18n-ph\]'\)",
        "apply() must process [data-i18n-ph]",
        issues,
    )

    if issues:
        print("DEPRECATED TRIPWIRE: lang apply fallback check failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("DEPRECATED TRIPWIRE: lang apply fallback check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
